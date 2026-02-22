/**
 * 💾 PAYMENT PERIODS SERVICE
 * Service để lưu và lấy payment periods từ DB
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calculatePaymentPeriods } from "@/lib/payment-calculator";
import type { TPaymentPeriod } from "@/types/loan.types";

/**
 * Lưu payment periods vào DB
 */
export async function savePaymentPeriodsService({
  loanId,
  cycleId,
  loanAmount,
  loanType,
  signedAt,
}: {
  loanId: string;
  cycleId: string;
  loanAmount: number;
  loanType: string;
  signedAt: string;
}): Promise<void> {
  const supabase = await createSupabaseServerClient();

  // Tính payment periods
  const { currentPeriod, nextPeriod } = calculatePaymentPeriods(
    loanAmount,
    loanType,
    signedAt,
  );

  // Chuẩn bị data để insert
  const periodsToInsert = [
    ...currentPeriod.milestones.map((m, index) => ({
      loan_id: loanId,
      cycle_id: cycleId,
      period_number: index + 1,
      period_type: "current",
      milestone_day: m.days,
      due_date: m.date,
      principal: null, // Sẽ update sau nếu là Gói 1
      interest: 0, // Sẽ update sau nếu là Gói 1
      rental_fee: 0, // Sẽ update sau nếu là Gói 1
      rate: null, // Sẽ update sau nếu là Gói 2,3
      fee_amount: m.interestAndFee,
      total_due: m.totalRedemption,
      status: "pending" as const,
    })),
    ...nextPeriod.milestones.map((m, index) => ({
      loan_id: loanId,
      cycle_id: cycleId,
      period_number: index + 1,
      period_type: "next",
      milestone_day: m.days,
      due_date: m.date,
      principal: null,
      interest: 0,
      rental_fee: 0,
      rate: null,
      fee_amount: m.interestAndFee,
      total_due: m.totalRedemption,
      status: "pending" as const,
    })),
  ];

  // Insert vào DB
  const { error } = await supabase
    .from("loan_payment_periods")
    .insert(periodsToInsert);

  if (error) {
    throw new Error(`Failed to save payment periods: ${error.message}`);
  }
}

/**
 * Lưu chi tiết payment periods với thông tin đầy đủ (principal, interest, rental_fee, rate)
 */
