import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role_id?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get profile by email
 */
export async function getProfileByEmail(email: string): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.trim())
      .single();

    if (error || !data) {
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error('Error getting profile by email:', error);
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
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error('Error getting profile by ID:', error);
    return null;
  }
}

/**
 * Create new profile
 */
export async function createProfile(profileData: Omit<Profile, 'created_at' | 'updated_at'>): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating profile:', error);
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error('Error creating profile:', error);
    return null;
  }
}

/**
 * Update profile
 */
export async function updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}

/**
 * Delete profile
 */
export async function deleteProfile(id: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting profile:', error);
    return false;
  }
}

/**
 * Get all profiles with pagination
 */
export async function getProfiles(page = 1, limit = 10): Promise<{ profiles: Profile[]; total: number }> {
  try {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting profiles:', error);
      return { profiles: [], total: 0 };
    }

    return {
      profiles: data as Profile[],
      total: count || 0
    };
  } catch (error) {
    console.error('Error getting profiles:', error);
    return { profiles: [], total: 0 };
  }
}