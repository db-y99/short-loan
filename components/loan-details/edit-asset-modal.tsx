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
import { Select, SelectItem } from "@heroui/select";
import { addToast } from "@heroui/toast";
import { Loader2, Smartphone } from "lucide-react";

import { ASSET_TYPES, ASSET_TYPE_LABEL } from "@/constants/loan";

const ASSET_TYPE_OPTIONS = Object.values(ASSET_TYPES).map((type) => ({
  key: type,
  label: ASSET_TYPE_LABEL[type],
}));

const VEHICLE_TYPES: readonly string[] = [
  ASSET_TYPES.MOTORBIKE,
  ASSET_TYPES.CAR,
];
const DEVICE_TYPES: readonly string[] = [ASSET_TYPES.PHONE, ASSET_TYPES.LAPTOP];

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  assetData: {
    typeKey: string;
    name: string;
    imei?: string;
    serial?: string;
    chassisNumber?: string;
    engineNumber?: string;
  };
  onSuccess?: () => void;
};

const EditAssetModal = ({
  isOpen,
  onClose,
  loanId,
  assetData,
  onSuccess,
}: TProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    assetType: "",
    assetName: "",
    imei: "",
    serial: "",
    chassisNumber: "",
    engineNumber: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        assetType: assetData.typeKey || "",
        assetName: assetData.name || "",
        imei: assetData.imei || "",
        serial: assetData.serial || "",
        chassisNumber: assetData.chassisNumber || "",
        engineNumber: assetData.engineNumber || "",
      });
    }
  }, [isOpen, assetData]);

  const isVehicle = VEHICLE_TYPES.includes(formData.assetType);
  const isDevice = DEVICE_TYPES.includes(formData.assetType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.assetType.trim() || !formData.assetName.trim()) {
      addToast({
        title: "Lỗi",
        description: "Vui lòng nhập loại tài sản và tên tài sản",
        color: "danger",
      });

      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/loans/${loanId}/asset`, {
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
          description: result.error || "Không thể cập nhật thông tin tài sản",
          color: "danger",
        });

        return;
      }

      addToast({
        title: "Thành công",
        description: "Đã cập nhật thông tin tài sản",
        color: "success",
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("[EDIT_ASSET_ERROR]", error);
      addToast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật tài sản",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="3xl" onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            <span>Sửa thông tin tài sản</span>
          </ModalHeader>
          <ModalBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              isRequired
              isDisabled={isSubmitting}
              label="Loại tài sản"
              placeholder="Chọn loại tài sản"
              selectedKeys={formData.assetType ? [formData.assetType] : []}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, assetType: e.target.value }))
              }
            >
              {ASSET_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>
            <Input
              isRequired
              isDisabled={isSubmitting}
              label="Tên tài sản"
              value={formData.assetName}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, assetName: value }))
              }
            />
            {isDevice && (
              <>
                <Input
                  isDisabled={isSubmitting}
                  label="IMEI"
                  value={formData.imei}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, imei: value }))
                  }
                />
                <Input
                  isDisabled={isSubmitting}
                  label="Serial"
                  value={formData.serial}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, serial: value }))
                  }
                />
              </>
            )}
            {isVehicle && (
              <>
                <Input
                  isDisabled={isSubmitting}
                  label="Số khung"
                  value={formData.chassisNumber}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, chassisNumber: value }))
                  }
                />
                <Input
                  isDisabled={isSubmitting}
                  label="Số máy"
                  value={formData.engineNumber}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, engineNumber: value }))
                  }
                />
              </>
            )}
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
                  <Smartphone className="w-4 h-4" />
                )
              }
              type="submit"
            >
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditAssetModal;
