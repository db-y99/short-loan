import { supabaseClient } from "@/lib/supabase/client";

export type TProfileClient = {
  id: string;
  role?: string;
};

/**
 * Get profile by user ID (client-side)
 */
export async function getProfileClientById(id: string): Promise<TProfileClient | null> {
  try {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("id, role")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data as TProfileClient;
  } catch (error) {
    console.error("Error getting profile:", error);
    return null;
  }
}
