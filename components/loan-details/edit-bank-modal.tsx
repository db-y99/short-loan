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
import { Loader2, Building2, CheckCircle, XCircle } from "lucide-react";
import { addToast } from "@heroui/toast";
import type { TBankFormData } from "@/types/bank.types";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  bankData: TBankFormData;
  onSuccess?: () => void;
};

const EditBankModal = ({
  isOpen,
  onClose,
  loanId,
  bankData,
  onSuccess,
}: TProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    bank_name: bankData.name,
    bank_account_holder: bankData.accountHolder,
    bank_account_number: bankData.accountNumber,
  });

  // Update form when bankData changes
  useEffect(() => {
    setFormData({
      bank_name: bankData.name,
      bank_account_holder: bankData.accountHolder,
      bank_account_number: bankData.accountNumber,
    });
  }, [bankData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.bank_name.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập tên ngân hàng" });
      return;
    }
    if (!formData.bank_account_holder.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập chủ tài khoản" });
      return;
    }
    if (!formData.bank_account_number.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập số tài khoản" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/loans/${loanId}/bank`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        addToast({
          title: "Thành công",
          description: "Cập nhật thông tin ngân hàng thành công!",
          color: "success",
        });

        // Call success callback immediately
        if (onSuccess) {
          onSuccess();
        }
        onClose();
        setMessage(null);
      } else {
        setMessage({ type: "error", text: result.error || "Có lỗi xảy ra" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi khi cập nhật thông tin" });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span>Sửa thông tin ngân hàng</span>
          </ModalHeader>

          <ModalBody className="gap-4">
            {message && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
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

            <Input
              label="Ngân hàng"
              placeholder="Vietcombank"
              value={formData.bank_name}
              onValueChange={(value) =>
                setFormData({ ...formData, bank_name: value })
              }
              isRequired
              isDisabled={isSubmitting}
            />

            <Input
              label="Chủ tài khoản"
              placeholder="NGUYEN VAN A"
              value={formData.bank_account_holder}
              onValueChange={(value) =>
                setFormData({ ...formData, bank_account_holder: value })
              }
              isRequired
              isDisabled={isSubmitting}
            />

            <Input
              label="Số tài khoản"
              placeholder="1234567890"
              value={formData.bank_account_number}
              onValueChange={(value) =>
                setFormData({ ...formData, bank_account_number: value })
              }
              isRequired
              isDisabled={isSubmitting}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              variant="flat"
              onPress={handleClose}
              isDisabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              color="primary"
              type="submit"
              startContent={
                isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Building2 className="w-4 h-4" />
                )
              }
              isDisabled={isSubmitting}
            >
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditBankModal;
