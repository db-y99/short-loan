import type { TLoanDetails, TReuseLoanOptions } from "@/types/loan.types";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import {
  AlertCircle,
  MessageSquare,
  ShoppingCart,
  CheckCircle,
  DollarSign,
  Loader2,
  UserCog,
  RotateCcw,
  Copy,
  XCircle,
} from "lucide-react";
import { addToast } from "@heroui/toast";

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
import UpdateAssetConditionModal from "@/components/loan-details/update-asset-condition-modal";
import EditCustomerModal from "@/components/loan-details/edit-customer-modal";
import EditBankModal from "@/components/loan-details/edit-bank-modal";
import EditLoanAmountModal from "@/components/loan-details/edit-loan-amount-modal";
import EditReferenceModal from "@/components/loan-details/edit-reference-modal";
import EditAssetModal from "@/components/loan-details/edit-asset-modal";
import SimplePaymentModal from "@/components/loan-details/simple-payment-modal";
import ConfirmModal from "@/components/confirm-modal";
import RejectLoanModal from "@/components/loan-details/reject-loan-modal.client";
import ReuseLoanConfirmModal from "@/components/reuse-loan-confirm-modal.client";
import {
  ROLES,
  isLoanApproverRole,
  isPaymentOperatorRole,
} from "@/constants/roles";
import { useAuth } from "@/lib/contexts/auth-context";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanDetails: TLoanDetails | null;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onReuseLoan?: (loanDetails: TLoanDetails, options: TReuseLoanOptions) => void;
};

