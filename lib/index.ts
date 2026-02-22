/**
 * 📦 LOAN CALCULATION LIBRARY - Main Export
 * Export tất cả functions cần thiết cho tính toán vay
 */

// Core calculation functions
export {
  calculateAppraisalFee,
  calculateInstallment3Periods,
  calculateBulletPaymentByMilestone,
  calculateBulletPaymentWithCollateralHold,
  calculateLoan,
  formatMoney,
  unformatMoney,
  getTotalPaymentInstallment,
  isInstallmentLoan,
  isBulletPaymentLoan,
  type TInstallmentPeriod,
  type TBulletPayment,
  type TLoanCalculationResult,
} from "./loan-calculation";

// Payment period calculator
export { calculatePaymentPeriods } from "./payment-calculator";

// Demo functions
export { runLoanCalculationDemo, demoExamples } from "./loan-calculation-demo";
