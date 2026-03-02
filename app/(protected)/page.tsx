import LoansPageClient from "@/components/loan-page.client";
import AppLayout from "@/components/layouts/app-layout";
import { getLoansService } from "@/services/loans/loans.service";

type TPageProps = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    loanType?: string;
    creator?: string;
  }>;
};

export default async function Home({ searchParams }: TPageProps) {
  const params = await searchParams;
  
  const loans = await getLoansService({
    search: params.search,
    status: params.status,
    loanType: params.loanType,
    creator: params.creator,
  });

  return (
    <AppLayout>
      <section className="flex flex-col gap-4 py-4 md:py-6">
        <LoansPageClient loans={loans} />
      </section>
    </AppLayout>
  );
}
