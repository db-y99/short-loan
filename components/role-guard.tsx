import { createSupabaseServerClient } from "@/lib/supabase/server";
import UnauthorizedAccess from "@/components/unauthorized-access";
import { getProfileRole } from "@/services/profiles.service";

type TProps = {
  role: string;
  children: React.ReactNode;
};

export default async function RoleGuard({ role, children }: TProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profileRole = user ? await getProfileRole(user.id) : null;

  if (profileRole !== role) {
    return <UnauthorizedAccess />;
  }

  return <>{children}</>;
}
