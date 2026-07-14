"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Copy, ImageIcon, ImagePlus } from "lucide-react";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanCode: string;
  assetImageCount: number;
  onConfirm: (keepAssetImages: boolean) => void;
};

const ReuseLoanConfirmModal = ({
  isOpen,
  onClose,
  loanCode,
  assetImageCount,
  onConfirm,
}: TProps) => {
  const hasAssetImages = assetImageCount > 0;

  return (
    <Modal isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Copy className="w-5 h-5 text-primary" />
          Vay lại từ {loanCode}
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-default-600">
            Tạo đơn vay mới với thông tin khách hàng, tài sản và ngân hàng từ
            hợp đồng này. Bạn muốn xử lý ảnh tài sản như thế nào?
          </p>
          {!hasAssetImages && (
            <p className="mt-2 text-sm text-warning-600">
              Hợp đồng cũ không có ảnh tài sản — bạn cần tải ảnh mới khi tạo
              đơn.
            </p>
          )}
        </ModalBody>
        <ModalFooter className="flex flex-wrap gap-2">
          <Button variant="flat" onPress={onClose}>
            Hủy
          </Button>
          <Button
            startContent={<ImagePlus size={16} />}
            variant="bordered"
            onPress={() => onConfirm(false)}
          >
            Tải ảnh mới
          </Button>
          <Button
            color="primary"
            isDisabled={!hasAssetImages}
            startContent={<ImageIcon size={16} />}
            onPress={() => onConfirm(true)}
          >
            Giữ ảnh cũ ({assetImageCount})
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReuseLoanConfirmModal;
