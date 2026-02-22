import { Card, CardBody, CardHeader } from "@heroui/react";
import { Clock, Calendar } from "lucide-react";

import type { TLoanDetails } from "@/types/loan.types";
import PaymentTable from "@/components/loan-details/payment-table";
import SectionHeader from "@/components/section-header";

type TProps = {
  loanDetails: TLoanDetails;
};

const PaymentPeriods = ({ loanDetails }: TProps) => {
  // Nếu không có payment periods, không hiển thị
  if (!loanDetails.currentPeriod || !loanDetails.nextPeriod) {
    return null;
  }

  return (
    <div className="col-span-2 grid grid-cols-1 gap-4">
      <Card shadow="sm">
        <CardHeader className="pb-2">
          <SectionHeader icon={Clock} title={loanDetails.currentPeriod.title} />
        </CardHeader>
        <CardBody className="pt-0">
          {loanDetails.currentPeriod.subtitle && (
            <p className="text-sm text-default-500 mb-3">
              {loanDetails.currentPeriod.subtitle}
            </p>
          )}
          <PaymentTable milestones={loanDetails.currentPeriod.milestones} />
        </CardBody>
      </Card>

      <Card shadow="sm">
        <CardHeader className="pb-2">
          <SectionHeader icon={Calendar} title={loanDetails.nextPeriod.title} />
        </CardHeader>
        <CardBody className="pt-0">
          {loanDetails.nextPeriod.subtitle && (
            <p className="text-sm text-default-500 mb-3">
              {loanDetails.nextPeriod.subtitle}
            </p>
          )}
          <PaymentTable milestones={loanDetails.nextPeriod.milestones} />
        </CardBody>
      </Card>
    </div>
  );
};

export default PaymentPeriods;
