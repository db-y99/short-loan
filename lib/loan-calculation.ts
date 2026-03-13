/**
 * 🔹 LOAN CALCULATION LIBRARY
 * Tính toán chi tiết cho 3 gói vay theo quy định pháp luật
 * Chia tách rõ ràng: Lãi suất + Phí thuê tài sản
 */

import { LOAN_TYPES, type TLoanType } from "@/constants/loan";
import {
  DAILY_INTEREST_RATE,
  APPRAISAL_FEE_THRESHOLD,
  APPRAISAL_FEE_RATE,
} from "@/lib/loan-constants";

/* =========================
   TYPES
========================== */

export type TInstallmentPeriod = {
  period: number; // Kỳ 1, 2, 3
  dueDay: number; // Ngày đáo hạn (7, 18, 30)
  principal: number; // Tiền gốc
  interest: number; // Tiền lãi (0.033%/ngày)
  rentalFee: number; // Phí thuê tài sản (để đạt mục tiêu lợi nhuận)
  total: number; // Tổng phải trả
  targetProfit: number; // Mục tiêu lợi nhuận (3%, 5%, 7%)
};

export type TBulletPayment = {
  milestone: number; // Mốc 1, 2, 3
  days: number; // 7, 18, 30 ngày
  rate: number; // Tỷ lệ % (5%, 8%, 12% hoặc 1.25%, 3.5%, 5%)
  interest: number; // Tiền lãi (0.033%/ngày)
  rentalFee: number; // Phí thuê tài sản
  total: number; // Tổng chuộc = Vay + Lãi + Phí
};

export type TLoanCalculationResult = {
  loanAmount: number;
  loanType: TLoanType;
  appraisalFee: number;
  netAmount: number; // Tiền khách thực nhận
  installments?: TInstallmentPeriod[]; // Gói 1
  bulletPayments?: TBulletPayment[]; // Gói 2, 3
};

/* =========================
   1. PHÍ THẨM ĐỊNH
========================== */

/**
 * Tính phí thẩm định (thu 1 lần đầu)
 * - Gói 1 & 2: Áp dụng cho khoản vay >= 5.000.000đ (5%)
 * - Gói 3: Không có phí thẩm định
 */
export function calculateAppraisalFee(
  loanAmount: number,
  loanType: TLoanType,
): number {
  // Gói 3 không có phí thẩm định
  if (loanType === LOAN_TYPES.BULLET_PAYMENT_WITH_COLLATERAL_HOLD) {
    return 0;
  }

  // Gói 1 & 2: Chỉ áp dụng cho khoản vay >= 5 triệu
  if (loanAmount < APPRAISAL_FEE_THRESHOLD) {
    return 0;
  }

  return Math.round(loanAmount * APPRAISAL_FEE_RATE);
}

/* =========================
   2. GÓI 1: VAY TRẢ GÓP (3 KỲ)
========================== */

/**
 * Tính toán chi tiết cho Gói 1: Vay trả góp (3 kỳ)
 * 
 * Logic:
 * - Kỳ 1 (ngày 7): Gốc 20%, Lãi = Vay × 0.033% × 7 ngày
 * - Kỳ 2 (ngày 18): Gốc 30%, Lãi = (Vay - G1) × 0.033% × 11 ngày
 * - Kỳ 3 (ngày 30): Gốc 50%, Lãi = (Vay - G1 - G2) × 0.033% × 12 ngày
 * 
 * Phí thuê = Mục tiêu lợi nhuận - Tiền lãi thực tế
 * - Kỳ 1: (Vay × 3%) - L1
 * - Kỳ 2: (Vay × 5%) - L2
 * - Kỳ 3: (Vay × 7%) - L3
 */
