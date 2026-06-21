import { LOAN_TYPES } from "@/constants/loan";
import { CONTRACT_TYPE } from "@/types/contract.types";
import type { TContractType } from "@/types/contract.types";

export { CONTRACT_TYPE };

/** Gói 3 (giữ tài sản tại cửa hàng) — không có HĐ thuê tài sản */
export const isCollateralHoldLoanType = (loanType: string): boolean =>
  loanType === LOAN_TYPES.BULLET_PAYMENT_WITH_COLLATERAL_HOLD ||
  loanType.includes("Giữ TS");

/** Loại hợp đồng áp dụng theo gói vay */
export const getGeneratableContractTypesForLoan = (
  loanType: string,
): TContractType[] => {
  if (isCollateralHoldLoanType(loanType)) {
    return GENERATABLE_CONTRACT_TYPES.filter(
      (type) => type !== CONTRACT_TYPE.ASSET_LEASE,
    );
  }

  return [...GENERATABLE_CONTRACT_TYPES];
};

/** Tab ký hợp đồng (trang /loans/[id]/sign) */
export const SIGN_PAGE_CONTRACT_TABS = [
  {
    key: "asset_pledge",
    type: CONTRACT_TYPE.ASSET_PLEDGE,
    label: "HĐ Cầm Cố",
    short: "1",
  },
  {
    key: "asset_lease",
    type: CONTRACT_TYPE.ASSET_LEASE,
    label: "HĐ Thuê TS",
    short: "2",
  },
  {
    key: "full_payment",
    type: CONTRACT_TYPE.FULL_PAYMENT,
    label: "XN Nhận Tiền",
    short: "3",
  },
  {
    key: "asset_disposal",
    type: CONTRACT_TYPE.ASSET_DISPOSAL,
    label: "Ủy Quyền TS",
    short: "4",
  },
] as const;

export type TSignPageContractTabKey =
  (typeof SIGN_PAGE_CONTRACT_TABS)[number]["key"];

export const getSignPageContractTabsForLoan = (loanType: string) => {
  const allowed = new Set(getGeneratableContractTypesForLoan(loanType));

  return SIGN_PAGE_CONTRACT_TABS.filter((tab) => allowed.has(tab.type));
};

/** Danh sách loại hợp đồng có thể tạo (theo thứ tự hiển thị) */
export const GENERATABLE_CONTRACT_TYPES: TContractType[] = [
  CONTRACT_TYPE.ASSET_PLEDGE,
  CONTRACT_TYPE.ASSET_LEASE,
  CONTRACT_TYPE.FULL_PAYMENT,
  CONTRACT_TYPE.ASSET_DISPOSAL,
];

export const CONTRACT_TYPE_LABEL: Record<TContractType, string> = {
  [CONTRACT_TYPE.ASSET_PLEDGE]: "HĐ Cầm Cố Tài Sản",
  [CONTRACT_TYPE.ASSET_LEASE]: "HĐ Thuê Tài Sản",
  [CONTRACT_TYPE.FULL_PAYMENT]: "XN Đã Nhận Đủ Tiền",
  [CONTRACT_TYPE.ASSET_DISPOSAL]: "UQ Xử Lý Tài Sản",
};

export const CONTRACT_TYPE_DESCRIPTION: Record<TContractType, string> = {
  [CONTRACT_TYPE.ASSET_PLEDGE]: "Hợp đồng cầm cố tài sản (gốc + lãi)",
  [CONTRACT_TYPE.ASSET_LEASE]: "Hợp đồng thuê tài sản (phí thuê)",
  [CONTRACT_TYPE.FULL_PAYMENT]: "Xác nhận khách hàng đã nhận đủ tiền",
  [CONTRACT_TYPE.ASSET_DISPOSAL]: "Giấy ủy quyền xử lý tài sản cầm cố",
};
