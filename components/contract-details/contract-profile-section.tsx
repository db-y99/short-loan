"use client";

import { Chip, Link } from "@heroui/react";
import { FileText, CheckCircle2 } from "lucide-react";

import type { TContractDetails } from "@/types/contracts.types";

type TProps = {
  contract: TContractDetails;
};

const ContractProfileSection = ({ contract }: TProps) => {
  const isSigned = contract.isSigned ?? contract.status === "disbursed" || contract.status === "completed";

  return (
    <div className="mb-4 p-4 bg-default-50 rounded-xl border border-default-200">
      {/* Title */}
      <h3 className="text-base font-bold text-primary uppercase mb-3">
        HỒ SƠ HỢP ĐỒNG:
      </h3>

      {/* Status Badge */}
      {isSigned && (
        <div className="mb-4">
          <Chip
            color="success"
            variant="flat"
            startContent={<CheckCircle2 className="w-4 h-4" />}
            classNames={{
              base: "bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800",
              content: "text-success-700 dark:text-success-400 font-medium",
            }}
          >
            Hợp đồng đã được ký kết.
          </Chip>
        </div>
      )}

      {/* File Gốc (Soạn thảo) */}
      {contract.originalFiles && contract.originalFiles.length > 0 && (
        <div>
          <p className="text-sm font-medium text-default-700 dark:text-default-300 italic mb-2">
            File Gốc (Soạn thảo):
          </p>
          <div className="flex flex-wrap gap-2">
            {contract.originalFiles.map((file) => (
              <Link
                key={file.id}
                isExternal
                href={file.url}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-default-100 border border-default-200 rounded-lg hover:border-primary transition-colors text-sm"
              >
                <FileText className="w-4 h-4 text-default-500" />
                <span className="text-default-700 dark:text-default-300">
                  {file.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Fallback: Single originalFileUrl */}
      {(!contract.originalFiles || contract.originalFiles.length === 0) &&
        contract.originalFileUrl && (
          <div>
            <p className="text-sm font-medium text-default-700 dark:text-default-300 italic mb-2">
              File Gốc (Soạn thảo):
            </p>
            <Link
              isExternal
              href={contract.originalFileUrl}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-default-100 border border-default-200 rounded-lg hover:border-primary transition-colors text-sm"
            >
              <FileText className="w-4 h-4 text-default-500" />
              <span className="text-default-700 dark:text-default-300">
                File Gốc
              </span>
            </Link>
          </div>
        )}
    </div>
  );
};

export default ContractProfileSection;