export function calculateInstallment3Periods(
  loanAmount: number,
): TInstallmentPeriod[] {
  // Kỳ 1: Ngày 7
  const principal1 = Math.round(loanAmount * 0.2); // 20%
  const interest1 = Math.round(loanAmount * DAILY_INTEREST_RATE * 7);
  const targetProfit1 = Math.round(loanAmount * 0.03); // 3%
  const rentalFee1 = Math.max(0, targetProfit1 - interest1);
  const total1 = principal1 + interest1 + rentalFee1;

  // Kỳ 2: Ngày 18
  const principal2 = Math.round(loanAmount * 0.3); // 30%
  const remainingAfterP1 = loanAmount - principal1;
  const interest2 = Math.round(remainingAfterP1 * DAILY_INTEREST_RATE * 11);
  const targetProfit2 = Math.round(loanAmount * 0.05); // 5%
  const rentalFee2 = Math.max(0, targetProfit2 - interest2);
  const total2 = principal2 + interest2 + rentalFee2;

  // Kỳ 3: Ngày 30
  const principal3 = loanAmount - principal1 - principal2; // 50%
  const remainingAfterP2 = loanAmount - principal1 - principal2;
  const interest3 = Math.round(remainingAfterP2 * DAILY_INTEREST_RATE * 12);
  const targetProfit3 = Math.round(loanAmount * 0.07); // 7%
  const rentalFee3 = Math.max(0, targetProfit3 - interest3);
  const total3 = principal3 + interest3 + rentalFee3;

  return [
    {
      period: 1,
      dueDay: 7,
      principal: principal1,
      interest: interest1,
      rentalFee: rentalFee1,
      total: total1,
      targetProfit: targetProfit1,
    },
    {
      period: 2,
      dueDay: 18,
      principal: principal2,
      interest: interest2,
      rentalFee: rentalFee2,
      total: total2,
      targetProfit: targetProfit2,
    },
    {
      period: 3,
      dueDay: 30,
      principal: principal3,
      interest: interest3,
      rentalFee: rentalFee3,
      total: total3,
      targetProfit: targetProfit3,
    },
  ];
}

/* =========================
   3. GÓI 2: GỐC CUỐI KỲ (THEO MỐC)
========================== */

/**
 * Gói 2: Gốc cuối kỳ (Theo mốc)
 * Dành cho khách giữ lại tài sản để sử dụng (xe máy/ô tô)
 * Phí cao hơn vì khách được sử dụng tài sản
 * 
 * Tách riêng:
 * - Lãi suất: 0.033%/ngày (pháp lý)
 * - Phí thuê: Để đạt tổng mục tiêu 5% - 8% - 12%
 * 
 * - Mốc 7 ngày: Tổng 5% (Lãi 0.231% + Phí 4.769%)
 * - Mốc 18 ngày: Tổng 8% (Lãi 0.594% + Phí 7.406%)
 * - Mốc 30 ngày: Tổng 12% (Lãi 0.99% + Phí 11.01%)
 */
export function calculateBulletPaymentByMilestone(
  loanAmount: number,
): TBulletPayment[] {
  // Mốc 1: 7 ngày
  const interest1 = Math.round(loanAmount * DAILY_INTEREST_RATE * 7); // 0.231%
  const targetTotal1 = Math.round(loanAmount * 1.05); // 5%
  const rentalFee1 = targetTotal1 - loanAmount - interest1;

  // Mốc 2: 18 ngày
  const interest2 = Math.round(loanAmount * DAILY_INTEREST_RATE * 18); // 0.594%
  const targetTotal2 = Math.round(loanAmount * 1.08); // 8%
  const rentalFee2 = targetTotal2 - loanAmount - interest2;

  // Mốc 3: 30 ngày
  const interest3 = Math.round(loanAmount * DAILY_INTEREST_RATE * 30); // 0.99%
  const targetTotal3 = Math.round(loanAmount * 1.12); // 12%
  const rentalFee3 = targetTotal3 - loanAmount - interest3;

  return [
    {
      milestone: 1,
      days: 7,
      rate: 0.05, // 5%
      interest: interest1,
      rentalFee: rentalFee1,
      total: targetTotal1,
    },
    {
      milestone: 2,
      days: 18,
      rate: 0.08, // 8%
      interest: interest2,
      rentalFee: rentalFee2,
      total: targetTotal2,
    },
    {
      milestone: 3,
      days: 30,
      rate: 0.12, // 12%
      interest: interest3,
      rentalFee: rentalFee3,
      total: targetTotal3,
    },
  ];
}

