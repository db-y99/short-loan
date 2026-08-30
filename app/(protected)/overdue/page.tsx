import type { TOverdueData } from "@/types/overdue.types";

import AppLayout from "@/components/layouts/app-layout";
import OverdueKanban from "@/components/overdue/overdue-kanban.client";
import { getOverdueCustomersService } from "@/services/payments/overdue.service";

const EMPTY_OVERDUE_DATA: TOverdueData = {
  upcoming: [],
  overdue_1_7: [],
  overdue_8_15: [],
  overdue_15_plus: [],
};

export default async function OverduePage() {
  let data = EMPTY_OVERDUE_DATA;
  let loadError: string | null = null;

  try {
    data = await getOverdueCustomersService();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Không thể tải danh sách khách quá hạn";
  }

  return (
    <AppLayout>
      <section className="flex flex-col gap-4 py-4 md:py-6">
        <OverdueKanban initialData={data} initialError={loadError} />
      </section>
    </AppLayout>
  );
}
