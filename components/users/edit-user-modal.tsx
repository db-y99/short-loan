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
import { Input } from "@heroui/input";
import { Loader2, Edit, CheckCircle, XCircle } from "lucide-react";
import { addToast } from "@heroui/toast";
import { Profile } from "@/services/profiles.service";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  user: Profile;
  onSuccess: () => void;
};

const EditUserModal = ({ isOpen, onClose, user, onSuccess }: TProps) => {
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        full_name: user.full_name || "",
      });
      setMessage(null);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!formData.email.trim() || !formData.full_name.trim()) {
      setMessage({ type: "error", text: "Vui lòng điền đầy đủ thông tin" });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: "error", text: "Email không hợp lệ" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        addToast({
          title: "Thành công",
          description: "Cập nhật thông tin người dùng thành công",
          color: "success",
        });
        
        setMessage(null);
        onClose();
        onSuccess();
      } else {
        setMessage({ type: "error", text: result.error || "Có lỗi xảy ra" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Lỗi kết nối server" });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Edit className="w-5 h-5 text-primary" />
          <span>Chỉnh sửa người dùng</span>
        </ModalHeader>
        <ModalBody>
          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400"
                  : "bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Email"
              placeholder="Nhập email người dùng"
              value={formData.email}
              onValueChange={(value) => setFormData({ ...formData, email: value })}
              type="email"
              isRequired
              isDisabled={isSubmitting}
            />

            <Input
              label="Họ và tên"
              placeholder="Nhập họ và tên"
              value={formData.full_name}
              onValueChange={(value) => setFormData({ ...formData, full_name: value })}
              isRequired
              isDisabled={isSubmitting}
            />
          </div>

          <div className="text-xs text-default-500 bg-default-50 p-3 rounded-lg">
            <strong>ID:</strong> {user.id}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={handleClose} isDisabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={isSubmitting || !formData.email.trim() || !formData.full_name.trim()}
            startContent={
              isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Edit className="w-4 h-4" />
              )
            }
          >
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditUserModal;