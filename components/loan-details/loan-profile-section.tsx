"use client";

import type { TLoanDetails } from "@/types/loan.types";

import { useState } from "react";
import { Link, Button } from "@heroui/react";
import { addToast } from "@heroui/toast";
import {
  FileText,
  CheckCircle2,
  QrCode,
  PenTool,
  X,
  AlertCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { LOAN_STATUS } from "@/constants/loan";
import { formatDateTimeVN } from "@/lib/format";
import ContractSigningModal from "@/components/contracts/contract-signing-modal";
import { sortContractsByType } from "@/lib/contract-utils";

type TProps = {
  loanDetails: TLoanDetails;
  onRefresh?: () => void; // Thêm callback để refresh data
};

const LoanProfileSection = ({ loanDetails, onRefresh }: TProps) => {
  const [showQR, setShowQR] = useState(false);
  const [showSigningModal, setShowSigningModal] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const isSigned =
    loanDetails.isSigned ??
    (loanDetails.status === LOAN_STATUS.SIGNED ||
      loanDetails.status === LOAN_STATUS.DISBURSED ||
      loanDetails.status === LOAN_STATUS.REDEEMED);
  const isApproved = loanDetails.status === LOAN_STATUS.APPROVED;
  const isSignedStatus = loanDetails.status === LOAN_STATUS.SIGNED;

  const hasUnsignedContracts = (loanDetails.originalFiles?.length ?? 0) > 0;
  const canStartSigning = isApproved && !isSigned && hasUnsignedContracts;

  // Sắp xếp originalFiles theo thứ tự mong muốn
  const sortedOriginalFiles = loanDetails.originalFiles
    ? sortContractsByType(loanDetails.originalFiles)
    : [];

  const handleDirectSign = () => {
    setShowSigningModal(true);
  };

  const handleSign = async () => {
    // This function is called by the modal after successful signing AND PDF generation
    setShowSigningModal(false);

    addToast({
      title: "Hoàn tất!",
      description: "Hợp đồng đã được ký và PDF đã được tạo",
      color: "success",
    });

    // Call refresh callback instead of reloading page
    if (onRefresh) {
      onRefresh();
    }
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
                  Hợp đồng đã được ký kết vào lúc{" "}
                  {formatDateTimeVN(loanDetails.signedAt)}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Signing Buttons - Show when approved but not signed yet */}
        {isApproved && !isSigned && (
          <>
            {!hasUnsignedContracts && (
              <div className="mb-4 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-warning-700 dark:text-warning-400">
                    <p className="font-semibold">Chưa thể ký hợp đồng</p>
                    <p className="mt-1">
                      Vui lòng tạo hợp đồng PDF ở mục &quot;Hợp đồng&quot; bên
                      dưới trước khi ký.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="mb-4 flex gap-2">
              <Button
                className="flex-1"
                color="primary"
                isDisabled={isSigning || !canStartSigning}
                startContent={<PenTool className="w-4 h-4" />}
                variant="solid"
                onPress={handleDirectSign}
              >
                {isSigning ? "Đang ký..." : "Ký trực tiếp"}
              </Button>
              <Button
                className="flex-1"
                color="secondary"
                isDisabled={isSigning || !canStartSigning}
                startContent={<QrCode className="w-4 h-4" />}
                variant="bordered"
                onPress={handleShowQR}
              >
                QR khách ký
              </Button>
            </div>
          </>
        )}

        {/* QR Code Display */}
        {showQR && canStartSigning && (
          <div className="mb-4 p-4 bg-white dark:bg-default-100 rounded-lg border-2 border-secondary text-center">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-default-700">
                Quét mã QR để khách hàng ký hợp đồng
              </p>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => setShowQR(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <QRCodeSVG
                includeMargin
                level="M"
                size={200}
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/loans/${loanDetails.id}/sign`}
              />
            </div>
            <p className="text-xs text-default-400 mt-3 break-all">
              {typeof window !== "undefined" ? window.location.origin : ""}
              /loans/{loanDetails.id}/sign
            </p>
          </div>
        )}

        {/* File Gốc (Soạn thảo) */}
        {sortedOriginalFiles.length > 0 && (
          <div>
            <p className="text-sm font-medium text-default-700 dark:text-default-300 italic mb-2">
              File Gốc (Soạn thảo):
            </p>
            <div className="flex flex-wrap gap-2">
              {sortedOriginalFiles.map((file) => (
                <Link
                  key={file.id}
                  isExternal
                  className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-default-100 border border-default-200 rounded-lg hover:border-primary transition-colors text-sm"
                  href={`/api/drive/image/${file.fileId}`}
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

        {/* Tạo/Xem hợp đồng cầm cố PDF
      <div className="mt-3">
        <Link
          href={`/loans/${loanDetails.id}/contract`}
          className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/30 rounded-lg hover:bg-primary/20 transition-colors text-sm text-primary font-medium"
        >
          <FileSignature className="w-4 h-4" />
          Tạo hợp đồng PDF
        </Link>
      </div> */}

        {/* Fallback: Single originalFileUrl */}
        {sortedOriginalFiles.length === 0 && loanDetails.originalFileUrl && (
          <div>
            <p className="text-sm font-medium text-default-700 dark:text-default-300 italic mb-2">
              File Gốc (Soạn thảo):
            </p>
            <Link
              isExternal
              className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-default-100 border border-default-200 rounded-lg hover:border-primary transition-colors text-sm"
              href={loanDetails.originalFileUrl}
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
      {showSigningModal && (
        <ContractSigningModal
          isOpen={showSigningModal}
          loanId={loanDetails.id}
          onClose={() => setShowSigningModal(false)}
          onSign={handleSign}
        />
      )}
    </>
  );
};

export default LoanProfileSection;
