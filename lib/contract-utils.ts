/**
 * Thứ tự hiển thị hợp đồng
 */

export const CONTRACT_ORDER = [
  "asset_pledge_contract", // HĐ Cầm Cố Tài Sản
  "asset_lease_contract", // HĐ Thuê Tài Sản
  "full_payment_confirmation", // XN Đã Nhận Đủ Tiền
  "asset_disposal_authorization", // Ủy Quyền Xử Lý TS
] as const;

export const GENERATABLE_LOAN_FILE_TYPES = new Set<string>(CONTRACT_ORDER);

const SIGNED_CONTRACT_NAME_MARKERS = ["(Đã ký)", "DaKy"] as const;

export function isSignedContractFileName(name: string): boolean {
  return SIGNED_CONTRACT_NAME_MARKERS.some((marker) => name.includes(marker));
}

type TContractFileLike = { name: string; type: string };

export function splitLoanContractFiles<T extends TContractFileLike>(
  files: T[],
) {
  const contractFiles = files.filter((file) =>
    GENERATABLE_LOAN_FILE_TYPES.has(file.type),
  );

  return {
    unsignedContractFiles: contractFiles.filter(
      (file) => !isSignedContractFileName(file.name),
    ),
    signedContractFiles: contractFiles.filter((file) =>
      isSignedContractFileName(file.name),
    ),
  };
}

export function needsSignedContractRepair({
  loanStatus,
  hasSignatures,
  loanFiles,
}: {
  loanStatus: string;
  hasSignatures: boolean;
  loanType?: string;
  loanFiles: TContractFileLike[];
}): boolean {
  if (loanStatus !== "signed" || !hasSignatures) {
    return false;
  }

  const { unsignedContractFiles, signedContractFiles } =
    splitLoanContractFiles(loanFiles);

  if (unsignedContractFiles.length === 0) {
    return false;
  }

  return signedContractFiles.length < unsignedContractFiles.length;
}

/**
 * Sắp xếp danh sách contracts/files theo thứ tự mong muốn
 */
export function sortContractsByType<T extends { type: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const indexA = CONTRACT_ORDER.indexOf(a.type as any);
    const indexB = CONTRACT_ORDER.indexOf(b.type as any);

    return indexA - indexB;
  });
}

/** Lấy danh sách loại hợp đồng chưa ký từ loan_files (theo thứ tự hiển thị) */
export function getUnsignedContractTypesFromFiles<T extends TContractFileLike>(
  files: T[],
): string[] {
  const { unsignedContractFiles } = splitLoanContractFiles(files);

  return sortContractsByType(unsignedContractFiles).map((file) => file.type);
}
