"use server";

import { revalidatePath } from "next/cache";
import { disburseLoanService } from "@/services/loans/disburse-loan.service";

type TDisburseResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Giải ngân khoản vay
 */
export async function disburseLoanAction(
  loanId: string,
): Promise<TDisburseResult> {
  try {
    const result = await disburseLoanService(loanId);

    if (!result.success) {
      return { success: false, error: result.error ?? "Lỗi không xác định" };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[DISBURSE_LOAN_ACTION_ERROR]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi khi giải ngân",
    };
  }
}
