"use server";

import { revalidatePath } from "next/cache";
import { SaveLoanAttachmentsSchema } from "./save-loan-attachments.schema";
import { addLoanAssetsService } from "@/services/loans/loans.service";

type TSaveLoanAttachmentsResult =
  | { success: true }
  | { success: false; error: string };

export const saveLoanAttachmentsAction = async (
  payload: unknown,
): Promise<TSaveLoanAttachmentsResult> => {
  try {
    const input = SaveLoanAttachmentsSchema.parse(payload);

    await addLoanAssetsService({
      loanId: input.loanId,
      attachments: input.attachments,
    });

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Không lưu được attachments",
    };
  }
};

