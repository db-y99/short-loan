/**
 * 📄 CONTRACTS SERVICE
 * Service để tạo và quản lý hợp đồng
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  CONTRACT_TYPE,
  type TContractData,
  type TContractFile,
  type TContractType,
} from "@/types/contract.types";
import {
  GENERATABLE_CONTRACT_TYPES,
  getGeneratableContractTypesForLoan,
} from "@/constants/contracts";
import { getUnsignedContractTypesFromFiles } from "@/lib/contract-utils";
import {
  buildAssetPledgeContractData,
  buildAssetLeaseContractData,
  buildFullPaymentConfirmationData,
  buildAssetDisposalAuthorizationData,
} from "@/lib/contract-data";

type TContractDataItem = {
  type: TContractType;
  name: string;
  fileName: string;
  data: TContractData;
};

async function cleanupDriveFiles(fileIds: string[]): Promise<void> {
  if (fileIds.length === 0) return;
  const { deleteManyFromDrive } = await import("@/lib/google-drive");
  await deleteManyFromDrive(fileIds).catch((err) => {
    console.error("[CONTRACT_DRIVE_CLEANUP_ERROR]", err);
  });
}

async function rollbackInsertedContractRows(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  rowIds: string[],
  driveFileIds: string[],
): Promise<void> {
  if (rowIds.length > 0) {
    await supabase.from("loan_files").delete().in("id", rowIds);
  }
  await cleanupDriveFiles(driveFileIds);
}

function buildAllContractsData(
  loan: Awaited<
    ReturnType<
      typeof import("@/services/loans/loans.service").getLoanDetailsService
    >
  >,
  folderId: string,
  versionSuffix: string,
): TContractDataItem[] {
  if (!loan) return [];

  const allowedTypes = new Set(
    getGeneratableContractTypesForLoan(loan.loanType),
  );

  const allContracts: TContractDataItem[] = [
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

  return allContracts.filter((contract) => allowedTypes.has(contract.type));
}

/**
 * Tạo hợp đồng cho loan (có thể chọn loại cần tạo)
 */
