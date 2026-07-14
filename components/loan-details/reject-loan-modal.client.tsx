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
import { Textarea } from "@heroui/input";
import { XCircle } from "lucide-react";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  onSuccess: () => void;
};

const RejectLoanModal = ({ isOpen, onClose, loanId, onSuccess }: TProps) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setReason("");
    setError(null);
    setIsSubmitting(false);
  }, [isOpen]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/loans/${loanId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: reason.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Không thể từ chối khoản vay");

        return;
      }

      onSuccess();
      onClose();
    } catch (submitError) {
      console.error("[REJECT_LOAN_MODAL_ERROR]", submitError);
      setError("Có lỗi xảy ra khi từ chối khoản vay");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-danger" />
          Từ chối khoản vay
        </ModalHeader>
        <ModalBody className="gap-4">
          <p className="text-sm text-default-600">
            Khoản vay sẽ chuyển sang trạng thái <strong>Từ chối</strong> và
            không thể duyệt hoặc ký hợp đồng.
          </p>
          {error ? (
            <div className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          ) : null}
          <Textarea
            label="Lý do từ chối"
            maxLength={500}
            minRows={4}
            placeholder="Nhập lý do (không bắt buộc)..."
            value={reason}
            onValueChange={setReason}
          />
        </ModalBody>
        <ModalFooter>
          <Button isDisabled={isSubmitting} variant="flat" onPress={onClose}>
            Hủy
          </Button>
          <Button
            color="danger"
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
            onPress={handleSubmit}
          >
            Từ chối
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RejectLoanModal;
