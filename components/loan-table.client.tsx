"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { Search, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounceValue } from "usehooks-ts";

import type { TLoan, TLoanStatus } from "@/types/loan.types";
import {
  LOANS_TABLE_COLUMNS,
  LOAN_STATUS_LABEL,
  LOAN_STATUS_COLOR,
  LOAN_STATUS,
  LOAN_TYPES,
  LOAN_TYPE_LABEL,
} from "@/constants/loan";
import { formatCurrencyVND, formatDateTimeVN } from "@/lib/format";
import CreateLoanButton from "@/components/create-loan/create-loan-button.client";

type TProps = {
  loans: TLoan[];
  onRefresh?: () => void;
  onRowClick?: (loan: TLoan) => void;
};

const ALL_FILTER_VALUE = "all";

const STATUS_OPTIONS = [
  { key: ALL_FILTER_VALUE, label: "Tất cả" },
  ...Object.values(LOAN_STATUS).map((status) => ({
    key: status,
    label: LOAN_STATUS_LABEL[status],
  })),
];

const LOAN_TYPE_OPTIONS = [
  { key: ALL_FILTER_VALUE, label: "Tất cả" },
  ...Object.values(LOAN_TYPES).map((type) => ({
    key: type,
    label: LOAN_TYPE_LABEL[type],
  })),
];


const LoansTable = ({ loans, onRefresh, onRowClick }: TProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isClient, setIsClient] = useState(false);
  
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [debouncedSearch] = useDebounceValue(search, 500);
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") ?? ALL_FILTER_VALUE,
  );
  const [loanTypeFilter, setLoanTypeFilter] = useState(
    searchParams.get("loanType") ?? ALL_FILTER_VALUE,
  );
  const [creatorFilter, setCreatorFilter] = useState(
    searchParams.get("creator") ?? ALL_FILTER_VALUE,
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update URL when debounced search changes - separate effect to avoid dependency issues
  useEffect(() => {
    if (!isClient || !debouncedSearch) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", debouncedSearch);

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  }, [debouncedSearch, isClient]);

  // Clear search from URL when empty
  useEffect(() => {
    if (!isClient || debouncedSearch) return;
    
    const params = new URLSearchParams(searchParams.toString());
    if (params.has("search")) {
      params.delete("search");
      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: false });
      });
    }
  }, [debouncedSearch, isClient]);

  // Update URL when filters change
  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== ALL_FILTER_VALUE) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams],
  );

  // Derive unique values from data for dynamic filters
  const creatorOptions = useMemo(() => {
    const unique = Array.from(new Set(loans.map((c) => c.creator)));

    return [
      { key: ALL_FILTER_VALUE, label: "Tất cả" },
      ...unique.map((creator) => ({ key: creator, label: creator })),
    ];
  }, [loans]);

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value || ALL_FILTER_VALUE;
      setStatusFilter(value);
      updateFilters({ status: value });
    },
    [updateFilters],
  );

  const handleLoanTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value || ALL_FILTER_VALUE;
      setLoanTypeFilter(value);
      updateFilters({ loanType: value });
    },
    [updateFilters],
  );

  const handleCreatorChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value || ALL_FILTER_VALUE;
      setCreatorFilter(value);
      updateFilters({ creator: value });
    },
    [updateFilters],
  );

  const renderCell = useCallback(
    (loan: TLoan, columnKey: string): React.ReactNode => {
      switch (columnKey) {
        case "amount":
          return (
            <span className="font-semibold">
              {formatCurrencyVND(loan.amount)}
            </span>
          );
        case "created_at":
          return formatDateTimeVN(loan.created_at);
        case "approved_at":
          return formatDateTimeVN(loan.approved_at);
        case "status":
          return (
            <Chip
              color={LOAN_STATUS_COLOR[loan.status as TLoanStatus]}
              variant="flat"
            >
              {LOAN_STATUS_LABEL[loan.status as TLoanStatus]}
            </Chip>
          );
        default:
          return loan[columnKey as keyof TLoan]?.toString() ?? "—";
      }
    },
    [],
  );

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    } else {
      router.refresh();
    }
  }, [onRefresh, router]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* Search Input - Always render consistently */}
        <Input
          className="w-full sm:max-w-xs"
          label="Tìm kiếm"
          labelPlacement="outside"
          placeholder="Mã HĐ, khách hàng, tài sản..."
          startContent={
            <Search className="text-default-400 flex-shrink-0" size={16} />
          }
          value={search}
          onValueChange={setSearch}
        />

        {/* Filters - Render only on client to avoid hydration mismatch */}
        {isClient ? (
          <>
            <Select
              className="w-full sm:max-w-[180px]"
              selectedKeys={[statusFilter]}
              label="Trạng thái"
              labelPlacement="outside"
              onChange={handleStatusChange}
              isDisabled={isPending}
            >
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>

            <Select
              className="w-full sm:max-w-[180px]"
              selectedKeys={[loanTypeFilter]}
              label="Gói vay"
              labelPlacement="outside"
              onChange={handleLoanTypeChange}
              isDisabled={isPending}
            >
              {LOAN_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>

            <Select
              className="w-full sm:max-w-[180px]"
              selectedKeys={[creatorFilter]}
              label="Người tạo"
              labelPlacement="outside"
              onChange={handleCreatorChange}
              isDisabled={isPending}
            >
              {creatorOptions.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>
          </>
        ) : (
          <>
            <div className="w-full sm:max-w-[180px] h-14 bg-default-100 rounded-lg animate-pulse" />
            <div className="w-full sm:max-w-[180px] h-14 bg-default-100 rounded-lg animate-pulse" />
            <div className="w-full sm:max-w-[180px] h-14 bg-default-100 rounded-lg animate-pulse" />
          </>
        )}

        {/* Refresh button */}
        <Tooltip content="Làm mới dữ liệu">
          <Button
            isIconOnly
            aria-label="Làm mới"
            variant="flat"
            onPress={handleRefresh}
            isLoading={isPending}
          >
            <RefreshCw size={16} />
          </Button>
        </Tooltip>

        {/* Create loan button */}
        <CreateLoanButton />
      </div>

      {/* Result count */}
      <div className="text-sm text-default-500">
        {isPending ? "Đang tải..." : `Tìm thấy ${loans.length} khoản vay`}
      </div>

      {/* Table */}
      <Table aria-label="Bảng khoản vay" isHeaderSticky selectionMode="none">
        <TableHeader columns={[...LOANS_TABLE_COLUMNS]}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "amount" ? "end" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent="Không có khoản vay nào"
          items={loans}
          isLoading={isPending}
        >
          {(loan) => (
            <TableRow
              key={loan.id}
              className={

                onRowClick
                  ? "cursor-pointer hover:bg-default-100 transition-colors"
                  : ""
              }
              onClick={() => onRowClick?.(loan)}
            >
              {(columnKey) => (
                <TableCell className="py-4">
                  {renderCell(loan, columnKey as string)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LoansTable;
