import UsersPageClient from "@/components/users/users-page.client";
import AppLayout from "@/components/layouts/app-layout";
import RoleGuard from "@/components/role-guard";
import { getProfiles } from "@/services/profiles.service";
import { getBranchesService } from "@/services/branches.service";
import { ROLES } from "@/constants/roles";

type TPageProps = {
  searchParams: Promise<{
    search?: string;
    page?: string;
    branch?: string;
  }>;
};

export default async function UsersPage({ searchParams }: TPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const branchId = params.branch || "";

  const [{ profiles, total }, branches] = await Promise.all([
    getProfiles(page, 20, search, branchId),
    getBranchesService(),
  ]);

  return (
    <AppLayout>
      <RoleGuard role={ROLES.ADMIN}>
        <section className="flex flex-col gap-4 py-4 md:py-6">
          <UsersPageClient
            branches={branches}
            currentPage={page}
            profiles={profiles}
            searchQuery={search}
            selectedBranch={branchId}
            total={total}
          />
        </section>
      </RoleGuard>
    </AppLayout>
  );
}
