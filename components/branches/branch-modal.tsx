"use client";

import type { TBranch } from "@/types/branch.types";

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
import { Checkbox } from "@heroui/checkbox";
import { Loader2, GitBranch } from "lucide-react";
import { addToast } from "@heroui/toast";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  branch: TBranch | null;
  onSuccess: () => void;
};

export default function BranchModal({
  isOpen,
  onClose,
  branch,
  onSuccess,
}: TProps) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    address: "",
    phone: "",
    is_headquarters: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (branch) {
      setForm({
        code: branch.code || "",
        name: branch.name,
        address: branch.address || "",
        phone: branch.phone || "",
        is_headquarters: branch.is_headquarters,
      });
    } else {
      setForm({
        code: "",
        name: "",
        address: "",
        phone: "",
        is_headquarters: false,
      });
    }
  }, [branch, isOpen]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      addToast({ title: "Vui lòng nhập tên chi nhánh", color: "danger" });

      return;
    }
    setIsSubmitting(true);
    try {
      const url = branch ? `/api/branches/${branch.id}` : "/api/branches";
      const method = branch ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();

      if (result.success) {
        addToast({
          title: branch ? "Đã cập nhật chi nhánh" : "Đã tạo chi nhánh",
          color: "success",
        });
        onSuccess();
      } else {
        addToast({ title: "Lỗi", description: result.error, color: "danger" });
      }
    } catch {
      addToast({ title: "Lỗi kết nối server", color: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          {branch ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh"}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              isDisabled={isSubmitting}
              label="Mã chi nhánh"
              placeholder="VD: CT, BN"
              value={form.code}
              onValueChange={(v) => setForm({ ...form, code: v })}
            />
            <Input
              isRequired
              isDisabled={isSubmitting}
              label="Tên chi nhánh"
              placeholder="VD: Chi nhánh Hà Nội"
              value={form.name}
              onValueChange={(v) => setForm({ ...form, name: v })}
            />
            <Input
              isDisabled={isSubmitting}
              label="Địa chỉ"
              placeholder="Nhập địa chỉ chi nhánh"
              value={form.address}
              onValueChange={(v) => setForm({ ...form, address: v })}
            />
            <Input
              isDisabled={isSubmitting}
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              value={form.phone}
              onValueChange={(v) => setForm({ ...form, phone: v })}
            />
            <Checkbox
              isDisabled={isSubmitting}
              isSelected={form.is_headquarters}
              onValueChange={(v) => setForm({ ...form, is_headquarters: v })}
            >
              Trụ sở chính
            </Checkbox>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button isDisabled={isSubmitting} variant="flat" onPress={onClose}>
            Hủy
          </Button>
          <Button
            color="primary"
            isDisabled={isSubmitting || !form.name.trim()}
            startContent={
              isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <GitBranch className="w-4 h-4" />
              )
            }
            onPress={handleSubmit}
          >
            {isSubmitting
              ? "Đang lưu..."
              : branch
                ? "Cập nhật"
                : "Tạo chi nhánh"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
