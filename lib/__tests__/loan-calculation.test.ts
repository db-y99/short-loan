/**
 * 🧪 UNIT TESTS - Loan Calculation
 * Kiểm tra tính chính xác của các công thức tính toán
 */

import { describe, it, expect } from "@jest/globals";
import {
  calculateAppraisalFee,
  calculateInstallment3Periods,
  calculateBulletPaymentByMilestone,
  calculateBulletPaymentWithCollateralHold,
  calculateLoan,
  formatMoney,
  unformatMoney,
  getTotalPaymentInstallment,
} from "../loan-calculation";
import { LOAN_TYPES } from "@/constants/loan";

describe("Loan Calculation Library", () => {
  /* =========================
     1. PHÍ THẨM ĐỊNH
  ========================== */

  describe("calculateAppraisalFee", () => {
    it("should return 0 for loan amount < 5,000,000", () => {
      const fee = calculateAppraisalFee(4_999_999, LOAN_TYPES.INSTALLMENT_3_PERIODS);
      expect(fee).toBe(0);
    });

    it("should calculate 5% for loan amount >= 5,000,000", () => {
      const fee1 = calculateAppraisalFee(5_000_000, LOAN_TYPES.INSTALLMENT_3_PERIODS);
      expect(fee1).toBe(250_000); // 5M × 5% = 250K
      
      const fee2 = calculateAppraisalFee(10_000_000, LOAN_TYPES.INSTALLMENT_3_PERIODS);
      expect(fee2).toBe(500_000); // 10M × 5% = 500K
    });

    it("should calculate 5% for Gói 3 with amount >= 5,000,000", () => {
      const fee = calculateAppraisalFee(
        10_000_000,
        LOAN_TYPES.BULLET_PAYMENT_WITH_COLLATERAL_HOLD,
      );
      expect(fee).toBe(500_000); // 10M × 5% = 500K
    });

    it("should calculate 5% for Gói 2 with amount >= 5,000,000", () => {
      // Gói 2 có phí thẩm định nếu >= 5 triệu
      const fee = calculateAppraisalFee(
        10_000_000,
        LOAN_TYPES.BULLET_PAYMENT_BY_MILESTONE,
      );
      expect(fee).toBe(500_000); // 10M × 5% = 500K
    });
  });

  /* =========================
     2. GÓI 1: TRẢ GÓP 3 KỲ
  ========================== */

  describe("calculateInstallment3Periods", () => {
    it("should calculate correctly for 10,000,000 VND", () => {
      const installments = calculateInstallment3Periods(10_000_000);

      expect(installments).toHaveLength(3);

      // Kỳ 1: Ngày 7
      expect(installments[0].period).toBe(1);
      expect(installments[0].dueDay).toBe(7);
      expect(installments[0].principal).toBe(2_000_000); // 20%
      expect(installments[0].interest).toBe(Math.round(10_000_000 * 0.00033 * 7)); // 23,100
      expect(installments[0].targetProfit).toBe(300_000); // 3%
      expect(installments[0].rentalFee).toBe(300_000 - installments[0].interest);

      // Kỳ 2: Ngày 18
      expect(installments[1].period).toBe(2);
      expect(installments[1].dueDay).toBe(18);
      expect(installments[1].principal).toBe(3_000_000); // 30%
      expect(installments[1].interest).toBe(Math.round(8_000_000 * 0.00033 * 11)); // 29,040
      expect(installments[1].targetProfit).toBe(500_000); // 5%

      // Kỳ 3: Ngày 30
      expect(installments[2].period).toBe(3);
      expect(installments[2].dueDay).toBe(30);
      expect(installments[2].principal).toBe(5_000_000); // 50%
      expect(installments[2].interest).toBe(Math.round(5_000_000 * 0.00033 * 12)); // 19,800
      expect(installments[2].targetProfit).toBe(700_000); // 7%
    });

    it("should ensure total principal equals loan amount", () => {
      const loanAmount = 15_000_000;
      const installments = calculateInstallment3Periods(loanAmount);

      const totalPrincipal = installments.reduce(
        (sum, p) => sum + p.principal,
        0,
      );

      expect(totalPrincipal).toBe(loanAmount);
    });

    it("should have rental fee = target profit - interest", () => {
      const installments = calculateInstallment3Periods(10_000_000);

      installments.forEach((period) => {
        const expectedRentalFee = Math.max(
          0,
          period.targetProfit - period.interest,
        );
        expect(period.rentalFee).toBe(expectedRentalFee);
      });
    });
  });

  /* =========================
     3. GÓI 2: GỐC CUỐI KỲ (THEO MỐC)
  ========================== */

  describe("calculateBulletPaymentByMilestone", () => {
    it("should calculate correctly for 10,000,000 VND", () => {
      const payments = calculateBulletPaymentByMilestone(10_000_000);

      expect(payments).toHaveLength(3);

      // Mốc 7 ngày: 5%
      expect(payments[0].days).toBe(7);
      expect(payments[0].rate).toBe(0.05);
      expect(payments[0].total).toBe(10_500_000);

      // Mốc 18 ngày: 8%
      expect(payments[1].days).toBe(18);
      expect(payments[1].rate).toBe(0.08);
      expect(payments[1].total).toBe(10_800_000);

      // Mốc 30 ngày: 12%
      expect(payments[2].days).toBe(30);
      expect(payments[2].rate).toBe(0.12);
      expect(payments[2].total).toBe(11_200_000);
    });
  });

  /* =========================
     4. GÓI 3: GỐC CUỐI KỲ + GIỮ TS
  ========================== */

  describe("calculateBulletPaymentWithCollateralHold", () => {
    it("should calculate correctly for 10,000,000 VND (no service fee)", () => {
      const payments = calculateBulletPaymentWithCollateralHold(10_000_000);

      expect(payments).toHaveLength(3);

      // Mốc 7 ngày: Lãi = 10M × 0.033% × 7, Phí thuê = (10M × 1.25%) - Lãi
      const interest1 = Math.round(10_000_000 * 0.00033 * 7); // 23,100
      const rentalFeeBase1 = Math.round(10_000_000 * 0.0125); // 125,000
      const rentalFee1 = Math.max(0, rentalFeeBase1 - interest1); // 101,900
      const total1 = 10_000_000 + interest1 + rentalFee1; // 10,125,000

      expect(payments[0].days).toBe(7);
      expect(payments[0].rate).toBe(0.0125);
      expect(payments[0].interest).toBe(interest1);
      expect(payments[0].rentalFee).toBe(rentalFee1);
      expect(payments[0].total).toBe(total1);

      // Mốc 18 ngày: Lãi = 10M × 0.033% × 18, Phí thuê = (10M × 3.5%) - Lãi
      const interest2 = Math.round(10_000_000 * 0.00033 * 18); // 59,400
      const rentalFeeBase2 = Math.round(10_000_000 * 0.035); // 350,000
      const rentalFee2 = Math.max(0, rentalFeeBase2 - interest2); // 290,600
      const total2 = 10_000_000 + interest2 + rentalFee2; // 10,350,000

      expect(payments[1].days).toBe(18);
      expect(payments[1].rate).toBe(0.035);
      expect(payments[1].interest).toBe(interest2);
      expect(payments[1].rentalFee).toBe(rentalFee2);
      expect(payments[1].total).toBe(total2);

      // Mốc 30 ngày: Lãi = 10M × 0.033% × 30, Phí thuê = (10M × 5%) - Lãi
      const interest3 = Math.round(10_000_000 * 0.00033 * 30); // 99,000
      const rentalFeeBase3 = Math.round(10_000_000 * 0.05); // 500,000
      const rentalFee3 = Math.max(0, rentalFeeBase3 - interest3); // 401,000
      const total3 = 10_000_000 + interest3 + rentalFee3; // 10,500,000

      expect(payments[2].days).toBe(30);
      expect(payments[2].rate).toBe(0.05);
      expect(payments[2].interest).toBe(interest3);
      expect(payments[2].rentalFee).toBe(rentalFee3);
      expect(payments[2].total).toBe(total3);
    });

    it("should include 30,000 service fee for loan <= 2,000,000", () => {
      const payments = calculateBulletPaymentWithCollateralHold(1_500_000);

      expect(payments).toHaveLength(3);

      // Mốc 1: 7 ngày
      const interest1 = Math.round(1_500_000 * 0.00033 * 7); // 3,465
      const rentalFeeBase1 = Math.round(1_500_000 * 0.0125); // 18,750
      const rentalFee1 = Math.max(0, rentalFeeBase1 - interest1); // 15,285
      const serviceFee = 30_000;
      const total1 = 1_500_000 + interest1 + rentalFee1 + serviceFee; // 1,549,285

      expect(payments[0].interest).toBe(interest1);
      expect(payments[0].rentalFee).toBe(rentalFee1);
      expect(payments[0].total).toBe(total1);

      // Mốc 2: 18 ngày
      const interest2 = Math.round(1_500_000 * 0.00033 * 18); // 8,910
      const rentalFeeBase2 = Math.round(1_500_000 * 0.035); // 52,500
      const rentalFee2 = Math.max(0, rentalFeeBase2 - interest2); // 43,590
      const total2 = 1_500_000 + interest2 + rentalFee2 + serviceFee; // 1,582,500

      expect(payments[1].interest).toBe(interest2);
      expect(payments[1].rentalFee).toBe(rentalFee2);
      expect(payments[1].total).toBe(total2);

      // Mốc 3: 30 ngày
      const interest3 = Math.round(1_500_000 * 0.00033 * 30); // 14,850
      const rentalFeeBase3 = Math.round(1_500_000 * 0.05); // 75,000
      const rentalFee3 = Math.max(0, rentalFeeBase3 - interest3); // 60,150
      const total3 = 1_500_000 + interest3 + rentalFee3 + serviceFee; // 1,605,000

      expect(payments[2].interest).toBe(interest3);
      expect(payments[2].rentalFee).toBe(rentalFee3);
      expect(payments[2].total).toBe(total3);
    });

    it("should have lower rates than Gói 2", () => {
      const loanAmount = 10_000_000;
      const goi2 = calculateBulletPaymentByMilestone(loanAmount);
      const goi3 = calculateBulletPaymentWithCollateralHold(loanAmount);

      // Gói 3 phải rẻ hơn Gói 2 ở mọi mốc
      expect(goi3[0].total).toBeLessThan(goi2[0].total);
      expect(goi3[1].total).toBeLessThan(goi2[1].total);
      expect(goi3[2].total).toBeLessThan(goi2[2].total);
    });
  });

  /* =========================
     5. MAIN CALCULATION
  ========================== */

  describe("calculateLoan", () => {
    it("should calculate Gói 1 with appraisal fee", () => {
      const result = calculateLoan(10_000_000, LOAN_TYPES.INSTALLMENT_3_PERIODS);

      expect(result.loanAmount).toBe(10_000_000);
      expect(result.appraisalFee).toBe(500_000);
      expect(result.netAmount).toBe(9_500_000);
      expect(result.installments).toBeDefined();
      expect(result.installments).toHaveLength(3);
      expect(result.bulletPayments).toBeUndefined();
    });

    it("should calculate Gói 2 with appraisal fee for amount >= 5M", () => {
      const result = calculateLoan(
        10_000_000,
        LOAN_TYPES.BULLET_PAYMENT_BY_MILESTONE,
      );

      expect(result.appraisalFee).toBe(500_000); // 10M × 5% = 500K
      expect(result.netAmount).toBe(9_500_000); // 10M - 500K
      expect(result.bulletPayments).toBeDefined();
      expect(result.bulletPayments).toHaveLength(3);
      expect(result.installments).toBeUndefined();
    });

    it("should calculate Gói 2 without appraisal fee for amount < 5M", () => {
      const result = calculateLoan(
        4_000_000,
        LOAN_TYPES.BULLET_PAYMENT_BY_MILESTONE,
      );

      expect(result.appraisalFee).toBe(0);
      expect(result.netAmount).toBe(4_000_000);
      expect(result.bulletPayments).toBeDefined();
      expect(result.bulletPayments).toHaveLength(3);
      expect(result.installments).toBeUndefined();
    });

    it("should calculate Gói 3 with appraisal fee", () => {
      const result = calculateLoan(
        10_000_000,
        LOAN_TYPES.BULLET_PAYMENT_WITH_COLLATERAL_HOLD,
      );

      expect(result.appraisalFee).toBe(500_000);
      expect(result.netAmount).toBe(9_500_000);
      expect(result.bulletPayments).toBeDefined();
      expect(result.bulletPayments).toHaveLength(3);
      expect(result.installments).toBeUndefined();
    });
  });

  /* =========================
     6. HELPER FUNCTIONS
  ========================== */

  describe("formatMoney", () => {
    it("should format number to VND currency", () => {
      expect(formatMoney(1_000_000)).toBe("1.000.000 ₫");
      expect(formatMoney(10_500_000)).toBe("10.500.000 ₫");
    });
  });

  describe("unformatMoney", () => {
    it("should parse formatted money back to number", () => {
      expect(unformatMoney("1.000.000 ₫")).toBe(1_000_000);
      expect(unformatMoney("10.500.000 ₫")).toBe(10_500_000);
    });
  });

  describe("getTotalPaymentInstallment", () => {
    it("should sum all installment totals", () => {
      const installments = calculateInstallment3Periods(10_000_000);
      const total = getTotalPaymentInstallment(installments);

      const expected = installments.reduce((sum, p) => sum + p.total, 0);
      expect(total).toBe(expected);
    });
  });

  /* =========================
     7. EDGE CASES
  ========================== */

  describe("Edge Cases", () => {
    it("should handle small loan amounts", () => {
      const result = calculateLoan(1_000_000, LOAN_TYPES.INSTALLMENT_3_PERIODS);
      expect(result.appraisalFee).toBe(0);
      expect(result.installments).toBeDefined();
    });

    it("should handle large loan amounts", () => {
      const result = calculateLoan(
        100_000_000,
        LOAN_TYPES.INSTALLMENT_3_PERIODS,
      );
      expect(result.appraisalFee).toBe(5_000_000);
      expect(result.netAmount).toBe(95_000_000);
    });

    it("should round all amounts to nearest integer", () => {
      const installments = calculateInstallment3Periods(10_000_000);

      installments.forEach((period) => {
        expect(Number.isInteger(period.principal)).toBe(true);
        expect(Number.isInteger(period.interest)).toBe(true);
        expect(Number.isInteger(period.rentalFee)).toBe(true);
        expect(Number.isInteger(period.total)).toBe(true);
      });
    });
  });
});
