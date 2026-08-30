"use server";

import type { TOverdueData } from "@/types/overdue.types";

import { getOverdueCustomersService } from "@/services/payments/overdue.service";
import { requireActionStaffUser } from "@/lib/auth/action-auth";

type TGetOverdueCustomersResult =
  | { success: true; data: TOverdueData }
  | { success: false; error: string };

export const getOverdueCustomersAction =
  async (): Promise<TGetOverdueCustomersResult> => {
    try {
      const auth = await requireActionStaffUser();

      if (!auth.ok) {
        return { success: false, error: auth.error };
      }

      const data = await getOverdueCustomersService();

      return { success: true, data };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách khách quá hạn";

      return { success: false, error: message };
    }
  };
