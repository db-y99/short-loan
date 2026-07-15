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
import { Textarea } from "@heroui/input";

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
      const response = await fetch(
        `/api/loans/${loanId}/update-asset-condition`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ asset_condition: condition }),
        },
      );

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
    <Modal isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader>Cập nhật tình trạng tài sản</ModalHeader>
        <ModalBody>
          {error && (
            <div className="rounded-lg bg-danger-50 px-4 py-3 text-danger text-sm mb-4">
              {error}
            </div>
          )}
          <Textarea
            label="Tình trạng tài sản"
            minRows={6}
            placeholder="Ví dụ: Còn mới, hoạt động tốt, không trầy xước..."
            value={condition}
            onValueChange={setCondition}
          />
        </ModalBody>
        <ModalFooter>
          <Button isDisabled={isSubmitting} variant="flat" onPress={onClose}>
            Hủy
          </Button>
          <Button
            color="primary"
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
            onPress={handleSubmit}
          >
            Cập nhật
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateAssetConditionModal;
