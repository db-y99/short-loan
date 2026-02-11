import { Button, Chip } from "@heroui/react";
import { FileText } from "lucide-react";

import type { TLoanDetails, TLoanStatus } from "@/types/loan.types";
import { LOAN_STATUS_COLOR, LOAN_STATUS_LABEL } from "@/constants/loan";
import { formatCurrencyVND, formatDateTimeVN } from "@/lib/format";

type TProps = {
  loanDetails: TLoanDetails;
  onClose: () => void;
};

const ContractHeader = ({ loanDetails, onClose }: TProps) => {
  const statusColor =
    LOAN_STATUS_COLOR[loanDetails.status as TLoanStatus] || "default";
  const statusLabel =
    LOAN_STATUS_LABEL[loanDetails.status as TLoanStatus] || "Không xác định";

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-secondary">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold">{loanDetails.code}</h2>
            <Chip color={statusColor} size="sm" variant="flat">
              {statusLabel}
            </Chip>
          </div>
          <div className="flex items-center gap-4 text-sm text-default-500 mt-0.5">
            <span className="font-semibold text-primary">
              {loanDetails.customer.fullName}
            </span>
            <span>•</span>
            <span className="font-bold text-success">
              {formatCurrencyVND(loanDetails.loanAmount)}
            </span>
            <span>•</span>
            <span>{formatDateTimeVN(loanDetails.signedAt)}</span>
          </div>
        </div>
      </div>
      <Button
        isIconOnly
        radius="full"
        size="sm"
        variant="light"
        onPress={onClose}
      >
        <span className="text-xl">×</span>
      </Button>
    </div>
  );
};

export default ContractHeader;
