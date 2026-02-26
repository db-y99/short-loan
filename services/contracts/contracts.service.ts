/**
 * 📄 CONTRACTS SERVICE
 * Service để tạo và quản lý hợp đồng
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CONTRACT_TYPE, type TContractFile } from "@/types/contract.types";
import {
  buildAssetPledgeContractData,
  buildAssetLeaseContractData,
  buildFullPaymentConfirmationData,
  buildAssetDisposalAuthorizationData,
} from "@/lib/contract-data";

/**
 * Tạo 4 hợp đồng cho loan
 * 1. Hợp đồng cầm cố tài sản
 * 2. Hợp đồng thuê tài sản
 * 3. Xác nhận đã nhận đủ tiền
 * 4. Giấy ủy quyền xử lý tài sản
 */
export async function generateContractsService(
  loanId: string,
): Promise<{
  success: boolean;
  contracts?: TContractFile[];
  error?: string;
}> {
  try {
    console.log(`[GENERATE_CONTRACTS] Starting for loan: ${loanId}`);
    const supabase = await createSupabaseServerClient();

    // Lấy loan details
    const { getLoanDetailsService } = await import(
      "@/services/loans/loans.service"
    );
    console.log(`[GENERATE_CONTRACTS] Fetching loan details...`);
    const loan = await getLoanDetailsService(loanId);

    if (!loan) {
      console.error(`[GENERATE_CONTRACTS] Loan not found: ${loanId}`);
      return { success: false, error: "Không tìm thấy khoản vay" };
    }
    console.log(`[GENERATE_CONTRACTS] Loan found: ${loan.code}`);

    // Kiểm tra drive folder
    const folderId = loan.driveFolderId;
    if (!folderId) {
      console.error(`[GENERATE_CONTRACTS] No drive folder for loan: ${loanId}`);
      return {
        success: false,
        error: "Khoản vay chưa có folder Drive. Vui lòng tạo folder trước.",
      };
    }
    console.log(`[GENERATE_CONTRACTS] Drive folder ID: ${folderId}`);

    // Lấy contract_version từ metadata trong bảng loans
    const { data: loanData } = await supabase
      .from("loans")
      .select("metadata")
      .eq("id", loanId)
      .single();

    const currentVersion = (loanData?.metadata as any)?.contract_version || 0;
    const newVersion = currentVersion + 1;

    // Tạo version suffix cho tên file (chỉ thêm suffix từ v2 trở đi)
    const versionSuffix = newVersion > 1 ? `-v${newVersion}` : "";

    // Build contract data
    const contractsData = [
      {
        type: CONTRACT_TYPE.ASSET_PLEDGE,
        name: "HĐ Cầm Cố Tài Sản",
        fileName: `HD-CamCo-${loan.code}${versionSuffix}.pdf`,
        data: buildAssetPledgeContractData(loan, folderId),
      },
      {
        type: CONTRACT_TYPE.ASSET_LEASE,
        name: "HĐ Thuê Tài Sản",
        fileName: `HD-Thue-${loan.code}${versionSuffix}.pdf`,
        data: buildAssetLeaseContractData(loan, folderId),
      },
      {
        type: CONTRACT_TYPE.FULL_PAYMENT,
        name: "XN Đã Nhận Đủ Tiền",
        fileName: `XN-NhanTien-${loan.code}${versionSuffix}.pdf`,
        data: buildFullPaymentConfirmationData(loan, folderId),
      },
      {
        type: CONTRACT_TYPE.ASSET_DISPOSAL,
        name: "UQ Xử Lý Tài Sản",
        fileName: `UQ-XuLy-${loan.code}${versionSuffix}.pdf`,
        data: buildAssetDisposalAuthorizationData(loan, folderId),
      },
    ];

    // BƯỚC 1: Generate tất cả PDF song song
    console.time("Generate PDFs");
    const pdfPromises = contractsData.map((contract) =>
      generateContractPDFDirect(contract.data, contract.type).catch((err: Error) => {
        console.error(`[PDF_GEN_ERROR] ${contract.name}:`, err);
        return null;
      })
    );
    const pdfBuffers = await Promise.all(pdfPromises);
    console.timeEnd("Generate PDFs");

    // Lọc ra các PDF thành công
    const validContracts = contractsData
      .map((contract, index) => ({
        ...contract,
        pdfBuffer: pdfBuffers[index],
      }))
      .filter((contract) => contract.pdfBuffer !== null);

    if (validContracts.length === 0) {
      return {
        success: false,
        error: "Không thể tạo PDF cho bất kỳ hợp đồng nào",
      };
    }

    // BƯỚC 2: Upload tất cả file lên Drive song song
    console.time("Upload to Drive");
    const { uploadToDrive } = await import("@/lib/google-drive");
    const uploadPromises = validContracts.map((contract) =>
      uploadToDrive(
        contract.pdfBuffer!,
        contract.fileName,
        "application/pdf",
        folderId,
      ).catch((err: Error) => {
        console.error(`[DRIVE_UPLOAD_ERROR] ${contract.name}:`, err);
        return null;
      })
    );
    const uploadResults = await Promise.all(uploadPromises);
    console.timeEnd("Upload to Drive");

    // Lọc ra các upload thành công
    const successfulUploads = validContracts
      .map((contract, index) => ({
        ...contract,
        fileId: uploadResults[index]?.fileId,
      }))
      .filter((contract) => contract.fileId);

    if (successfulUploads.length === 0) {
      return {
        success: false,
        error: "Không thể upload hợp đồng lên Drive",
      };
    }

    // BƯỚC 3: Insert tất cả records vào DB song song
    console.time("Insert to DB");

    const dbPromises = successfulUploads.map(async (contract) => {
      const { data, error } = await supabase
        .from("loan_files")
        .insert({
          loan_id: loanId,
          name: contract.name,
          type: contract.type,
          provider: "google_drive",
          file_id: contract.fileId!,
        })
        .select("id, name, type, file_id, provider")
        .single();

      if (error || !data) {
        console.error(`[DB_INSERT_ERROR] ${contract.name}:`, error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        type: data.type,
        fileId: data.file_id,
        provider: data.provider,
      };
    });

    const dbResults = await Promise.all(dbPromises);
    console.timeEnd("Insert to DB");

    const uploadedContracts = dbResults.filter((contract) => contract !== null) as TContractFile[];

    if (uploadedContracts.length === 0) {
      return {
        success: false,
        error: "Không thể tạo hợp đồng. Vui lòng thử lại.",
      };
    }

    // Cập nhật contract_version trong metadata
    const { data: currentLoan } = await supabase
      .from("loans")
      .select("metadata")
      .eq("id", loanId)
      .single();

    const updatedMetadata = {
      ...(currentLoan?.metadata || {}),
      contract_version: newVersion,
    };

    await supabase
      .from("loans")
      .update({ metadata: updatedMetadata })
      .eq("id", loanId);

    return {
      success: true,
      contracts: uploadedContracts,
    };
  } catch (error) {
    console.error("[GENERATE_CONTRACTS_ERROR]", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Lỗi khi tạo hợp đồng",
    };
  }
}

/**
 * Generate PDF buffer từ contract data - DIRECT CALL (không qua HTTP)
 */
async function generateContractPDFDirect(
  contractData: any,
  contractType: string,
): Promise<Buffer> {
  const { generateContractPDF } = await import("@/lib/pdf-generator");
  return await generateContractPDF(contractData, contractType);
}

/**
 * Lấy danh sách hợp đồng của loan
 */
export async function getContractsService(loanId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("loan_files")
    .select("id, name, type, file_id, provider, created_at")
    .eq("loan_id", loanId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Xóa hợp đồng
 */
export async function deleteContractService(contractId: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("loan_files")
    .delete()
    .eq("id", contractId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

/**
 * Tạo lại hợp đồng (xóa cũ và tạo mới)
 */
export async function regenerateContractsService(
  loanId: string,
): Promise<{
  success: boolean;
  contracts?: TContractFile[];
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();

    // Xóa tất cả hợp đồng cũ trong DB (giữ file trên Drive)
    const { error: deleteError } = await supabase
      .from("loan_files")
      .delete()
      .eq("loan_id", loanId);

    if (deleteError) {
      console.error("[DELETE_OLD_CONTRACTS_ERROR]", deleteError);
      return {
        success: false,
        error: "Không thể xóa hợp đồng cũ",
      };
    }

    // Tạo hợp đồng mới (version sẽ tự động tăng trong generateContractsService)
    return await generateContractsService(loanId);
  } catch (error) {
    console.error("[REGENERATE_CONTRACTS_ERROR]", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Lỗi khi tạo lại hợp đồng",
    };
  }
}