export async function generateContractsService(
  loanId: string,
  contractTypes: TContractType[] = [...GENERATABLE_CONTRACT_TYPES],
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

    if (contractTypes.length === 0) {
      return {
        success: false,
        error: "Vui lòng chọn ít nhất một loại hợp đồng",
      };
    }

    const allowedTypes = getGeneratableContractTypesForLoan(loan.loanType);
    const selectedSet = new Set(
      contractTypes.filter((type) => allowedTypes.includes(type)),
    );

    if (selectedSet.size === 0) {
      return {
        success: false,
        error: "Không có loại hợp đồng hợp lệ được chọn cho gói vay này",
      };
    }

    const contractsData = buildAllContractsData(
      loan,
      folderId,
      versionSuffix,
    ).filter((contract) => selectedSet.has(contract.type));

    if (contractsData.length === 0) {
      return {
        success: false,
        error: "Không có loại hợp đồng hợp lệ được chọn",
      };
    }

    console.log(
      `[GENERATE_CONTRACTS] Creating ${contractsData.length} contract(s):`,
      contractsData.map((c) => c.type).join(", "),
    );

    // BƯỚC 1: Generate PDF song song (parallel) với Google Apps Script
    // Google Apps Script có thể handle multiple requests tốt hơn PDF service local
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

    if (validContracts.length !== contractsData.length) {
      return {
        success: false,
        error:
          "Một hoặc nhiều hợp đồng tạo PDF thất bại. Hệ thống đã dừng để tránh dữ liệu không đồng bộ.",
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

    if (successfulUploads.length !== validContracts.length) {
      await cleanupDriveFiles(
        successfulUploads
          .map((contract) => contract.fileId)
          .filter((id): id is string => Boolean(id)),
      );
      return {
        success: false,
        error:
          "Một hoặc nhiều hợp đồng upload thất bại. Hệ thống đã dừng để tránh dữ liệu không đồng bộ.",
      };
    }

    const typesToReplace = successfulUploads.map((contract) => contract.type);
    const { data: existingRows, error: existingRowsError } = await supabase
      .from("loan_files")
      .select("id")
      .eq("loan_id", loanId)
      .in("type", typesToReplace);

    if (existingRowsError) {
      console.error("[FETCH_OLD_CONTRACTS_ERROR]", existingRowsError);
      return {
        success: false,
        error:
          "Không thể kiểm tra hợp đồng cũ trước khi thay thế. Vui lòng thử lại.",
      };
    }

    // BƯỚC 3: Insert records mới trước để tránh mất dữ liệu nếu insert thất bại
    console.time("Insert to DB");
    const rowsToInsert = successfulUploads.map((contract) => ({
      loan_id: loanId,
      name: contract.name,
      type: contract.type,
      provider: "google_drive" as const,
      file_id: contract.fileId!,
    }));

    const { data: insertedRows, error: insertError } = await supabase
      .from("loan_files")
      .insert(rowsToInsert)
      .select("id, name, type, file_id, provider");

    console.timeEnd("Insert to DB");

    if (insertError || !insertedRows || insertedRows.length !== rowsToInsert.length) {
      console.error("[DB_BULK_INSERT_ERROR]", insertError);
      await cleanupDriveFiles(
        successfulUploads.map((contract) => contract.fileId!),
      );
      return {
        success: false,
        error:
          "Không thể lưu đầy đủ hợp đồng mới vào hệ thống. Dữ liệu cũ được giữ nguyên.",
      };
    }

    const oldIdsToDelete = (existingRows ?? []).map((row) => row.id);
    const newDriveFileIds = successfulUploads.map((contract) => contract.fileId!);
    const newRowIds = insertedRows.map((row) => row.id);

    // BƯỚC 4: Xóa đúng bản ghi cũ đã snapshot trước khi insert mới
    if (oldIdsToDelete.length > 0) {
      const { error: cleanupError } = await supabase
        .from("loan_files")
        .delete()
        .in("id", oldIdsToDelete);

      if (cleanupError) {
        console.error("[CLEANUP_OLD_CONTRACTS_ERROR]", cleanupError);
        await rollbackInsertedContractRows(supabase, newRowIds, newDriveFileIds);
        return {
          success: false,
          error:
            "Không thể hoàn tất thay thế hợp đồng. Dữ liệu cũ được giữ nguyên.",
        };
      }
    }

    const uploadedContracts: TContractFile[] = insertedRows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type as TContractType,
      fileId: row.file_id,
      provider: row.provider,
    }));

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

    const { error: metadataUpdateError } = await supabase
      .from("loans")
      .update({ metadata: updatedMetadata })
      .eq("id", loanId);

    if (metadataUpdateError) {
      console.error("[UPDATE_CONTRACT_VERSION_ERROR]", metadataUpdateError);
      return {
        success: false,
        error:
          "Đã tạo hợp đồng nhưng không thể cập nhật phiên bản hợp đồng. Vui lòng thử lại.",
      };
    }

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
 * Generate PDF buffer từ contract data - GOOGLE APPS SCRIPT
 */
