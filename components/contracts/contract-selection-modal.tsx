"use client";

import type { TContractType } from "@/types/contract.types";

import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { AlertTriangle, FileText } from "lucide-react";

import {
  GENERATABLE_CONTRACT_TYPES,
  DEFAULT_SELECTED_CONTRACT_TYPES,
  CONTRACT_TYPE,
  CONTRACT_TYPE_LABEL,
  CONTRACT_TYPE_DESCRIPTION,
} from "@/constants/contracts";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedTypes: TContractType[]) => void;
  isLoading?: boolean;
  mode?: "create" | "regenerate";
};

const ContractSelectionModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  mode = "create",
}: TProps) => {
  const availableTypes = useMemo(() => [...GENERATABLE_CONTRACT_TYPES], []);

  const [selectedTypes, setSelectedTypes] = useState<TContractType[]>([
    ...DEFAULT_SELECTED_CONTRACT_TYPES,
  ]);

  useEffect(() => {
    if (isOpen) {
      setSelectedTypes([...DEFAULT_SELECTED_CONTRACT_TYPES]);
    }
  }, [isOpen]);

  const allSelected = selectedTypes.length === availableTypes.length;
  const noneSelected = selectedTypes.length === 0;

  const toggleType = (type: TContractType, checked: boolean) => {
    setSelectedTypes((prev) =>
      checked ? [...prev, type] : prev.filter((t) => t !== type),
    );
  };

  const handleSelectAll = () => {
    setSelectedTypes([...availableTypes]);
  };

  const handleDeselectAll = () => {
    setSelectedTypes([]);
  };

  const handleConfirm = () => {
    if (noneSelected) return;
    onConfirm(selectedTypes);
  };

  const isRegenerate = mode === "regenerate";

  return (
    <Modal isOpen={isOpen} size="lg" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <span>
              {isRegenerate
                ? "Chọn hợp đồng cần tạo lại"
                : "Chọn hợp đồng cần tạo"}
            </span>
          </div>
        </ModalHeader>
        <ModalBody className="gap-4">
          {isRegenerate && (
            <div className="p-3 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-sm text-warning-700 dark:text-warning-400">
                  <p className="font-semibold">Lưu ý khi tạo lại</p>
                  <ul className="text-xs mt-2 space-y-1 list-disc list-inside">
                    <li>Hợp đồng cũ sẽ bị xóa khỏi danh sách</li>
                    <li>File cũ vẫn được giữ trên Google Drive</li>
                    <li>Trạng thái khoản vay sẽ reset về Đã duyệt</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-default-600">
            Chọn các loại hợp đồng bạn muốn tạo. Chỉ các file đã chọn mới được
            sinh và upload lên Drive.
          </p>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Đã chọn {selectedTypes.length}/{availableTypes.length}
            </span>
            <div className="flex gap-2">
              <Button
                isDisabled={allSelected}
                size="sm"
                variant="flat"
                onPress={handleSelectAll}
              >
                Chọn tất cả
              </Button>
              <Button
                isDisabled={noneSelected}
                size="sm"
                variant="flat"
                onPress={handleDeselectAll}
              >
                Bỏ chọn
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {availableTypes.map((type) => (
              <div
                key={type}
                className="flex items-start gap-3 p-3 rounded-lg border border-default-200 dark:border-default-100 hover:bg-default-50 transition-colors"
              >
                <Checkbox
                  aria-label={CONTRACT_TYPE_LABEL[type]}
                  isSelected={selectedTypes.includes(type)}
                  onValueChange={(checked) => toggleType(type, checked)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {CONTRACT_TYPE_LABEL[type]}
                  </p>
                  <p className="text-xs text-default-500 mt-0.5">
                    {CONTRACT_TYPE_DESCRIPTION[type]}
                    {type === CONTRACT_TYPE.ASSET_LEASE ? (
                      <span className="text-default-400"> · Ít dùng</span>
                    ) : null}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {noneSelected && (
            <p className="text-xs text-danger">
              Vui lòng chọn ít nhất một loại hợp đồng
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button isDisabled={isLoading} variant="flat" onPress={onClose}>
            Hủy
          </Button>
          <Button
            color={isRegenerate ? "warning" : "primary"}
            isDisabled={noneSelected || isLoading}
            isLoading={isLoading}
            onPress={handleConfirm}
          >
            {isLoading
              ? "Đang tạo..."
              : isRegenerate
                ? `Tạo lại (${selectedTypes.length})`
                : `Tạo hợp đồng (${selectedTypes.length})`}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ContractSelectionModal;
