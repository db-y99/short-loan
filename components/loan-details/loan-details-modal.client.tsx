import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { AlertCircle, CreditCard, MessageSquare, ShoppingCart, CheckCircle, XCircle, DollarSign, Loader2, UserPlus } from "lucide-react";
import type { TLoanDetails } from "@/types/loan.types";
import { LOAN_STATUS } from "@/constants/loan";
import ContractHeader from "@/components/loan-details/loan-header";
import LoanAmountSummary from "@/components/loan-details/loan-amount-summary";
import { ChatInterface } from "@/components/chat/chat-interface";
import LoanInfoCards from "@/components/loan-details/loan-info-cards.client";
import LoanProfileSection from "@/components/loan-details/loan-profile-section";
import PaymentPeriods from "@/components/loan-details/payment-periods";
import ContractsSection from "@/components/loan-details/contracts-section";
import PayInterestModal from "@/components/loan-details/pay-interest-modal.client";
import PaymentHistoryModal from "@/components/loan-details/payment-history-modal";
import RedeemModal from "@/components/loan-details/redeem-modal.client";
import AddReferenceModal from "@/components/loan-details/add-reference-modal";

import { useAuth } from "@/lib/contexts/auth-context";

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
  const { user } = useAuth();
  const [isDisbursing, setIsDisbursing] = useState(false);
  const [isPayInterestOpen, setIsPayInterestOpen] = useState(false);
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [isAddReferenceOpen, setIsAddReferenceOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Thêm state để force refresh
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleDisburse = async () => {
    if (!loanDetails) return;

    const isApproving = loanDetails.status === LOAN_STATUS.PENDING;
    const isDisbursing = loanDetails.status === LOAN_STATUS.SIGNED;

    const confirmMessage = isApproving
      ? "Xác nhận duyệt khoản vay này?\n\nSau khi duyệt:\n- Chuyển sang trạng thái Đã duyệt (Chờ ký)\n- Có thể ký hợp đồng"
      : "Xác nhận giải ngân khoản vay này?\n\nSau khi giải ngân:\n- Chuyển sang trạng thái Đang cầm\n- Bắt đầu tính lãi từ thời điểm này\n- Có thể đóng lãi và chuộc đồ";

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDisbursing(true);
    setMessage(null);

    try {
      const endpoint = isApproving 
        ? `/api/loans/${loanDetails.id}/approve`
        : `/api/loans/${loanDetails.id}/disburse`;

      const response = await fetch(endpoint, {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: isApproving ? "Duyệt thành công!" : "Giải ngân thành công!",
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
      setMessage({ type: "error", text: isApproving ? "Lỗi khi duyệt" : "Lỗi khi giải ngân" });
      console.error(error);
    } finally {
      setIsDisbursing(false);
    }
  };

  if (!loanDetails && !isLoading && !error) return null;

  // Kiểm tra trạng thái
  const isPending = loanDetails?.status === LOAN_STATUS.PENDING;
  const isSigned = loanDetails?.status === LOAN_STATUS.SIGNED;
  const isDisbursed = loanDetails?.status === LOAN_STATUS.DISBURSED;

  const handlePayInterestSuccess = () => {
    setMessage({
      type: "success",
      text: "Đóng lãi thành công!",
    });
    
    // Tăng refreshKey để force refresh PaymentPeriods
    setRefreshKey(prev => prev + 1);
    
    if (onRefresh) {
      setTimeout(() => {
        onRefresh();
        setMessage(null);
      }, 1500);
    }
  };

  const handleAddReferenceSuccess = () => {
    setMessage({
      type: "success",
      text: "Thêm tham chiếu thành công!",
    });
    
    if (onRefresh) {
      setTimeout(() => {
        onRefresh();
        setMessage(null);
      }, 1500);
    }
  };

  const handleRedeemSuccess = () => {
    setMessage({
      type: "success",
      text: "Chuộc đồ thành công!",
    });
    
    if (onRefresh) {
      setTimeout(() => {
        onRefresh();
        setMessage(null);
        onClose(); // Close the main modal after redeem
      }, 2000);
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
                        onAddReference={() => setIsAddReferenceOpen(true)}
                      />
                    </div>
                    <LoanAmountSummary loanDetails={loanDetails} />
                    <PaymentPeriods loanDetails={loanDetails} refreshKey={refreshKey} />
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
                        color="default"
                        variant="flat"
                        className="w-full"
                        size="md"
                        startContent={<MessageSquare size={16} />}
                        onPress={() => setIsPaymentHistoryOpen(true)}
                      >
                        Xem lịch sử đóng lãi
                      </Button>
                      <Button
                        color="success"
                        variant="solid"
                        className="w-full"
                        size="lg"
                        startContent={<ShoppingCart size={16} />}
                        onPress={() => setIsRedeemOpen(true)}
                      >
                        Chuộc đồ
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Column - Chat Interface */}
            <div className="w-[500px] flex flex-col flex-2 h-full">
              {loanDetails && user && (
                <ChatInterface
                  loanId={loanDetails.id}
                  driveFolderId={loanDetails.driveFolderId || ""}
                  currentUserId={user.id}
                  currentUserName={user.user_metadata?.full_name || user.email || "User"}
                />
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex-shrink-0 border-t border-default-200 py-3">
          <Button variant="flat" onPress={onClose}>
            Đóng
          </Button>
          {isPending && (
            <Button
              color="primary"
              startContent={
                isDisbursing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )
              }
              isDisabled={isDisbursing}
              onPress={handleDisburse}
            >
              {isDisbursing ? "Đang xử lý..." : "Duyệt"}
            </Button>
          )}
          {isSigned && (
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
              {isDisbursing ? "Đang xử lý..." : "Giải ngân"}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>

      {/* Modals */}
      {loanDetails && (
        <>
          <PayInterestModal
            isOpen={isPayInterestOpen}
            onClose={() => setIsPayInterestOpen(false)}
            loanId={loanDetails.id}
            onSuccess={handlePayInterestSuccess}
          />

          <PaymentHistoryModal
            isOpen={isPaymentHistoryOpen}
            onClose={() => setIsPaymentHistoryOpen(false)}
            loanId={loanDetails.id}
          />

          <RedeemModal
            isOpen={isRedeemOpen}
            onClose={() => setIsRedeemOpen(false)}
            loanId={loanDetails.id}
            loanAmount={loanDetails.loanAmount}
            onSuccess={handleRedeemSuccess}
          />

          <AddReferenceModal
            isOpen={isAddReferenceOpen}
            onClose={() => setIsAddReferenceOpen(false)}
            loanId={loanDetails.id}
            onSuccess={handleAddReferenceSuccess}
          />
        </>
      )}
    </Modal>
  );
};

export default LoanDetailsModal;
