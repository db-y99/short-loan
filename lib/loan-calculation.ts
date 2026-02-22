/**
 * 🔹 LOAN CALCULATION LIBRARY
 * Tính toán chi tiết cho 3 gói vay theo quy định pháp luật
 * Chia tách rõ ràng: Lãi suất + Phí thuê tài sản
 */

import { LOAN_TYPES, type TLoanType } from "@/constants/loan";

/* =========================
   CONSTANTS
========================== */

/** Lãi suất cơ bản: 0.033%/ngày */
const DAILY_INTEREST_RATE = 0.00033;

/** Ngưỡng áp dụng phí thẩm định */
const APPRAISAL_FEE_THRESHOLD = 5_000_000;

/** Tỷ lệ phí thẩm định */
const APPRAISAL_FEE_RATE = 0.05; // 5%

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
  total: number; // Tổng chuộc = Vay × (1 + rate)
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
 * Áp dụng cho khoản vay >= 5.000.000đ và thuộc nhóm vay tín chấp/trả góp
 */
export function calculateAppraisalFee(
  loanAmount: number,
  loanType: TLoanType,
): number {
  // Chỉ áp dụng cho Gói 1 (trả góp)
  if (loanType !== LOAN_TYPES.INSTALLMENT_3_PERIODS) {
    return 0;
  }

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
 * - Mốc 7 ngày: 5%
 * - Mốc 18 ngày: 8%
 * - Mốc 30 ngày: 12%
 */
export function calculateBulletPaymentByMilestone(
  loanAmount: number,
): TBulletPayment[] {
  return [
    {
      milestone: 1,
      days: 7,
      rate: 0.05, // 5%
      total: Math.round(loanAmount * 1.05),
    },
    {
      milestone: 2,
      days: 18,
      rate: 0.08, // 8%
      total: Math.round(loanAmount * 1.08),
    },
    {
      milestone: 3,
      days: 30,
      rate: 0.12, // 12%
      total: Math.round(loanAmount * 1.12),
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
 * - Mốc 7 ngày: 1.25%
 * - Mốc 18 ngày: 3.5%
 * - Mốc 30 ngày: 5%
 */
export function calculateBulletPaymentWithCollateralHold(
  loanAmount: number,
): TBulletPayment[] {
  return [
    {
      milestone: 1,
      days: 7,
      rate: 0.0125, // 1.25%
      total: Math.round(loanAmount * 1.0125),
    },
    {
      milestone: 2,
      days: 18,
      rate: 0.035, // 3.5%
      total: Math.round(loanAmount * 1.035),
    },
    {
      milestone: 3,
      days: 30,
      rate: 0.05, // 5%
      total: Math.round(loanAmount * 1.05),
    },
  ];
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
