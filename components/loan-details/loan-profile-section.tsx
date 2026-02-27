"use client";

import { useState } from "react";
import { Chip, Link, Button } from "@heroui/react";
import { FileText, CheckCircle2, FileSignature, QrCode, PenTool } from "lucide-react";
import type { TLoanDetails } from "@/types/loan.types";
import { LOAN_STATUS } from "@/constants/loan";
import { formatDateTimeVN } from "@/lib/format";
import ContractSigningModal from "@/components/contracts/contract-signing-modal";

type TProps = {
  loanDetails: TLoanDetails;
};

const LoanProfileSection = ({ loanDetails }: TProps) => {
  const [showQR, setShowQR] = useState(false);
  const [showSigningModal, setShowSigningModal] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const isSigned = loanDetails.isSigned ?? (
    loanDetails.status === LOAN_STATUS.SIGNED || 
    loanDetails.status === LOAN_STATUS.DISBURSED || 
    loanDetails.status === LOAN_STATUS.REDEEMED
  );
  const isApproved = loanDetails.status === LOAN_STATUS.APPROVED;
  const isSignedStatus = loanDetails.status === LOAN_STATUS.SIGNED;

  const handleDirectSign = () => {
    setShowSigningModal(true);
  };

  const handleSign = async () => {
    // This function is called by the modal after successful signing
    // Just close modal and reload
    alert("Ký hợp đồng thành công!");
    setShowSigningModal(false);
    window.location.reload(); // Refresh để cập nhật UI
  };

  const handleShowQR = () => {
    setShowQR(!showQR);
  };

  return (
    <>
    <div className="mb-4 p-4 bg-default-50 rounded-xl border border-default-200">
      {/* Title */}
      <h3 className="text-base font-bold text-primary uppercase mb-3">
        HỒ SƠ HỢP ĐỒNG:
      </h3>

      {/* Status Badge - Hiển thị khi đã ký */}
      {isSigned && (
        <div className="mb-4 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success-600 dark:text-success-400" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-success-700 dark:text-success-400">
                Hợp đồng đã được ký kết vào lúc {formatDateTimeVN(loanDetails.signedAt)}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Signing Buttons - Show when approved but not signed yet */}
      {isApproved && !isSigned && (
        <div className="mb-4 flex gap-2">
          <Button
            color="primary"
            variant="solid"
            startContent={<PenTool className="w-4 h-4" />}
            onPress={handleDirectSign}
            isDisabled={isSigning}
            className="flex-1"
          >
            {isSigning ? "Đang ký..." : "Ký trực tiếp"}
          </Button>
          <Button
            color="secondary"
            variant="bordered"
            startContent={<QrCode className="w-4 h-4" />}
            onPress={handleShowQR}
            isDisabled={isSigning}
            className="flex-1"
          >
            QR khách ký
          </Button>
        </div>
      )}

      {/* QR Code Display */}
      {showQR && isApproved && !isSigned && (
        <div className="mb-4 p-4 bg-white dark:bg-default-100 rounded-lg border-2 border-secondary text-center">
          <p className="text-sm text-default-600 mb-3">Quét mã QR để khách hàng ký hợp đồng:</p>
          <div className="flex justify-center items-center h-48 bg-default-100 dark:bg-default-200 rounded-lg">
            <QrCode className="w-24 h-24 text-default-400" />
            {/* TODO: Replace with actual QR code */}
          </div>
          <p className="text-xs text-default-500 mt-3">
            Link: {window.location.origin}/loans/{loanDetails.id}/sign
          </p>
        </div>
      )}

      {/* File Gốc (Soạn thảo) */}
      {loanDetails.originalFiles && loanDetails.originalFiles.length > 0 && (
        <div>
          <p className="text-sm font-medium text-default-700 dark:text-default-300 italic mb-2">
            File Gốc (Soạn thảo):
          </p>
          <div className="flex flex-wrap gap-2">
            {loanDetails.originalFiles.map((file) => (
              <Link
                key={file.id}
                isExternal
                href={`/api/drive/image/${file.fileId}`}
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

      {/* Tạo/Xem hợp đồng cầm cố PDF */}
      <div className="mt-3">
        <Link
          href={`/loans/${loanDetails.id}/contract`}
          className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/30 rounded-lg hover:bg-primary/20 transition-colors text-sm text-primary font-medium"
        >
          <FileSignature className="w-4 h-4" />
          Tạo hợp đồng PDF
        </Link>
      </div>

      {/* Fallback: Single originalFileUrl */}
      {(!loanDetails.originalFiles || loanDetails.originalFiles.length === 0) &&
        loanDetails.originalFileUrl && (
          <div>
            <p className="text-sm font-medium text-default-700 dark:text-default-300 italic mb-2">
              File Gốc (Soạn thảo):
            </p>
            <Link
              isExternal
              href={loanDetails.originalFileUrl}
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

    {/* Contract Signing Modal */}
    <ContractSigningModal
      isOpen={showSigningModal}
      onClose={() => setShowSigningModal(false)}
      loanId={loanDetails.id}
      onSign={handleSign}
    />
  </>
  );
};

export default LoanProfileSection;
