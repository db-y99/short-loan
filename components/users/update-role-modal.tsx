"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Loader2, ShieldCheck, XCircle } from "lucide-react";
import { addToast } from "@heroui/toast";

import { Profile } from "@/services/profiles.service";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  user: Profile;
  onSuccess: () => void;
};

import { ROLES } from "@/constants/roles";

const ROLE_OPTIONS = [
  { key: ROLES.ADMIN, label: "Admin" },
  { key: ROLES.CA, label: "CA (Kế toán)" },
  { key: ROLES.USER, label: "User" },
];

const UpdateRoleModal = ({ isOpen, onClose, user, onSuccess }: TProps) => {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedRole(user.role || ROLES.USER);
      setError(null);
    }
  }, [isOpen, user]);

  const handleSubmit = async () => {
    if (!selectedRole) {
      setError("Vui lòng chọn role");

      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${user.id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      const result = await response.json();

      if (result.success) {
        addToast({
          title: "Thành công",
          description: "Cập nhật role người dùng thành công",
          color: "success",
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
      setError(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} size="sm" onClose={handleClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span>Cập nhật Role</span>
        </ModalHeader>
        <ModalBody>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="text-sm text-default-600 bg-default-50 dark:bg-default-100/10 p-3 rounded-lg space-y-1">
            <p>
              <span className="font-medium">Người dùng:</span> {user.full_name}
            </p>
            <p>
              <span className="font-medium">Role hiện tại:</span>{" "}
              {user.role || ROLES.USER}
            </p>
          </div>

          <Select
            isDisabled={isSubmitting}
            label="Role mới"
            selectedKeys={[selectedRole]}
            onSelectionChange={(keys) =>
              setSelectedRole(Array.from(keys)[0] as string)
            }
          >
            {ROLE_OPTIONS.map((role) => (
              <SelectItem key={role.key}>{role.label}</SelectItem>
            ))}
          </Select>
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
            isDisabled={isSubmitting || !selectedRole}
            startContent={
              isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )
            }
            onPress={handleSubmit}
          >
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateRoleModal;
