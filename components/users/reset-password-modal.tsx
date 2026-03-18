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
import { Input } from "@heroui/input";
import { Loader2, KeyRound, XCircle, Eye, EyeOff, RefreshCw } from "lucide-react";
import { addToast } from "@heroui/toast";
import { Profile } from "@/services/profiles.service";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  user: Profile;
};

const ResetPasswordModal = ({ isOpen, onClose, user }: TProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!";
    const generated = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setPassword(generated);
    setShowPassword(true);
  };

  const handleSubmit = async () => {
    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${user.id}/reset-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (result.success) {
        addToast({
          title: "Thành công",
          description: "Đặt lại mật khẩu thành công",
          color: "success",
        });
        handleClose();
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
      setPassword("");
      setShowPassword(false);
      setError(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="sm">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-warning" />
          <span>Đặt lại mật khẩu</span>
        </ModalHeader>
        <ModalBody>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="text-sm text-default-600 bg-default-50 dark:bg-default-100/10 p-3 rounded-lg space-y-1">
            <p><span className="font-medium">Người dùng:</span> {user.full_name}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
          </div>

          <Input
            label="Mật khẩu mới"
            placeholder="Nhập mật khẩu mới"
            value={password}
            onValueChange={setPassword}
            type={showPassword ? "text" : "password"}
            isRequired
            isDisabled={isSubmitting}
            description="Tối thiểu 6 ký tự"
            endContent={
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-default-400 hover:text-default-600 p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-default-400 hover:text-primary p-1"
                  tabIndex={-1}
                  title="Tạo mật khẩu ngẫu nhiên"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            }
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={handleClose} isDisabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            color="warning"
            onPress={handleSubmit}
            isDisabled={isSubmitting || !password.trim()}
            startContent={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
          >
            {isSubmitting ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ResetPasswordModal;
