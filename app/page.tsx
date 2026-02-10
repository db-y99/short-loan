import LoansPageClient from "@/components/loan-page.client";
import AppLayout from "@/components/layouts/app-layout";
import { getLoansService } from "@/services/loans/loans.service";

export default async function Home() {
  const loans = await getLoansService();

  return (
    <AppLayout>
      <section className="flex flex-col gap-4 py-4 md:py-6">
        <LoansPageClient loans={loans} />
      </section>
    </AppLayout>
  );
}
