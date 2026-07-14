"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { addToast } from "@heroui/toast";
import { DollarSign, Loader2 } from "lucide-react";

import { formatNumberInput, parseFormattedNumber } from "@/lib/format";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  loanAmount: number;
  onSuccess?: () => void;
};

const EditLoanAmountModal = ({
  isOpen,
  onClose,
  loanId,
  loanAmount,
  onSuccess,
}: TProps) => {
  const [amountInput, setAmountInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmountInput(formatNumberInput(String(loanAmount)));
    }
  }, [isOpen, loanAmount]);

  const handleSubmit = async () => {
    const nextAmount = parseFormattedNumber(amountInput);

    if (nextAmount <= 0) {
      addToast({
        title: "Lỗi",
        description: "Số tiền vay phải lớn hơn 0",
        color: "danger",
      });

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/loans/${loanId}/amount`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loanAmount: nextAmount,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        addToast({
          title: "Lỗi",
          description: result.error || "Không thể cập nhật số tiền vay",
          color: "danger",
        });

        return;
      }

      addToast({
        title: "Thành công",
        description: "Đã cập nhật số tiền vay",
        color: "success",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("[EDIT_LOAN_AMOUNT_ERROR]", error);
      addToast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật số tiền vay",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <span>Sửa số tiền vay</span>
        </ModalHeader>
        <ModalBody>
          <Input
            isDisabled={isSubmitting}
            label="Số tiền vay mới"
            placeholder="Nhập số tiền vay"
            value={amountInput}
            onValueChange={(value) => setAmountInput(formatNumberInput(value))}
          />
        </ModalBody>
        <ModalFooter>
          <Button isDisabled={isSubmitting} variant="flat" onPress={onClose}>
            Hủy
          </Button>
          <Button
            color="primary"
            isDisabled={isSubmitting}
            startContent={
              isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <DollarSign className="w-4 h-4" />
              )
            }
            onPress={handleSubmit}
          >
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditLoanAmountModal;
