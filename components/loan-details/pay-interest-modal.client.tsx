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
import { Loader2, DollarSign, Info, CheckCircle, XCircle } from "lucide-react";
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
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setNotes("");
      setMessage(null);
    }
  }, [isOpen]);

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
    
    if (!amount || numericAmount <= 0) {
      setMessage({ type: "error", text: "Vui lòng nhập số tiền hợp lệ" });
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
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
                  : "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-4 h-4" />
              ) : message.type === "error" ? (
                <XCircle className="w-4 h-4" />
              ) : (
                <Info className="w-4 h-4" />
              )}
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-primary-700 dark:text-primary-400">
                Nhập số tiền lãi cần đóng. Số tiền sẽ được ghi nhận vào lịch sử thanh toán.
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
            isRequired
            isDisabled={isSubmitting}
          />

          <Textarea
            label="Ghi chú (tùy chọn)"
            placeholder="Ví dụ: Đóng lãi tháng 1, Đóng lãi kỳ 1..."
            value={notes}
            onValueChange={setNotes}
            minRows={3}
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
            isDisabled={isSubmitting || !amount}
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
