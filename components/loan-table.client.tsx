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
import { Skeleton } from "@heroui/skeleton";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { Search, RefreshCw } from "lucide-react";

import type { TLoan, TLoanStatus } from "@/types/loan.types";
import {
  LOANS_TABLE_COLUMNS,
  LOAN_STATUS_LABEL,
  LOAN_STATUS_COLOR,
  LOAN_STATUS,
} from "@/constants/loan";
import { formatCurrencyVND, formatDateTimeVN } from "@/lib/format";

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


const LoansTable = ({ loans, onRefresh, onRowClick }: TProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER_VALUE);
  const [loanPackageFilter, setLoanPackageFilter] = useState(ALL_FILTER_VALUE);
  const [creatorFilter, setCreatorFilter] = useState(ALL_FILTER_VALUE);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Derive unique values from data for dynamic filters
  const loanPackageOptions = useMemo(() => {
    const unique = Array.from(new Set(loans.map((c) => c.loan_package)));

    return [
      { key: ALL_FILTER_VALUE, label: "Tất cả" },
      ...unique.map((pkg) => ({ key: pkg, label: pkg })),
    ];
  }, [loans]);

  const creatorOptions = useMemo(() => {
    const unique = Array.from(new Set(loans.map((c) => c.creator)));

    return [
      { key: ALL_FILTER_VALUE, label: "Tất cả" },
      ...unique.map((creator) => ({ key: creator, label: creator })),
    ];
  }, [loans]);

  // Filter loans
  const filteredLoans = useMemo(() => {
    let result = loans;

    // Search by code, customer, asset
    if (search.trim()) {
      const keyword = search.trim().toLowerCase();

      result = result.filter(
        (c) =>
          c.code.toLowerCase().includes(keyword) ||
          c.customer.toLowerCase().includes(keyword) ||
          c.asset.toLowerCase().includes(keyword),
      );
    }

    // Filter by status
    if (statusFilter !== ALL_FILTER_VALUE) {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Filter by loan package
    if (loanPackageFilter !== ALL_FILTER_VALUE) {
      result = result.filter((c) => c.loan_package === loanPackageFilter);
    }

    // Filter by creator
    if (creatorFilter !== ALL_FILTER_VALUE) {
      result = result.filter((c) => c.creator === creatorFilter);
    }

    return result;
  }, [loans, search, statusFilter, loanPackageFilter, creatorFilter]);

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

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setStatusFilter(e.target.value || ALL_FILTER_VALUE);
    },
    [],
  );

  const handleLoanPackageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setLoanPackageFilter(e.target.value || ALL_FILTER_VALUE);
    },
    [],
  );

  const handleCreatorChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCreatorFilter(e.target.value || ALL_FILTER_VALUE);
    },
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
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

        {isMounted ? (
          <>
            <Select
              className="w-full sm:max-w-[180px]"
              defaultSelectedKeys={[ALL_FILTER_VALUE]}
              label="Trạng thái"
              labelPlacement="outside"
              onChange={handleStatusChange}
            >
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>

            <Select
              className="w-full sm:max-w-[180px]"
              defaultSelectedKeys={[ALL_FILTER_VALUE]}
              label="Gói vay"
              labelPlacement="outside"
              onChange={handleLoanPackageChange}
            >
              {loanPackageOptions.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>

            <Select
              className="w-full sm:max-w-[180px]"
              defaultSelectedKeys={[ALL_FILTER_VALUE]}
              label="Người tạo"
              labelPlacement="outside"
              onChange={handleCreatorChange}
            >
              {creatorOptions.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>
          </>
        ) : (
          <>
            <div className="w-full sm:max-w-[180px] flex flex-col gap-1">
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
            <div className="w-full sm:max-w-[180px] flex flex-col gap-1">
              <Skeleton className="h-3 w-12 rounded-md" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
            <div className="w-full sm:max-w-[180px] flex flex-col gap-1">
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          </>
        )}

        {/* Refresh button */}
        <Tooltip content="Làm mới dữ liệu">
          <Button
            isIconOnly
            aria-label="Làm mới"
            variant="flat"
            onPress={onRefresh}
          >
            <RefreshCw size={16} />
          </Button>
        </Tooltip>
      </div>

      {/* Result count */}
      <div className="text-sm text-default-500">
        Tìm thấy {filteredLoans.length} khoản vay
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
          items={filteredLoans}
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
