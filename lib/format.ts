/**
 * Format chuỗi số thành dạng 1.000.000 (dấu chấm ngăn cách hàng nghìn)
 * Chỉ giữ lại ký tự số, loại bỏ mọi ký tự khác
 */
export const formatNumberInput = (value: string): string => {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  return Number(digits).toLocaleString("de-DE");
};

/**
 * Parse chuỗi đã format (1.000.000) về số nguyên
 */
export const parseFormattedNumber = (value: string): number => {
  const digits = value.replace(/\D/g, "");

  return digits ? Number(digits) : 0;
};

/**
 * Format số tiền VND (vi-VN)
 */
export const formatCurrencyVND = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Format ngày giờ vi-VN (ngày/tháng/năm giờ:phút)
 */
export const formatDateTimeVN = (dateString: string | null): string => {
  if (!dateString) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

/**
 * Format ngày ngắn vi-VN (ngày/tháng/năm)
 */
export const formatDateShortVN = (dateString: string): string => {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateString));
};

/**
 * Format thời gian nhật ký (ngày/tháng giờ:phút)
 */
export const formatActivityTimeVN = (dateString: string): string => {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};
