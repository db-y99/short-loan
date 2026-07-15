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
import { ShoppingCart, CheckCircle, XCircle } from "lucide-react";
import { addToast } from "@heroui/toast";

import { formatCurrencyVND } from "@/lib/format";
import ConfirmModal from "@/components/confirm-modal";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  loanAmount: number;
  /** Giữ prop để không phá call site — không còn phân nhánh theo gói */
  loanType?: string;
  onSuccess?: () => void;
};

/**
 * Chuộc đồ — kế toán chỉ nhập số tiền lãi/phí cần thu.
 * Gốc luôn bằng số tiền vay (RPC yêu cầu). Không validate theo gói.
 */
const RedeemModal = ({
  isOpen,
  onClose,
  loanId,
  loanAmount,
  onSuccess,
}: TProps) => {
  const [interestAmount, setInterestAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setInterestAmount("0");
    setNotes("");
    setMessage(null);
  }, [isOpen, loanId]);

  const formatNumber = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");

    if (!numericValue) return "";

    return Number(numericValue).toLocaleString("vi-VN");
  };

  const parseAmount = (formattedAmount: string): number => {
    if (!formattedAmount.trim()) return 0;

    return Number(formattedAmount.replace(/\./g, "")) || 0;
  };

  const redeemInterest = parseAmount(interestAmount);
  const totalAmount = loanAmount + redeemInterest;

  const handleSubmit = () => {
    if (redeemInterest < 0) {
      setMessage({ type: "error", text: "Số tiền lãi/phí không hợp lệ" });

      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirmRedeem = async () => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/loans/${loanId}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          principalAmount: loanAmount,
          interestAmount: redeemInterest,
          notes: notes.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        addToast({
          title: "Thành công",
          description: `Chuộc đồ thành công! Tổng: ${formatCurrencyVND(totalAmount)}`,
          color: "success",
        });
        setInterestAmount("0");
        setNotes("");
        setMessage(null);
        onClose();
        onSuccess?.();
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

  return (
    <>
      <Modal isOpen={isOpen} size="md" onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-success" />
            Chuộc đồ
          </ModalHeader>
          <ModalBody className="gap-4">
            {message && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                  message.type === "success"
                    ? "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400"
                    : "bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0" />
                )}
                {message.text}
              </div>
            )}

            <div className="rounded-lg bg-default-100 px-3 py-2 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-default-500">Tiền gốc (cố định)</span>
                <span className="font-semibold">
                  {formatCurrencyVND(loanAmount)}
                </span>
              </div>
            </div>

            <Input
              description="Kế toán tự nhập số cần thu — không ràng buộc theo gói"
              label="Tiền lãi / phí thu thêm"
              placeholder="0"
              value={interestAmount}
              onValueChange={(value) => setInterestAmount(formatNumber(value))}
            />

            <div className="rounded-lg border border-success-200 bg-success-50 dark:bg-success-900/20 px-3 py-2 text-sm flex justify-between gap-2">
              <span className="font-medium text-success-700 dark:text-success-400">
                Tổng khách trả
              </span>
              <span className="font-bold text-success-700 dark:text-success-400">
                {formatCurrencyVND(totalAmount)}
              </span>
            </div>

            <Textarea
              label="Ghi chú (tuỳ chọn)"
              minRows={2}
              placeholder="Ví dụ: Khách chuộc đồ, thanh toán đủ..."
              value={notes}
              onValueChange={setNotes}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Hủy
            </Button>
            <Button
              color="success"
              isLoading={isSubmitting}
              startContent={
                isSubmitting ? undefined : <ShoppingCart className="w-4 h-4" />
              }
              onPress={handleSubmit}
            >
              {isSubmitting ? "Đang xử lý..." : "Chuộc đồ"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmModal
        confirmColor="success"
        confirmText="Xác nhận chuộc đồ"
        isLoading={isSubmitting}
        isOpen={isConfirmOpen}
        message={`Tiền gốc: ${formatCurrencyVND(loanAmount)}\nLãi/phí: ${formatCurrencyVND(redeemInterest)}\nTổng: ${formatCurrencyVND(totalAmount)}\n\nKhoản vay sẽ chuyển sang trạng thái Đã chuộc.`}
        title="Xác nhận chuộc đồ"
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmRedeem}
      />
    </>
  );
};

export default RedeemModal;
