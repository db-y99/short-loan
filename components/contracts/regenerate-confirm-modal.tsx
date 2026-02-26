"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { AlertTriangle } from "lucide-react";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

const RegenerateConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: TProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <span>Xác nhận tạo lại hợp đồng</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-3">
            <p className="text-sm">
              Bạn có chắc chắn muốn tạo lại tất cả hợp đồng?
            </p>
            <div className="p-3 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
              <p className="text-sm text-warning-700 dark:text-warning-400">
                <strong>Lưu ý:</strong>
              </p>
              <ul className="text-xs text-warning-600 dark:text-warning-500 mt-2 space-y-1 list-disc list-inside">
                <li>Hợp đồng cũ sẽ bị xóa khỏi danh sách</li>
                <li>File cũ vẫn được giữ trên Google Drive</li>
                <li>Hợp đồng mới sẽ có version tăng dần (v2, v3...)</li>
              </ul>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={isLoading}>
            Hủy
          </Button>
          <Button
            color="warning"
            onPress={onConfirm}
            isDisabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? "Đang tạo lại..." : "Xác nhận tạo lại"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RegenerateConfirmModal;
