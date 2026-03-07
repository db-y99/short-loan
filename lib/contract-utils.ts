/**
 * Thứ tự hiển thị hợp đồng
 */
export const CONTRACT_ORDER = [
  "asset_pledge_contract",      // HĐ Cầm Cố Tài Sản
  "asset_lease_contract",        // HĐ Thuê Tài Sản
  "full_payment_confirmation",   // XN Đã Nhận Đủ Tiền
  "asset_disposal_authorization" // Ủy Quyền Xử Lý TS
] as const;

/**
 * Sắp xếp danh sách contracts/files theo thứ tự mong muốn
 */
export function sortContractsByType<T extends { type: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const indexA = CONTRACT_ORDER.indexOf(a.type as any);
    const indexB = CONTRACT_ORDER.indexOf(b.type as any);
    return indexA - indexB;
  });
}
