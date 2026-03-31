import BranchesPageClient from "@/components/branches/branches-page.client";
import AppLayout from "@/components/layouts/app-layout";
import RoleGuard from "@/components/role-guard";
import { getBranchesService } from "@/services/branches.service";
import { ROLES } from "@/constants/roles";

export default async function BranchesPage() {
  const branches = await getBranchesService();

  return (
    <AppLayout>
      <RoleGuard role={ROLES.ADMIN}>
        <section className="flex flex-col gap-4 py-4 md:py-6">
          <BranchesPageClient branches={branches} />
        </section>
      </RoleGuard>
    </AppLayout>
  );
}
