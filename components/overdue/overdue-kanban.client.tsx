"use client";

import type {
  TOverdueData,
  TOverdueCustomer,
} from "@/services/payments/overdue.service";
import type { TLoanDetails } from "@/types/loan.types";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Phone, Calendar, DollarSign, Package, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition, useState, useCallback } from "react";

import { formatCurrencyVND, formatDateShortVN } from "@/lib/format";
import { LOAN_TYPE_LABEL } from "@/constants/loan";
import LoanDetailsModal from "@/components/loan-details/loan-details-modal.client";

type TProps = {
  data: TOverdueData;
};

type TCustomerCardProps = {
  customer: TOverdueCustomer;
  onOpenDetails: (loanId: string) => void;
};

const CATEGORY_CONFIG = {
  upcoming: {
    title: "Sắp đến hạn",
    subtitle: "1-3 ngày",
    color: "warning" as const,
    bgColor: "bg-warning-50 dark:bg-warning-50/10",
    borderColor: "border-warning-300 dark:border-warning-700",
  },
  overdue_1_7: {
    title: "Quá hạn",
    subtitle: "1-7 ngày",
    color: "primary" as const,
    bgColor: "bg-primary-50 dark:bg-primary-50/10",
    borderColor: "border-primary-300 dark:border-primary-700",
  },
  overdue_8_15: {
    title: "Quá hạn",
    subtitle: "8-15 ngày",
    color: "secondary" as const,
    bgColor: "bg-secondary-50 dark:bg-secondary-50/10",
    borderColor: "border-secondary-300 dark:border-secondary-700",
  },
  overdue_15_plus: {
    title: "Quá hạn nghiêm trọng",
    subtitle: ">15 ngày",
    color: "danger" as const,
    bgColor: "bg-danger-50 dark:bg-danger-50/10",
    borderColor: "border-danger-300 dark:border-danger-700",
  },
};

function CustomerCard({ customer, onOpenDetails }: TCustomerCardProps) {
  const handleClick = () => {
    onOpenDetails(customer.loan_id);
  };

  return (
    <Card
      isPressable
      className="mb-3 hover:scale-[1.02] transition-transform"
      onPress={handleClick}
    >
      <CardBody className="gap-2 p-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-sm">{customer.customer_name}</p>
            <p className="text-xs text-default-500">{customer.loan_code}</p>
          </div>
          <Chip
            color={customer.days_overdue < 0 ? "warning" : "danger"}
            size="sm"
            variant="flat"
          >
            {customer.days_overdue < 0
              ? `Còn ${Math.abs(customer.days_overdue)} ngày`
              : `+${customer.days_overdue} ngày`}
          </Chip>
        </div>

        <div className="flex items-center gap-2 text-xs text-default-600">
          <Phone className="w-3 h-3" />
          <span>{customer.customer_phone}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-default-600">
          <Calendar className="w-3 h-3" />
          <span>Hạn: {formatDateShortVN(customer.due_date)}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-default-600">
          <Package className="w-3 h-3" />
          <span className="truncate">{customer.asset_name}</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-danger">
          <DollarSign className="w-3 h-3" />
          <span>{formatCurrencyVND(customer.total_due)}</span>
        </div>

        <div className="text-xs text-default-400 mt-1">
          Kỳ {customer.period_number} •{" "}
          {LOAN_TYPE_LABEL[customer.loan_type as keyof typeof LOAN_TYPE_LABEL]}
        </div>
      </CardBody>
    </Card>
  );
}

function KanbanColumn({
  title,
  subtitle,
  color,
  bgColor,
  borderColor,
  customers,
  onOpenDetails,
}: {
  title: string;
  subtitle: string;
  color: "warning" | "primary" | "secondary" | "danger";
  bgColor: string;
  borderColor: string;
  customers: TOverdueCustomer[];
  onOpenDetails: (loanId: string) => void;
}) {
  return (
    <div className="flex-1 min-w-[280px]">
      <Card className={`${bgColor} border-2 ${borderColor}`}>
        <CardHeader className="flex flex-col items-start gap-1 pb-2">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-base font-bold">{title}</h3>
            <Chip color={color} size="sm" variant="flat">
              {customers.length}
            </Chip>
          </div>
          <p className="text-xs text-default-500">{subtitle}</p>
        </CardHeader>
        <CardBody className="gap-0 max-h-[calc(100vh-280px)] overflow-y-auto">
          {customers.length === 0 ? (
            <div className="text-center py-8 text-default-400 text-sm">
              Không có khách hàng
            </div>
          ) : (
            customers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onOpenDetails={onOpenDetails}
              />
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default function OverdueKanban({ data }: TProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [loanDetails, setLoanDetails] = useState<TLoanDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleOpenDetails = useCallback(async (loanId: string) => {
    setSelectedLoanId(loanId);
    setIsLoadingDetails(true);
    setDetailsError(null);

    try {
      const response = await fetch(`/api/loans/${loanId}`);
      const result = await response.json();

      if (result.success) {
        setLoanDetails(result.data);
      } else {
        setDetailsError(result.error || "Không thể tải thông tin khoản vay");
      }
    } catch (error) {
      console.error("Error fetching loan details:", error);
      setDetailsError("Có lỗi xảy ra khi tải thông tin");
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  const handleCloseDetails = () => {
    setSelectedLoanId(null);
    setLoanDetails(null);
    setDetailsError(null);
  };

  const handleRefreshDetails = () => {
    if (selectedLoanId) {
      handleOpenDetails(selectedLoanId);
    }
    handleRefresh();
  };

  const totalOverdue =
    data.upcoming.length +
    data.overdue_1_7.length +
    data.overdue_8_15.length +
    data.overdue_15_plus.length;

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Theo dõi khách quá hạn</h1>
            <p className="text-sm text-default-500 mt-1">
              Tổng: {totalOverdue} khách hàng cần theo dõi
            </p>
          </div>
          <Button
            color="primary"
            isLoading={isPending}
            startContent={<RefreshCw className="w-4 h-4" />}
            variant="flat"
            onPress={handleRefresh}
          >
            Làm mới
          </Button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          <KanbanColumn
            {...CATEGORY_CONFIG.upcoming}
            customers={data.upcoming}
            onOpenDetails={handleOpenDetails}
          />
          <KanbanColumn
            {...CATEGORY_CONFIG.overdue_1_7}
            customers={data.overdue_1_7}
            onOpenDetails={handleOpenDetails}
          />
          <KanbanColumn
            {...CATEGORY_CONFIG.overdue_8_15}
            customers={data.overdue_8_15}
            onOpenDetails={handleOpenDetails}
          />
          <KanbanColumn
            {...CATEGORY_CONFIG.overdue_15_plus}
            customers={data.overdue_15_plus}
            onOpenDetails={handleOpenDetails}
          />
        </div>
      </div>

      <LoanDetailsModal
        error={detailsError}
        isLoading={isLoadingDetails}
        isOpen={selectedLoanId !== null}
        loanDetails={loanDetails}
        onClose={handleCloseDetails}
        onRefresh={handleRefreshDetails}
      />
    </>
  );
}