/* =========================
   4. GÓI 3: GỐC CUỐI KỲ + GIỮ TÀI SẢN
========================== */

/**
 * Gói 3: Gốc cuối kỳ + Giữ tài sản
 * Tài sản được lưu kho tại cửa hàng → Phí thấp hơn Gói 2
 * 
 * Công thức mới:
 * - Lãi suất: 0.033%/ngày (pháp lý)
 * - Phí thuê = (Vay × %) - Lãi
 * - Phí dịch vụ = 30,000 đ (nếu Vay ≤ 2,000,000)
 * - Tổng chuộc = Vay + Lãi + Phí thuê + Phí dịch vụ
 * 
 * - Mốc 7 ngày: Lãi = Vay × 0.033% × 7, Phí thuê = (Vay × 1.25%) - Lãi
 * - Mốc 18 ngày: Lãi = Vay × 0.033% × 18, Phí thuê = (Vay × 3.5%) - Lãi
 * - Mốc 30 ngày: Lãi = Vay × 0.033% × 30, Phí thuê = (Vay × 5%) - Lãi
 */
export function calculateBulletPaymentWithCollateralHold(
  loanAmount: number,
): TBulletPayment[] {
  // Xác định phí dịch vụ (30,000 nếu vay <= 2,000,000)
  const serviceFee = loanAmount <= 2000000 ? 30000 : 0;

  // Mốc 1: 7 ngày
  const interest1 = Math.round(loanAmount * DAILY_INTEREST_RATE * 7);
  const rentalFeeBase1 = Math.round(loanAmount * 0.0125); // 1.25%
  const rentalFee1 = Math.max(0, rentalFeeBase1 - interest1);
  const total1 = loanAmount + interest1 + rentalFee1 + serviceFee;

  // Mốc 2: 18 ngày
  const interest2 = Math.round(loanAmount * DAILY_INTEREST_RATE * 18);
  const rentalFeeBase2 = Math.round(loanAmount * 0.035); // 3.5%
  const rentalFee2 = Math.max(0, rentalFeeBase2 - interest2);
  const total2 = loanAmount + interest2 + rentalFee2 + serviceFee;

  // Mốc 3: 30 ngày
  const interest3 = Math.round(loanAmount * DAILY_INTEREST_RATE * 30);
  const rentalFeeBase3 = Math.round(loanAmount * 0.05); // 5%
  const rentalFee3 = Math.max(0, rentalFeeBase3 - interest3);
  const total3 = loanAmount + interest3 + rentalFee3 + serviceFee;

  return [
    {
      milestone: 1,
      days: 7,
      rate: 0.0125, // 1.25%
      interest: interest1,
      rentalFee: rentalFee1,
      total: total1,
    },
    {
      milestone: 2,
      days: 18,
      rate: 0.035, // 3.5%
      interest: interest2,
      rentalFee: rentalFee2,
      total: total2,
    },
    {
      milestone: 3,
      days: 30,
      rate: 0.05, // 5%
      interest: interest3,
      rentalFee: rentalFee3,
      total: total3,
    },
  ];
}

/* =========================
   4.5. GÓI 3: THANH TOÁN TRỄ HẠN
========================== */

/**
 * Tính phí khi thanh toán trễ hạn cho Gói 3
 * 
 * Trễ qua 31 ngày (ngày 31):
 * - Phí = Vay × (5% + 1.25%) = Vay × 6.25%
 * - Tổng chuộc = Vay + Phí
 * 
 * Trễ từ ngày 36 trở đi (ngày thứ 6 của tháng mới):
 * - Phí = Vay × (5% + 1.25% + 2%) = Vay × 8.25%
 * - Tổng chuộc = Vay + Phí
 */
