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

    // Kiểm tra trạng thái loan - chỉ cho phép tạo hợp đồng khi đã duyệt
    if (loan.status !== "approved") {
      console.error(`[GENERATE_CONTRACTS] Invalid loan status: ${loan.status}`);
      return {
        success: false,
        error: `Không thể tạo hợp đồng. Trạng thái hiện tại: ${loan.status}. Cần trạng thái: approved`,
      };
    }

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

    console.log(buildAssetDisposalAuthorizationData(loan, folderId))

    // BƯỚC 1: Generate PDF song song (parallel) với PDF service
    // Vì dùng PDF service riêng nên không còn lo ETXTBSY như Puppeteer local
    console.time("Generate PDFs");
    const pdfPromises = contractsData.map(async (contract) => {
      try {
        const buffer = await generateContractPDFDirect(contract.data, contract.type);
        return buffer;
      } catch (err) {
        console.error(`[PDF_GEN_ERROR] ${contract.name}:`, err);
        return null;
      }
    });
    
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
    console.log(`[REGENERATE_CONTRACTS] Starting for loan: ${loanId}`);
    const supabase = await createSupabaseServerClient();

    // Kiểm tra loan tồn tại và lấy trạng thái hiện tại
    const { data: currentLoan } = await supabase
      .from("loans")
      .select("id, status, code")
      .eq("id", loanId)
      .single();

    if (!currentLoan) {
      return {
        success: false,
        error: "Không tìm thấy khoản vay",
      };
    }

    console.log(`[REGENERATE_CONTRACTS] Current loan status: ${currentLoan.status} (${currentLoan.code})`);

    // Xóa tất cả hợp đồng cũ trong DB (giữ file trên Drive)
    console.log(`[REGENERATE_CONTRACTS] Deleting old contracts...`);
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

    // Reset loan status về approved và xóa chữ ký để có thể ký lại
    console.log(`[REGENERATE_CONTRACTS] Resetting loan status to approved...`);
    const { error: updateError } = await supabase
      .from("loans")
      .update({
        status: "approved",
        signed_at: null,
        draft_signature_file_id: null,
        official_signature_file_id: null,
      })
      .eq("id", loanId);

    if (updateError) {
      console.error("[RESET_LOAN_STATUS_ERROR]", updateError);
      return {
        success: false,
        error: "Không thể reset trạng thái khoản vay",
      };
    }

    console.log(`[REGENERATE_CONTRACTS] Status reset successful. Generating new contracts...`);

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

/**
 * Generate 4 signed contract PDFs (sau khi ký hợp đồng)
 * Tạo PDF có chữ ký và lưu vào DB + Drive
 */
