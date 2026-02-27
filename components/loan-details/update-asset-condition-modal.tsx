"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  currentCondition?: string;
  onSuccess: () => void;
};

const UpdateAssetConditionModal = ({
  isOpen,
  onClose,
  loanId,
  currentCondition = "",
  onSuccess,
}: TProps) => {
  const [condition, setCondition] = useState(currentCondition);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!condition.trim()) {
      setError("Vui lòng nhập tình trạng tài sản");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/loans/${loanId}/update-asset-condition`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ asset_condition: condition }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || "Có lỗi xảy ra");
      }
    } catch (err) {
      setError("Lỗi khi cập nhật tình trạng tài sản");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>Cập nhật tình trạng tài sản</ModalHeader>
        <ModalBody>
          {error && (
            <div className="rounded-lg bg-danger-50 px-4 py-3 text-danger text-sm mb-4">
              {error}
            </div>
          )}
          <Input
            label="Tình trạng tài sản"
            placeholder="Ví dụ: Còn mới, hoạt động tốt"
            value={condition}
            onValueChange={setCondition}
            autoFocus
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            Cập nhật
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateAssetConditionModal;
