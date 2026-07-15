import AppLayout from "@/components/layouts/app-layout";
import OverdueKanban from "@/components/overdue/overdue-kanban.client";
import { getOverdueCustomersService } from "@/services/payments/overdue.service";

export default async function OverduePage() {
  const data = await getOverdueCustomersService();

  return (
    <AppLayout>
      <section className="flex flex-col gap-4 py-4 md:py-6">
        <OverdueKanban data={data} />
      </section>
    </AppLayout>
  );
}
