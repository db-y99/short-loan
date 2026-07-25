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
import {
  getLoanInterestRateDescription,
  DAILY_INTEREST_RATE,
} from "@/lib/loan-constants";
import { LOAN_TYPES, ASSET_TYPES, type TLoanType } from "@/constants/loan";
import {
  calculateAppraisalFee,
  calculateBulletPaymentWithCollateralHold,
} from "@/lib/loan-calculation";
import { isCollateralHoldLoanType } from "@/constants/contracts";

/** Format số tiền VND */
function formatVND(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n) + " VNĐ";
}

/**
 * Helper function để build thông tin định danh tài sản theo loại
 * - Điện thoại, Laptop: IMEI và Serial
 * - Xe máy, Ô tô: Số khung và Số máy
 */
function buildAssetIdentityInfo(loan: TLoanDetails): {
  chiTiet: string;
  field1Label: string;
  field1Value: string;
  field2Label: string;
  field2Value: string;
} {
  const assetType = loan.asset.type;

  // So sánh với label tiếng Việt vì loan.asset.type đã được convert sang label
  const isVehicle =
    assetType === "Xe máy" ||
    assetType === "Ô tô" ||
    assetType === ASSET_TYPES.MOTORBIKE ||
    assetType === ASSET_TYPES.CAR;
  const isDevice =
    assetType === "Điện thoại" ||
    assetType === "Laptop" ||
    assetType === ASSET_TYPES.PHONE ||
    assetType === ASSET_TYPES.LAPTOP;

  if (isVehicle) {
    // Xe máy, Ô tô: hiển thị số khung và số máy
    const chassisStr = loan.asset.chassisNumber
      ? ` (Số khung: ${loan.asset.chassisNumber}`
      : "";
    const engineStr = loan.asset.engineNumber
      ? chassisStr
        ? ` - Số máy: ${loan.asset.engineNumber})`
        : ` (Số máy: ${loan.asset.engineNumber})`
      : chassisStr
        ? ")"
        : "";

    return {
      chiTiet: `${loan.asset.name || ""}${chassisStr}${engineStr}`.trim(),
      field1Label: "Số khung",
      field1Value: loan.asset.chassisNumber ?? "—",
      field2Label: "Số máy",
      field2Value: loan.asset.engineNumber ?? "—",
    };
  } else if (isDevice) {
    // Điện thoại, Laptop: hiển thị IMEI và Serial
    const imeiStr = loan.asset.imei ? ` (IMEI: ${loan.asset.imei}` : "";
    const serialStr = loan.asset.serial
      ? imeiStr
        ? ` - Serial: ${loan.asset.serial})`
        : ` (Serial: ${loan.asset.serial})`
      : imeiStr
        ? ")"
        : "";

    return {
      chiTiet: `${loan.asset.name || ""}${imeiStr}${serialStr}`.trim(),
      field1Label: "IMEI",
      field1Value: loan.asset.imei ?? "—",
      field2Label: "Serial",
      field2Value: loan.asset.serial ?? "—",
    };
  } else {
    // Các loại khác: hiển thị IMEI và Serial (mặc định)
    const imeiStr = loan.asset.imei ? ` (IMEI: ${loan.asset.imei}` : "";
    const serialStr = loan.asset.serial
      ? imeiStr
        ? ` - Serial: ${loan.asset.serial})`
        : ` (Serial: ${loan.asset.serial})`
      : imeiStr
        ? ")"
        : "";

    return {
      chiTiet: `${loan.asset.name || ""}${imeiStr}${serialStr}`.trim(),
      field1Label: "IMEI",
      field1Value: loan.asset.imei ?? "—",
      field2Label: "Serial",
      field2Value: loan.asset.serial ?? "—",
    };
  }
}

/**
 * Tạo milestones cho Hợp đồng cầm cố (Chỉ hiển thị lãi suất pháp lý)
 * Dựa vào loanAmount và loanType để tính trực tiếp
 */