export async function saveDetailedPaymentPeriodsService({
  loanId,
  cycleId,
  loanAmount,
  loanType,
  signedAt,
}: {
  loanId: string;
  cycleId: string;
  loanAmount: number;
  loanType: string;
  signedAt: string;
}): Promise<void> {
  const supabase = await createSupabaseServerClient();

  // Xóa payment periods cũ nếu có (để tránh duplicate)
  await supabase
    .from("loan_payment_periods")
    .delete()
    .eq("loan_id", loanId)
    .eq("cycle_id", cycleId);

  // Import calculation functions
  const {
    calculateInstallment3Periods,
    calculateBulletPaymentByMilestone,
    calculateBulletPaymentWithCollateralHold,
  } = await import("@/lib/loan-calculation");

  const { LOAN_TYPES } = await import("@/constants/loan");

  // Xác định loan type
  let mappedLoanType: string;
  if (loanType.includes("trả góp") || loanType.includes("3 kỳ")) {
    mappedLoanType = LOAN_TYPES.INSTALLMENT_3_PERIODS;
  } else if (loanType.includes("Theo mốc")) {
    mappedLoanType = LOAN_TYPES.BULLET_PAYMENT_BY_MILESTONE;
  } else if (loanType.includes("Giữ TS")) {
    mappedLoanType = LOAN_TYPES.BULLET_PAYMENT_WITH_COLLATERAL_HOLD;
  } else {
    mappedLoanType = LOAN_TYPES.INSTALLMENT_3_PERIODS;
  }

  // Tính ngày đáo hạn
  function calculateDueDate(signedAt: string, days: number): string {
    const date = new Date(signedAt);
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  }

  function calculateNextPeriodDueDate(signedAt: string, days: number): string {
    const date = new Date(signedAt);
    date.setDate(date.getDate() + 30 + days);
    return date.toISOString().split("T")[0];
  }

  let periodsToInsert: any[] = [];

  // Tính toán theo từng gói
  if (mappedLoanType === LOAN_TYPES.INSTALLMENT_3_PERIODS) {
    // Gói 1: Trả góp 3 kỳ
    const installments = calculateInstallment3Periods(loanAmount);

    periodsToInsert = [
      ...installments.map((period) => ({
        loan_id: loanId,
        cycle_id: cycleId,
        period_number: period.period,
        period_type: "current",
        milestone_day: period.dueDay,
        due_date: calculateDueDate(signedAt, period.dueDay),
        principal: period.principal,
        interest: period.interest,
        rental_fee: period.rentalFee,
        rate: null,
        fee_amount: period.interest + period.rentalFee,
        total_due: period.total,
        status: "pending" as const,
      })),
      ...installments.map((period) => ({
        loan_id: loanId,
        cycle_id: cycleId,
        period_number: period.period,
        period_type: "next",
        milestone_day: period.dueDay,
        due_date: calculateNextPeriodDueDate(signedAt, period.dueDay),
        principal: period.principal,
        interest: period.interest,
        rental_fee: period.rentalFee,
        rate: null,
        fee_amount: period.interest + period.rentalFee,
        total_due: period.total,
        status: "pending" as const,
      })),
    ];
  } else if (mappedLoanType === LOAN_TYPES.BULLET_PAYMENT_BY_MILESTONE) {
    // Gói 2: Gốc cuối kỳ (Theo mốc)
    const payments = calculateBulletPaymentByMilestone(loanAmount);

    periodsToInsert = [
      ...payments.map((payment, index) => ({
        loan_id: loanId,
        cycle_id: cycleId,
        period_number: index + 1,
        period_type: "current",
        milestone_day: payment.days,
        due_date: calculateDueDate(signedAt, payment.days),
        principal: loanAmount, // Gốc cuối kỳ = toàn bộ số tiền vay
        interest: 0,
        rental_fee: 0,
        rate: payment.rate,
        fee_amount: payment.total - loanAmount,
        total_due: payment.total,
        status: "pending" as const,
      })),
      ...payments.map((payment, index) => ({
        loan_id: loanId,
        cycle_id: cycleId,
        period_number: index + 1,
        period_type: "next",
        milestone_day: payment.days,
        due_date: calculateNextPeriodDueDate(signedAt, payment.days),
        principal: loanAmount,
        interest: 0,
        rental_fee: 0,
        rate: payment.rate,
        fee_amount: payment.total - loanAmount,
        total_due: payment.total,
        status: "pending" as const,
      })),
    ];
  } else {
    // Gói 3: Gốc cuối kỳ + Giữ TS
    const payments = calculateBulletPaymentWithCollateralHold(loanAmount);

    periodsToInsert = [
      ...payments.map((payment, index) => ({
        loan_id: loanId,
        cycle_id: cycleId,
        period_number: index + 1,
        period_type: "current",
        milestone_day: payment.days,
        due_date: calculateDueDate(signedAt, payment.days),
        principal: loanAmount,
        interest: 0,
        rental_fee: 0,
        rate: payment.rate,
        fee_amount: payment.total - loanAmount,
        total_due: payment.total,
        status: "pending" as const,
      })),
      ...payments.map((payment, index) => ({
        loan_id: loanId,
        cycle_id: cycleId,
        period_number: index + 1,
        period_type: "next",
        milestone_day: payment.days,
        due_date: calculateNextPeriodDueDate(signedAt, payment.days),
        principal: loanAmount,
        interest: 0,
        rental_fee: 0,
        rate: payment.rate,
        fee_amount: payment.total - loanAmount,
        total_due: payment.total,
        status: "pending" as const,
      })),
    ];
  }

  // Insert vào DB
  const { error } = await supabase
    .from("loan_payment_periods")
    .insert(periodsToInsert);

  if (error) {
    throw new Error(`Failed to save payment periods: ${error.message}`);
  }
}

/**
 * Lấy payment periods từ DB
 */
export async function getPaymentPeriodsService(
  loanId: string,
  cycleId: string,
): Promise<{
  currentPeriod: TPaymentPeriod;
  nextPeriod: TPaymentPeriod;
}> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("loan_payment_periods")
    .select("*")
    .eq("loan_id", loanId)
    .eq("cycle_id", cycleId)
    .order("period_type", { ascending: true })
    .order("period_number", { ascending: true });

  if (error) {
    throw new Error(`Failed to get payment periods: ${error.message}`);
  }

  // Group by period_type
  const currentPeriods = data.filter((p) => p.period_type === "current");
  const nextPeriods = data.filter((p) => p.period_type === "next");

  // Convert to TPaymentPeriod format
  const currentPeriod: TPaymentPeriod = {
    title: "Kỳ hiện tại",
    subtitle: currentPeriods[0]
      ? `${currentPeriods.length} mốc thanh toán`
      : undefined,
    milestones: currentPeriods.map((p) => ({
      days: p.milestone_day,
      date: p.due_date,
      interestAndFee: Number(p.fee_amount),
      totalRedemption: Number(p.total_due),
    })),
  };

  const nextPeriod: TPaymentPeriod = {
    title: "Kỳ kế tiếp",
    subtitle: "Nếu gia hạn (Đóng lãi ngày 30)",
    milestones: nextPeriods.map((p) => ({
      days: p.milestone_day,
      date: p.due_date,
      interestAndFee: Number(p.fee_amount),
      totalRedemption: Number(p.total_due),
    })),
  };

  return { currentPeriod, nextPeriod };
}

/**
 * Tạo cycle mới cho loan
 */
export async function createPaymentCycleService({
  loanId,
  cycleNumber,
  principal,
  startDate,
  endDate,
}: {
  loanId: string;
  cycleNumber: number;
  principal: number;
  startDate: string;
  endDate: string;
}): Promise<string> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("loan_payment_cycles")
    .insert({
      loan_id: loanId,
      cycle_number: cycleNumber,
      principal,
      start_date: startDate,
      end_date: endDate,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create payment cycle: ${error.message}`);
  }

  return data.id;
}
