"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import {
  generateContractsService,
  regenerateContractsService,
} from "@/services/contracts/contracts.service";
import { GenerateContractsSchema } from "./generate-contracts.schema";

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
  contractTypes: string[],
): Promise<TGenerateContractsResult> {
  try {
    const input = GenerateContractsSchema.parse({ loanId, contractTypes });
    const result = await generateContractsService(
      input.loanId,
      input.contractTypes,
    );

    if (!result.success) {
      return { success: false, error: result.error ?? "Lỗi không xác định" };
    }

    revalidatePath(`/`);
    return { success: true, data: result.contracts ?? [] };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues.map((issue) => issue.message).join(", "),
      };
    }
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
  contractTypes: string[],
): Promise<TGenerateContractsResult> {
  try {
    const input = GenerateContractsSchema.parse({ loanId, contractTypes });
    const result = await regenerateContractsService(
      input.loanId,
      input.contractTypes,
    );

    if (!result.success) {
      return { success: false, error: result.error ?? "Lỗi không xác định" };
    }

    revalidatePath(`/`);
    return { success: true, data: result.contracts ?? [] };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues.map((issue) => issue.message).join(", "),
      };
    }
    console.error("[REGENERATE_CONTRACTS_ACTION_ERROR]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi khi tạo lại hợp đồng",
    };
  }
}
