import { supabaseClient } from "@/lib/supabase/client";

export type TProfileClient = {
  id: string;
  role?: string;
  status?: string;
  deleted_at?: string | null;
  branch_id?: string | null;
  branch_name?: string | null;
};

/**
 * Get profile by user ID (client-side)
 */
export async function getProfileClientById(id: string): Promise<TProfileClient | null> {
  try {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("id, role, status, deleted_at, branch_id, branches(name)")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    const branch = data.branches as { name: string } | { name: string }[] | null;
    const branchName = (Array.isArray(branch) ? branch[0] : branch)?.name ?? null;

    return {
      id: data.id,
      role: data.role,
      status: data.status,
      deleted_at: data.deleted_at,
      branch_id: data.branch_id ?? null,
      branch_name: branchName,
    };
  } catch (error) {
    console.error("Error getting profile:", error);
    return null;
  }
}
