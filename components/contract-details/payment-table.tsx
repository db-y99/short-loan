import type { TPaymentMilestone } from "@/types/contracts.types";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { formatDateShortVN } from "@/lib/format";
import { formatCurrencyVND } from "@/lib/format";

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


export default PaymentTable