/**
 * 📅 OVERDUE SERVICE
 * Service để lấy danh sách khách hàng quá hạn thanh toán
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TOverdueCustomer = {
  id: string;
  loan_id: string;
  loan_code: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  period_id: string;
  period_number: number;
  due_date: string;
  total_due: number;
  days_overdue: number;
  loan_amount: number;
  loan_type: string;
  asset_name: string;
};

export type TOverdueCategory =
  | "upcoming"
  | "overdue_1_7"
  | "overdue_8_15"
  | "overdue_15_plus";

export type TOverdueData = {
  upcoming: TOverdueCustomer[];
  overdue_1_7: TOverdueCustomer[];
  overdue_8_15: TOverdueCustomer[];
  overdue_15_plus: TOverdueCustomer[];
};

/**
 * Lấy danh sách khách hàng quá hạn, phân loại theo số ngày
 */
export async function getOverdueCustomersService(): Promise<TOverdueData> {
  const supabase = await createSupabaseServerClient();

  // Query lấy các payment periods chưa thanh toán của loans đang active
  const { data, error } = await supabase
    .from("loan_payment_periods")
    .select(
      `
      id,
      loan_id,
      period_number,
      due_date,
      total_due,
      status,
      loans!inner (
        id,
        code,
        amount,
        loan_type,
        asset_name,
        status,
        customer_id,
        customers!inner (
          id,
          full_name,
          phone
        )
      )
    `,
    )
    .eq("status", "pending")
    .in("loans.status", ["disbursed"])
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching overdue customers:", error);
    throw new Error(`Failed to fetch overdue customers: ${error.message}`);
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const result: TOverdueData = {
    upcoming: [],
    overdue_1_7: [],
    overdue_8_15: [],
    overdue_15_plus: [],
  };

  data?.forEach((period: any) => {
    const dueDate = new Date(period.due_date);

    dueDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - dueDate.getTime();
    const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const customer: TOverdueCustomer = {
      id: period.id,
      loan_id: period.loans.id,
      loan_code: period.loans.code,
      customer_id: period.loans.customers.id,
      customer_name: period.loans.customers.full_name,
      customer_phone: period.loans.customers.phone,
      period_id: period.id,
      period_number: period.period_number,
      due_date: period.due_date,
      total_due: period.total_due,
      days_overdue: daysOverdue,
      loan_amount: period.loans.amount,
      loan_type: period.loans.loan_type,
      asset_name: period.loans.asset_name,
    };

    // Phân loại theo số ngày
    if (daysOverdue < 0 && daysOverdue >= -3) {
      // Sắp đến hạn (1-3 ngày)
      result.upcoming.push(customer);
    } else if (daysOverdue >= 0 && daysOverdue <= 7) {
      // Quá hạn 1-7 ngày
      result.overdue_1_7.push(customer);
    } else if (daysOverdue >= 8 && daysOverdue <= 15) {
      // Quá hạn 8-15 ngày
      result.overdue_8_15.push(customer);
    } else if (daysOverdue > 15) {
      // Quá hạn >15 ngày
      result.overdue_15_plus.push(customer);
    }
  });

  return result;
}
