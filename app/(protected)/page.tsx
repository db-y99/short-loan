import LoansPageClient from "@/components/loan-page.client";
import AppLayout from "@/components/layouts/app-layout";
import { getLoansService } from "@/services/loans/loans.service";
import { getBranchesService } from "@/services/branches.service";

type TPageProps = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    loanType?: string;
    creator?: string;
    branch?: string;
  }>;
};

export default async function Home({ searchParams }: TPageProps) {
  const params = await searchParams;

  const [loans, branches] = await Promise.all([
    getLoansService({
      search: params.search,
      status: params.status,
      loanType: params.loanType,
      creator: params.creator,
      branch: params.branch,
    }),
    getBranchesService(),
  ]);

  return (
    <AppLayout>
      <section className="flex flex-col gap-4 py-4 md:py-6">
        <LoansPageClient
          branches={branches}
          loans={loans}
          selectedBranch={params.branch || ""}
        />
      </section>
    </AppLayout>
  );
}
