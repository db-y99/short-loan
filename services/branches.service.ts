import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TBranch, TBranchFormData } from "@/types/branch.types";

const BRANCH_SELECT =
  "id, code, name, address, phone, status, is_headquarters, created_at";

const toBranchInsertPayload = (input: TBranchFormData) => ({
  name: input.name.trim(),
  code: input.code?.trim() || null,
  address: input.address?.trim() || null,
  phone: input.phone?.trim() || null,
  is_headquarters: input.is_headquarters ?? false,
});

const toBranchUpdatePayload = (
  input: Partial<TBranchFormData> & { status?: string },
) => {
  const payload: Record<string, string | boolean | null> = {};

  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.code !== undefined) payload.code = input.code.trim() || null;
  if (input.address !== undefined) payload.address = input.address?.trim() || null;
  if (input.phone !== undefined) payload.phone = input.phone?.trim() || null;
  if (input.is_headquarters !== undefined) {
    payload.is_headquarters = input.is_headquarters;
  }
  if (input.status !== undefined) payload.status = input.status;

  return payload;
};

export const getBranchesService = async (): Promise<TBranch[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("branches")
    .select("id, code, name, address, phone, status, is_headquarters, created_at")
    .is("deleted_at", null)
    .order("is_headquarters", { ascending: false })
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as TBranch[];
};

export const createBranchService = async (input: TBranchFormData): Promise<TBranch> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("branches")
    .insert(toBranchInsertPayload(input))
    .select(BRANCH_SELECT)
    .single();
  if (error) throw new Error(error.message);
  return data as TBranch;
};

export const updateBranchService = async (id: string, input: Partial<TBranchFormData> & { status?: string }): Promise<TBranch> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("branches")
    .update(toBranchUpdatePayload(input))
    .eq("id", id)
    .select(BRANCH_SELECT)
    .single();
  if (error) throw new Error(error.message);
  return data as TBranch;
};

export const deleteBranchService = async (id: string): Promise<void> => {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("branches")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
};
