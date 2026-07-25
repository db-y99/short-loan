import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role?: string;
  status?: string;
  branch_id?: string | null;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

const PROFILE_COLUMNS =
  "id, email, full_name, role, status, branch_id, deleted_at, created_at, updated_at";

/**
 * Get profile by email (pre-auth / OTP).
 * Dùng service-role vì RLS chặn anon SELECT trên profiles —
 * OTP login chạy khi chưa có session nên client thường luôn trả null.
 */
export async function getProfileByEmail(
  email: string,
): Promise<Profile | null> {
  try {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return null;
    }

    const originalTrimmed = email.trim();
    const emailCandidates = Array.from(
      new Set([originalTrimmed, trimmedEmail]),
    );

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .in("email", emailCandidates)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error("Error getting profile by email:", error);

    return null;
  }
}

/**
 * Get profile by user ID
 */
export async function getProfileById(id: string): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error("Error getting profile by ID:", error);

    return null;
  }
}

/**
 * Create new profile
 */
export async function createProfile(
  profileData: Omit<Profile, "created_at" | "updated_at">,
): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .insert(profileData)
      .select()
      .single();

    if (error || !data) {
      console.error("Error creating profile:", error);

      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error("Error creating profile:", error);

    return null;
  }
}

/**
 * Update profile
 */
export async function updateProfile(
  id: string,
  updates: Partial<Profile>,
): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Error updating profile:", error);

      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error("Error updating profile:", error);

    return null;
  }
}

/**
 * Delete profile
 */
export async function deleteProfile(id: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").delete().eq("id", id);

    if (error) {
      console.error("Error deleting profile:", error);

      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting profile:", error);

    return false;
  }
}

/**
 * Get profile role by user ID (server-side)
 */
export async function getProfileRole(id: string): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return data.role ?? null;
  } catch (error) {
    console.error("Error getting profile role:", error);

    return null;
  }
}

export async function getProfiles(
  page = 1,
  limit = 10,
  search = "",
  branchId = "",
): Promise<{ profiles: Profile[]; total: number }> {
  try {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .range(from, to)
      .order("created_at", { ascending: false });

    if (search.trim()) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (branchId.trim()) {
      query = query.eq("branch_id", branchId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error getting profiles:", error);

      return { profiles: [], total: 0 };
    }

    return {
      profiles: data as Profile[],
      total: count || 0,
    };
  } catch (error) {
    console.error("Error getting profiles:", error);

    return { profiles: [], total: 0 };
  }
}
