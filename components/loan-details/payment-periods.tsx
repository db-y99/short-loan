import { Card, CardBody, CardHeader } from "@heroui/react";
import { Clock, Calendar } from "lucide-react";

import type { TLoanDetails } from "@/types/loan.types";
import PaymentTable from "@/components/loan-details/payment-table";
import SectionHeader from "@/components/section-header";


type TProps = {
  contract: TLoanDetails;
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
