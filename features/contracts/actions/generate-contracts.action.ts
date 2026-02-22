"use server";

import { revalidatePath } from "next/cache";
import { generateContractsService, regenerateContractsService } from "@/services/contracts/contracts.service";

type TGenerateContractsResult =
  | {
      success: true;
      data: Array<{
        id: string;
        name: string;
        type: string;
        fileId: string;
        provider: string;
      }>;
    }
  | { success: false; error: string };

export async function generateContractsAction(
  loanId: string,
): Promise<TGenerateContractsResult> {
  try {
    const result = await generateContractsService(loanId);

    if (!result.success) {
      return { success: false, error: result.error ?? "Lỗi không xác định" };
    }

    revalidatePath(`/`);
    return { success: true, data: result.contracts ?? [] };
  } catch (error) {
    console.error("[GENERATE_CONTRACTS_ACTION_ERROR]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi khi tạo hợp đồng",
    };
  }
}

/**
 * Tạo lại hợp đồng (xóa cũ và tạo mới)
 */
export async function regenerateContractsAction(
  loanId: string,
): Promise<TGenerateContractsResult> {
  try {
    const result = await regenerateContractsService(loanId);

    if (!result.success) {
      return { success: false, error: result.error ?? "Lỗi không xác định" };
    }

    revalidatePath(`/`);
    return { success: true, data: result.contracts ?? [] };
  } catch (error) {
    console.error("[REGENERATE_CONTRACTS_ACTION_ERROR]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi khi tạo lại hợp đồng",
    };
  }
}
