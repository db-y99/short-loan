import type { TLoanDetails } from "@/types/loan.types";
import type {
  TAssetPledgeContractData,
  TAssetLeaseContractData,
  TFullPaymentConfirmationData,
  TAssetDisposalAuthorizationData,
} from "@/types/contract.types";
import { formatDateShortVN } from "@/lib/format";
import { COMPANY_INFO } from "@/constants/company";

/** Format số tiền VND */
function formatVND(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n) + " VNĐ";
}

/**
 * Build dữ liệu cho Hợp đồng cầm cố tài sản từ TLoanDetails
 * @param driveFolderId - Folder Drive của loan để upload PDF (tùy chọn)
 */
export function buildAssetPledgeContractData(
  loan: TLoanDetails,
  driveFolderId = "",
): TAssetPledgeContractData {
  const signedDate = new Date(loan.signedAt ?? loan.id);
  const principal = loan.loanAmount;

  /** Tính các mốc thanh toán từ currentPeriod nếu có, nếu không dùng công thức cũ */
  const milestones = loan.currentPeriod?.milestones.map((m, index) => ({
    moc: index + 1,
    ngay: m.days,
    tongTien: formatVND(m.totalRedemption),
  })) ?? [
    { moc: 1, ngay: 7, tongTien: formatVND(principal) },
    { moc: 2, ngay: 18, tongTien: formatVND(principal) },
    { moc: 3, ngay: 30, tongTien: formatVND(principal) },
  ];

  /** Chi tiết tài sản: tên + IMEI/Serial nếu có */
  const imeiStr = loan.asset.imei ? ` (IMEI: ${loan.asset.imei}` : "";
  const serialStr = loan.asset.serial
    ? imeiStr
      ? ` - Serial: ${loan.asset.serial})`
      : ` (Serial: ${loan.asset.serial})`
    : imeiStr
      ? ")"
      : "";
  const chiTiet = `${loan.asset.name || ""}${imeiStr}${serialStr}`.trim();

  return {
    MA_HD: loan.code,
    NGAY: signedDate.getDate(),
    THANG: signedDate.getMonth() + 1,
    NAM: signedDate.getFullYear(),
    BEN_A_TEN: COMPANY_INFO.NAME,
    BEN_A_DIA_CHI: COMPANY_INFO.ADDRESS,
    BEN_A_DAI_DIEN: `Bà ${COMPANY_INFO.REPRESENTATIVE.toUpperCase()}`,
    BEN_A_CHUC_VU: COMPANY_INFO.POSITION,
    HO_TEN: loan.customer.fullName,
    CCCD: loan.customer.cccd,
    NGAY_CAP: loan.customer.cccdIssueDate,
    NOI_CAP: loan.customer.cccdIssuePlace,
    DIA_CHI: loan.customer.address,
    SDT: loan.customer.phone,
    LOAI_TS: loan.asset.type,
    CHI_TIET: chiTiet || "—",
    IMEI: loan.asset.imei ?? "—",
    SERIAL: loan.asset.serial ?? "—",
    TINH_TRANG: loan.assetCondition || "Đang cầm cố",
    SO_TIEN_VAY: formatVND(principal),
    LAI_SUAT: getLoanInterestRateDescription(loan.loanType),
    MILESTONES: milestones,
    drive_folder_id: driveFolderId,
  };
}

/**
 * Lấy mô tả lãi suất/phí theo gói vay
 */
function getLoanInterestRateDescription(loanType: string): string {
  if (loanType.includes("trả góp") || loanType.includes("3 kỳ")) {
    return "Lãi suất 0,033%/ngày + Phí thuê tài sản";
  } else if (loanType.includes("Theo mốc")) {
    return "Phí theo mốc: 5% (7 ngày), 8% (18 ngày), 12% (30 ngày)";
  } else if (loanType.includes("Giữ TS")) {
    return "Phí theo mốc: 1,25% (7 ngày), 3,5% (18 ngày), 5% (30 ngày)";
  }
  return "0,99%/30 ngày";
}

