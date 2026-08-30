/**
 * 📅 OVERDUE SERVICE
 * Service để lấy danh sách khách hàng quá hạn thanh toán
 */

import type { TOverdueCustomer, TOverdueData } from "@/types/overdue.types";

import { LOAN_STATUS } from "@/constants/loan";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type TOverduePeriodRow = {
  id: string;
  loan_id: string;
  cycle_id: string;
  period_number: number;
  due_date: string;
  total_due: number;
  loans:
    | {
        id: string;
        code: string;
        amount: number;
        loan_type: string;
        asset_name: string;
        status: string;
        current_cycle: number | null;
        customers:
          | {
              id: string;
              full_name: string;
              phone: string;
            }
          | {
              id: string;
              full_name: string;
              phone: string;
            }[];
      }
    | {
        id: string;
        code: string;
        amount: number;
        loan_type: string;
        asset_name: string;
        status: string;
        current_cycle: number | null;
        customers:
          | {
              id: string;
              full_name: string;
              phone: string;
            }
          | {
              id: string;
              full_name: string;
              phone: string;
            }[];
      }[];
};

const EMPTY_OVERDUE_DATA: TOverdueData = {
  upcoming: [],
  overdue_1_7: [],
  overdue_8_15: [],
  overdue_15_plus: [],
};

const unwrapRelation = <T>(value: T | T[] | null | undefined): T | null => {
  if (!value) return null;

  return Array.isArray(value) ? (value[0] ?? null) : value;
};

/**
 * Lấy danh sách khách hàng quá hạn, phân loại theo số ngày
 */
export async function getOverdueCustomersService(): Promise<TOverdueData> {
  const supabase = await createSupabaseServerClient();

  const { data: periods, error } = await supabase
    .from("loan_payment_periods")
    .select(
      `
      id,
      loan_id,
      cycle_id,
      period_number,
      due_date,
      total_due,
      loans!inner (
        id,
        code,
        amount,
        loan_type,
        asset_name,
        status,
        current_cycle,
        customers!inner (
          id,
          full_name,
          phone
        )
      )
    `,
    )
    .eq("status", "pending")
    .eq("period_type", "current")
    .order("due_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch overdue customers: ${error.message}`);
  }

  if (!periods?.length) {
    return EMPTY_OVERDUE_DATA;
  }

  const cycleIds = Array.from(
    new Set(
      (periods as TOverduePeriodRow[]).map((period) => period.cycle_id),
    ),
  );

  const { data: cycles, error: cyclesError } = await supabase
    .from("loan_payment_cycles")
    .select("id, cycle_number")
    .in("id", cycleIds);

  if (cyclesError) {
    throw new Error(`Failed to fetch payment cycles: ${cyclesError.message}`);
  }

  const cycleNumberById = new Map(
    (cycles ?? []).map((cycle) => [cycle.id, cycle.cycle_number]),
  );

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const firstUnpaidByLoan = new Map<string, TOverdueCustomer>();

  (periods as TOverduePeriodRow[]).forEach((period) => {
    const loan = unwrapRelation(period.loans);
    const customer = unwrapRelation(loan?.customers);
    const cycleNumber = cycleNumberById.get(period.cycle_id);

    if (!loan || !customer || cycleNumber === undefined) return;
    if (loan.status !== LOAN_STATUS.DISBURSED) return;
    if (cycleNumber !== (loan.current_cycle ?? 1)) return;

    const dueDate = new Date(period.due_date);

    dueDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - dueDate.getTime();
    const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const overdueCustomer: TOverdueCustomer = {
      id: period.id,
      loan_id: loan.id,
      loan_code: loan.code,
      customer_id: customer.id,
      customer_name: customer.full_name,
      customer_phone: customer.phone,
      period_id: period.id,
      period_number: period.period_number,
      due_date: period.due_date,
      total_due: Number(period.total_due) || 0,
      days_overdue: daysOverdue,
      loan_amount: Number(loan.amount) || 0,
      loan_type: loan.loan_type,
      asset_name: loan.asset_name,
    };

    const existing = firstUnpaidByLoan.get(loan.id);

    if (!existing || period.period_number < existing.period_number) {
      firstUnpaidByLoan.set(loan.id, overdueCustomer);
    }
  });

  const result: TOverdueData = {
    upcoming: [],
    overdue_1_7: [],
    overdue_8_15: [],
    overdue_15_plus: [],
  };

  firstUnpaidByLoan.forEach((customer) => {
    const { days_overdue: daysOverdue } = customer;

    if (daysOverdue < 0 && daysOverdue >= -3) {
      result.upcoming.push(customer);
    } else if (daysOverdue >= 0 && daysOverdue <= 7) {
      result.overdue_1_7.push(customer);
    } else if (daysOverdue >= 8 && daysOverdue <= 15) {
      result.overdue_8_15.push(customer);
    } else if (daysOverdue > 15) {
      result.overdue_15_plus.push(customer);
    }
  });

  return result;
}
