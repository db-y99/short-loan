"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Loader2, Download, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { TLoanFile } from "@/types/loan.types";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  contracts: TLoanFile[];
  initialIndex?: number;
  loanId: string;
};

const ContractPreviewModal = ({
  isOpen,
  onClose,
  contracts,
  initialIndex = 0,
  loanId: _loanId,
}: TProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingWord, setIsDownloadingWord] = useState(false);
  const pdfUrlRef = useRef<string | null>(null);

  const contract = contracts[currentIndex] ?? null;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < contracts.length - 1;

  const revokePdfUrl = () => {
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
      pdfUrlRef.current = null;
    }
    setPdfUrl(null);
  };

  // Đồng bộ index trước khi paint để tránh tải PDF theo index cũ
  useLayoutEffect(() => {
    if (isOpen) {
      const safeIndex = Math.min(
        Math.max(initialIndex, 0),
        Math.max(contracts.length - 1, 0),
      );
      setCurrentIndex(safeIndex);
    }
  }, [isOpen, initialIndex, contracts.length]);

  // Reset khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      revokePdfUrl();
      setError(null);
      setIsLoading(true);
    }
  }, [isOpen]);

  // Tải PDF theo fileId — hủy request cũ khi đổi hợp đồng
  useEffect(() => {
    if (!isOpen || !contract?.fileId) {
      return;
    }

    const fileId = contract.fileId;
    const abortController = new AbortController();

    revokePdfUrl();
    setIsLoading(true);
    setError(null);

    const loadContractPDF = async () => {
      try {
        const response = await fetch(`/api/drive/download/${fileId}`, {
          signal: abortController.signal,
        });
        if (!response.ok) throw new Error("Không thể tải file PDF");

        const blob = await response.blob();
        if (abortController.signal.aborted) return;

        const objectUrl = URL.createObjectURL(blob);
        pdfUrlRef.current = objectUrl;
        setPdfUrl(objectUrl);
      } catch (err) {
        if (abortController.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Lỗi khi tải hợp đồng");
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadContractPDF();

    return () => {
      abortController.abort();
    };
  }, [isOpen, contract?.fileId]);

  const handlePrev = () => {
    if (hasPrev) setCurrentIndex((i) => i - 1);
  };

  const handleNext = () => {
    if (hasNext) setCurrentIndex((i) => i + 1);
  };

  const handleDownload = async () => {
    if (!contract || !pdfUrl) return;
    setIsDownloading(true);
    try {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `${contract.name}.pdf`;
      link.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải xuống");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadWord = async () => {
    if (!contract) return;
    setIsDownloadingWord(true);
    try {
      const url = `/api/drive/download-word/${contract.fileId}`;
      const response = await fetch(url);
      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || "Không thể tải file Word");
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${contract.name}.docx`;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải xuống Word");
    } finally {
      setIsDownloadingWord(false);
    }
  };

  if (!contract) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      classNames={{ base: "max-w-[1200px] h-[90vh]" }}
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between border-b border-default-200">
          <div className="flex items-center gap-2 min-w-0">
            {contracts.length > 1 && (
              <span className="text-sm text-default-400 shrink-0">
                {currentIndex + 1} / {contracts.length}
              </span>
            )}
            <h3 className="text-lg font-semibold truncate">{contract.name}</h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {contracts.length > 1 && (
              <>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={handlePrev}
                  isDisabled={!hasPrev || isLoading}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={handleNext}
                  isDisabled={!hasNext || isLoading}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button isIconOnly variant="light" size="sm" onPress={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </ModalHeader>

        <ModalBody className="p-0">
          {isLoading && (
            <div className="flex items-center justify-center py-16 h-full">
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
              key={contract.fileId}
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
            variant="flat"
            startContent={
              isDownloadingWord ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )
            }
            onPress={handleDownloadWord}
            isDisabled={isDownloadingWord}
          >
            {isDownloadingWord ? "Đang tải..." : "Tải xuống Word"}
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
