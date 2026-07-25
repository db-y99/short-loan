import type { TPaymentMilestone } from "@/types/loan.types";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";

import { formatDateShortVN } from "@/lib/format";
import { formatCurrencyVND } from "@/lib/format";

const PaymentTable = ({
  milestones,
  showTotal = false,
  showPrincipal = false,
  showDetailedBreakdown = false,
  /** Gói 3: hiện cột phí dịch vụ. Gói 2: tắt. */
  showServiceFeeColumn = false,
  /** Nhãn cột phí — Gói 2: Phí thuê; Gói 3: Phí bảo quản tài sản */
  feeLabel = "Phí thuê",
}: {
  milestones: TPaymentMilestone[];
  showTotal?: boolean;
  showPrincipal?: boolean;
  showDetailedBreakdown?: boolean;
  showServiceFeeColumn?: boolean;
  feeLabel?: string;
}) => {
  const totalRedemption = milestones.reduce(
    (sum, m) => sum + m.totalRedemption,
    0,
  );

  const detailedColSpan = showServiceFeeColumn ? 5 : 4;

  const renderDetailedHeader = () =>
    showServiceFeeColumn ? (
      <TableHeader>
        <TableColumn>Mốc</TableColumn>
        <TableColumn>Ngày</TableColumn>
        <TableColumn align="end">Lãi</TableColumn>
        <TableColumn align="end">{feeLabel}</TableColumn>
        <TableColumn align="end">Phí dịch vụ</TableColumn>
        <TableColumn align="end">Tổng chuộc</TableColumn>
      </TableHeader>
    ) : (
      <TableHeader>
        <TableColumn>Mốc</TableColumn>
        <TableColumn>Ngày</TableColumn>
        <TableColumn align="end">Lãi</TableColumn>
        <TableColumn align="end">{feeLabel}</TableColumn>
        <TableColumn align="end">Tổng chuộc</TableColumn>
      </TableHeader>
    );

  const renderDetailedRow = (milestone: TPaymentMilestone, index: number) =>
    showServiceFeeColumn ? (
      <TableRow key={index}>
        <TableCell>
          <Chip size="sm" variant="flat">
            {milestone.days} ngày
          </Chip>
        </TableCell>
        <TableCell>{formatDateShortVN(milestone.date)}</TableCell>
        <TableCell className="text-end">
          {formatCurrencyVND(milestone.interest || 0)}
        </TableCell>
        <TableCell className="text-end">
          {formatCurrencyVND(milestone.rentalFee || 0)}
        </TableCell>
        <TableCell className="text-end">
          {formatCurrencyVND(milestone.serviceFee || 0)}
        </TableCell>
        <TableCell className="text-end font-semibold text-primary">
          {formatCurrencyVND(milestone.totalRedemption)}
        </TableCell>
      </TableRow>
    ) : (
      <TableRow key={index}>
        <TableCell>
          <Chip size="sm" variant="flat">
            {milestone.days} ngày
          </Chip>
        </TableCell>
        <TableCell>{formatDateShortVN(milestone.date)}</TableCell>
        <TableCell className="text-end">
          {formatCurrencyVND(milestone.interest || 0)}
        </TableCell>
        <TableCell className="text-end">
          {formatCurrencyVND(milestone.rentalFee || 0)}
        </TableCell>
        <TableCell className="text-end font-semibold text-primary">
          {formatCurrencyVND(milestone.totalRedemption)}
        </TableCell>
      </TableRow>
    );

  return (
    <Table
      aria-label="Bảng thanh toán"
      classNames={{
        wrapper: "shadow-none border border-default-200 rounded-lg",
        th: "bg-default-100",
      }}
    >
      {showDetailedBreakdown
        ? renderDetailedHeader()
        : showPrincipal
          ? (
              <TableHeader>
                <TableColumn>Mốc</TableColumn>
                <TableColumn>Ngày</TableColumn>
                <TableColumn align="end">Gốc</TableColumn>
                <TableColumn align="end">Lãi + Phí</TableColumn>
                <TableColumn align="end">Tổng chuộc</TableColumn>
              </TableHeader>
            )
          : (
              <TableHeader>
                <TableColumn>Mốc</TableColumn>
                <TableColumn>Ngày</TableColumn>
                <TableColumn align="end">Lãi + Phí</TableColumn>
                <TableColumn align="end">Tổng chuộc</TableColumn>
              </TableHeader>
            )}
      <TableBody>
        {[
          ...milestones.map((milestone, index) =>
            showDetailedBreakdown
              ? renderDetailedRow(milestone, index)
              : showPrincipal
                ? (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip size="sm" variant="flat">
                          {milestone.days} ngày
                        </Chip>
                      </TableCell>
                      <TableCell>{formatDateShortVN(milestone.date)}</TableCell>
                      <TableCell className="text-end font-semibold">
                        {formatCurrencyVND(milestone.principal || 0)}
                      </TableCell>
                      <TableCell className="text-end">
                        {formatCurrencyVND(milestone.interestAndFee)}
                      </TableCell>
                      <TableCell className="text-end font-semibold text-primary">
                        {formatCurrencyVND(milestone.totalRedemption)}
                      </TableCell>
                    </TableRow>
                  )
                : (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip size="sm" variant="flat">
                          {milestone.days} ngày
                        </Chip>
                      </TableCell>
                      <TableCell>{formatDateShortVN(milestone.date)}</TableCell>
                      <TableCell className="text-end">
                        {formatCurrencyVND(milestone.interestAndFee)}
                      </TableCell>
                      <TableCell className="text-end font-semibold text-primary">
                        {formatCurrencyVND(milestone.totalRedemption)}
                      </TableCell>
                    </TableRow>
                  ),
          ),
          ...(showTotal
            ? [
                <TableRow key="total">
                  <TableCell
                    className="text-end font-bold"
                    colSpan={
                      showDetailedBreakdown
                        ? detailedColSpan
                        : showPrincipal
                          ? 4
                          : 3
                    }
                  >
                    TỔNG CỘNG
                  </TableCell>
                  <TableCell className="text-end font-bold text-success text-lg">
                    {formatCurrencyVND(totalRedemption)}
                  </TableCell>
                </TableRow>,
              ]
            : []),
        ]}
      </TableBody>
    </Table>
  );
};

export default PaymentTable;
