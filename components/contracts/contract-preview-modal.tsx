"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Loader2, Download, X } from "lucide-react";
import type { TLoanFile } from "@/types/loan.types";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  contract: TLoanFile | null;
  loanId: string;
};

const ContractPreviewModal = ({
  isOpen,
  onClose,
  contract,
  loanId,
}: TProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen && contract) {
      loadContractPDF();
    }

    return () => {
      // Cleanup PDF URL
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, contract]);

  const loadContractPDF = async () => {
    if (!contract) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch PDF từ Drive qua API
      const response = await fetch(
        `/api/drive/download/${contract.fileId}`,
      );

      if (!response.ok) {
        throw new Error("Không thể tải file PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lỗi khi tải hợp đồng",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!contract || !pdfUrl) return;

    setIsDownloading(true);
    try {
      // Download file
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `${contract.name}.pdf`;
      link.click();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lỗi khi tải xuống",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (!contract) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-w-[1200px] h-[90vh]",
      }}
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between border-b border-default-200">
          <h3 className="text-lg font-semibold">{contract.name}</h3>
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </ModalHeader>

        <ModalBody className="p-0">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && !isLoading && (
            <div className="rounded-lg bg-danger-50 px-4 py-6 text-danger text-center m-6">
              {error}
            </div>
          )}

          {pdfUrl && !isLoading && (
            <iframe
              src={pdfUrl}
              className="w-full h-full min-h-[600px]"
              title={contract.name}
            />
          )}
        </ModalBody>

        <ModalFooter className="border-t border-default-200">
          <Button variant="flat" onPress={onClose}>
            Đóng
          </Button>
          <Button
            color="primary"
            startContent={
              isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )
            }
            onPress={handleDownload}
            isDisabled={!pdfUrl || isDownloading}
          >
            {isDownloading ? "Đang tải..." : "Tải xuống PDF"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ContractPreviewModal;