function buildPledgeMilestones(loan: TLoanDetails): TPledgeMilestone[] {
  const loanAmount = loan.loanAmount;

  // Gói 3: Hiển thị tổng chuộc (Gốc + Lãi + Phí thuê + Phí DV)
  if (isCollateralHoldLoanType(loan.loanType)) {
    return calculateBulletPaymentWithCollateralHold(loanAmount).map((p) => ({
      moc: p.milestone,
      ngay: p.days,
      lai: formatVND(p.interest),
      tongTien: formatVND(p.total),
    }));
  }

  // Gói 1 & 2: Tính lãi suất pháp lý cho 3 mốc (chỉ hiển thị lãi, không hiển thị phí thuê)
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
 * Tạo milestones cho Hợp đồng thuê tài sản (Phí thuê)
 * Dựa vào loanAmount và loanType để tính trực tiếp
 */
function buildLeaseMilestones(loan: TLoanDetails): TLeaseMilestone[] {
  const loanAmount = loan.loanAmount;

  // Xác định loan type để tính phí thuê
  const isPackage1 =
    loan.loanType === LOAN_TYPES.INSTALLMENT_3_PERIODS ||
    loan.loanType.includes("trả góp") ||
    loan.loanType.includes("3 kỳ");

  const isPackage2 =
    loan.loanType === LOAN_TYPES.BULLET_PAYMENT_BY_MILESTONE ||
    loan.loanType.includes("Theo mốc");

  const isPackage3 =
    loan.loanType === LOAN_TYPES.BULLET_PAYMENT_WITH_COLLATERAL_HOLD ||
    loan.loanType.includes("Giữ TS");

  if (isPackage1) {
    // Package 1: Phí thuê = Target profit - Interest
    return [
      {
        moc: 1,
        ngay: 7,
        phiThue: formatVND(
          Math.max(
            0,
            Math.round(loanAmount * 0.03) -
              Math.round(loanAmount * DAILY_INTEREST_RATE * 7),
          ),
        ),
      },
      {
        moc: 2,
        ngay: 18,
        phiThue: formatVND(
          Math.max(
            0,
            Math.round(loanAmount * 0.05) -
              Math.round(loanAmount * 0.8 * DAILY_INTEREST_RATE * 11),
          ),
        ),
      },
      {
        moc: 3,
        ngay: 30,
        phiThue: formatVND(
          Math.max(
            0,
            Math.round(loanAmount * 0.07) -
              Math.round(loanAmount * 0.5 * DAILY_INTEREST_RATE * 12),
          ),
        ),
      },
    ];
  }

  if (isPackage2) {
    // Package 2: Phí thuê = Total target - Principal - Interest
    return [
      {
        moc: 1,
        ngay: 7,
        phiThue: formatVND(
          Math.round(loanAmount * 1.05) -
            loanAmount -
            Math.round(loanAmount * DAILY_INTEREST_RATE * 7),
        ),
      },
      {
        moc: 2,
        ngay: 18,
        phiThue: formatVND(
          Math.round(loanAmount * 1.08) -
            loanAmount -
            Math.round(loanAmount * DAILY_INTEREST_RATE * 18),
        ),
      },
      {
        moc: 3,
        ngay: 30,
        phiThue: formatVND(
          Math.round(loanAmount * 1.12) -
            loanAmount -
            Math.round(loanAmount * DAILY_INTEREST_RATE * 30),
        ),
      },
    ];
  }

  if (isPackage3) {
    // Gói 3: Phí thuê + Phí dịch vụ (cùng công thức calculateBulletPaymentWithCollateralHold)
    return calculateBulletPaymentWithCollateralHold(loanAmount).map((p) => ({
      moc: p.milestone,
      ngay: p.days,
      phiThue: formatVND(p.rentalFee + (p.serviceFee ?? 0)),
    }));
  }

  // Fallback: coi như gói 2
  return [
    {
      moc: 1,
      ngay: 7,
      phiThue: formatVND(
        Math.round(loanAmount * 1.05) -
          loanAmount -
          Math.round(loanAmount * DAILY_INTEREST_RATE * 7),
      ),
    },
    {
      moc: 2,
      ngay: 18,
      phiThue: formatVND(
        Math.round(loanAmount * 1.08) -
          loanAmount -
          Math.round(loanAmount * DAILY_INTEREST_RATE * 18),
      ),
    },
    {
      moc: 3,
      ngay: 30,
      phiThue: formatVND(
        Math.round(loanAmount * 1.12) -
          loanAmount -
          Math.round(loanAmount * DAILY_INTEREST_RATE * 30),
      ),
    },
  ];
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

  /** Chi tiết tài sản: tên + thông tin định danh theo loại */
  const assetInfo = buildAssetIdentityInfo(loan);

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
    CHI_TIET: assetInfo.chiTiet || "—",
    IMEI: assetInfo.field1Value,
    SERIAL: assetInfo.field2Value,
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

  /** Chi tiết tài sản: tên + thông tin định danh theo loại */
  const assetInfo = buildAssetIdentityInfo(loan);

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
    CHI_TIET: assetInfo.chiTiet || "—",
    IMEI: assetInfo.field1Value,
    SERIAL: assetInfo.field2Value,
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

  const assetInfo = buildAssetIdentityInfo(loan);

  const assets = `${loan.asset.type}, ${assetInfo.chiTiet}`;

  const loanType = loan.loanType as TLoanType;
  const appraisalFee =
    loan.appraisalFee ?? calculateAppraisalFee(loan.loanAmount, loanType);
  const actualAmount = loan.loanAmount - appraisalFee;

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
    TAI_SAN: assets ?? "",
    SO_TIEN: formatVND(actualAmount),
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

  /** Chi tiết tài sản: tên + thông tin định danh theo loại */
  const assetInfo = buildAssetIdentityInfo(loan);

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
    CHI_TIET: assetInfo.chiTiet || "—",
    IMEI: assetInfo.field1Value,
    SERIAL: assetInfo.field2Value,
    TINH_TRANG: loan.assetCondition || "Đang cầm cố",
    drive_folder_id: driveFolderId,
  };
}
