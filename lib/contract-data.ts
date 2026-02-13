import type { TLoanDetails } from "@/types/loan.types";
import type {
  TAssetPledgeContractData,
  TAssetLeaseContractData,
  TFullPaymentConfirmationData,
  TAssetDisposalAuthorizationData,
} from "@/types/contract.types";
import { formatDateShortVN } from "@/lib/format";

/** Lãi suất 0,99%/30 ngày - tính lãi theo mốc */
const INTEREST_RATE_PER_30 = 0.0099;
const MILESTONE_DAYS = [7, 18, 30] as const;

/** Tính lãi theo số ngày (tỷ lệ tuyến tính với 30 ngày) */
function calcInterest(principal: number, days: number): number {
  return Math.round(principal * INTEREST_RATE_PER_30 * (days / 30));
}

/** Tính tổng phải trả (gốc + lãi) tại mốc */
function calcTotalDue(principal: number, days: number): number {
  return principal + calcInterest(principal, days);
}

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

  /** Tính các mốc thanh toán (ngày 7, 18, 30) */
  const milestones = MILESTONE_DAYS.map((ngay) => ({
    moc: MILESTONE_DAYS.indexOf(ngay) + 1,
    ngay,
    tongTien: formatVND(calcTotalDue(principal, ngay)),
  }));

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
    BEN_A_TEN: "CÔNG TY CỔ PHẦN CẦM ĐỒ Y99",
    BEN_A_DIA_CHI:
      "99B Nguyễn Trãi, phường Ninh Kiều, thành phố Cần Thơ",
    BEN_A_DAI_DIEN: "Bà NGUYỄN THỊ THÚY QUYÊN",
    BEN_A_CHUC_VU: "Giám đốc",
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
    TINH_TRANG: "Đang cầm cố",
    SO_TIEN_VAY: formatVND(principal),
    LAI_SUAT: "0,99%/30 ngày",
    MILESTONES: milestones,
    drive_folder_id: driveFolderId,
  };
}

/** Build dữ liệu Hợp đồng thuê tài sản */
export function buildAssetLeaseContractData(
  loan: TLoanDetails,
  driveFolderId = "",
): TAssetLeaseContractData {
  const signedDate = new Date(loan.signedAt ?? loan.id);
  const principal = loan.loanAmount;
  const milestones = MILESTONE_DAYS.map((ngay) => ({
    moc: MILESTONE_DAYS.indexOf(ngay) + 1,
    ngay,
    tongTien: formatVND(calcTotalDue(principal, ngay)),
  }));
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
    BEN_A_TEN: "CÔNG TY CỔ PHẦN CẦM ĐỒ Y99",
    BEN_A_DIA_CHI: "99B Nguyễn Trãi, Phường Ninh Kiều, TP Cần Thơ, Việt Nam",
    BEN_A_DAI_DIEN: "Nguyễn Thị Thúy Quyên",
    BEN_A_CHUC_VU: "Giám đốc",
    BEN_A_MST: "1801778932",
    BEN_A_SDT: "1900575792",
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
    BEN_GIAO_TEN: "CÔNG TY CỔ PHẦN CẦM ĐỒ Y99",
    BEN_GIAO_DIA_CHI:
      "99B Nguyễn Trãi, Phường Ninh Kiều, TP Cần Thơ, Việt Nam",
    BEN_GIAO_DAI_DIEN: "Nguyễn Thị Thúy Quyên",
    BEN_GIAO_CHUC_VU: "Giám đốc",
    BEN_GIAO_MST: "1801778932",
    BEN_GIAO_SDT: "1900575792",
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
    BEN_UU_QUYEN_TEN: "CÔNG TY CỔ PHẦN CẦM ĐỒ Y99",
    BEN_UU_QUYEN_DIA_CHI:
      "99B Nguyễn Trãi, Phường Ninh Kiều, TP Cần Thơ, Việt Nam",
    BEN_UU_QUYEN_DAI_DIEN: "Nguyễn Thị Thúy Quyên",
    BEN_UU_QUYEN_MST: "1801778932",
    BEN_UU_QUYEN_SDT: "1900575792",
    LOAI_TS: loan.asset.type,
    CHI_TIET: chiTiet || "—",
    IMEI: loan.asset.imei ?? "—",
    SERIAL: loan.asset.serial ?? "—",
    TINH_TRANG: "Đang cầm cố",
    drive_folder_id: driveFolderId,
  };
}
