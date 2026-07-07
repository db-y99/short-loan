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
import { Loader2, UserCog } from "lucide-react";
import { addToast } from "@heroui/toast";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  referenceId: string;
  fullName: string;
  phone: string;
  relationship: string;
  onSuccess?: () => void;
};

const EditReferenceModal = ({
  isOpen,
  onClose,
  loanId,
  referenceId,
  fullName,
  phone,
  relationship,
  onSuccess,
}: TProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    relationship: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName,
        phone,
        relationship,
      });
    }
  }, [isOpen, fullName, phone, relationship]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.relationship.trim()) {
      addToast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin tham chiếu",
        color: "danger",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/loans/${loanId}/references/${referenceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        addToast({
          title: "Lỗi",
          description: result.error || "Không thể cập nhật tham chiếu",
          color: "danger",
        });
        return;
      }

      addToast({
        title: "Thành công",
        description: "Đã cập nhật tham chiếu",
        color: "success",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("[EDIT_REFERENCE_ERROR]", error);
      addToast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật tham chiếu",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" />
            <span>Sửa tham chiếu</span>
          </ModalHeader>
          <ModalBody className="gap-4">
            <Input
              label="Họ và tên"
              value={formData.fullName}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, fullName: value }))}
              isRequired
              isDisabled={isSubmitting}
            />
            <Input
              label="Số điện thoại"
              value={formData.phone}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
              isRequired
              isDisabled={isSubmitting}
            />
            <Input
              label="Mối quan hệ"
              value={formData.relationship}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, relationship: value }))}
              isRequired
              isDisabled={isSubmitting}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose} isDisabled={isSubmitting}>
              Hủy
            </Button>
            <Button
              color="primary"
              type="submit"
              isDisabled={isSubmitting}
              startContent={
                isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserCog className="w-4 h-4" />
                )
              }
            >
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditReferenceModal;
