"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { CreateLoanSchema } from "./create-loan.schema";
import { upsertCustomerService } from "@/services/customers/customers.service";
import {
  createLoanService,
  deleteLoanService,
  generateLoanCodeService,
  updateLoanDriveFolderIdService,
} from "@/services/loans/loans.service";
import { LOAN_TYPE_LABEL, type TLoanType } from "@/constants/loan";
import { parseFormattedNumber } from "@/lib/format";
import { TCreateLoanPayload } from "@/types/loan.types";
import { createLoanFolder } from "@/lib/google-drive";
import { env } from "@/config/env";
import { calculateAppraisalFee } from "@/lib/loan-calculation";
import {
  createLoanPaymentScheduleService,
} from "@/services/payments/payment-periods.service";
import { getCurrentUser } from "@/lib/actions/auth";
import { getProfileById } from "@/services/profiles.service";
import { ROLES } from "@/constants/roles";
import { zodIssuesToFieldErrors } from "@/lib/zod-field-errors";

type TCreateLoanResult =
  | { success: true; data: { id: string; code: string; folderId: string } }
  | { success: false; error?: string; fieldErrors?: Record<string, string> };

export const createLoanAction = async (
  payload: TCreateLoanPayload,
): Promise<TCreateLoanResult> => {
  let createdLoanId: string | null = null;

  try {
    // Lấy thông tin user đang đăng nhập
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để tạo khoản vay",
      };
    }

    // Lấy profile để biết role và branch_id
    const profile = await getProfileById(currentUser.id);
    const isAdmin = profile?.role === ROLES.ADMIN;
    // Admin: dùng branch_id từ payload (có thể chọn), user thường: dùng branch_id của chính họ
    const branchId = isAdmin ? (payload.branch_id ?? null) : (profile?.branch_id ?? null);

    const input = CreateLoanSchema.parse({
      ...payload,
      references: payload.references,
    });

    const parentFolderId = env.SHORT_LOAN_GOOGLE_DRIVE_FOLDER_ID;
    if (!parentFolderId) {
      return {
        success: false,
        error: "Thiếu cấu hình SHORT_LOAN_GOOGLE_DRIVE_FOLDER_ID",
      };
    }

    const customer = await upsertCustomerService({
      full_name: input.full_name,
      cccd: input.cccd,
      phone: input.phone,
      address: input.address,
      cccd_issue_date: input.cccd_issue_date || null,
      cccd_issue_place: input.cccd_issue_place || null,
      facebook_link: input.facebook_link || null,
      job: input.job || null,
      income: input.income ? parseFormattedNumber(input.income) : null,
    });

    const amount = parseFormattedNumber(input.loan_amount);
    const loanType = input.loan_type as TLoanType;
    const loanPackage = LOAN_TYPE_LABEL[loanType] ?? input.loan_type;
    const code = await generateLoanCodeService(loanPackage);

    // Tính phí thẩm định tự động
    const appraisalFee = calculateAppraisalFee(amount, loanType);
    const appraisalFeePercentage = appraisalFee > 0 ? 5 : undefined;

    const { id } = await createLoanService({
      code,
      profile_id: currentUser.id,
      customer_id: customer.id,
      asset_type: input.asset_type,
      asset_name: input.asset_name,
      asset_identity: input.asset_identity,
      asset_condition: input.asset_condition || null,
      drive_folder_id: parentFolderId,
      amount,
      loan_package: loanPackage,
      loan_type: input.loan_type,
      appraisal_fee_percentage: appraisalFeePercentage,
      appraisal_fee: appraisalFee > 0 ? appraisalFee : undefined,
      bank_name: input.bank_name || null,
      bank_account_holder: input.bank_account_holder || null,
      bank_account_number: input.bank_account_number || null,
      notes: input.notes || null,
      branch_id: branchId,
      references: input.references.map((r) => ({
        full_name: r.full_name,
        phone: r.phone,
        relationship: r.relationship ?? null,
      })),
    });
    createdLoanId = id;

    const folderId = await createLoanFolder({
      parentFolderId,
      loanCode: code,
      customerName: input.full_name,
    });

    await updateLoanDriveFolderIdService({
      loanId: id,
      driveFolderId: folderId,
    });

    const signedAt = new Date().toISOString();

    await createLoanPaymentScheduleService({
      loanId: id,
      loanAmount: amount,
      loanType: loanPackage,
      signedAt,
    });

    revalidatePath("/");
    createdLoanId = null;
    return { success: true, data: { id, code, folderId } };
  } catch (err) {
    if (createdLoanId) {
      await deleteLoanService(createdLoanId).catch((cleanupError) => {
        console.error("[CREATE_LOAN_ROLLBACK_ERROR]", cleanupError);
      });
    }

    if (err instanceof ZodError) {
      return {
        success: false,
        fieldErrors: zodIssuesToFieldErrors(err.issues),
      };
    }

    if (err instanceof Error) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Đã xảy ra lỗi khi tạo khoản vay" };
  }
};
