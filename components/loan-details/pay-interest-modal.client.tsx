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
import { Loader2, DollarSign, Info, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { formatCurrencyVND } from "@/lib/format";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  onSuccess?: () => void;
};

const PayInterestModal = ({ isOpen, onClose, loanId, onSuccess }: TProps) => {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [totalInterestDue, setTotalInterestDue] = useState(0);
  const [totalInterestPaid, setTotalInterestPaid] = useState(0);
  const [currentMilestone, setCurrentMilestone] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info" | "warning";
    text: string;
  } | null>(null);

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
        const paid = Number(result.data.cycle?.totalInterestPaid || 0);
        const periods = result.data.periods || [];
        
        // Tính phí theo mốc hiện tại (không cộng dồn)
        // Sắp xếp periods theo milestone_day
        const sortedPeriods = [...periods].sort((a: any, b: any) => 
          a.milestone_day - b.milestone_day
        );
        
        // Tìm mốc hiện tại: mốc đầu tiên có status pending hoặc overdue
        // Nếu không tìm thấy (đã đóng hết), lấy mốc cuối cùng
        const currentPeriod = sortedPeriods.find((p: any) => 
          p.status === 'pending' || p.status === 'overdue'
        ) || sortedPeriods[sortedPeriods.length - 1];
        
        let currentMilestoneFee = 0;
        let milestone = null;
        
        if (currentPeriod) {
          currentMilestoneFee = Number(currentPeriod.fee_amount);
          milestone = currentPeriod.milestone_day;
        }
        
        setTotalInterestPaid(paid);
        setTotalInterestDue(currentMilestoneFee);
        setCurrentMilestone(milestone);
        
        // Auto-fill remaining interest
        const remaining = Math.max(0, currentMilestoneFee - paid);
        if (remaining > 0) {
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
        text: `Số tiền không được vượt quá ${formatCurrencyVND(remainingInterest)}` 
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
        setMessage({ 
          type: "success", 
          text: `Đã đóng lãi ${formatCurrencyVND(numericAmount)} thành công!` 
        });
        
        // Close modal and refresh after 1.5s
        setTimeout(() => {
          setAmount("");
          setNotes("");
          setMessage(null);
          onClose();
          if (onSuccess) onSuccess();
        }, 1500);
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
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span>Đóng lãi</span>
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
            <Card shadow="sm">
              <CardBody className="space-y-2">
                {currentMilestone && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-default-600">Mốc hiện tại:</span>
                    <span className="font-semibold text-primary">{currentMilestone} ngày</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-default-600">Tổng lãi phải trả:</span>
                  <span className="font-semibold">{formatCurrencyVND(totalInterestDue)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-default-600">Đã đóng lãi:</span>
                  <span className="font-semibold text-success">{formatCurrencyVND(totalInterestPaid)}</span>
                </div>
                <Divider />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-default-600 font-medium">Lãi còn thiếu:</span>
                  <span className={`font-bold ${remainingInterest > 0 ? 'text-warning' : 'text-success'}`}>
                    {formatCurrencyVND(remainingInterest)}
                  </span>
                </div>
              </CardBody>
            </Card>
          )}

          <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-primary-700 dark:text-primary-400">
                Nhập số tiền lãi cần đóng. Số tiền không được vượt quá số tiền còn thiếu của mốc hiện tại.
              </p>
            </div>
          </div>

          <Input
            label="Số tiền đóng lãi"
            placeholder="Nhập số tiền"
            value={amount}
            onValueChange={handleAmountChange}
            endContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">VNĐ</span>
              </div>
            }
            description={remainingInterest > 0 ? `Tối đa: ${formatCurrencyVND(remainingInterest)}` : "Đã đóng đủ lãi"}
            isRequired
            isDisabled={isSubmitting || remainingInterest <= 0}
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
            label="Ghi chú (tùy chọn)"
            placeholder="Ví dụ: Đóng lãi tháng 1, Đóng lãi kỳ 1..."
            value={notes}
            onValueChange={setNotes}
            minRows={2}
            isDisabled={isSubmitting}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={handleClose} isDisabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={isSubmitting || !amount || numericAmount <= 0 || numericAmount > remainingInterest || remainingInterest <= 0}
            startContent={
              isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <DollarSign className="w-4 h-4" />
              )
            }
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận đóng lãi"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PayInterestModal;
