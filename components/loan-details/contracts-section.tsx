"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { FileText, Download, Eye, Loader2, Plus, CheckCircle, RefreshCw } from "lucide-react";
import { addToast } from "@heroui/toast";
import type { TLoanFile, TLoanStatus } from "@/types/loan.types";
import { generateContractsAction, regenerateContractsAction } from "@/features/contracts/actions/generate-contracts.action";
import ContractPreviewModal from "@/components/contracts/contract-preview-modal";
import RegenerateConfirmModal from "@/components/contracts/regenerate-confirm-modal";
import ContractErrorDetails from "@/components/contracts/contract-error-details";
import { sortContractsByType } from "@/lib/contract-utils";
import { LOAN_STATUS, LOAN_STATUS_LABEL } from "@/constants/loan";

type TProps = {
  loanId: string;
  loanStatus: TLoanStatus; // Thêm loan status
  loanFiles?: TLoanFile[]; // All loan files from DB
  onRefresh?: () => void; // Thêm callback để refresh data
};

const ContractsSection = ({ loanId, loanStatus, loanFiles = [], onRefresh }: TProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [selectedContract, setSelectedContract] = useState<TLoanFile | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Sắp xếp contracts theo thứ tự mong muốn
  const sortedContracts = sortContractsByType(loanFiles);

  const handleGenerateContracts = async () => {
    setIsGenerating(true);
    setMessage(null);
    try {
      const result = await generateContractsAction(loanId);

      if (result.success) {
        addToast({
          title: "Thành công",
          description: "Tạo hợp đồng thành công!",
          color: "success",
        });
        
        // Call refresh callback to update parent data
        if (onRefresh) {
          onRefresh();
        }
        
        setMessage(null);
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

  const handleRegenerateContracts = async () => {
    setIsRegenerating(true);
    setMessage(null);
    setIsConfirmOpen(false);
    
    try {
      const result = await regenerateContractsAction(loanId);

      if (result.success) {
        addToast({
          title: "Thành công",
          description: "Tạo lại hợp đồng thành công!",
          color: "success",
        });
        
        // Call refresh callback to update parent data
        if (onRefresh) {
          onRefresh();
        }
        
        setMessage(null);
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

  const handleDownloadAll = async () => {
    if (sortedContracts.length === 0) return;
    setIsDownloadingAll(true);
    try {
      await Promise.all(
        sortedContracts.map(async (contract) => {
          const response = await fetch(`/api/drive/download/${contract.fileId}`);
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
      addToast({ title: "Thành công", description: "Đã tải xuống tất cả hợp đồng", color: "success" });
    } catch (error) {
      addToast({ title: "Lỗi", description: error instanceof Error ? error.message : "Lỗi khi tải xuống", color: "danger" });
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
        description: error instanceof Error ? error.message : "Lỗi khi tải xuống",
        color: "danger",
      });
    }
  };

  return (
    <>
      <Card shadow="sm" className="col-span-2">
        <CardHeader className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Hợp đồng</h3>
          </div>
        <div className="flex items-center gap-2">
            {loanFiles.length > 0 && (
              <Button
                size="sm"
                variant="flat"
                startContent={
                  isDownloadingAll ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )
                }
                isDisabled={isDownloadingAll}
                onPress={handleDownloadAll}
              >
                {isDownloadingAll ? "Đang tải..." : "Tải tất cả"}
              </Button>
            )}
            {/* Chỉ hiển thị nút tạo/tạo lại hợp đồng khi loan đã được duyệt hoặc đã ký */}
            {(loanStatus === LOAN_STATUS.APPROVED || loanStatus === LOAN_STATUS.SIGNED) && (
              <>
                {loanFiles.length === 0 ? (
                  <Button
                    color="primary"
                    size="sm"
                    startContent={
                      isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )
                    }
                    isDisabled={isGenerating}
                    onPress={handleGenerateContracts}
                  >
                    {isGenerating ? "Đang tạo..." : "Tạo hợp đồng"}
                  </Button>
                ) : (
                  <Button
                    color="warning"
                    size="sm"
                    variant="flat"
                    startContent={
                      isRegenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )
                    }
                    isDisabled={isRegenerating}
                    onPress={() => setIsConfirmOpen(true)}
                  >
                    {isRegenerating ? "Đang tạo lại..." : "Tạo lại"}
                  </Button>
                )}
              </>
            )}
          </div>
        </CardHeader>
        <CardBody className="pt-0 space-y-3">
          {/* Loading state khi đang tạo hợp đồng */}
          {(isGenerating || isRegenerating) && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400 border border-warning-200 dark:border-warning-800">
              <Loader2 className="w-4 h-4 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {isRegenerating ? "Đang tạo lại hợp đồng PDF..." : "Đang tạo hợp đồng PDF..."}
                </p>
                <p className="text-xs mt-1">
                  Quá trình này có thể mất vài giây. Vui lòng đợi.
                </p>
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
                  <p className="mt-1">Bạn có thể tạo lại hợp đồng nếu khách hàng ký sai hoặc cần chỉnh sửa.</p>
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

          {loanFiles.length === 0 ? (
            <div className="text-center py-8 text-default-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              {loanStatus === "approved" || loanStatus === "signed" ? (
                <>
                  <p className="text-sm">Chưa có hợp đồng đã ký</p>
                  <p className="text-xs mt-1">
                    {loanStatus === "approved" 
                      ? "Hợp đồng sẽ được tạo tự động sau khi ký"
                      : "Có thể tạo lại hợp đồng nếu cần thiết"
                    }
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm">Chưa có hợp đồng</p>
                  <p className="text-xs mt-1">
                    Hợp đồng chỉ có thể tạo khi khoản vay đã được duyệt
                  </p>
                  <p className="text-xs text-warning-600 mt-1">
                    Trạng thái hiện tại: <span className="font-medium">{LOAN_STATUS_LABEL[loanStatus]}</span>
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
                      size="sm"
                      variant="flat"
                      isIconOnly
                      onPress={() => handleViewContract(contract)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      isIconOnly
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
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedContract(null);
        }}
        contracts={sortedContracts}
        initialIndex={selectedIndex}
        loanId={loanId}
      />

      {/* Regenerate Confirmation Modal */}
      <RegenerateConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleRegenerateContracts}
        isLoading={isRegenerating}
      />
    </>
  );
};

export default ContractsSection;
