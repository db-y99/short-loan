"use client";

import type { TBranch } from "@/types/branch.types";

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
import { Select, SelectItem } from "@heroui/select";
import {
  Loader2,
  UserPlus,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { addToast } from "@heroui/toast";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branches?: TBranch[];
};

import { ROLES } from "@/constants/roles";

const CreateUserModal = ({
  isOpen,
  onClose,
  onSuccess,
  branches = [],
}: TProps) => {
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    full_name: string;
    role: (typeof ROLES)[keyof typeof ROLES];
    branch_id: string;
  }>({
    email: "",
    password: "",
    full_name: "",
    role: ROLES.USER,
    branch_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const generatePassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!";
    const password = Array.from(
      { length: 12 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");

    setFormData((prev) => ({ ...prev, password }));
    setShowPassword(true);
  };

  const handleSubmit = async () => {
    if (
      !formData.email.trim() ||
      !formData.full_name.trim() ||
      !formData.password.trim()
    ) {
      setError("Vui lòng điền đầy đủ thông tin");

      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      setError("Email không hợp lệ");

      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");

      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        addToast({
          title: "Thành công",
          description: "Tạo người dùng mới thành công",
          color: "success",
        });
        setFormData({
          email: "",
          password: "",
          full_name: "",
          role: ROLES.USER,
          branch_id: "",
        });
        onClose();
        onSuccess();
      } else {
        setError(result.error || "Có lỗi xảy ra");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        email: "",
        password: "",
        full_name: "",
        role: ROLES.USER,
        branch_id: "",
      });
      setError(null);
      setShowPassword(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} size="md" onClose={handleClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          <span>Thêm người dùng mới</span>
        </ModalHeader>
        <ModalBody>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <Input
              isRequired
              isDisabled={isSubmitting}
              label="Họ và tên"
              placeholder="Nhập họ và tên"
              value={formData.full_name}
              onValueChange={(value) =>
                setFormData({ ...formData, full_name: value })
              }
            />

            <Input
              isRequired
              isDisabled={isSubmitting}
              label="Email"
              placeholder="Nhập email"
              type="email"
              value={formData.email}
              onValueChange={(value) =>
                setFormData({ ...formData, email: value })
              }
            />

            <Input
              isRequired
              description="Tối thiểu 6 ký tự"
              endContent={
                <div className="flex items-center gap-1">
                  <button
                    className="text-default-400 hover:text-default-600 p-1"
                    tabIndex={-1}
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    className="text-default-400 hover:text-primary p-1"
                    tabIndex={-1}
                    title="Tạo mật khẩu ngẫu nhiên"
                    type="button"
                    onClick={generatePassword}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              }
              isDisabled={isSubmitting}
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onValueChange={(value) =>
                setFormData({ ...formData, password: value })
              }
            />

            <Select
              isDisabled={isSubmitting}
              label="Role"
              selectedKeys={[formData.role]}
              onSelectionChange={(keys) =>
                setFormData({
                  ...formData,
                  role: Array.from(
                    keys,
                  )[0] as (typeof ROLES)[keyof typeof ROLES],
                })
              }
            >
              <SelectItem key={ROLES.USER}>User</SelectItem>
              <SelectItem key={ROLES.CA}>CA (Kế toán)</SelectItem>
              <SelectItem key={ROLES.ADMIN}>Admin</SelectItem>
            </Select>

            {branches.length > 0 && (
              <Select
                isDisabled={isSubmitting}
                label="Chi nhánh"
                placeholder="Chọn chi nhánh"
                selectedKeys={formData.branch_id ? [formData.branch_id] : []}
                onSelectionChange={(keys) =>
                  setFormData({
                    ...formData,
                    branch_id: (Array.from(keys)[0] as string) || "",
                  })
                }
              >
                {branches.map((b) => (
                  <SelectItem key={b.id}>{b.name}</SelectItem>
                ))}
              </Select>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            isDisabled={isSubmitting}
            variant="flat"
            onPress={handleClose}
          >
            Hủy
          </Button>
          <Button
            color="primary"
            isDisabled={
              isSubmitting ||
              !formData.email.trim() ||
              !formData.full_name.trim() ||
              !formData.password.trim()
            }
            startContent={
              isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )
            }
            onPress={handleSubmit}
          >
            {isSubmitting ? "Đang tạo..." : "Tạo người dùng"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateUserModal;