export async function generateSignedContractsService(
  loanId: string,
): Promise<{
  success: boolean;
  contracts?: TContractFile[];
  error?: string;
}> {
  try {
    console.log(`[GENERATE_SIGNED_CONTRACTS] Starting for loan: ${loanId}`);
    const supabase = await createSupabaseServerClient();

    // XÓA TẤT CẢ HỢP ĐỒNG CŨ TRƯỚC KHI TẠO MỚI
    console.log(`[GENERATE_SIGNED_CONTRACTS] Deleting old contracts...`);
    
    // Lấy loan details và xóa contracts song song
    const { getLoanDetailsService } = await import(
      "@/services/loans/loans.service"
    );
    
    const [loan, deleteResult, loanData] = await Promise.all([
      getLoanDetailsService(loanId),
      supabase.from("loan_files").delete().eq("loan_id", loanId),
      supabase
        .from("loans")
        .select("draft_signature_file_id, official_signature_file_id, metadata")
        .eq("id", loanId)
        .single(),
    ]);

    if (deleteResult.error) {
      console.error(`[GENERATE_SIGNED_CONTRACTS] Error deleting old contracts:`, deleteResult.error);
      // Continue anyway, don't fail the process
    }

    if (!loan) {
      console.error(`[GENERATE_SIGNED_CONTRACTS] Loan not found: ${loanId}`);
      return { success: false, error: "Không tìm thấy khoản vay" };
    }

    // Kiểm tra drive folder
    const folderId = loan.driveFolderId;
    if (!folderId) {
      console.error(`[GENERATE_SIGNED_CONTRACTS] No drive folder for loan: ${loanId}`);
      return {
        success: false,
        error: "Khoản vay chưa có folder Drive",
      };
    }

    if (!loanData.data?.draft_signature_file_id || !loanData.data?.official_signature_file_id) {
      return {
        success: false,
        error: "Chưa có chữ ký",
      };
    }

    // Fetch signatures and convert to base64 for PDF embedding
    let draftSignatureBase64: string | null = null;
    let officialSignatureBase64: string | null = null;
    
    try {
      // Fetch signatures from Drive in parallel
      const { getFileFromDrive } = await import("@/lib/google-drive");
      
      const [draftSigBuffer, officialSigBuffer] = await Promise.all([
        getFileFromDrive(loanData.data.draft_signature_file_id),
        getFileFromDrive(loanData.data.official_signature_file_id),
      ]);
      
      draftSignatureBase64 = `data:image/png;base64,${draftSigBuffer.toString('base64')}`;
      officialSignatureBase64 = `data:image/png;base64,${officialSigBuffer.toString('base64')}`;
    } catch (fetchError) {
      console.error("Error fetching signatures:", fetchError);
      return {
        success: false,
        error: "Không thể tải chữ ký từ Drive",
      };
    }

    // Get contract version - reset to 1 since we're deleting old ones
    const newVersion = 1;
    const versionSuffix = ""; // No suffix for version 1

    // Build contract data with signatures
    const contractsData = [
      {
        type: CONTRACT_TYPE.ASSET_PLEDGE,
        name: "HĐ Cầm Cố Tài Sản (Đã ký)",
        fileName: `HD-CamCo-DaKy-${loan.code}${versionSuffix}.pdf`,
        data: {
          ...buildAssetPledgeContractData(loan, folderId),
          DRAFT_SIGNATURE: draftSignatureBase64,
          OFFICIAL_SIGNATURE: officialSignatureBase64,
        },
      },
      {
        type: CONTRACT_TYPE.ASSET_LEASE,
        name: "HĐ Thuê Tài Sản (Đã ký)",
        fileName: `HD-Thue-DaKy-${loan.code}${versionSuffix}.pdf`,
        data: {
          ...buildAssetLeaseContractData(loan, folderId),
          DRAFT_SIGNATURE: draftSignatureBase64,
          OFFICIAL_SIGNATURE: officialSignatureBase64,
        },
      },
      {
        type: CONTRACT_TYPE.FULL_PAYMENT,
        name: "XN Đã Nhận Đủ Tiền (Đã ký)",
        fileName: `XN-NhanTien-DaKy-${loan.code}${versionSuffix}.pdf`,
        data: {
          ...buildFullPaymentConfirmationData(loan, folderId),
          DRAFT_SIGNATURE: draftSignatureBase64,
          OFFICIAL_SIGNATURE: officialSignatureBase64,
        },
      },
      {
        type: CONTRACT_TYPE.ASSET_DISPOSAL,
        name: "UQ Xử Lý Tài Sản (Đã ký)",
        fileName: `UQ-XuLy-DaKy-${loan.code}${versionSuffix}.pdf`,
        data: {
          ...buildAssetDisposalAuthorizationData(loan, folderId),
          DRAFT_SIGNATURE: draftSignatureBase64,
          OFFICIAL_SIGNATURE: officialSignatureBase64,
        },
      },
    ];

    // Generate all PDFs in parallel
    console.time("Generate Signed PDFs");
    const pdfPromises = contractsData.map((contract) =>
      generateContractPDFDirect(contract.data, contract.type).catch((err: Error) => {
        console.error(`[SIGNED_PDF_GEN_ERROR] ${contract.name}:`, err);
        return null;
      })
    );
    const pdfBuffers = await Promise.all(pdfPromises);
    console.timeEnd("Generate Signed PDFs");

    // Filter successful PDFs
    const validContracts = contractsData
      .map((contract, index) => ({
        ...contract,
        pdfBuffer: pdfBuffers[index],
      }))
      .filter((contract) => contract.pdfBuffer !== null);

    if (validContracts.length === 0) {
      return {
        success: false,
        error: "Không thể tạo PDF có chữ ký",
      };
    }

    // Upload all files to Drive in parallel
    console.time("Upload Signed PDFs to Drive");
    const { uploadToDrive } = await import("@/lib/google-drive");
    const uploadPromises = validContracts.map((contract) =>
      uploadToDrive(
        contract.pdfBuffer!,
        contract.fileName,
        "application/pdf",
        folderId,
      ).catch((err: Error) => {
        console.error(`[SIGNED_DRIVE_UPLOAD_ERROR] ${contract.name}:`, err);
        return null;
      })
    );
    const uploadResults = await Promise.all(uploadPromises);
    console.timeEnd("Upload Signed PDFs to Drive");

    // Filter successful uploads
    const successfulUploads = validContracts
      .map((contract, index) => ({
        ...contract,
        fileId: uploadResults[index]?.fileId,
      }))
      .filter((contract) => contract.fileId);

    if (successfulUploads.length === 0) {
      return {
        success: false,
        error: "Không thể upload hợp đồng đã ký lên Drive",
      };
    }

    // Insert all records to DB in parallel
    console.time("Insert Signed PDFs to DB");
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
        console.error(`[SIGNED_DB_INSERT_ERROR] ${contract.name}:`, error);
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
    console.timeEnd("Insert Signed PDFs to DB");

    const uploadedContracts = dbResults.filter((contract) => contract !== null) as TContractFile[];

    if (uploadedContracts.length === 0) {
      return {
        success: false,
        error: "Không thể lưu hợp đồng đã ký vào DB",
      };
    }

    // Update signed_contract_version in metadata (always 1 since we delete old ones)
    const updatedMetadata = {
      ...(loanData.data?.metadata || {}),
      signed_contract_version: newVersion,
    };

    await supabase
      .from("loans")
      .update({ metadata: updatedMetadata })
      .eq("id", loanId);

    console.log(`[GENERATE_SIGNED_CONTRACTS] Successfully created ${uploadedContracts.length} signed PDFs (replaced old contracts)`);

    return {
      success: true,
      contracts: uploadedContracts,
    };
  } catch (error) {
    console.error("[GENERATE_SIGNED_CONTRACTS_ERROR]", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Lỗi khi tạo hợp đồng đã ký",
    };
  }
}
