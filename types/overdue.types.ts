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
