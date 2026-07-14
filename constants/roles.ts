export const ROLES = {
  ADMIN: "admin",
  CA: "ca",
  USER: "user",
} as const;

export type TRole = (typeof ROLES)[keyof typeof ROLES];

export const LOAN_APPROVER_ROLES = [ROLES.ADMIN, ROLES.CA] as const;

export const isLoanApproverRole = (role: string | null | undefined): boolean =>
  role === ROLES.ADMIN || role === ROLES.CA;

/** Admin + CA (kế toán) — được đóng tiền / chuộc đồ */
export const isPaymentOperatorRole = isLoanApproverRole;
