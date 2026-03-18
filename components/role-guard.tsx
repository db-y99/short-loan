import { createSupabaseServerClient } from "@/lib/supabase/server";
import UnauthorizedAccess from "@/components/unauthorized-access";

type TProps = {
  role: string;
  children: React.ReactNode;
};

export default async function RoleGuard({ role, children }: TProps) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  if (!profile || profile.role !== role) {
    return <UnauthorizedAccess />;
  }

  return <>{children}</>;
}
