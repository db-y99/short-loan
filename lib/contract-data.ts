import type { TLoanDetails } from "@/types/loan.types";
import type {
  TAssetPledgeContractData,
  TAssetLeaseContractData,
  TFullPaymentConfirmationData,
  TAssetDisposalAuthorizationData,
  TPledgeMilestone,
  TLeaseMilestone,
} from "@/types/contract.types";
import { formatDateShortVN } from "@/lib/format";
import { COMPANY_INFO } from "@/constants/company";
import { getLoanInterestRateDescription, DAILY_INTEREST_RATE } from "@/lib/loan-constants";
import { LOAN_TYPES } from "@/constants/loan";

/** Format số tiền VND */
function formatVND(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n) + " VNĐ";
}

/**
 * Tạo milestones cho Hợp đồng cầm cố (Chỉ hiển thị lãi suất pháp lý)
 * Dựa vào loanAmount và loanType để tính trực tiếp
 */
function buildPledgeMilestones(loan: TLoanDetails): TPledgeMilestone[] {
  const loanAmount = loan.loanAmount;
  
  // Tính lãi suất pháp lý cho 3 mốc (chỉ hiển thị lãi, không hiển thị phí thuê)
  const milestones = [
    {
      moc: 1,
      ngay: 7,
      lai: formatVND(Math.round(loanAmount * DAILY_INTEREST_RATE * 7)), // 0.033% x 7 ngày
      tongTien: formatVND(Math.round(loanAmount * DAILY_INTEREST_RATE * 7)),
    },
    {
      moc: 2,
      ngay: 18,
      lai: formatVND(Math.round(loanAmount * DAILY_INTEREST_RATE * 18)), // 0.033% x 18 ngày
      tongTien: formatVND(Math.round(loanAmount * DAILY_INTEREST_RATE * 18)),
    },
    {
      moc: 3,
      ngay: 30,
      lai: formatVND(Math.round(loanAmount * DAILY_INTEREST_RATE * 30)), // 0.033% x 30 ngày
      tongTien: formatVND(Math.round(loanAmount * DAILY_INTEREST_RATE * 30)),
    },
  ];

  return milestones;
}

/**
 * Tạo milestones cho Hợp đồng thuê tài sản (Chỉ hiển thị phí thuê)
 * Dựa vào loanAmount và loanType để tính trực tiếp
 */
function buildLeaseMilestones(loan: TLoanDetails): TLeaseMilestone[] {
  const loanAmount = loan.loanAmount;
  
  // Xác định loan type để tính phí thuê
  let isPackage1 = loan.loanType === LOAN_TYPES.INSTALLMENT_3_PERIODS || 
                   loan.loanType.includes("trả góp") || 
                   loan.loanType.includes("3 kỳ");
  
  let isPackage2 = loan.loanType === LOAN_TYPES.BULLET_PAYMENT_BY_MILESTONE || 
                   loan.loanType.includes("Theo mốc");
  
  let isPackage3 = loan.loanType === LOAN_TYPES.BULLET_PAYMENT_WITH_COLLATERAL_HOLD || 
                   loan.loanType.includes("Giữ TS");

  if (isPackage1) {
    // Package 1: Phí thuê = Target profit - Interest
    return [
      {
        moc: 1,
        ngay: 7,
        phiThue: formatVND(Math.max(0, Math.round(loanAmount * 0.03) - Math.round(loanAmount * DAILY_INTEREST_RATE * 7))),
      },
      {
        moc: 2,
        ngay: 18,
        phiThue: formatVND(Math.max(0, Math.round(loanAmount * 0.05) - Math.round((loanAmount * 0.8) * DAILY_INTEREST_RATE * 11))),
      },
      {
        moc: 3,
        ngay: 30,
        phiThue: formatVND(Math.max(0, Math.round(loanAmount * 0.07) - Math.round((loanAmount * 0.5) * DAILY_INTEREST_RATE * 12))),
      },
    ];
  } else if (isPackage2) {
    // Package 2: Phí thuê = Total target - Principal - Interest
    return [
      {
        moc: 1,
        ngay: 7,
        phiThue: formatVND(Math.round(loanAmount * 1.05) - loanAmount - Math.round(loanAmount * DAILY_INTEREST_RATE * 7)),
      },
      {
        moc: 2,
        ngay: 18,
        phiThue: formatVND(Math.round(loanAmount * 1.08) - loanAmount - Math.round(loanAmount * DAILY_INTEREST_RATE * 18)),
      },
      {
        moc: 3,
        ngay: 30,
        phiThue: formatVND(Math.round(loanAmount * 1.12) - loanAmount - Math.round(loanAmount * DAILY_INTEREST_RATE * 30)),
      },
    ];
  } else {
    // Package 3: Phí thuê = Total target - Principal - Interest
    return [
      {
        moc: 1,
        ngay: 7,
        phiThue: formatVND(Math.round(loanAmount * 1.0125) - loanAmount - Math.round(loanAmount * DAILY_INTEREST_RATE * 7)),
      },
      {
        moc: 2,
        ngay: 18,
        phiThue: formatVND(Math.round(loanAmount * 1.035) - loanAmount - Math.round(loanAmount * DAILY_INTEREST_RATE * 18)),
      },
      {
        moc: 3,
        ngay: 30,
        phiThue: formatVND(Math.round(loanAmount * 1.05) - loanAmount - Math.round(loanAmount * DAILY_INTEREST_RATE * 30)),
      },
    ];
  }
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

  /** Tính các mốc thanh toán cho Hợp đồng cầm cố (Gốc + Lãi) */
  const milestones = buildPledgeMilestones(loan);

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
    LAI_SUAT: getLoanInterestRateDescription(),
    loan_type: loan.loanType, // Sử dụng snake_case
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
  
  /** Tính các mốc thanh toán cho Hợp đồng thuê (Phí thuê) */
  const milestones = buildLeaseMilestones(loan);
  
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
