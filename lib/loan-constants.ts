/**
 * 🔹 LOAN CONSTANTS
 * Các hằng số dùng chung cho tính toán khoản vay
 */

/** Lãi suất cơ bản: 0.033%/ngày */
export const DAILY_INTEREST_RATE = 0.00033;

/** Số ngày tính lãi chuẩn cho hợp đồng */
export const STANDARD_LOAN_DAYS = 30;

/** Ngưỡng áp dụng phí thẩm định */
export const APPRAISAL_FEE_THRESHOLD = 5_000_000;

/** Tỷ lệ phí thẩm định */
export const APPRAISAL_FEE_RATE = 0.05; // 5%

/**
 * Lấy mô tả lãi suất cho hợp đồng cầm cố
 * Tính động dựa trên DAILY_INTEREST_RATE và STANDARD_LOAN_DAYS
 */
export function getLoanInterestRateDescription(): string {
  // Tính lãi suất theo tháng (30 ngày)
  const monthlyRate = DAILY_INTEREST_RATE * STANDARD_LOAN_DAYS * 100; // Chuyển sang %
  const formattedRate = monthlyRate.toFixed(2).replace(".", ","); // Format theo VN: 0,99
  
  return `${formattedRate}%/${STANDARD_LOAN_DAYS} ngày`;
}
