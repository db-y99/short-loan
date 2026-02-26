"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { Chip } from "@heroui/chip";
import { TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { formatCurrencyVND } from "@/lib/format";

type TPaymentPeriod = {
  milestone_day: number;
  fee_amount: number;
  status: string;
};

type TProps = {
  periods: TPaymentPeriod[];
  totalInterestPaid: number;
  cycleTitle?: string;
};

const PaymentProgressCard = ({ periods, totalInterestPaid, cycleTitle }: TProps) => {
  // Tính tổng lãi phải trả trong chu kỳ
  const totalInterestDue = periods.reduce((sum, p) => sum + Number(p.fee_amount), 0);
  
  // Tính số kỳ đã đóng và chưa đóng
  const paidPeriods = periods.filter(p => p.status === 'paid').length;
  const pendingPeriods = periods.filter(p => p.status === 'pending').length;
  const overduePeriods = periods.filter(p => p.status === 'overdue').length;
  
  // Tính phần trăm đã đóng
  const progressPercentage = totalInterestDue > 0 
    ? Math.round((totalInterestPaid / totalInterestDue) * 100) 
    : 0;
  
  // Số tiền còn phải đóng
  const remainingAmount = totalInterestDue - totalInterestPaid;

  return (
    <Card shadow="sm" className="col-span-2">
      <CardHeader className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Tiến độ đóng lãi</h3>
          {cycleTitle && (
            <span className="text-sm text-default-500">({cycleTitle})</span>
          )}
        </div>
      </CardHeader>
      <CardBody className="pt-0 space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-default-600">Đã đóng</span>
            <span className="font-semibold text-success">
              {formatCurrencyVND(totalInterestPaid)} / {formatCurrencyVND(totalInterestDue)}
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            color={progressPercentage === 100 ? "success" : "primary"}
            size="lg"
            showValueLabel
            classNames={{
              value: "text-xs font-semibold",
            }}
          />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Đã đóng */}
          <div className="p-3 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <p className="text-xs text-success-700 dark:text-success-400 font-medium">
                Đã đóng
              </p>
            </div>
            <p className="text-lg font-bold text-success">
              {formatCurrencyVND(totalInterestPaid)}
            </p>
            <p className="text-xs text-success-600 dark:text-success-500 mt-1">
              {paidPeriods} kỳ
            </p>
          </div>

          {/* Còn phải đóng */}
          <div className="p-3 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-warning" />
              <p className="text-xs text-warning-700 dark:text-warning-400 font-medium">
                Còn lại
              </p>
            </div>
            <p className="text-lg font-bold text-warning">
              {formatCurrencyVND(remainingAmount)}
            </p>
            <p className="text-xs text-warning-600 dark:text-warning-500 mt-1">
              {pendingPeriods + overduePeriods} kỳ
            </p>
          </div>

          {/* Tổng cộng */}
          <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-xs text-primary-700 dark:text-primary-400 font-medium">
                Tổng lãi
              </p>
            </div>
            <p className="text-lg font-bold text-primary">
              {formatCurrencyVND(totalInterestDue)}
            </p>
            <p className="text-xs text-primary-600 dark:text-primary-500 mt-1">
              {periods.length} kỳ
            </p>
          </div>
        </div>

        {/* Status chips */}
        {remainingAmount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-default-600">Trạng thái:</span>
            {pendingPeriods > 0 && (
              <Chip size="sm" color="warning" variant="flat">
                {pendingPeriods} kỳ chưa đóng
              </Chip>
            )}
            {overduePeriods > 0 && (
              <Chip size="sm" color="danger" variant="flat">
                {overduePeriods} kỳ quá hạn
              </Chip>
            )}
          </div>
        )}

        {remainingAmount === 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-success-50 dark:bg-success-900/20">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <p className="text-sm font-medium text-success">
              Đã hoàn thành đóng lãi cho chu kỳ này
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default PaymentProgressCard;