const LoanDetailsModal = ({
  isOpen,
  onClose,
  loanDetails,
  isLoading = false,
  error = null,
  onRefresh,
  onReuseLoan,
}: TProps) => {
  const { user, profile } = useAuth();
  const [isDisbursing, setIsDisbursing] = useState(false);
  const [isPayInterestOpen, setIsPayInterestOpen] = useState(false);
  const [isSimplePaymentOpen, setIsSimplePaymentOpen] = useState(false);
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [isAddReferenceOpen, setIsAddReferenceOpen] = useState(false);
  const [isEditReferenceOpen, setIsEditReferenceOpen] = useState(false);
  const [isUpdateConditionOpen, setIsUpdateConditionOpen] = useState(false);
  const [isEditAssetOpen, setIsEditAssetOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [isEditBankOpen, setIsEditBankOpen] = useState(false);
  const [isEditLoanAmountOpen, setIsEditLoanAmountOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmColor?: "primary" | "success" | "warning" | "danger";
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Thêm state để force refresh
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(
    null,
  );
  const [isReuseConfirmOpen, setIsReuseConfirmOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const handleDisburse = async () => {
    if (!loanDetails) return;

    const isApproving = loanDetails.status === LOAN_STATUS.PENDING;
    const isDisbursing = loanDetails.status === LOAN_STATUS.SIGNED;

    const title = isApproving ? "Xác nhận duyệt" : "Xác nhận giải ngân";
    const message = isApproving
      ? "Xác nhận duyệt khoản vay này?\n\nSau khi duyệt:\n- Chuyển sang trạng thái Đã duyệt (Chờ ký)\n- Có thể ký hợp đồng"
      : "Xác nhận giải ngân khoản vay này?\n\nSau khi giải ngân:\n- Chuyển sang trạng thái Đang cầm\n- Bắt đầu tính lãi từ thời điểm này\n- Có thể đóng tiền và chuộc đồ";

    setConfirmConfig({
      title,
      message,
      confirmColor: isApproving ? "primary" : "success",
      onConfirm: async () => {
        setIsDisbursing(true);

        try {
          const endpoint = isApproving
            ? `/api/loans/${loanDetails.id}/approve`
            : `/api/loans/${loanDetails.id}/disburse`;

          const response = await fetch(endpoint, {
            method: "POST",
          });

          const result = await response.json();

          if (result.success) {
            addToast({
              title: "Thành công",
              description: isApproving
                ? "Duyệt thành công!"
                : "Giải ngân thành công!",
              color: "success",
            });

            // Refresh data immediately
            if (onRefresh) {
              onRefresh();
            }
          } else {
            addToast({
              title: "Lỗi",
              description: result.error || "Có lỗi xảy ra",
              color: "danger",
            });
          }
        } catch (error) {
          addToast({
            title: "Lỗi",
            description: isApproving ? "Lỗi khi duyệt" : "Lỗi khi giải ngân",
            color: "danger",
          });
          console.error(error);
        } finally {
          setIsDisbursing(false);
        }
      },
    });
    setIsConfirmOpen(true);
  };

  if (!loanDetails && !isLoading && !error) return null;

  // Kiểm tra trạng thái
  const isAdmin = profile?.role === ROLES.ADMIN;
  const isLoanApprover = isLoanApproverRole(profile?.role);
  const canOperatePayments = isPaymentOperatorRole(profile?.role);
  const isPending = loanDetails?.status === LOAN_STATUS.PENDING;
  const isApproved = loanDetails?.status === LOAN_STATUS.APPROVED;
  const isSigned = loanDetails?.status === LOAN_STATUS.SIGNED;
  const isDisbursed = loanDetails?.status === LOAN_STATUS.DISBURSED;
  const isRedeemed = loanDetails?.status === LOAN_STATUS.REDEEMED;
  const isRejected = loanDetails?.status === LOAN_STATUS.REJECTED;
  const canReuseLoan = Boolean(
    onReuseLoan && loanDetails && (isRedeemed || isRejected),
  );
  const canEditLoanDetails = isAdmin && isPending;
  const canEditLoanAmount = isLoanApprover && isPending;
  const contractFiles =
    loanDetails?.status === LOAN_STATUS.SIGNED
      ? loanDetails.signedFiles?.length
        ? loanDetails.signedFiles
        : (loanDetails.originalFiles ?? [])
      : (loanDetails?.originalFiles ?? loanDetails?.signedFiles ?? []);
  const hasContractSignatures =
    loanDetails?.status === LOAN_STATUS.SIGNED ||
    Boolean(loanDetails?.isSigned);

  const handlePayInterestSuccess = () => {
    // Tăng refreshKey để force refresh PaymentPeriods
    setRefreshKey((prev) => prev + 1);

    if (onRefresh) {
      onRefresh();
    }
  };

  const handleSimplePaymentSuccess = () => {
    // Tăng refreshKey để force refresh PaymentPeriods
    setRefreshKey((prev) => prev + 1);

    if (onRefresh) {
      onRefresh();
    }
  };

  const handleAddReferenceSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleEditReferenceSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleRedeemSuccess = () => {
    if (onRefresh) {
      onRefresh();
      onClose(); // Close the main modal after redeem
    }
  };

  const handleUpdateConditionSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleEditCustomerSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleEditBankSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleEditLoanAmountSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleEditAssetSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleRejectSuccess = () => {
    addToast({
      title: "Thành công",
      description: "Đã từ chối khoản vay",
      color: "success",
    });

    if (onRefresh) {
      onRefresh();
    }
  };

  const handleRevertToPending = () => {
    if (!loanDetails) return;

    setConfirmConfig({
      title: "Trả về chờ duyệt",
      message:
        "Trả khoản vay này về trạng thái Chờ duyệt để chỉnh sửa?\n\nLưu ý:\n- Các hợp đồng đã tạo sẽ bị xóa để tránh dữ liệu sai lệch\n- Cần duyệt lại sau khi chỉnh sửa xong",
      confirmColor: "warning",
      onConfirm: async () => {
        setIsDisbursing(true);
        try {
          const response = await fetch(
            `/api/loans/${loanDetails.id}/revert-to-pending`,
            { method: "POST" },
          );
          const result = await response.json();

          if (!result.success) {
            addToast({
              title: "Lỗi",
              description: result.error || "Không thể trả về chờ duyệt",
              color: "danger",
            });
            if (onRefresh) {
              onRefresh();
            }

            return;
          }

          addToast({
            title: "Thành công",
            description: "Đã trả về trạng thái chờ duyệt",
            color: "success",
          });

          if (onRefresh) {
            onRefresh();
          }
        } catch (error) {
          console.error("[REVERT_TO_PENDING_ERROR]", error);
          addToast({
            title: "Lỗi",
            description: "Có lỗi xảy ra khi trả về chờ duyệt",
            color: "danger",
          });
          if (onRefresh) {
            onRefresh();
          }
        } finally {
          setIsDisbursing(false);
        }
      },
    });
    setIsConfirmOpen(true);
  };

  const handleReuseConfirm = (keepAssetImages: boolean) => {
    if (!loanDetails || !onReuseLoan) return;
    setIsReuseConfirmOpen(false);
    onReuseLoan(loanDetails, { keepAssetImages });
  };

  const handleOpenEditReference = (referenceId: string) => {
    setSelectedReferenceId(referenceId);
    setIsEditReferenceOpen(true);
  };

  const handleCloseEditReference = () => {
    setIsEditReferenceOpen(false);
    setSelectedReferenceId(null);
  };

  const handleDeleteReference = async (referenceId: string) => {
    if (!loanDetails) return;

    setConfirmConfig({
      title: "Xóa tham chiếu",
      message: "Bạn có chắc muốn xóa người tham chiếu này?",
      confirmColor: "danger",
      onConfirm: async () => {
        setIsDisbursing(true);
        try {
          const response = await fetch(
            `/api/loans/${loanDetails.id}/references/${referenceId}`,
            { method: "DELETE" },
          );
          const result = await response.json();

          if (!result.success) {
            addToast({
              title: "Lỗi",
              description: result.error || "Không thể xóa tham chiếu",
              color: "danger",
            });

            return;
          }

          addToast({
            title: "Thành công",
            description: "Đã xóa tham chiếu",
            color: "success",
          });

          if (onRefresh) {
            onRefresh();
          }
        } catch (error) {
          console.error("[DELETE_REFERENCE_ERROR]", error);
          addToast({
            title: "Lỗi",
            description: "Có lỗi xảy ra khi xóa tham chiếu",
            color: "danger",
          });
        } finally {
          setIsDisbursing(false);
        }
      },
    });
    setIsConfirmOpen(true);
  };

  return (
    <Modal
      hideCloseButton
      isKeyboardDismissDisabled
      className="max-w-[1400px]"
      isDismissable={false}
      isOpen={isOpen}
      scrollBehavior="inside"
      size="5xl"
      onClose={onClose}
    >
      <ModalContent className="h-full">
        <ModalHeader className="flex-shrink-0 py-3 px-6 border-b border-default-200">
          {loanDetails ? (
            <ContractHeader loanDetails={loanDetails} onClose={onClose} />
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-lg font-semibold">
                {isLoading ? "Đang tải..." : (error ?? "Chi tiết khoản vay")}
              </span>
              <Button size="sm" variant="flat" onPress={onClose}>
                Đóng
              </Button>
            </div>
          )}
        </ModalHeader>

        <ModalBody className="flex-1 p-0 overflow-hidden">
          <div className="flex h-full min-h-0 min-w-0">
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
                  <LoanProfileSection
                    loanDetails={loanDetails}
                    onRefresh={onRefresh}
                  />

                  {/* Edit Customer Button */}
                  <div className="mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {canEditLoanDetails && (
                        <Button
                          color="default"
                          size="sm"
                          startContent={<UserCog className="w-4 h-4" />}
                          variant="bordered"
                          onPress={() => setIsEditCustomerOpen(true)}
                        >
                          Sửa thông tin khách hàng
                        </Button>
                      )}
                      {canEditLoanAmount && (
                        <Button
                          color="primary"
                          size="sm"
                          startContent={<DollarSign className="w-4 h-4" />}
                          variant="bordered"
                          onPress={() => setIsEditLoanAmountOpen(true)}
                        >
                          Sửa số tiền vay
                        </Button>
                      )}
                    </div>
                  </div>

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
                        showAssetGallery
                        canManageImages={canEditLoanDetails}
                        loanDetails={loanDetails}
                        onAddReference={
                          canEditLoanDetails
                            ? () => setIsAddReferenceOpen(true)
                            : undefined
                        }
                        onDeleteReference={
                          canEditLoanDetails ? handleDeleteReference : undefined
                        }
                        onEditAsset={
                          canEditLoanDetails
                            ? () => setIsEditAssetOpen(true)
                            : undefined
                        }
                        onEditBank={
                          canEditLoanDetails
                            ? () => setIsEditBankOpen(true)
                            : undefined
                        }
                        onEditReference={
                          canEditLoanDetails
                            ? handleOpenEditReference
                            : undefined
                        }
                        onRefresh={onRefresh}
                        onUpdateAssetCondition={
                          canEditLoanDetails
                            ? () => setIsUpdateConditionOpen(true)
                            : undefined
                        }
                      />
                    </div>
                    <LoanAmountSummary loanDetails={loanDetails} />
                    <PaymentPeriods
                      loanDetails={loanDetails}
                      refreshKey={refreshKey}
                      onOpenPaymentHistory={() => setIsPaymentHistoryOpen(true)}
                    />
                    <ContractsSection
                      hasSignatures={hasContractSignatures}
                      loanFiles={contractFiles}
                      loanId={loanDetails.id}
                      loanStatus={loanDetails.status}
                      loanType={loanDetails.loanType}
                      onRefresh={onRefresh}
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

                  {isDisbursed && canOperatePayments && (
                    <div className="flex items-center flex-col gap-2 mt-4">
                      {/* Button Đóng tiền đơn giản - linh hoạt cho kế toán */}
                      <Button
                        className="w-full"
                        color="primary"
                        size="lg"
                        startContent={<DollarSign size={16} />}
                        variant="solid"
                        onPress={() => setIsSimplePaymentOpen(true)}
                      >
                        Đóng tiền
                      </Button>

                      {/* Button Đóng tiền theo gói - ẩn để đơn giản hóa */}
                      {/* <Button
                        color="primary"
                        variant="bordered"
                        className="w-full"
                        size="sm"
                        startContent={<CreditCard size={14} />}
                        onPress={() => setIsPayInterestOpen(true)}
                      >
                        Đóng tiền theo gói
                      </Button> */}

                      <Button
                        className="w-full"
                        color="success"
                        size="lg"
                        startContent={<ShoppingCart size={16} />}
                        variant="solid"
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
            <div className="flex h-full min-h-0 min-w-0 w-[500px] flex-2 flex-col overflow-hidden">
              {loanDetails && user && (
                <ChatInterface
                  currentUserId={user.id}
                  currentUserName={
                    user.user_metadata?.full_name || user.email || "User"
                  }
                  driveFolderId={loanDetails.driveFolderId || ""}
                  loanId={loanDetails.id}
                />
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex-shrink-0 border-t border-default-200 py-3">
          <Button variant="flat" onPress={onClose}>
            Đóng
          </Button>
          {canReuseLoan && (
            <Button
              color="primary"
              startContent={<Copy className="w-4 h-4" />}
              variant="flat"
              onPress={() => setIsReuseConfirmOpen(true)}
            >
              Vay lại
            </Button>
          )}
          {isPending && isLoanApprover && (
            <>
              <Button
                color="danger"
                isDisabled={isDisbursing}
                startContent={<XCircle className="w-4 h-4" />}
                variant="flat"
                onPress={() => setIsRejectOpen(true)}
              >
                Từ chối
              </Button>
              <Button
                color="primary"
                isDisabled={isDisbursing}
                startContent={
                  isDisbursing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )
                }
                onPress={handleDisburse}
              >
                {isDisbursing ? "Đang xử lý..." : "Duyệt"}
              </Button>
            </>
          )}
          {isApproved && isLoanApprover && (
            <Button
              color="warning"
              isDisabled={isDisbursing}
              startContent={
                isDisbursing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )
              }
              variant="flat"
              onPress={handleRevertToPending}
            >
              {isDisbursing ? "Đang xử lý..." : "Trả về chờ duyệt"}
            </Button>
          )}
          {isSigned && isLoanApprover && (
            <Button
              color="success"
              isDisabled={isDisbursing}
              startContent={
                isDisbursing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <DollarSign className="w-4 h-4" />
                )
              }
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
            loanId={loanDetails.id}
            loanType={loanDetails.loanType}
            onClose={() => setIsPayInterestOpen(false)}
            onSuccess={handlePayInterestSuccess}
          />

          <SimplePaymentModal
            customerName={loanDetails.customer.fullName}
            isOpen={isSimplePaymentOpen}
            loanId={loanDetails.id}
            onClose={() => setIsSimplePaymentOpen(false)}
            onSuccess={handleSimplePaymentSuccess}
          />

          <PaymentHistoryModal
            isOpen={isPaymentHistoryOpen}
            loanId={loanDetails.id}
            onClose={() => setIsPaymentHistoryOpen(false)}
          />

          <RedeemModal
            isOpen={isRedeemOpen}
            loanAmount={loanDetails.loanAmount}
            loanId={loanDetails.id}
            loanType={loanDetails.loanType}
            onClose={() => setIsRedeemOpen(false)}
            onSuccess={handleRedeemSuccess}
          />

          <AddReferenceModal
            isOpen={isAddReferenceOpen}
            loanId={loanDetails.id}
            onClose={() => setIsAddReferenceOpen(false)}
            onSuccess={handleAddReferenceSuccess}
          />

          {selectedReferenceId && (
            <EditReferenceModal
              fullName={
                loanDetails.references.find(
                  (ref) => ref.id === selectedReferenceId,
                )?.full_name ?? ""
              }
              isOpen={isEditReferenceOpen}
              loanId={loanDetails.id}
              phone={
                loanDetails.references.find(
                  (ref) => ref.id === selectedReferenceId,
                )?.phone ?? ""
              }
              referenceId={selectedReferenceId}
              relationship={
                loanDetails.references.find(
                  (ref) => ref.id === selectedReferenceId,
                )?.relationship ?? ""
              }
              onClose={handleCloseEditReference}
              onSuccess={handleEditReferenceSuccess}
            />
          )}

          <UpdateAssetConditionModal
            currentCondition={loanDetails.assetCondition}
            isOpen={isUpdateConditionOpen}
            loanId={loanDetails.id}
            onClose={() => setIsUpdateConditionOpen(false)}
            onSuccess={handleUpdateConditionSuccess}
          />

          <EditAssetModal
            assetData={{
              typeKey: loanDetails.assetTypeKey ?? "",
              name: loanDetails.asset.name,
              imei: loanDetails.asset.imei,
              serial: loanDetails.asset.serial,
              chassisNumber: loanDetails.asset.chassisNumber,
              engineNumber: loanDetails.asset.engineNumber,
            }}
            isOpen={isEditAssetOpen}
            loanId={loanDetails.id}
            onClose={() => setIsEditAssetOpen(false)}
            onSuccess={handleEditAssetSuccess}
          />

          <EditCustomerModal
            customerData={{
              fullName: loanDetails.customer.fullName,
              cccd: loanDetails.customer.cccd,
              phone: loanDetails.customer.phone,
              address: loanDetails.customer.address,
              cccdIssueDate: loanDetails.customer.cccdIssueDate,
              cccdIssuePlace: loanDetails.customer.cccdIssuePlace,
              facebookUrl: loanDetails.customer.facebookUrl,
              job: loanDetails.customer.job,
              income: loanDetails.customer.income,
            }}
            customerId={loanDetails.customer.id}
            isOpen={isEditCustomerOpen}
            onClose={() => setIsEditCustomerOpen(false)}
            onSuccess={handleEditCustomerSuccess}
          />

          <EditBankModal
            bankData={{
              name: loanDetails.bank.name,
              accountNumber: loanDetails.bank.accountNumber,
              accountHolder: loanDetails.bank.accountHolder,
            }}
            isOpen={isEditBankOpen}
            loanId={loanDetails.id}
            onClose={() => setIsEditBankOpen(false)}
            onSuccess={handleEditBankSuccess}
          />

          <EditLoanAmountModal
            isOpen={isEditLoanAmountOpen}
            loanAmount={loanDetails.loanAmount}
            loanId={loanDetails.id}
            onClose={() => setIsEditLoanAmountOpen(false)}
            onSuccess={handleEditLoanAmountSuccess}
          />
        </>
      )}

      {/* Confirm Modal */}
      {confirmConfig && (
        <ConfirmModal
          confirmColor={confirmConfig.confirmColor}
          isLoading={isDisbursing}
          isOpen={isConfirmOpen}
          message={confirmConfig.message}
          title={confirmConfig.title}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={confirmConfig.onConfirm}
        />
      )}

      {loanDetails && (
        <RejectLoanModal
          isOpen={isRejectOpen}
          loanId={loanDetails.id}
          onClose={() => setIsRejectOpen(false)}
          onSuccess={handleRejectSuccess}
        />
      )}

      {loanDetails && (
        <ReuseLoanConfirmModal
          assetImageCount={loanDetails.asset.images.length}
          isOpen={isReuseConfirmOpen}
          loanCode={loanDetails.code}
          onClose={() => setIsReuseConfirmOpen(false)}
          onConfirm={handleReuseConfirm}
        />
      )}
    </Modal>
  );
};

export default LoanDetailsModal;
