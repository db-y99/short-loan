import UsersPageClient from "@/components/users/users-page.client";
import AppLayout from "@/components/layouts/app-layout";
import RoleGuard from "@/components/role-guard";
import { getProfiles } from "@/services/profiles.service";

type TPageProps = {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
};

export default async function UsersPage({ searchParams }: TPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";

  const { profiles, total } = await getProfiles(page, 20, search);

  return (
    <AppLayout>
      <RoleGuard role="admin">
        <section className="flex flex-col gap-4 py-4 md:py-6">
          <UsersPageClient
            profiles={profiles}
            total={total}
            currentPage={page}
            searchQuery={search}
          />
        </section>
      </RoleGuard>
    </AppLayout>
  );
}
