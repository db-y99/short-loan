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
import { DollarSign, Loader2 } from "lucide-react";
import { addToast } from "@heroui/toast";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  customerName?: string;
  onSuccess?: () => void;
};

const SimplePaymentModal = ({
  isOpen,
  onClose,
  loanId,
  customerName,
  onSuccess,
}: TProps) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");

    return new Intl.NumberFormat("vi-VN").format(Number(numericValue));
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");

    setAmount(numericValue);
  };

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      addToast({
        title: "Lỗi",
        description: "Vui lòng nhập số tiền hợp lệ",
        color: "danger",
      });

      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/loans/${loanId}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          type: "flexible", // Đánh dấu là thanh toán linh hoạt
        }),
      });

      const result = await response.json();

      if (result.success) {
        addToast({
          title: "Thành công",
          description: `Đã ghi nhận thanh toán ${formatCurrency(amount)} VNĐ`,
          color: "success",
        });

        setAmount("");
        onClose();

        if (onSuccess) {
          onSuccess();
        }
      } else {
        addToast({
          title: "Lỗi",
          description: result.error || "Có lỗi xảy ra khi xử lý thanh toán",
          color: "danger",
        });
      }
    } catch (error) {
      addToast({
        title: "Lỗi",
        description: "Lỗi kết nối, vui lòng thử lại",
        color: "danger",
      });
      console.error("Payment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setAmount("");
      onClose();
    }
  };

  return (
    <Modal
      hideCloseButton={isLoading}
      isOpen={isOpen}
      size="md"
      onClose={handleClose}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <span>Đóng tiền</span>
        </ModalHeader>

        <ModalBody>
          {customerName && (
            <div className="mb-4 p-3 bg-default-100 rounded-lg">
              <span className="text-sm text-default-600">Khách hàng: </span>
              <span className="font-medium">{customerName}</span>
            </div>
          )}

          <div className="space-y-4">
            <Input
              isRequired
              classNames={{
                input: "text-right text-lg",
              }}
              endContent={
                <span className="text-default-500 text-sm font-medium">
                  VNĐ
                </span>
              }
              label="Số tiền đóng"
              placeholder="Nhập số tiền"
              size="lg"
              value={amount ? formatCurrency(amount) : ""}
              variant="bordered"
              onValueChange={handleAmountChange}
            />

            <div className="text-xs text-default-500 bg-default-50 p-3 rounded-lg">
              <p>
                Nhập số tiền khách trả — ghi nhận đúng số bạn nhập. Có thể đóng
                nhiều lần; mỗi lần mở lại form và nhập tiếp.
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button isDisabled={isLoading} variant="flat" onPress={handleClose}>
            Hủy
          </Button>
          <Button
            color="primary"
            isDisabled={!amount || Number(amount) <= 0 || isLoading}
            startContent={
              isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <DollarSign className="w-4 h-4" />
              )
            }
            onPress={handleSubmit}
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận đóng tiền"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SimplePaymentModal;
