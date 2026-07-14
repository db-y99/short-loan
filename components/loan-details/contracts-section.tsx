"use client";

import type { TLoanFile, TLoanStatus } from "@/types/loan.types";
import type { TContractType } from "@/types/contract.types";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  FileText,
  Download,
  Eye,
  Loader2,
  Plus,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { addToast } from "@heroui/toast";

import {
  generateContractsAction,
  regenerateContractsAction,
} from "@/features/contracts/actions/generate-contracts.action";
import { repairSignedContractsAction } from "@/features/contracts/actions/repair-signed-contracts.action";
import ContractPreviewModal from "@/components/contracts/contract-preview-modal";
import ContractSelectionModal from "@/components/contracts/contract-selection-modal";
import ContractErrorDetails from "@/components/contracts/contract-error-details";
import {
  needsSignedContractRepair,
  sortContractsByType,
} from "@/lib/contract-utils";
import { LOAN_STATUS, LOAN_STATUS_LABEL } from "@/constants/loan";
import { isLoanApproverRole } from "@/constants/roles";
import { useAuth } from "@/lib/contexts/auth-context";

type TProps = {
  loanId: string;
  loanStatus: TLoanStatus;
  loanType: string;
  loanFiles?: TLoanFile[];
  hasSignatures?: boolean;
  onRefresh?: () => void;
};

