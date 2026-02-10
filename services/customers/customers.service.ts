import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TCustomer } from "@/types/customer.types";

type TUpsertCustomerInput = {
  full_name: string;
  cccd: string;
  phone: string;
  address: string;
  cccd_issue_date?: string | null;
  cccd_issue_place?: string | null;
  facebook_link?: string | null;
  job?: string | null;
  income?: number | null;
};

/** Tạo hoặc cập nhật customer theo CCCD, trả về customer id */
export const upsertCustomerService = async (
  input: TUpsertCustomerInput
): Promise<TCustomer> => {
  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("customers")
    .select("id, full_name, cccd, phone, address, cccd_issue_date, cccd_issue_place, facebook_link, job, income, created_at")
    .eq("cccd", input.cccd)
    .single();

  if (existing) {
    const { data: updated, error } = await supabase
      .from("customers")
      .update({
        full_name: input.full_name,
        phone: input.phone,
        address: input.address,
        cccd_issue_date: input.cccd_issue_date || null,
        cccd_issue_place: input.cccd_issue_place || null,
        facebook_link: input.facebook_link || null,
        job: input.job || null,
        income: input.income ?? null,
      })
      .eq("id", existing.id)
      .select("id, full_name, cccd, phone, address, cccd_issue_date, cccd_issue_place, facebook_link, job, income, created_at")
      .single();

    if (error) throw new Error(error.message);
    if (!updated) throw new Error("Failed to update customer");
    return updated as TCustomer;
  }

  const { data: inserted, error } = await supabase
    .from("customers")
    .insert({
      full_name: input.full_name,
      cccd: input.cccd,
      phone: input.phone,
      address: input.address,
      cccd_issue_date: input.cccd_issue_date || null,
      cccd_issue_place: input.cccd_issue_place || null,
      facebook_link: input.facebook_link || null,
      job: input.job || null,
      income: input.income ?? null,
    })
    .select("id, full_name, cccd, phone, address, cccd_issue_date, cccd_issue_place, facebook_link, job, income, created_at")
    .single();

  if (error) throw new Error(error.message);
  if (!inserted) throw new Error("Failed to create customer");
  return inserted as TCustomer;
};
