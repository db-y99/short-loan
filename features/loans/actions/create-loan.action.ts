"use server";

import { revalidatePath } from "next/cache";
import { CreateLoanSchema, type CreateLoanInput } from "./create-loan.schema";
import { upsertCustomerService } from "@/services/customers/customers.service";
import {
  createLoanService,
  generateLoanCodeService,
} from "@/services/loans/loans.service";
import { LOAN_TYPE_LABEL } from "@/constants/loan";
import { parseFormattedNumber } from "@/lib/format";

type TCreateLoanResult =
  | { success: true; data: { id: string; code: string } }
  | { success: false; error: string };

export const createLoanAction = async (
  formData: FormData
): Promise<TCreateLoanResult> => {
  try {
    const raw = {
      full_name: formData.get("full_name"),
      cccd: formData.get("cccd"),
      phone: formData.get("phone"),
      cccd_issue_date: formData.get("cccd_issue_date"),
      cccd_issue_place: formData.get("cccd_issue_place"),
      address: formData.get("address"),
      facebook_link: formData.get("facebook_link"),
      job: formData.get("job"),
      income: formData.get("income"),
      bank_name: formData.get("bank_name"),
      bank_account_holder: formData.get("bank_account_holder"),
      bank_account_number: formData.get("bank_account_number"),
      asset_type: formData.get("asset_type"),
      asset_name: formData.get("asset_name"),
      chassis_number: formData.get("chassis_number"),
      engine_number: formData.get("engine_number"),
      imei: formData.get("imei"),
      serial: formData.get("serial"),
      loan_amount: formData.get("loan_amount"),
      loan_type: formData.get("loan_type"),
      notes: formData.get("notes"),
      references: formData.get("references"),
    };

    const parsedRefs = raw.references
      ? (JSON.parse(String(raw.references)) as CreateLoanInput["references"])
      : [];

    const input = CreateLoanSchema.parse({
      ...raw,
      references: parsedRefs,
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
      chassis_number: input.chassis_number || null,
      engine_number: input.engine_number || null,
      imei: input.imei || null,
      serial: input.serial || null,
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