async function generateContractPDFDirect(
  contractData: any,
  contractType: string,
): Promise<Buffer> {
  const { generateContractPDF } = await import("@/lib/pdf-generator-app-scripts");
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
  contractTypes: TContractType[] = [...GENERATABLE_CONTRACT_TYPES],
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
      .select(
        "id, status, code, loan_type, signed_at, is_signed, draft_signature_file_id, official_signature_file_id",
      )
      .eq("id", loanId)
      .single();

    if (!currentLoan) {
      return {
        success: false,
        error: "Không tìm thấy khoản vay",
      };
    }

    console.log(`[REGENERATE_CONTRACTS] Current loan status: ${currentLoan.status} (${currentLoan.code})`);

    if (contractTypes.length === 0) {
      return {
        success: false,
        error: "Vui lòng chọn ít nhất một loại hợp đồng",
      };
    }

    const statusSnapshot =
      currentLoan.status === "signed"
        ? {
            status: currentLoan.status,
            signed_at: currentLoan.signed_at,
            is_signed: currentLoan.is_signed ?? true,
            draft_signature_file_id: currentLoan.draft_signature_file_id,
            official_signature_file_id: currentLoan.official_signature_file_id,
          }
        : null;

    // Khoản vay đã ký vẫn có thể tạo lại các loại hợp đồng được chọn.
    // Reset chữ ký để generateContractsService có thể tạo lại ở trạng thái approved.
    if (currentLoan.status === "signed") {
      console.log(`[REGENERATE_CONTRACTS] Resetting loan status to approved...`);
      const { error: updateError } = await supabase
        .from("loans")
        .update({
          status: "approved",
          signed_at: null,
          is_signed: false,
          draft_signature_file_id: null,
          official_signature_file_id: null,
        })
        .eq("id", loanId)
        .eq("status", "signed");

      if (updateError) {
        console.error("[RESET_LOAN_STATUS_ERROR]", updateError);
        return {
          success: false,
          error: "Không thể reset trạng thái khoản vay",
        };
      }
    }

    console.log(`[REGENERATE_CONTRACTS] Generating new contracts...`);

    const result = await generateContractsService(loanId, contractTypes);

    if (!result.success && statusSnapshot) {
      const { error: rollbackError } = await supabase
        .from("loans")
        .update(statusSnapshot)
        .eq("id", loanId)
        .eq("status", "approved");

      if (rollbackError) {
        console.error("[REGENERATE_STATUS_ROLLBACK_ERROR]", rollbackError);
      }
    }

    return result;
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

    // Lấy loan details và metadata trước. Chỉ thay thế dữ liệu cũ sau khi đã tạo mới thành công.
    const { getLoanDetailsService } = await import(
      "@/services/loans/loans.service"
    );
    
    const [loan, loanData] = await Promise.all([
      getLoanDetailsService(loanId),
      supabase
        .from("loans")
        .select("draft_signature_file_id, official_signature_file_id, metadata")
        .eq("id", loanId)
        .single(),
    ]);

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

    const { data: loanFiles } = await supabase
      .from("loan_files")
      .select("type, name")
      .eq("loan_id", loanId);

    const createdContractTypes = getUnsignedContractTypesFromFiles(
      loanFiles ?? [],
    ) as TContractType[];

    if (createdContractTypes.length === 0) {
      return {
        success: false,
        error: "Chưa có hợp đồng để ký",
      };
    }

    const createdSet = new Set(createdContractTypes);

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

    const signedContractMeta: Partial<
      Record<TContractType, { name: string; fileName: string }>
    > = {
      [CONTRACT_TYPE.ASSET_PLEDGE]: {
        name: "HĐ Cầm Cố Tài Sản (Đã ký)",
        fileName: `HD-CamCo-DaKy-${loan.code}${versionSuffix}.pdf`,
      },
      [CONTRACT_TYPE.ASSET_LEASE]: {
        name: "HĐ Thuê Tài Sản (Đã ký)",
        fileName: `HD-Thue-DaKy-${loan.code}${versionSuffix}.pdf`,
      },
      [CONTRACT_TYPE.FULL_PAYMENT]: {
        name: "XN Đã Nhận Đủ Tiền (Đã ký)",
        fileName: `XN-NhanTien-DaKy-${loan.code}${versionSuffix}.pdf`,
      },
      [CONTRACT_TYPE.ASSET_DISPOSAL]: {
        name: "UQ Xử Lý Tài Sản (Đã ký)",
        fileName: `UQ-XuLy-DaKy-${loan.code}${versionSuffix}.pdf`,
      },
    };

    const contractsData = buildAllContractsData(loan, folderId, versionSuffix)
      .filter((contract) => createdSet.has(contract.type))
      .map((contract) => {
        const meta = signedContractMeta[contract.type];
        if (!meta) return null;

        return {
          type: contract.type,
          name: meta.name,
          fileName: meta.fileName,
          data: {
            ...contract.data,
            DRAFT_SIGNATURE: draftSignatureBase64,
            OFFICIAL_SIGNATURE: officialSignatureBase64,
          },
        };
      })
      .filter((contract): contract is NonNullable<typeof contract> =>
        contract !== null,
      );

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

    if (validContracts.length !== contractsData.length) {
      return {
        success: false,
        error:
          "Một hoặc nhiều hợp đồng ký tạo PDF thất bại. Hệ thống đã dừng để tránh dữ liệu không đồng bộ.",
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

    if (successfulUploads.length !== validContracts.length) {
      await cleanupDriveFiles(
        successfulUploads
          .map((contract) => contract.fileId)
          .filter((id): id is string => Boolean(id)),
      );
      return {
        success: false,
        error:
          "Một hoặc nhiều hợp đồng ký upload thất bại. Hệ thống đã dừng để tránh dữ liệu không đồng bộ.",
      };
    }

    const signedTypes = successfulUploads.map((contract) => contract.type);
    const { data: existingRows, error: existingRowsError } = await supabase
      .from("loan_files")
      .select("id")
      .eq("loan_id", loanId)
      .in("type", signedTypes);

    if (existingRowsError) {
      console.error("[FETCH_OLD_SIGNED_CONTRACTS_ERROR]", existingRowsError);
      return {
        success: false,
        error:
          "Không thể kiểm tra hợp đồng đã ký cũ trước khi thay thế. Vui lòng thử lại.",
      };
    }

    // Insert tất cả records mới trước
    console.time("Insert Signed PDFs to DB");
    const rowsToInsert = successfulUploads.map((contract) => ({
      loan_id: loanId,
      name: contract.name,
      type: contract.type,
      provider: "google_drive" as const,
      file_id: contract.fileId!,
    }));

    const { data: insertedRows, error: insertError } = await supabase
      .from("loan_files")
      .insert(rowsToInsert)
      .select("id, name, type, file_id, provider");
    console.timeEnd("Insert Signed PDFs to DB");

    if (insertError || !insertedRows || insertedRows.length !== rowsToInsert.length) {
      console.error("[SIGNED_DB_BULK_INSERT_ERROR]", insertError);
      await cleanupDriveFiles(
        successfulUploads.map((contract) => contract.fileId!),
      );
      return {
        success: false,
        error:
          "Không thể lưu đầy đủ hợp đồng ký mới vào hệ thống. Dữ liệu cũ được giữ nguyên.",
      };
    }

    // Xóa đúng hợp đồng cũ cùng type sau khi insert mới thành công
    const oldIdsToDelete = (existingRows ?? []).map((row) => row.id);
    const newDriveFileIds = successfulUploads.map((contract) => contract.fileId!);
    const newRowIds = insertedRows.map((row) => row.id);

    if (oldIdsToDelete.length > 0) {
      const { error: cleanupError } = await supabase
        .from("loan_files")
        .delete()
        .in("id", oldIdsToDelete);

      if (cleanupError) {
        console.error("[SIGNED_CLEANUP_OLD_CONTRACTS_ERROR]", cleanupError);
        await rollbackInsertedContractRows(supabase, newRowIds, newDriveFileIds);
        return {
          success: false,
          error:
            "Không thể hoàn tất thay thế hợp đồng đã ký. Dữ liệu cũ được giữ nguyên.",
        };
      }
    }

    const uploadedContracts: TContractFile[] = insertedRows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type as TContractType,
      fileId: row.file_id,
      provider: row.provider,
    }));

    // Update signed_contract_version in metadata (always 1 since we delete old ones)
    const updatedMetadata = {
      ...(loanData.data?.metadata || {}),
      signed_contract_version: newVersion,
    };

    const { error: metadataUpdateError } = await supabase
      .from("loans")
      .update({ metadata: updatedMetadata })
      .eq("id", loanId);

    if (metadataUpdateError) {
      console.error("[UPDATE_SIGNED_CONTRACT_VERSION_ERROR]", metadataUpdateError);
      return {
        success: false,
        error:
          "Đã tạo hợp đồng ký nhưng không thể cập nhật phiên bản. Vui lòng thử lại.",
      };
    }

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
