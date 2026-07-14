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
  showDetailedBreakdown = false, // Hiển thị chi tiết lãi, phí, phí dịch vụ
}: {
  milestones: TPaymentMilestone[];
  showTotal?: boolean;
  showPrincipal?: boolean;
  showDetailedBreakdown?: boolean;
}) => {
  // Tính tổng số tiền chuộc
  const totalRedemption = milestones.reduce(
    (sum, m) => sum + m.totalRedemption,
    0,
  );

  return (
    <Table
      aria-label="Bảng thanh toán"
      classNames={{
        wrapper: "shadow-none border border-default-200 rounded-lg",
        th: "bg-default-100",
      }}
    >
      {showDetailedBreakdown ? (
        // Hiển thị chi tiết cho Gói 3
        <TableHeader>
          <TableColumn>Mốc</TableColumn>
          <TableColumn>Ngày</TableColumn>
          <TableColumn align="end">Lãi</TableColumn>
          <TableColumn align="end">Phí thuê</TableColumn>
          <TableColumn align="end">Phí dịch vụ</TableColumn>
          <TableColumn align="end">Tổng chuộc</TableColumn>
        </TableHeader>
      ) : showPrincipal ? (
        <TableHeader>
          <TableColumn>Mốc</TableColumn>
          <TableColumn>Ngày</TableColumn>
          <TableColumn align="end">Gốc</TableColumn>
          <TableColumn align="end">Lãi + Phí</TableColumn>
          <TableColumn align="end">Tổng chuộc</TableColumn>
        </TableHeader>
      ) : (
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
            showDetailedBreakdown ? (
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
            ) : showPrincipal ? (
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
            ) : (
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
                    colSpan={showDetailedBreakdown ? 5 : showPrincipal ? 4 : 3}
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
