/**
 * 💾 PAYMENT PERIODS SERVICE
 * Service để lưu và lấy payment periods từ DB
 */

import type { TPaymentPeriod } from "@/types/loan.types";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calculatePaymentPeriods } from "@/lib/payment-calculator";

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

  // Xác định loan type - handle both enum values and display labels
  let mappedLoanType: string;

  if (
    loanType === LOAN_TYPES.INSTALLMENT_3_PERIODS ||
    loanType.includes("trả góp") ||
    loanType.includes("3 kỳ")
  ) {
    mappedLoanType = LOAN_TYPES.INSTALLMENT_3_PERIODS;
  } else if (
    loanType === LOAN_TYPES.BULLET_PAYMENT_BY_MILESTONE ||
    loanType.includes("Theo mốc")
  ) {
    mappedLoanType = LOAN_TYPES.BULLET_PAYMENT_BY_MILESTONE;
  } else if (
    loanType === LOAN_TYPES.BULLET_PAYMENT_WITH_COLLATERAL_HOLD ||
    loanType.includes("Giữ TS")
  ) {
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
        interest: payment.interest,
        rental_fee: payment.rentalFee,
        rate: payment.rate,
        fee_amount:
          payment.interest + payment.rentalFee + (payment.serviceFee || 0),
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
        interest: payment.interest,
        rental_fee: payment.rentalFee,
        rate: payment.rate,
        fee_amount:
          payment.interest + payment.rentalFee + (payment.serviceFee || 0),
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

  // Lấy thông tin loan để biết loan_type và amount
  const { data: loanData, error: loanError } = await supabase
    .from("loans")
    .select("amount, loan_type")
    .eq("id", loanId)
    .single();

  if (loanError) {
    throw new Error(`Failed to get loan info: ${loanError.message}`);
  }

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

  // Tính service fee cho Gói 3
  const isPackage3 =
    loanData.loan_type === "bullet_payment_with_collateral_hold" ||
    loanData.loan_type?.includes("Giữ TS");
  const serviceFee = isPackage3 && loanData.amount <= 2000000 ? 30000 : 0;

  // Convert to TPaymentPeriod format
  const currentPeriod: TPaymentPeriod = {
    title: "Kỳ hiện tại",
    subtitle: currentPeriods[0]
      ? `${currentPeriods.length} mốc thanh toán`
      : undefined,
    milestones: currentPeriods.map((p) => ({
      days: p.milestone_day,
      date: p.due_date,
      principal: p.principal ? Number(p.principal) : undefined,
      interestAndFee: Number(p.fee_amount),
      totalRedemption: Number(p.total_due),
      // Chi tiết cho Gói 3
      interest: p.interest ? Number(p.interest) : undefined,
      rentalFee: p.rental_fee ? Number(p.rental_fee) : undefined,
      serviceFee: isPackage3 ? serviceFee : undefined,
    })),
  };

  const nextPeriod: TPaymentPeriod = {
    title: "Kỳ kế tiếp",
    subtitle: "Nếu gia hạn (Đóng lãi ngày 30)",
    milestones: nextPeriods.map((p) => ({
      days: p.milestone_day,
      date: p.due_date,
      principal: p.principal ? Number(p.principal) : undefined,
      interestAndFee: Number(p.fee_amount),
      totalRedemption: Number(p.total_due),
      // Chi tiết cho Gói 3
      interest: p.interest ? Number(p.interest) : undefined,
      rentalFee: p.rental_fee ? Number(p.rental_fee) : undefined,
      serviceFee: isPackage3 ? serviceFee : undefined,
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

/**
 * Tính lại chu kỳ + các kỳ thanh toán khi sửa số tiền vay (chỉ PENDING, chưa có giao dịch)
 */
export async function recalculatePendingLoanPaymentScheduleService({
  loanId,
  loanAmount,
}: {
  loanId: string;
  loanAmount: number;
}): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("id, loan_type, loan_package, created_at, current_cycle")
    .eq("id", loanId)
    .single();

  if (loanError || !loan) {
    throw new Error("Không tìm thấy khoản vay");
  }

  const cycleNumber = loan.current_cycle ?? 1;

  const { data: cycle, error: cycleError } = await supabase
    .from("loan_payment_cycles")
    .select("id, start_date")
    .eq("loan_id", loanId)
    .eq("cycle_number", cycleNumber)
    .single();

  if (cycleError || !cycle) {
    throw new Error("Không tìm thấy chu kỳ thanh toán");
  }

  const { count, error: txCountError } = await supabase
    .from("loan_payment_transactions")
    .select("id", { count: "exact", head: true })
    .eq("loan_id", loanId);

  if (txCountError) {
    throw new Error("Không thể kiểm tra lịch sử thanh toán");
  }

  if (count && count > 0) {
    throw new Error("Không thể tính lại lịch thanh toán khi đã có giao dịch");
  }

  const { error: updateCycleError } = await supabase
    .from("loan_payment_cycles")
    .update({ principal: loanAmount })
    .eq("id", cycle.id);

  if (updateCycleError) {
    throw new Error(updateCycleError.message);
  }

  const loanType = loan.loan_package ?? loan.loan_type ?? "";
  const signedAt = cycle.start_date
    ? new Date(cycle.start_date).toISOString()
    : (loan.created_at ?? new Date().toISOString());

  await saveDetailedPaymentPeriodsService({
    loanId,
    cycleId: cycle.id,
    loanAmount,
    loanType,
    signedAt,
  });
}

/**
 * Xóa lịch thanh toán nếu chưa có giao dịch (dùng khi hoàn tác ký / tạo lại HĐ).
 */
export async function clearLoanPaymentScheduleIfNoTransactionsService(
  loanId: string,
): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { count, error: txCountError } = await supabase
    .from("loan_payment_transactions")
    .select("id", { count: "exact", head: true })
    .eq("loan_id", loanId);

  if (txCountError) {
    throw new Error("Không thể kiểm tra lịch sử thanh toán");
  }

  if (count && count > 0) {
    return;
  }

  await supabase.from("loan_payment_periods").delete().eq("loan_id", loanId);
  await supabase.from("loan_payment_cycles").delete().eq("loan_id", loanId);
}

/**
 * Tạo lại lịch thanh toán khi ký hợp đồng (dùng ngày ký thực tế).
 * Xóa chu kỳ cũ nếu chưa có giao dịch thanh toán.
 */
export async function recreateLoanPaymentScheduleOnSignService({
  loanId,
  loanAmount,
  loanType,
  signedAt,
}: {
  loanId: string;
  loanAmount: number;
  loanType: string;
  signedAt: string;
}): Promise<void> {
  await clearLoanPaymentScheduleIfNoTransactionsService(loanId);

  await createLoanPaymentScheduleService({
    loanId,
    loanAmount,
    loanType,
    signedAt,
  });
}

/**
 * Tạo chu kỳ + lịch thanh toán ban đầu (rollback cycle nếu lưu periods thất bại)
 */
export async function createLoanPaymentScheduleService({
  loanId,
  loanAmount,
  loanType,
  signedAt,
}: {
  loanId: string;
  loanAmount: number;
  loanType: string;
  signedAt: string;
}): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const startDate = signedAt.split("T")[0];
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const cycleId = await createPaymentCycleService({
    loanId,
    cycleNumber: 1,
    principal: loanAmount,
    startDate,
    endDate,
  });

  try {
    await saveDetailedPaymentPeriodsService({
      loanId,
      cycleId,
      loanAmount,
      loanType,
      signedAt,
    });
  } catch (error) {
    await supabase.from("loan_payment_cycles").delete().eq("id", cycleId);
    throw error;
  }
}
