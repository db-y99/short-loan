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
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import {
  Loader2,
  DollarSign,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { addToast } from "@heroui/toast";

import { formatCurrencyVND } from "@/lib/format";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  loanType?: string; // Thêm loan_type để hiển thị thông tin
  onSuccess?: () => void;
};

const PayInterestModal = ({
  isOpen,
  onClose,
  loanId,
  loanType,
  onSuccess,
}: TProps) => {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [totalInterestDue, setTotalInterestDue] = useState(0);
  const [totalInterestPaid, setTotalInterestPaid] = useState(0);
  const [currentMilestone, setCurrentMilestone] = useState<number | null>(null);
  const [hasExistingPayment, setHasExistingPayment] = useState(false); // Kiểm tra đã đóng tiền chưa
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info" | "warning";
    text: string;
  } | null>(null);

  // Xác định loại gói
  const isInstallmentType =
    loanType === "installment_3_periods" ||
    loanType?.includes("trả góp") ||
    loanType?.includes("Gói 1");

  const isBulletPaymentType =
    loanType === "bullet_payment_by_milestone" ||
    loanType === "bullet_payment_with_collateral_hold" ||
    loanType?.includes("Gói 2") ||
    loanType?.includes("Gói 3");

  // Reset form và fetch data khi mở modal
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setNotes("");
      setMessage(null);
      fetchPaymentProgress();
    }
  }, [isOpen, loanId]);

  const fetchPaymentProgress = async () => {
    setIsLoadingProgress(true);
    try {
      const response = await fetch(`/api/loans/${loanId}/payment-progress`);

      if (!response.ok) {
        console.error("Failed to fetch payment progress:", response.status);

        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        let paid = Number(result.data.cycle?.totalInterestPaid || 0); // Đổi const thành let
        const periods = result.data.periods || [];

        // Sắp xếp periods theo milestone_day
        const sortedPeriods = [...periods].sort(
          (a: any, b: any) => a.milestone_day - b.milestone_day,
        );

        let currentPeriod = null;
        let currentMilestoneFee = 0;
        let milestone = null;

        if (isInstallmentType) {
          // Gói 1: Mỗi kỳ độc lập, không cộng dồn
          // Tìm kỳ đầu tiên CHƯA hoàn thành (status != 'paid')
          currentPeriod = sortedPeriods.find((p: any) => p.status !== "paid");

          // Nếu không tìm thấy (đã hoàn thành hết), lấy kỳ cuối
          if (!currentPeriod) {
            currentPeriod = sortedPeriods[sortedPeriods.length - 1];
          }

          if (currentPeriod) {
            const feeAmount = Number(currentPeriod.fee_amount || 0);
            const principalAmount = Number(currentPeriod.principal || 0);

            currentMilestoneFee = principalAmount + feeAmount;
            milestone = currentPeriod.milestone_day;

            // Sử dụng paid_amount của kỳ này (không phải tổng tích lũy)
            paid = Number(currentPeriod.paid_amount || 0);
          }
        } else {
          // Gói 2, 3: Luôn đóng lãi + phí của mốc 30 ngày
          const milestone30 =
            sortedPeriods.find((p: any) => p.milestone_day === 30) ||
            sortedPeriods[sortedPeriods.length - 1];

          if (milestone30) {
            const feeAmount = Number(milestone30.fee_amount || 0);

            currentMilestoneFee = feeAmount;
            milestone = 30; // Luôn hiển thị mốc 30 ngày

            // Sử dụng paid_amount của mốc 30 ngày
            paid = Number(milestone30.paid_amount || 0);
          }
        }

        setTotalInterestPaid(paid);
        setTotalInterestDue(currentMilestoneFee);
        setCurrentMilestone(milestone);

        // Gói 2, 3: Kiểm tra xem đã đóng đủ mốc 30 ngày chưa
        if (isBulletPaymentType && sortedPeriods.length > 0) {
          const milestone30 =
            sortedPeriods.find((p: any) => p.milestone_day === 30) ||
            sortedPeriods[sortedPeriods.length - 1];

          if (milestone30) {
            const milestoneFee = Number(milestone30.fee_amount || 0);
            const paidAmount = Number(milestone30.paid_amount || 0);
            const hasCompleted = paidAmount >= milestoneFee && milestoneFee > 0;

            setHasExistingPayment(hasCompleted);
          }
        } else {
          setHasExistingPayment(false);
        }

        // Auto-fill remaining interest
        const remaining = Math.max(0, currentMilestoneFee - paid);

        if (remaining > 0 && !hasExistingPayment) {
          setAmount(remaining.toLocaleString("vi-VN"));
        }
      }
    } catch (error) {
      console.error("Failed to fetch payment progress:", error);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const formatNumber = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^\d]/g, "");

    if (!numericValue) return "";

    // Format with thousand separators
    return Number(numericValue).toLocaleString("vi-VN");
  };

  const handleAmountChange = (value: string) => {
    const formatted = formatNumber(value);

    setAmount(formatted);
  };

  const parseAmount = (formattedAmount: string): number => {
    return Number(formattedAmount.replace(/\./g, ""));
  };

  const handleSubmit = async () => {
    const numericAmount = parseAmount(amount);
    const remainingInterest = totalInterestDue - totalInterestPaid;

    if (!amount || numericAmount <= 0) {
      setMessage({ type: "error", text: "Vui lòng nhập số tiền hợp lệ" });

      return;
    }

    // Kiểm tra không vượt quá số tiền còn thiếu
    if (numericAmount > remainingInterest) {
      setMessage({
        type: "error",
        text: `Số tiền không được vượt quá ${formatCurrencyVND(remainingInterest)}`,
      });

      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/loans/${loanId}/pay-interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericAmount,
          notes: notes.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        addToast({
          title: "Thành công",
          description: `Đã đóng tiền ${formatCurrencyVND(numericAmount)} thành công!`,
          color: "success",
        });

        // Close modal and refresh immediately
        setAmount("");
        setNotes("");
        setMessage(null);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setMessage({ type: "error", text: result.error || "Có lỗi xảy ra" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Lỗi kết nối server" });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAmount("");
      setNotes("");
      setMessage(null);
      onClose();
    }
  };

  const numericAmount = parseAmount(amount);
  const remainingInterest = totalInterestDue - totalInterestPaid;

  return (
    <Modal isOpen={isOpen} size="lg" onClose={handleClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span>Đóng tiền</span>
          </div>
        </ModalHeader>
        <ModalBody>
          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400"
                  : message.type === "error"
                    ? "bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400"
                    : message.type === "warning"
                      ? "bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400"
                      : "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-4 h-4" />
              ) : message.type === "error" ? (
                <XCircle className="w-4 h-4" />
              ) : message.type === "warning" ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <Info className="w-4 h-4" />
              )}
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          {/* Payment Progress Summary */}
          {isLoadingProgress ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Thông báo về loại gói */}
              {isInstallmentType && (
                <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-primary-700 dark:text-primary-400">
                      <p className="font-semibold">
                        Gói 1: Đóng tiền tổng chuộc theo mốc
                      </p>
                      <p className="mt-1">
                        Đóng tiền bao gồm Gốc + Lãi + Phí. Có thể đóng nhiều lần
                        cho đến khi đủ mốc hiện tại.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isBulletPaymentType && (
                <div className="p-3 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-warning-700 dark:text-warning-400">
                      <p className="font-semibold">
                        Gói 2/3: Đóng tiền theo mốc 30 ngày
                      </p>
                      <p className="mt-1">
                        Luôn đóng lãi + phí của mốc 30 ngày (bất kể đang ở mốc
                        nào). Có thể đóng nhiều lần cho đến khi đủ. Đóng xong
                        mốc 30 ngày rồi thì XONG, không cho đóng thêm nữa.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cảnh báo nếu Gói 2/3 đã đóng xong mốc 30 ngày */}
              {isBulletPaymentType && hasExistingPayment && (
                <div className="p-3 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-danger-700 dark:text-danger-400">
                      <p className="font-semibold">
                        Đã đóng xong mốc 30 ngày rồi
                      </p>
                      <p className="mt-1">
                        Gói 2/3 đã đóng xong mốc 30 ngày. Không cho đóng thêm
                        nữa.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Card shadow="sm">
                <CardBody className="space-y-2">
                  {currentMilestone && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-default-600">Mốc hiện tại:</span>
                      <span className="font-semibold text-primary">
                        {currentMilestone} ngày
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-default-600">Tổng lãi phải trả:</span>
                    <span className="font-semibold">
                      {formatCurrencyVND(totalInterestDue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-default-600">Đã đóng:</span>
                    <span className="font-semibold text-success">
                      {formatCurrencyVND(totalInterestPaid)}
                    </span>
                  </div>
                  <Divider />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-default-600 font-medium">
                      Lãi còn thiếu:
                    </span>
                    <span
                      className={`font-bold ${remainingInterest > 0 ? "text-warning" : "text-success"}`}
                    >
                      {formatCurrencyVND(remainingInterest)}
                    </span>
                  </div>
                </CardBody>
              </Card>
            </>
          )}

          <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-primary-700 dark:text-primary-400">
                {isInstallmentType
                  ? "Nhập số tiền cần đóng (Gốc + Lãi + Phí). Số tiền không được vượt quá số tiền còn thiếu của mốc hiện tại."
                  : "Nhập số tiền lãi + phí cần đóng cho mốc 30 ngày. Số tiền không được vượt quá số tiền còn thiếu."}
              </p>
            </div>
          </div>

          <Input
            isRequired
            description={
              remainingInterest > 0
                ? `Tối đa: ${formatCurrencyVND(remainingInterest)}`
                : "Đã đóng đủ"
            }
            endContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">VNĐ</span>
              </div>
            }
            isDisabled={
              isSubmitting ||
              remainingInterest <= 0 ||
              (isBulletPaymentType && hasExistingPayment)
            }
            label={
              isInstallmentType
                ? "Số tiền đóng (Gốc + Lãi + Phí)"
                : "Số tiền đóng (Lãi + Phí)"
            }
            placeholder="Nhập số tiền"
            value={amount}
            onValueChange={handleAmountChange}
          />

          {/* Warning if amount exceeds remaining */}
          {numericAmount > remainingInterest && remainingInterest > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <p className="text-sm text-warning-700 dark:text-warning-400">
                Số tiền vượt quá số tiền còn thiếu!
              </p>
            </div>
          )}

          <Textarea
            isDisabled={isSubmitting}
            label="Ghi chú (tùy chọn)"
            minRows={2}
            placeholder="Ví dụ: Đóng tiền tháng 1, Đóng tiền kỳ 1..."
            value={notes}
            onValueChange={setNotes}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            isDisabled={isSubmitting}
            variant="flat"
            onPress={handleClose}
          >
            Hủy
          </Button>
          <Button
            color="primary"
            isDisabled={
              isSubmitting ||
              !amount ||
              numericAmount <= 0 ||
              numericAmount > remainingInterest ||
              remainingInterest <= 0 ||
              (isBulletPaymentType && hasExistingPayment) // Disable nếu Gói 2/3 đã đóng đủ 1 mốc
            }
            startContent={
              isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <DollarSign className="w-4 h-4" />
              )
            }
            onPress={handleSubmit}
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận đóng tiền"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PayInterestModal;
