/**
 * 🔹 PAYMENT CALCULATOR
 * Tính toán payment periods (currentPeriod, nextPeriod) cho loan details
 */

import type { TPaymentPeriod, TPaymentMilestone } from "@/types/loan.types";
import { LOAN_TYPES, type TLoanType } from "@/constants/loan";
import {
  calculateInstallment3Periods,
  calculateBulletPaymentByMilestone,
  calculateBulletPaymentWithCollateralHold,
  type TInstallmentPeriod,
  type TBulletPayment,
} from "./loan-calculation";

/**
 * Tính ngày đáo hạn từ ngày ký hợp đồng
 */
function calculateDueDate(signedAt: string, days: number): string {
  const date = new Date(signedAt);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

/**
 * Tính ngày đáo hạn cho kỳ kế tiếp (sau 30 ngày từ ngày ký)
 */
function calculateNextPeriodDueDate(signedAt: string, days: number): string {
  const date = new Date(signedAt);
  date.setDate(date.getDate() + 30 + days); // Sau 30 ngày + days
  return date.toISOString().split("T")[0];
}

/**
 * Convert installment period sang payment milestone
 */
function convertInstallmentToMilestone(
  period: TInstallmentPeriod,
  signedAt: string,
  isNextPeriod = false,
): TPaymentMilestone {
  const dueDate = isNextPeriod
    ? calculateNextPeriodDueDate(signedAt, period.dueDay)
    : calculateDueDate(signedAt, period.dueDay);

  return {
    days: period.dueDay,
    date: dueDate,
    interestAndFee: period.interest + period.rentalFee,
    totalRedemption: period.total,
  };
}

/**
 * Convert bullet payment sang payment milestone
 */
function convertBulletToMilestone(
  payment: TBulletPayment,
  signedAt: string,
  loanAmount: number,
  isNextPeriod = false,
): TPaymentMilestone {
  const dueDate = isNextPeriod
    ? calculateNextPeriodDueDate(signedAt, payment.days)
    : calculateDueDate(signedAt, payment.days);

  return {
    days: payment.days,
    date: dueDate,
    interestAndFee: payment.interest + payment.rentalFee,
    totalRedemption: payment.total,
  };
}

/**
 * Tính payment periods cho Gói 1: Trả góp 3 kỳ
 */
function calculateInstallmentPaymentPeriods(
  loanAmount: number,
  signedAt: string,
): { currentPeriod: TPaymentPeriod; nextPeriod: TPaymentPeriod } {
  const installments = calculateInstallment3Periods(loanAmount);

  const currentMilestones = installments.map((period) =>
    convertInstallmentToMilestone(period, signedAt, false),
  );

  const nextMilestones = installments.map((period) =>
    convertInstallmentToMilestone(period, signedAt, true),
  );

  return {
    currentPeriod: {
      title: "Kỳ hiện tại",
      subtitle: "Trả góp 3 kỳ",
      milestones: currentMilestones,
    },
    nextPeriod: {
      title: "Kỳ kế tiếp",
      subtitle: "Nếu gia hạn (Đóng lãi ngày 30)",
      milestones: nextMilestones,
    },
  };
}

/**
 * Tính payment periods cho Gói 2: Gốc cuối kỳ (Theo mốc)
 */
function calculateBulletByMilestonePaymentPeriods(
  loanAmount: number,
  signedAt: string,
): { currentPeriod: TPaymentPeriod; nextPeriod: TPaymentPeriod } {
  const payments = calculateBulletPaymentByMilestone(loanAmount);

  const currentMilestones = payments.map((payment) =>
    convertBulletToMilestone(payment, signedAt, loanAmount, false),
  );

  const nextMilestones = payments.map((payment) =>
    convertBulletToMilestone(payment, signedAt, loanAmount, true),
  );

  return {
    currentPeriod: {
      title: "Kỳ hiện tại",
      subtitle: "Gốc cuối kỳ (Khách dùng tài sản)",
      milestones: currentMilestones,
    },
    nextPeriod: {
      title: "Kỳ kế tiếp",
      subtitle: "Nếu gia hạn (Đóng phí ngày 30)",
      milestones: nextMilestones,
    },
  };
}

/**
 * Tính payment periods cho Gói 3: Gốc cuối kỳ + Giữ TS
 */
function calculateBulletWithCollateralPaymentPeriods(
  loanAmount: number,
  signedAt: string,
): { currentPeriod: TPaymentPeriod; nextPeriod: TPaymentPeriod } {
  const payments = calculateBulletPaymentWithCollateralHold(loanAmount);

  const currentMilestones = payments.map((payment) =>
    convertBulletToMilestone(payment, signedAt, loanAmount, false),
  );

  const nextMilestones = payments.map((payment) =>
    convertBulletToMilestone(payment, signedAt, loanAmount, true),
  );

  return {
    currentPeriod: {
      title: "Kỳ hiện tại",
      subtitle: "Gốc cuối kỳ (Giữ tài sản tại cửa hàng)",
      milestones: currentMilestones,
    },
    nextPeriod: {
      title: "Kỳ kế tiếp",
      subtitle: "Nếu gia hạn (Đóng phí ngày 30)",
      milestones: nextMilestones,
    },
  };
}

/**
 * 🔹 MAIN FUNCTION: Tính payment periods dựa trên loan type
 */
export function calculatePaymentPeriods(
  loanAmount: number,
  loanType: string,
  signedAt: string,
): { currentPeriod: TPaymentPeriod; nextPeriod: TPaymentPeriod } {
  // Map loan type string to constant - handle both enum values and display labels
  let mappedLoanType: TLoanType;

  if (loanType === LOAN_TYPES.INSTALLMENT_3_PERIODS || loanType.includes("trả góp") || loanType.includes("3 kỳ")) {
    mappedLoanType = LOAN_TYPES.INSTALLMENT_3_PERIODS;
  } else if (loanType === LOAN_TYPES.BULLET_PAYMENT_BY_MILESTONE || loanType.includes("Theo mốc")) {
    mappedLoanType = LOAN_TYPES.BULLET_PAYMENT_BY_MILESTONE;
  } else if (loanType === LOAN_TYPES.BULLET_PAYMENT_WITH_COLLATERAL_HOLD || loanType.includes("Giữ TS")) {
    mappedLoanType = LOAN_TYPES.BULLET_PAYMENT_WITH_COLLATERAL_HOLD;
  } else {
    // Default to installment
    mappedLoanType = LOAN_TYPES.INSTALLMENT_3_PERIODS;
  }

  switch (mappedLoanType) {
    case LOAN_TYPES.INSTALLMENT_3_PERIODS:
      return calculateInstallmentPaymentPeriods(loanAmount, signedAt);

    case LOAN_TYPES.BULLET_PAYMENT_BY_MILESTONE:
      return calculateBulletByMilestonePaymentPeriods(loanAmount, signedAt);

    case LOAN_TYPES.BULLET_PAYMENT_WITH_COLLATERAL_HOLD:
      return calculateBulletWithCollateralPaymentPeriods(loanAmount, signedAt);

    default:
      return calculateInstallmentPaymentPeriods(loanAmount, signedAt);
  }
}
