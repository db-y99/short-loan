"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { History, DollarSign, Calendar, FileText } from "lucide-react";
import { formatCurrencyVND, formatDateTimeVN } from "@/lib/format";

type TPaymentTransaction = {
  id: string;
  amount: number;
  transaction_type: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
};

type TProps = {
  payments: TPaymentTransaction[];
  totalInterestPaid?: number;
};

const PaymentHistorySection = ({ payments, totalInterestPaid }: TProps) => {
  if (payments.length === 0) {
    return null;
  }

  return (
    <Card shadow="sm" className="col-span-2">
      <CardHeader className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Lịch sử đóng lãi</h3>
          <span className="text-sm text-default-500">({payments.length})</span>
        </div>
        {totalInterestPaid !== undefined && totalInterestPaid > 0 && (
          <Chip color="success" variant="flat" size="sm">
            Tổng: {formatCurrencyVND(totalInterestPaid)}
          </Chip>
        )}
      </CardHeader>
      <CardBody className="pt-0 space-y-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="p-3 rounded-lg bg-default-100 hover:bg-default-200 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-success" />
                  <p className="font-semibold text-success">
                    {formatCurrencyVND(payment.amount)}
                  </p>
                  <Chip size="sm" variant="flat" color="primary">
                    {payment.payment_method === "cash" ? "Tiền mặt" : payment.payment_method}
                  </Chip>
                </div>

                <div className="flex items-center gap-2 text-sm text-default-600">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDateTimeVN(payment.created_at)}</span>
                </div>

                {payment.notes && (
                  <div className="flex items-start gap-2 text-sm text-default-600">
                    <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{payment.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
};

export default PaymentHistorySection;
