"use server";

import type { TLoanDetails } from "@/types/loan.types";

import { getLoanDetailsService } from "@/services/loans/loans.service";
import { requireActionStaffUser } from "@/lib/auth/action-auth";

type TGetLoanDetailsResult =
  | { success: true; data: TLoanDetails }
  | { success: false; error: string; data?: null };

export const getLoanDetailsAction = async (
  loanId: string,
): Promise<TGetLoanDetailsResult> => {
  try {
    const auth = await requireActionStaffUser();

    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    if (!loanId?.trim()) {
      return { success: false, error: "ID khoản vay không hợp lệ" };
    }

    const data = await getLoanDetailsService(loanId);

    if (!data) {
      return { success: false, error: "Không tìm thấy khoản vay" };
    }

    return { success: true, data };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Đã xảy ra lỗi khi tải chi tiết khoản vay";

    return { success: false, error: message };
  }
};
