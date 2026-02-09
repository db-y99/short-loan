import type { ElementType } from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Clock, Calendar } from "lucide-react";

import type { TContractDetails, TPaymentMilestone } from "@/types/contracts.types";
import { formatCurrencyVND, formatDateShortVN } from "@/lib/format";

const SectionHeader = ({
  icon: Icon,
  title,
}: {
  icon: ElementType;
  title: string;
}) => (
  <div className="flex items-center gap-2">
    <div className="p-2 rounded-lg bg-primary/10">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <h3 className="font-semibold">{title}</h3>
  </div>
);

const PaymentTable = ({
  milestones,
}: {
  milestones: TPaymentMilestone[];
}) => (
  <Table
    aria-label="Bảng thanh toán"
    classNames={{
      wrapper: "shadow-none border border-default-200 rounded-lg",
      th: "bg-default-100",
    }}
  >
    <TableHeader>
      <TableColumn>Mốc</TableColumn>
      <TableColumn>Ngày</TableColumn>
      <TableColumn align="end">Lãi + Phí</TableColumn>
      <TableColumn align="end">Tổng chuộc</TableColumn>
    </TableHeader>
    <TableBody>
      {milestones.map((milestone, index) => (
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
      ))}
    </TableBody>
  </Table>
);

type TProps = {
  contract: TContractDetails;
};

const PaymentPeriods = ({ contract }: TProps) => {
  return (
    <div className="col-span-2 grid grid-cols-1 gap-4">
      <Card shadow="sm">
        <CardHeader className="pb-2">
          <SectionHeader icon={Clock} title="Kỳ hiện tại" />
        </CardHeader>
        <CardBody className="pt-0">
          <PaymentTable milestones={contract.currentPeriod.milestones} />
        </CardBody>
      </Card>

      <Card shadow="sm">
        <CardHeader className="pb-2">
          <SectionHeader icon={Calendar} title="Kỳ kế tiếp" />
        </CardHeader>
        <CardBody className="pt-0">
          <PaymentTable milestones={contract.nextPeriod.milestones} />
        </CardBody>
      </Card>
    </div>
  );
};

export default PaymentPeriods;
