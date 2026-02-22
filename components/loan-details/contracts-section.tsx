"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { FileText, Download, Eye, Loader2, Plus, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import type { TLoanFile } from "@/types/loan.types";
import { generateContractsAction, regenerateContractsAction } from "@/features/contracts/actions/generate-contracts.action";
import ContractPreviewModal from "@/components/contracts/contract-preview-modal";

type TProps = {
  loanId: string;
  contracts?: TLoanFile[];
};

const ContractsSection = ({ loanId, contracts = [] }: TProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [localContracts, setLocalContracts] = useState<TLoanFile[]>(contracts);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [selectedContract, setSelectedContract] = useState<TLoanFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleGenerateContracts = async () => {
    setIsGenerating(true);
    setMessage(null);
    try {
      const result = await generateContractsAction(loanId);

      if (result.success) {
        setMessage({ type: "success", text: "Tạo hợp đồng thành công!" });
        // Update local state
        setLocalContracts(
          result.data.map((c) => ({
            id: c.id,
            name: c.name,
            fileId: c.fileId,
            provider: c.provider,
            type: c.type,
          })),
        );
        
        // Auto hide message after 3s
        setTimeout(() => setMessage(null), 3000);
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
    if (!confirm("Bạn có chắc muốn tạo lại tất cả hợp đồng? Hợp đồng cũ sẽ bị xóa.")) {
      return;
    }

    setIsRegenerating(true);
    setMessage(null);
    try {
      const result = await regenerateContractsAction(loanId);

      if (result.success) {
        setMessage({ type: "success", text: "Tạo lại hợp đồng thành công!" });
        // Update local state
        setLocalContracts(
          result.data.map((c) => ({
            id: c.id,
            name: c.name,
            fileId: c.fileId,
            provider: c.provider,
            type: c.type,
          })),
        );
        
        // Auto hide message after 3s
        setTimeout(() => setMessage(null), 3000);
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

  const handleViewContract = (contract: TLoanFile) => {
    setSelectedContract(contract);
    setIsPreviewOpen(true);
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

      setMessage({ type: "success", text: `Đã tải xuống: ${contract.name}` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Lỗi khi tải xuống",
      });
      setTimeout(() => setMessage(null), 3000);
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
            {localContracts.length === 0 ? (
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
                onPress={handleRegenerateContracts}
              >
                {isRegenerating ? "Đang tạo lại..." : "Tạo lại"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody className="pt-0 space-y-3">
          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400"
                  : "bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          {localContracts.length === 0 ? (
            <div className="text-center py-8 text-default-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chưa có hợp đồng</p>
              <p className="text-xs mt-1">
                Nhấn "Tạo hợp đồng" để tạo bộ hợp đồng
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {localContracts.map((contract) => (
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
        contract={selectedContract}
        loanId={loanId}
      />
    </>
  );
};

export default ContractsSection;
