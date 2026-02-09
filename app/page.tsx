import LoansPageClient from "@/components/loan-page.client";
import { LOAN_STATUS } from "@/constants/loan";
import type { TLoan } from "@/types/loan.types";
import AppLayout from "@/components/layouts/app-layout";

// Mock data — sẽ thay bằng service call khi có database
const MOCK_LOANS: TLoan[] = [
  {
    id: "1",
    code: "HD-2026-001",
    creator: "Nguyễn Văn A",
    customer: "Trần Thị B",
    asset: "Xe máy Honda Wave",
    amount: 5_000_000,
    loan_package: "Gói 30 ngày",
    created_at: "2026-02-01T10:30:00Z",
    approved_at: "2026-02-02T14:00:00Z",
    status: LOAN_STATUS.APPROVED,
  },
  {
    id: "2",
    code: "HD-2026-002",
    creator: "Lê Văn C",
    customer: "Phạm Thị D",
    asset: "Laptop Dell Inspiron",
    amount: 3_000_000,
    loan_package: "Gói 15 ngày",
    created_at: "2026-02-03T09:00:00Z",
    approved_at: null,
    status: LOAN_STATUS.PENDING,
  },
  {
    id: "3",
    code: "HD-2026-003",
    creator: "Nguyễn Văn A",
    customer: "Hoàng Văn E",
    asset: "iPhone 15 Pro Max",
    amount: 10_000_000,
    loan_package: "Gói 60 ngày",
    created_at: "2026-02-04T15:45:00Z",
    approved_at: "2026-02-05T08:30:00Z",
    status: LOAN_STATUS.DISBURSED,
  },
  {
    id: "4",
    code: "HD-2026-004",
    creator: "Lê Văn C",
    customer: "Võ Thị F",
    asset: "Xe máy Yamaha Exciter",
    amount: 8_000_000,
    loan_package: "Gói 30 ngày",
    created_at: "2026-01-20T11:00:00Z",
    approved_at: "2026-01-20T16:00:00Z",
    status: LOAN_STATUS.COMPLETED,
  },
  {
    id: "5",
    code: "HD-2026-005",
    creator: "Nguyễn Văn A",
    customer: "Đỗ Văn G",
    asset: "Samsung Galaxy S24",
    amount: 2_000_000,
    loan_package: "Gói 7 ngày",
    created_at: "2026-02-06T08:15:00Z",
    approved_at: null,
    status: LOAN_STATUS.REJECTED,
  },
];

export default function Home() {
  // TODO: Thay mock data bằng service call khi có database
  // const loans = await getLoansService();
  const loans = MOCK_LOANS;

  return (
    <AppLayout>
      <section className="flex flex-col gap-4 py-4 md:py-6">
        <LoansPageClient loans={loans} />
      </section>
    </AppLayout>
  );
}
