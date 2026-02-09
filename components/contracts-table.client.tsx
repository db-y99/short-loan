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

import type { TContract, TContractStatus } from "@/types/contracts.types";
import {
  CONTRACT_TABLE_COLUMNS,
  CONTRACT_STATUS_LABEL,
  CONTRACT_STATUS_COLOR,
  CONTRACT_STATUS,
} from "@/constants/contracts";

type TProps = {
  contracts: TContract[];
  onRefresh?: () => void;
  onRowClick?: (contract: TContract) => void;
};

const ALL_FILTER_VALUE = "all";

const STATUS_OPTIONS = [
  { key: ALL_FILTER_VALUE, label: "Tất cả" },
  ...Object.values(CONTRACT_STATUS).map((status) => ({
    key: status,
    label: CONTRACT_STATUS_LABEL[status],
  })),
];

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

const ContractsTable = ({ contracts, onRefresh, onRowClick }: TProps) => {
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
    const unique = Array.from(new Set(contracts.map((c) => c.loan_package)));

    return [
      { key: ALL_FILTER_VALUE, label: "Tất cả" },
      ...unique.map((pkg) => ({ key: pkg, label: pkg })),
    ];
  }, [contracts]);

  const creatorOptions = useMemo(() => {
    const unique = Array.from(new Set(contracts.map((c) => c.creator)));

    return [
      { key: ALL_FILTER_VALUE, label: "Tất cả" },
      ...unique.map((creator) => ({ key: creator, label: creator })),
    ];
  }, [contracts]);

  // Filter contracts
  const filteredContracts = useMemo(() => {
    let result = contracts;

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
  }, [contracts, search, statusFilter, loanPackageFilter, creatorFilter]);

  const renderCell = useCallback(
    (contract: TContract, columnKey: string): React.ReactNode => {
      switch (columnKey) {
        case "amount":
          return (
            <span className="font-semibold">
              {formatCurrency(contract.amount)}
            </span>
          );
        case "created_at":
          return formatDate(contract.created_at);
        case "approved_at":
          return formatDate(contract.approved_at);
        case "status":
          return (
            <Chip
              color={CONTRACT_STATUS_COLOR[contract.status as TContractStatus]}
              variant="flat"
            >
              {CONTRACT_STATUS_LABEL[contract.status as TContractStatus]}
            </Chip>
          );
        default:
          return contract[columnKey as keyof TContract]?.toString() ?? "—";
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
        Tìm thấy {filteredContracts.length} hợp đồng
      </div>

      {/* Table */}
      <Table aria-label="Bảng hợp đồng vay" isHeaderSticky selectionMode="none">
        <TableHeader columns={[...CONTRACT_TABLE_COLUMNS]}>
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
          emptyContent="Không có hợp đồng nào"
          items={filteredContracts}
        >
          {(contract) => (
            <TableRow
              key={contract.id}
              className={

                onRowClick
                  ? "cursor-pointer hover:bg-default-100 transition-colors"
                  : ""
              }
              onClick={() => onRowClick?.(contract)}
            >
              {(columnKey) => (
                <TableCell className="py-4">
                  {renderCell(contract, columnKey as string)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContractsTable;
