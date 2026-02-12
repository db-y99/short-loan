"use server";

import { revalidatePath } from "next/cache";
import { CreateLoanSchema } from "./create-loan.schema";
import { upsertCustomerService } from "@/services/customers/customers.service";
import {
  createLoanService,
  generateLoanCodeService,
} from "@/services/loans/loans.service";
import { LOAN_TYPE_LABEL } from "@/constants/loan";
import { parseFormattedNumber } from "@/lib/format";
import { TCreateLoanPayload } from "@/types/loan.types";

type TCreateLoanResult =
  | { success: true; data: { id: string; code: string } }
  | { success: false; error: string };

export const createLoanAction = async (
  payload: TCreateLoanPayload,
): Promise<TCreateLoanResult> => {
  try {
    const input = CreateLoanSchema.parse({
      ...payload,
      references: payload.references,
    });

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

    const code = await generateLoanCodeService();
    const amount = parseFormattedNumber(input.loan_amount);
    const loanPackage = LOAN_TYPE_LABEL[input.loan_type] ?? input.loan_type;

    const { id } = await createLoanService({
      code,
      creator: "system",
      customer_id: customer.id,
      asset_type: input.asset_type,
      asset_name: input.asset_name,
      asset_identity: input.asset_identity,
      drive_folder_id: input.drive_folder_id,
      amount,
      loan_package: loanPackage,
      loan_type: input.loan_type,
      bank_name: input.bank_name || null,
      bank_account_holder: input.bank_account_holder || null,
      bank_account_number: input.bank_account_number || null,
      notes: input.notes || null,
      references: input.references.map((r) => ({
        full_name: r.full_name,
        phone: r.phone,
        relationship: r.relationship ?? null,
      })),
      attachments: payload.attachments, // File IDs đã được upload
    });

    revalidatePath("/");
    return { success: true, data: { id, code } };
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Đã xảy ra lỗi khi tạo khoản vay" };
  }
};
