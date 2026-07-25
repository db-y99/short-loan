import { createClient } from "@supabase/supabase-js";

import { env } from "@/config/env";

/** Service-role client — bypass RLS. Chỉ dùng server-side (API công khai khách / admin ops). */
export const createSupabaseAdminClient = () =>
  createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
