import { CONTRACT_TYPE } from "@/types/contract.types";
import type { TContractType } from "@/types/contract.types";

export { CONTRACT_TYPE };

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
