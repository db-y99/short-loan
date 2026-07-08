"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { generateSignedContractsService } from "@/services/contracts/contracts.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LOAN_STATUS } from "@/constants/loan";
import { needsSignedContractRepair } from "@/lib/contract-utils";

const RepairSignedContractsSchema = z.object({
  loanId: z.string().uuid("Loan ID không hợp lệ"),
});

type TRepairSignedContractsResult =
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

export async function repairSignedContractsAction(
  loanId: string,
): Promise<TRepairSignedContractsResult> {
  try {
    const { loanId: validatedLoanId } = RepairSignedContractsSchema.parse({
      loanId,
    });

    const supabase = await createSupabaseServerClient();
    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select(
        "id, status, loan_type, loan_package, draft_signature_file_id, official_signature_file_id",
      )
      .eq("id", validatedLoanId)
      .single();

    if (loanError || !loan) {
      return { success: false, error: "Không tìm thấy khoản vay" };
    }

    if (loan.status !== LOAN_STATUS.SIGNED) {
      return {
        success: false,
        error: "Chỉ có thể tạo lại PDF khi khoản vay đã được ký",
      };
    }

    if (!loan.draft_signature_file_id || !loan.official_signature_file_id) {
      return {
        success: false,
        error: "Khoản vay chưa có chữ ký để tạo PDF",
      };
    }

    const { data: files } = await supabase
      .from("loan_files")
      .select("name, type")
      .eq("loan_id", validatedLoanId);

    const loanType = loan.loan_package ?? loan.loan_type ?? "";
    const canRepair = needsSignedContractRepair({
      loanStatus: loan.status,
      hasSignatures: true,
      loanType,
      loanFiles: files ?? [],
    });

    if (!canRepair) {
      return {
        success: false,
        error: "Hợp đồng PDF đã ký đã đủ, không cần tạo lại",
      };
    }

    const result = await generateSignedContractsService(validatedLoanId);

    if (!result.success) {
      return {
        success: false,
        error: result.error ?? "Không thể tạo lại hợp đồng PDF đã ký",
      };
    }

    revalidatePath("/");
    return { success: true, data: result.contracts ?? [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((issue) => issue.message).join(", "),
      };
    }

    console.error("[REPAIR_SIGNED_CONTRACTS_ACTION_ERROR]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Lỗi khi tạo lại hợp đồng PDF đã ký",
    };
  }
}
