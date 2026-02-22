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
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Loader2, DollarSign } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/loans/${loanId}/pay-interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          notes: notes.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAmount("");
        setNotes("");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(result.error || "Có lỗi xảy ra");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span>Đóng lãi</span>
          </div>
        </ModalHeader>
        <ModalBody>
          {error && (
            <div className="p-3 rounded-lg bg-danger-50 text-danger text-sm">
              {error}
            </div>
          )}

          <Input
            label="Số tiền đóng lãi"
            placeholder="Nhập số tiền"
            type="number"
            value={amount}
            onValueChange={setAmount}
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">₫</span>
              </div>
            }
            isRequired
          />

          <Textarea
            label="Ghi chú"
            placeholder="Ghi chú về lần đóng lãi này (tùy chọn)"
            value={notes}
            onValueChange={setNotes}
            minRows={3}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={isSubmitting}
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