/** Build dữ liệu Hợp đồng thuê tài sản */
export function buildAssetLeaseContractData(
  loan: TLoanDetails,
  driveFolderId = "",
): TAssetLeaseContractData {
  const signedDate = new Date(loan.signedAt ?? loan.id);
  const principal = loan.loanAmount;
  
  /** Tính các mốc thanh toán từ currentPeriod nếu có */
  const milestones = loan.currentPeriod?.milestones.map((m, index) => ({
    moc: index + 1,
    ngay: m.days,
    tongTien: formatVND(m.totalRedemption),
  })) ?? [
    { moc: 1, ngay: 7, tongTien: formatVND(principal) },
    { moc: 2, ngay: 18, tongTien: formatVND(principal) },
    { moc: 3, ngay: 30, tongTien: formatVND(principal) },
  ];
  
  const imeiStr = loan.asset.imei ? ` (IMEI: ${loan.asset.imei}` : "";
  const serialStr = loan.asset.serial
    ? imeiStr
      ? ` - Serial: ${loan.asset.serial})`
      : ` (Serial: ${loan.asset.serial})`
    : imeiStr
      ? ")"
      : "";
  const chiTiet = `${loan.asset.name || ""}${imeiStr}${serialStr}`.trim();

  return {
    MA_HD_CAM_CO: loan.code,
    SO_HD_THUE: `${loan.code}-T`,
    NGAY: signedDate.getDate(),
    THANG: signedDate.getMonth() + 1,
    NAM: signedDate.getFullYear(),
    BEN_A_TEN: COMPANY_INFO.NAME,
    BEN_A_DIA_CHI: COMPANY_INFO.ADDRESS,
    BEN_A_DAI_DIEN: COMPANY_INFO.REPRESENTATIVE,
    BEN_A_CHUC_VU: COMPANY_INFO.POSITION,
    BEN_A_MST: COMPANY_INFO.TAX_CODE,
    BEN_A_SDT: COMPANY_INFO.PHONE,
    HO_TEN: loan.customer.fullName,
    CCCD: loan.customer.cccd,
    NGAY_CAP: loan.customer.cccdIssueDate,
    NOI_CAP: loan.customer.cccdIssuePlace,
    DIA_CHI: loan.customer.address,
    SDT: loan.customer.phone,
    LOAI_TS: loan.asset.type,
    CHI_TIET: chiTiet || "—",
    IMEI: loan.asset.imei ?? "—",
    SERIAL: loan.asset.serial ?? "—",
    MILESTONES: milestones,
    NGAY_BAT_DAU: formatDateShortVN(loan.signedAt ?? new Date().toISOString()),
    drive_folder_id: driveFolderId,
  };
}

/** Build dữ liệu Xác nhận đã nhận đủ tiền */
export function buildFullPaymentConfirmationData(
  loan: TLoanDetails,
  driveFolderId = "",
): TFullPaymentConfirmationData {
  const d = new Date();

  return {
    MA_HD: loan.code,
    NGAY_HD: formatDateShortVN(loan.signedAt ?? new Date().toISOString()),
    NGAY: d.getDate(),
    THANG: d.getMonth() + 1,
    NAM: d.getFullYear(),
    BEN_GIAO_TEN: COMPANY_INFO.NAME,
    BEN_GIAO_DIA_CHI: COMPANY_INFO.ADDRESS,
    BEN_GIAO_DAI_DIEN: COMPANY_INFO.REPRESENTATIVE,
    BEN_GIAO_CHUC_VU: COMPANY_INFO.POSITION,
    BEN_GIAO_MST: COMPANY_INFO.TAX_CODE,
    BEN_GIAO_SDT: COMPANY_INFO.PHONE,
    HO_TEN: loan.customer.fullName,
    CCCD: loan.customer.cccd,
    NGAY_CAP: loan.customer.cccdIssueDate,
    NOI_CAP: loan.customer.cccdIssuePlace,
    DIA_CHI: loan.customer.address,
    SDT: loan.customer.phone,
    TAI_SAN: loan.asset.name ?? "",
    SO_TIEN: formatVND(loan.loanAmount),
    NGAN_HANG: loan.bank.name ?? "—",
    SO_TAI_KHOAN: loan.bank.accountNumber ?? "—",
    TEN_TAI_KHOAN: loan.bank.accountHolder ?? "—",
    drive_folder_id: driveFolderId,
  };
}

/** Build dữ liệu Giấy ủy quyền xử lý tài sản cầm cố */
export function buildAssetDisposalAuthorizationData(
  loan: TLoanDetails,
  driveFolderId = "",
): TAssetDisposalAuthorizationData {
  const signedDate = new Date(loan.signedAt ?? loan.id);
  const imeiStr = loan.asset.imei ? ` (IMEI: ${loan.asset.imei}` : "";
  const serialStr = loan.asset.serial
    ? imeiStr
      ? ` - Serial: ${loan.asset.serial})`
      : ` (Serial: ${loan.asset.serial})`
    : imeiStr
      ? ")"
      : "";
  const chiTiet = `${loan.asset.name || ""}${imeiStr}${serialStr}`.trim();

  return {
    MA_HD: loan.code,
    NGAY: signedDate.getDate(),
    THANG: signedDate.getMonth() + 1,
    NAM: signedDate.getFullYear(),
    HO_TEN: loan.customer.fullName,
    CCCD: loan.customer.cccd,
    NGAY_CAP: loan.customer.cccdIssueDate,
    NOI_CAP: loan.customer.cccdIssuePlace,
    DIA_CHI: loan.customer.address,
    SDT: loan.customer.phone,
    BEN_UU_QUYEN_TEN: COMPANY_INFO.NAME,
    BEN_UU_QUYEN_DIA_CHI: COMPANY_INFO.ADDRESS,
    BEN_UU_QUYEN_DAI_DIEN: COMPANY_INFO.REPRESENTATIVE,
    BEN_UU_QUYEN_MST: COMPANY_INFO.TAX_CODE,
    BEN_UU_QUYEN_SDT: COMPANY_INFO.PHONE,
    LOAI_TS: loan.asset.type,
    CHI_TIET: chiTiet || "—",
    IMEI: loan.asset.imei ?? "—",
    SERIAL: loan.asset.serial ?? "—",
    TINH_TRANG: loan.assetCondition || "Đang cầm cố",
    drive_folder_id: driveFolderId,
  };
}