const ContractsSection = ({
  loanId,
  loanStatus,
  loanType,
  loanFiles = [],
  hasSignatures = false,
  onRefresh,
}: TProps) => {
  const { profile } = useAuth();
  const canManageContractActions = isLoanApproverRole(profile?.role);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [selectionModalMode, setSelectionModalMode] = useState<
    "create" | "regenerate" | null
  >(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [selectedContract, setSelectedContract] = useState<TLoanFile | null>(
    null,
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Sắp xếp contracts theo thứ tự mong muốn
  const sortedContracts = sortContractsByType(loanFiles);
  const shouldRepairSignedContracts = needsSignedContractRepair({
    loanStatus,
    hasSignatures,
    loanType,
    loanFiles,
  });

  const handleRepairSignedContracts = async () => {
    setIsRepairing(true);
    setMessage(null);

    try {
      const result = await repairSignedContractsAction(loanId);

      if (result.success) {
        addToast({
          title: "Thành công",
          description: `Đã tạo lại ${result.data.length} hợp đồng PDF đã ký`,
          color: "success",
        });
        onRefresh?.();
        setMessage(null);
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Lỗi khi tạo lại hợp đồng PDF đã ký",
      });
      console.error(error);
    } finally {
      setIsRepairing(false);
    }
  };

  const handleGenerateContracts = async (selectedTypes: TContractType[]) => {
    setIsGenerating(true);
    setMessage(null);
    try {
      const result = await generateContractsAction(loanId, selectedTypes);

      if (result.success) {
        addToast({
          title: "Thành công",
          description: `Đã tạo ${result.data.length} hợp đồng thành công!`,
          color: "success",
        });

        if (onRefresh) {
          onRefresh();
        }

        setMessage(null);
        setSelectionModalMode(null);
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi khi tạo hợp đồng" });
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateContracts = async (selectedTypes: TContractType[]) => {
    setIsRegenerating(true);
    setMessage(null);

    try {
      const result = await regenerateContractsAction(loanId, selectedTypes);

      if (result.success) {
        addToast({
          title: "Thành công",
          description: `Đã tạo lại ${result.data.length} hợp đồng thành công!`,
          color: "success",
        });

        if (onRefresh) {
          onRefresh();
        }

        setMessage(null);
        setSelectionModalMode(null);
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi khi tạo lại hợp đồng" });
      console.error(error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSelectionConfirm = (selectedTypes: TContractType[]) => {
    if (selectionModalMode === "regenerate") {
      void handleRegenerateContracts(selectedTypes);
    } else {
      void handleGenerateContracts(selectedTypes);
    }
  };

  const handleDownloadAll = async () => {
    if (sortedContracts.length === 0) return;
    setIsDownloadingAll(true);
    try {
      await Promise.all(
        sortedContracts.map(async (contract) => {
          const response = await fetch(
            `/api/drive/download/${contract.fileId}`,
          );

          if (!response.ok) throw new Error(`Không thể tải: ${contract.name}`);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");

          link.href = url;
          link.download = `${contract.name}.pdf`;
          link.click();
          URL.revokeObjectURL(url);
        }),
      );
      addToast({
        title: "Thành công",
        description: "Đã tải xuống tất cả hợp đồng",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Lỗi khi tải xuống",
        color: "danger",
      });
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleViewContract = (contract: TLoanFile) => {
    const index = sortedContracts.findIndex((c) => c.id === contract.id);

    setSelectedContract(contract);
    setIsPreviewOpen(true);
    setSelectedIndex(index >= 0 ? index : 0);
  };

  const handleDownloadContract = async (contract: TLoanFile) => {
    try {
      // Fetch PDF từ Drive
      const response = await fetch(`/api/drive/download/${contract.fileId}`);

      if (!response.ok) {
        throw new Error("Không thể tải file");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${contract.name}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      addToast({
        title: "Thành công",
        description: `Đã tải xuống: ${contract.name}`,
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Lỗi khi tải xuống",
        color: "danger",
      });
    }
  };

  return (
    <>
      <Card className="col-span-2" shadow="sm">
        <CardHeader className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Hợp đồng</h3>
          </div>
          <div className="flex items-center gap-2">
            {canManageContractActions && shouldRepairSignedContracts ? (
              <Button
                color="warning"
                isDisabled={isRepairing}
                size="sm"
                startContent={
                  isRepairing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )
                }
                onPress={handleRepairSignedContracts}
              >
                {isRepairing ? "Đang tạo PDF..." : "Tạo lại PDF đã ký"}
              </Button>
            ) : null}
            {canManageContractActions && loanFiles.length > 0 && (
              <Button
                isDisabled={isDownloadingAll}
                size="sm"
                startContent={
                  isDownloadingAll ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )
                }
                variant="flat"
                onPress={handleDownloadAll}
              >
                {isDownloadingAll ? "Đang tải..." : "Tải tất cả"}
              </Button>
            )}
            {/* Chỉ hiển thị nút tạo/tạo lại hợp đồng khi loan đã được duyệt hoặc đã ký */}
            {canManageContractActions &&
              (loanStatus === LOAN_STATUS.APPROVED ||
                loanStatus === LOAN_STATUS.SIGNED) && (
                <>
                  {loanFiles.length === 0 ? (
                    <Button
                      color="primary"
                      isDisabled={isGenerating}
                      size="sm"
                      startContent={
                        isGenerating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )
                      }
                      onPress={() => setSelectionModalMode("create")}
                    >
                      {isGenerating ? "Đang tạo..." : "Tạo hợp đồng"}
                    </Button>
                  ) : (
                    canManageContractActions && (
                      <Button
                        color="warning"
                        isDisabled={isRegenerating}
                        size="sm"
                        startContent={
                          isRegenerating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )
                        }
                        variant="flat"
                        onPress={() => setSelectionModalMode("regenerate")}
                      >
                        {isRegenerating ? "Đang tạo lại..." : "Tạo lại"}
                      </Button>
                    )
                  )}
                </>
              )}
          </div>
        </CardHeader>
        <CardBody className="pt-0 space-y-3">
          {/* Loading state khi đang tạo hợp đồng */}
          {(isGenerating || isRegenerating || isRepairing) && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400 border border-warning-200 dark:border-warning-800">
              <Loader2 className="w-4 h-4 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {isRepairing
                    ? "Đang tạo lại hợp đồng PDF đã ký..."
                    : isRegenerating
                      ? "Đang tạo lại hợp đồng PDF..."
                      : "Đang tạo hợp đồng PDF..."}
                </p>
                <p className="text-xs mt-1">
                  Quá trình này có thể mất vài giây. Vui lòng đợi.
                </p>
              </div>
            </div>
          )}

          {shouldRepairSignedContracts && (
            <div className="p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg border border-danger-200 dark:border-danger-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                <div className="text-sm text-danger-700 dark:text-danger-400">
                  <p className="font-semibold">Thiếu hợp đồng PDF đã ký</p>
                  <p className="mt-1">
                    Khoản vay đã ký nhưng PDF chưa đủ. Nhấn &quot;Tạo lại PDF đã
                    ký&quot; để khôi phục.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cảnh báo khi loan đã ký nhưng muốn tạo lại hợp đồng */}
          {loanStatus === LOAN_STATUS.SIGNED && loanFiles.length > 0 && (
            <div className="p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-sm text-warning-700 dark:text-warning-400">
                  <p className="font-semibold">Hợp đồng đã được ký</p>
                  <p className="mt-1">
                    Bạn có thể tạo lại hợp đồng nếu khách hàng ký sai hoặc cần
                    chỉnh sửa.
                  </p>
                </div>
              </div>
            </div>
          )}

          {message && (
            <>
              {message.type === "success" ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400">
                  <CheckCircle className="w-4 h-4" />
                  <p className="text-sm">{message.text}</p>
                </div>
              ) : (
                <ContractErrorDetails error={message.text} />
              )}
            </>
          )}

          {loanStatus === LOAN_STATUS.APPROVED && loanFiles.length === 0 && (
            <div className="p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-sm text-warning-700 dark:text-warning-400">
                  <p className="font-semibold">Bước bắt buộc trước khi ký</p>
                  <p className="mt-1">
                    Nhấn &quot;Tạo hợp đồng&quot; để tạo PDF chưa ký. Chỉ sau đó
                    mới có thể ký hợp đồng.
                  </p>
                </div>
              </div>
            </div>
          )}

          {loanFiles.length === 0 ? (
            <div className="text-center py-8 text-default-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              {loanStatus === LOAN_STATUS.APPROVED ||
              loanStatus === LOAN_STATUS.SIGNED ? (
                <>
                  <p className="text-sm">Chưa có hợp đồng</p>
                  <p className="text-xs mt-1">
                    {loanStatus === LOAN_STATUS.APPROVED
                      ? "Tạo hợp đồng PDF trước, sau đó mới ký"
                      : "Có thể tạo lại hợp đồng nếu cần thiết"}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm">Chưa có hợp đồng</p>
                  <p className="text-xs mt-1">
                    Hợp đồng chỉ có thể tạo khi khoản vay đã được duyệt
                  </p>
                  <p className="text-xs text-warning-600 mt-1">
                    Trạng thái hiện tại:{" "}
                    <span className="font-medium">
                      {LOAN_STATUS_LABEL[loanStatus]}
                    </span>
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-default-100 hover:bg-default-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{contract.name}</p>
                      <p className="text-xs text-default-500">
                        {contract.provider === "google_drive"
                          ? "Google Drive"
                          : "Local"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      onPress={() => handleViewContract(contract)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      onPress={() => handleDownloadContract(contract)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Contract Preview Modal */}
      <ContractPreviewModal
        key={selectedContract?.id ?? "preview-closed"}
        contracts={sortedContracts}
        initialIndex={selectedIndex}
        isOpen={isPreviewOpen}
        loanId={loanId}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedContract(null);
        }}
      />

      {/* Contract Selection Modal */}
      <ContractSelectionModal
        isLoading={isGenerating || isRegenerating}
        isOpen={selectionModalMode !== null}
        mode={selectionModalMode ?? "create"}
        onClose={() => setSelectionModalMode(null)}
        onConfirm={handleSelectionConfirm}
      />
    </>
  );
};

export default ContractsSection;
