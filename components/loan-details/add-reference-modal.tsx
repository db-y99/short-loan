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
import { Loader2, UserPlus, CheckCircle, XCircle } from "lucide-react";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  onSuccess?: () => void;
};

const AddReferenceModal = ({ isOpen, onClose, loanId, onSuccess }: TProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    relationship: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!formData.fullName.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập họ tên" });
      return;
    }
    if (!formData.phone.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập số điện thoại" });
      return;
    }
    if (!formData.relationship.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập mối quan hệ" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/loans/${loanId}/references`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: "Thêm tham chiếu thành công!",
        });
        
        // Reset form
        setFormData({
          fullName: "",
          phone: "",
          relationship: "",
        });

        // Call success callback
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
            onClose();
            setMessage(null);
          }, 1500);
        }
      } else {
        setMessage({ type: "error", text: result.error || "Có lỗi xảy ra" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi khi thêm tham chiếu" });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        fullName: "",
        phone: "",
        relationship: "",
      });
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
            <UserPlus className="w-5 h-5 text-primary" />
            <span>Thêm tham chiếu</span>
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
              label="Họ và tên"
              placeholder="Nhập họ tên người tham chiếu"
              value={formData.fullName}
              onValueChange={(value) =>
                setFormData({ ...formData, fullName: value })
              }
              isRequired
              isDisabled={isSubmitting}
            />

            <Input
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              value={formData.phone}
              onValueChange={(value) =>
                setFormData({ ...formData, phone: value })
              }
              isRequired
              isDisabled={isSubmitting}
            />

            <Input
              label="Mối quan hệ"
              placeholder="Ví dụ: Bạn bè, Đồng nghiệp, Người thân..."
              value={formData.relationship}
              onValueChange={(value) =>
                setFormData({ ...formData, relationship: value })
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
                  <UserPlus className="w-4 h-4" />
                )
              }
              isDisabled={isSubmitting}
            >
              {isSubmitting ? "Đang thêm..." : "Thêm tham chiếu"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddReferenceModal;