export function calculateBulletPaymentWithCollateralHoldLate(
  loanAmount: number,
  daysLate: number,
): { fee: number; total: number; breakdown: string } {
  let fee: number;
  let breakdown: string;

  if (daysLate <= 30) {
    // Không tính phí trễ nếu <= 30 ngày
    fee = 0;
    breakdown = "Không có phí trễ";
  } else if (daysLate <= 35) {
    // Trễ từ ngày 31-35: 5% (tháng cũ) + 1.25% (tháng mới)
    fee = Math.round(loanAmount * 0.0625); // 6.25%
    breakdown = `Phí tháng cũ (5%) + Phí tháng mới (1.25%) = 6.25%`;
  } else {
    // Trễ từ ngày 36 trở đi: 5% + 1.25% + 2% (phạt)
    fee = Math.round(loanAmount * 0.0825); // 8.25%
    breakdown = `Phí tháng cũ (5%) + Phí tháng mới (1.25%) + Phí phạt (2%) = 8.25%`;
  }

  const total = loanAmount + fee;

  return {
    fee,
    total,
    breakdown,
  };
}

/* =========================
   5. MAIN CALCULATION FUNCTION
========================== */

/**
 * Tính toán đầy đủ cho khoản vay theo gói
 */
export function calculateLoan(
  loanAmount: number,
  loanType: TLoanType,
): TLoanCalculationResult {
  // 1. Tính phí thẩm định
  const appraisalFee = calculateAppraisalFee(loanAmount, loanType);
  const netAmount = loanAmount - appraisalFee;

  // 2. Tính toán theo gói
  let installments: TInstallmentPeriod[] | undefined;
  let bulletPayments: TBulletPayment[] | undefined;

  switch (loanType) {
    case LOAN_TYPES.INSTALLMENT_3_PERIODS:
      installments = calculateInstallment3Periods(loanAmount);
      break;

    case LOAN_TYPES.BULLET_PAYMENT_BY_MILESTONE:
      bulletPayments = calculateBulletPaymentByMilestone(loanAmount);
      break;

    case LOAN_TYPES.BULLET_PAYMENT_WITH_COLLATERAL_HOLD:
      bulletPayments = calculateBulletPaymentWithCollateralHold(loanAmount);
      break;

    default:
      throw new Error(`Unknown loan type: ${loanType}`);
  }

  return {
    loanAmount,
    loanType,
    appraisalFee,
    netAmount,
    installments,
    bulletPayments,
  };
}

/* =========================
   6. HELPER FUNCTIONS
========================== */

/**
 * Format số tiền VND
 */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}

/**
 * Loại bỏ dấu phân cách để lưu vào Google Sheets
 */
export function unformatMoney(formatted: string): number {
  return parseInt(formatted.replace(/\./g, "").replace(/[^\d]/g, ""), 10) || 0;
}

/**
 * Tính tổng phải trả cho Gói 1
 */
export function getTotalPaymentInstallment(
  installments: TInstallmentPeriod[],
): number {
  return installments.reduce((sum, period) => sum + period.total, 0);
}

/**
 * Kiểm tra xem có phải gói trả góp không
 */
export function isInstallmentLoan(loanType: TLoanType): boolean {
  return loanType === LOAN_TYPES.INSTALLMENT_3_PERIODS;
}

/**
 * Kiểm tra xem có phải gói gốc cuối kỳ không
 */
export function isBulletPaymentLoan(loanType: TLoanType): boolean {
  return (
    loanType === LOAN_TYPES.BULLET_PAYMENT_BY_MILESTONE ||
    loanType === LOAN_TYPES.BULLET_PAYMENT_WITH_COLLATERAL_HOLD
  );
}
