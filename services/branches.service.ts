import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TBranch, TBranchFormData } from "@/types/branch.types";

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
    .insert({ name: input.name, address: input.address || null, phone: input.phone || null })
    .select("id, name, address, phone, status, created_at")
    .single();
  if (error) throw new Error(error.message);
  return data as TBranch;
};

export const updateBranchService = async (id: string, input: Partial<TBranchFormData> & { status?: string }): Promise<TBranch> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("branches")
    .update(input)
    .eq("id", id)
    .select("id, name, address, phone, status, created_at")
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
