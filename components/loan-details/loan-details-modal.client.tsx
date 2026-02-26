"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { AlertCircle, CreditCard, MessageCircle, MessageSquare, ShoppingCart, CheckCircle, XCircle, DollarSign, Loader2 } from "lucide-react";
import type { TLoanDetails } from "@/types/loan.types";
import ContractHeader from "@/components/loan-details/loan-header";
import LoanAmountSummary from "@/components/loan-details/loan-amount-summary";
import ActivityLogSection from "@/components/loan-details/activity-log-section.client";
import LoanInfoCards from "@/components/loan-details/loan-info-cards.client";
import LoanProfileSection from "@/components/loan-details/loan-profile-section";
import PaymentPeriods from "@/components/loan-details/payment-periods";
import ContractsSection from "@/components/loan-details/contracts-section";
import PayInterestModal from "@/components/loan-details/pay-interest-modal.client";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanDetails: TLoanDetails | null;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
};

const LoanDetailsModal = ({
  isOpen,
  onClose,
  loanDetails,
  isLoading = false,
  error = null,
  onRefresh,
}: TProps) => {
  const [isDisbursing, setIsDisbursing] = useState(false);
  const [isPayInterestOpen, setIsPayInterestOpen] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleDisburse = async () => {
    if (!loanDetails) return;

    if (!confirm("Xác nhận duyệt và giải ngân khoản vay này?\n\nSau khi duyệt:\n- Chuyển sang trạng thái Đang cầm\n- Bắt đầu tính lãi từ thời điểm này\n- Có thể đóng lãi và chuộc đồ")) {
      return;
    }

    setIsDisbursing(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/loans/${loanDetails.id}/disburse`, {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: "Duyệt và giải ngân thành công!",
        });
        
        // Refresh data
        if (onRefresh) {
          setTimeout(() => {
            onRefresh();
            setMessage(null);
          }, 1500);
        }
      } else {
        setMessage({ type: "error", text: result.error || "Có lỗi xảy ra" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi khi giải ngân" });
      console.error(error);
    } finally {
      setIsDisbursing(false);
    }
  };

  if (!loanDetails && !isLoading && !error) return null;

  // Kiểm tra trạng thái
  const isPending = loanDetails?.status === "pending";
  const isDisbursed = loanDetails?.status === "disbursed";

  const handlePayInterestSuccess = () => {
    setMessage({
      type: "success",
      text: "Đóng lãi thành công!",
    });
    
    if (onRefresh) {
      setTimeout(() => {
        onRefresh();
        setMessage(null);
      }, 1500);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="5xl"
      hideCloseButton
      className="max-w-[1400px]"
      onClose={onClose}
    >
      <ModalContent className="h-full">
        <ModalHeader className="flex-shrink-0 py-3 px-6 border-b border-default-200">
          {loanDetails ? (
            <ContractHeader loanDetails={loanDetails} onClose={onClose} />
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-lg font-semibold">
                {isLoading ? "Đang tải..." : error ?? "Chi tiết khoản vay"}
              </span>
              <Button variant="flat" size="sm" onPress={onClose}>
                Đóng
              </Button>
            </div>
          )}
        </ModalHeader>

        <ModalBody className="flex-1 p-0 overflow-hidden">
          <div className="flex h-full">
            {/* Left Column - Contract Details */}
            <div className="flex-3 overflow-y-auto p-6 border-r border-default-200">
              {isLoading && (
                <div className="flex items-center justify-center py-16 h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
                </div>
              )}
              {error && !isLoading && (
                <div className="rounded-lg bg-danger-50 px-4 py-6 text-danger text-center">
                  {error}
                </div>
              )}
              {loanDetails && !isLoading && (
                <>
                  <LoanProfileSection loanDetails={loanDetails} />

                  {message && (
                    <div
                      className={`flex items-center gap-2 p-3 mb-4 rounded-xl ${
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

                  {loanDetails.notes && (
                    <div className="flex items-start gap-3 p-3 mb-4 rounded-xl bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
                      <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-warning-700 dark:text-warning-400">
                        {loanDetails.notes}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <LoanInfoCards
                        loanDetails={loanDetails}
                        showAssetGallery
                      />
                    </div>
                    <LoanAmountSummary loanDetails={loanDetails} />
                    <PaymentPeriods loanDetails={loanDetails} />
                    <ContractsSection
                      loanId={loanDetails.id}
                      contracts={loanDetails.originalFiles}
                    />
                  </div>

                  {loanDetails.statusMessage && (
                    <div className="mt-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <p className="text-sm">{loanDetails.statusMessage}</p>
                      </div>
                    </div>
                  )}

                  {isDisbursed && (
                    <div className="flex items-center flex-col gap-2 mt-4">
                      <Button
                        color="primary"
                        variant="bordered"
                        className="w-full"
                        size="lg"
                        startContent={<CreditCard size={16} />}
                        onPress={() => setIsPayInterestOpen(true)}
                      >
                        Đóng lãi
                      </Button>
                      <Button
                        color="primary"
                        variant="solid"
                        className="w-full"
                        size="lg"
                        startContent={<ShoppingCart size={16} />}
                        onPress={() => {}}
                      >
                        Chuộc đồ
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Column - Activity Log */}
            <div className="w-[400px] flex flex-col flex-2 h-full bg-default-50 dark:bg-default-100/5">
              <div className="flex-shrink-0 p-4 border-b border-default-200">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Trao đổi & Nhật ký</h3>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <ActivityLogSection 
                  entries={loanDetails?.activityLog ?? []} 
                  loanId={loanDetails?.id ?? ""}
                  currentUserId="current-user-id"
                  currentUserName="Nhân viên"
                />
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex-shrink-0 border-t border-default-200 py-3">
          <Button variant="flat" onPress={onClose}>
            Đóng
          </Button>
          {isPending && (
            <Button
              color="success"
              startContent={
                isDisbursing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <DollarSign className="w-4 h-4" />
                )
              }
              isDisabled={isDisbursing}
              onPress={handleDisburse}
            >
              {isDisbursing ? "Đang xử lý..." : "Duyệt & Giải ngân"}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>

      {/* Pay Interest Modal */}
      {loanDetails && (
        <PayInterestModal
          isOpen={isPayInterestOpen}
          onClose={() => setIsPayInterestOpen(false)}
          loanId={loanDetails.id}
          onSuccess={handlePayInterestSuccess}
        />
      )}
    </Modal>
  );
};

export default LoanDetailsModal;
