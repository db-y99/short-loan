import { Button, Chip } from "@heroui/react";
import { FileText } from "lucide-react";

import type {
  TContractDetails,
  TContractStatus,
} from "@/types/contracts.types";
import {
  CONTRACT_STATUS_COLOR,
  CONTRACT_STATUS_LABEL,
} from "@/constants/contracts";
import { formatCurrencyVND, formatDateTimeVN } from "@/lib/format";

type TProps = {
  contract: TContractDetails;
  onClose: () => void;
};

const ContractHeader = ({ contract, onClose }: TProps) => {
  const statusColor =
    CONTRACT_STATUS_COLOR[contract.status as TContractStatus] || "default";
  const statusLabel =
    CONTRACT_STATUS_LABEL[contract.status as TContractStatus] ||
    "Không xác định";

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-secondary">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold">{contract.code}</h2>
            <Chip color={statusColor} size="sm" variant="flat">
              {statusLabel}
            </Chip>
          </div>
          <div className="flex items-center gap-4 text-sm text-default-500 mt-0.5">
            <span className="font-semibold text-primary">
              {contract.customer.fullName}
            </span>
            <span>•</span>
            <span className="font-bold text-success">
              {formatCurrencyVND(contract.loanAmount)}
            </span>
            <span>•</span>
            <span>{formatDateTimeVN(contract.signedAt)}</span>
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
