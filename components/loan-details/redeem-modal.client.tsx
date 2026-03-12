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
import { Textarea } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Loader2, ShoppingCart, Info, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { addToast } from "@heroui/toast";
import { formatCurrencyVND } from "@/lib/format";
import ConfirmModal from "@/components/confirm-modal";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  loanAmount: number;
  loanType?: string; // Thêm loanType để phân biệt logic
  onSuccess?: () => void;
};

const RedeemModal = ({ isOpen, onClose, loanId, loanAmount, loanType, onSuccess }: TProps) => {
  const [principalAmount, setPrincipalAmount] = useState("");
  const [interestAmount, setInterestAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [totalInterestDue, setTotalInterestDue] = useState(0);
  const [totalInterestPaid, setTotalInterestPaid] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info" | "warning";
    text: string;
  } | null>(null);

  // Xác định loại gói
  const isInstallmentType = loanType === "installment_3_periods" || 
                            loanType?.includes("trả góp") || 
                            loanType?.includes("Gói 1");
  
  const isBulletPaymentType = loanType === "bullet_payment_by_milestone" || 
                              loanType === "bullet_payment_with_collateral_hold" ||
                              loanType?.includes("Gói 2") || 
                              loanType?.includes("Gói 3");

  // Reset form và fetch data khi mở modal
  useEffect(() => {
    if (isOpen) {
      // Gói 1: Không cần nhập tiền gốc riêng (đã bao gồm trong tổng 3 kỳ)
      // Gói 2, 3: Cần nhập tiền gốc
      if (isInstallmentType) {
        setPrincipalAmount("0"); // Gói 1 không cần gốc riêng
      } else {
        setPrincipalAmount(loanAmount.toLocaleString("vi-VN"));
      }
      setInterestAmount("");
      setNotes("");
      setMessage(null);
      fetchPaymentProgress();
    }
  }, [isOpen, loanAmount, loanId, isInstallmentType]);

  const fetchPaymentProgress = async () => {
    setIsLoadingProgress(true);
    try {
      const response = await fetch(`/api/loans/${loanId}/payment-progress`);
      
      if (!response.ok) {
        console.error("Failed to fetch payment progress:", response.status);
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        const paid = Number(result.data.cycle?.totalInterestPaid || 0);
        const periods = result.data.periods || [];
        
        let totalDue = 0;
        
        if (isInstallmentType) {
          // Gói 1: Tính tổng của cả 3 kỳ (Gốc + Lãi + Phí)
          totalDue = periods.reduce((sum: number, p: any) => {
            const feeAmount = Number(p.fee_amount || 0);
            const principalAmount = Number(p.principal || 0);
            return sum + principalAmount + feeAmount;
          }, 0);
        } else {
          // Gói 2, 3: Chỉ tính mốc hiện tại (Lãi + Phí)
          const today = new Date();
          const sortedPeriods = [...periods].sort((a: any, b: any) => 
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          );
          
          const currentPeriod = sortedPeriods.find((p: any) => new Date(p.due_date) >= today) 
            || sortedPeriods[sortedPeriods.length - 1];
          
          if (currentPeriod) {
            totalDue = Number(currentPeriod.fee_amount || 0);
          }
        }
        
        setTotalInterestPaid(paid);
        setTotalInterestDue(totalDue);
        
        // Auto-fill remaining interest
        const remaining = Math.max(0, totalDue - paid);
        if (remaining > 0) {
          setInterestAmount(remaining.toLocaleString("vi-VN"));
        }
      }
    } catch (error) {
      console.error("Failed to fetch payment progress:", error);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const formatNumber = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    if (!numericValue) return "";
    return Number(numericValue).toLocaleString("vi-VN");
  };

  const handlePrincipalChange = (value: string) => {
    const formatted = formatNumber(value);
    setPrincipalAmount(formatted);
  };

  const handleInterestChange = (value: string) => {
    const formatted = formatNumber(value);
    setInterestAmount(formatted);
  };

  const parseAmount = (formattedAmount: string): number => {
    return Number(formattedAmount.replace(/\./g, ""));
  };

  const handleSubmit = async () => {
    const numericPrincipal = parseAmount(principalAmount);
    const numericInterest = parseAmount(interestAmount);
    
    // Gói 1: Không cần kiểm tra gốc (đã bao gồm trong tổng 3 kỳ)
    if (!isInstallmentType) {
      if (!principalAmount || numericPrincipal <= 0) {
        setMessage({ type: "error", text: "Vui lòng nhập số tiền gốc hợp lệ" });
        return;
      }

      if (numericPrincipal !== loanAmount) {
        setMessage({ 
          type: "error", 
          text: `Số tiền gốc phải bằng ${formatCurrencyVND(loanAmount)}` 
        });
        return;
      }
    }

    if (!interestAmount || numericInterest < 0) {
      setMessage({ type: "error", text: isInstallmentType ? "Vui lòng nhập tổng tiền hợp lệ" : "Vui lòng nhập số tiền lãi hợp lệ" });
      return;
    }

    // Build confirm message
    const totalAmount = isInstallmentType ? numericInterest : (numericPrincipal + numericInterest);
    const remainingInterest = totalInterestDue - totalInterestPaid;
    
    let msg = "";
    
    if (isInstallmentType) {
      msg += `Tổng chuộc (cả 3 kỳ): ${formatCurrencyVND(numericInterest)}\n\n`;
    } else {
      msg += `Tiền gốc: ${formatCurrencyVND(numericPrincipal)}\n`;
      msg += `Tiền lãi: ${formatCurrencyVND(numericInterest)}\n`;
      msg += `Tổng cộng: ${formatCurrencyVND(totalAmount)}\n\n`;
    }
    
    if (numericInterest < remainingInterest) {
      msg += `⚠️ Lưu ý: Còn thiếu ${formatCurrencyVND(remainingInterest - numericInterest)}\n\n`;
    }
    
    msg += `Sau khi chuộc đồ, khoản vay sẽ chuyển sang trạng thái "Hoàn thành"`;

    setConfirmMessage(msg);
    setIsConfirmOpen(true);
  };

  const handleConfirmRedeem = async () => {
    const numericPrincipal = parseAmount(principalAmount);
    const numericInterest = parseAmount(interestAmount);
    const totalAmount = isInstallmentType ? numericInterest : (numericPrincipal + numericInterest);

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/loans/${loanId}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          principalAmount: isInstallmentType ? 0 : numericPrincipal, // Gói 1 không cần gốc riêng
          interestAmount: numericInterest,
          notes: notes.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        addToast({
          title: "Thành công",
          description: `Chuộc đồ thành công! Tổng: ${formatCurrencyVND(totalAmount)}`,
          color: "success",
        });
        
        // Close modal and refresh immediately
        setPrincipalAmount("");
        setInterestAmount("");
        setNotes("");
        setMessage(null);
        onClose();
        if (onSuccess) onSuccess();
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
      setPrincipalAmount("");
      setInterestAmount("");
      setNotes("");
      setMessage(null);
      onClose();
    }
  };

  const numericPrincipal = parseAmount(principalAmount);
  const numericInterest = parseAmount(interestAmount);
  const totalAmount = isInstallmentType ? numericInterest : (numericPrincipal + numericInterest);
  const remainingInterest = totalInterestDue - totalInterestPaid;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <span>Chuộc đồ</span>
          </div>
        </ModalHeader>
        <ModalBody>
          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400"
                  : message.type === "error"
                  ? "bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400"
                  : message.type === "warning"
                  ? "bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400"
                  : "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-4 h-4" />
              ) : message.type === "error" ? (
                <XCircle className="w-4 h-4" />
              ) : message.type === "warning" ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <Info className="w-4 h-4" />
              )}
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          {/* Payment Progress Summary */}
          {isLoadingProgress ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <Card shadow="sm">
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-default-600">Tổng lãi phải trả:</span>
                  <span className="font-semibold">{formatCurrencyVND(totalInterestDue)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-default-600">Đã đóng:</span>
                  <span className="font-semibold text-success">{formatCurrencyVND(totalInterestPaid)}</span>
                </div>
                <Divider />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-default-600 font-medium">Lãi còn thiếu:</span>
                  <span className={`font-bold ${remainingInterest > 0 ? 'text-warning' : 'text-success'}`}>
                    {formatCurrencyVND(remainingInterest)}
                  </span>
                </div>
              </CardBody>
            </Card>
          )}

          <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-primary-700 dark:text-primary-400">
                {isInstallmentType 
                  ? "Gói 1: Chuộc đồ = Tổng (Gốc + Lãi + Phí) của cả 3 kỳ (trừ phần đã thanh toán). Tổng 3 kỳ đã bao gồm cả gốc."
                  : "Chuộc đồ = Trả gốc + Trả lãi còn thiếu. Sau khi chuộc đồ, khoản vay sẽ hoàn thành."
                }
              </p>
            </div>
          </div>

          {/* Chỉ hiển thị input tiền gốc cho Gói 2, 3 */}
          {!isInstallmentType && (
            <Input
              label="Tiền gốc"
              placeholder="Nhập số tiền gốc"
              value={principalAmount}
              onValueChange={handlePrincipalChange}
              endContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">VNĐ</span>
                </div>
              }
              description={`Phải bằng số tiền vay: ${formatCurrencyVND(loanAmount)}`}
              isRequired
              isDisabled={isSubmitting}
            />
          )}

          <Input
            label={isInstallmentType ? "Tổng chuộc (Gốc + Lãi + Phí) cả 3 kỳ" : "Tiền lãi"}
            placeholder={isInstallmentType ? "Nhập tổng tiền" : "Nhập số tiền lãi"}
            value={interestAmount}
            onValueChange={handleInterestChange}
            endContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">VNĐ</span>
              </div>
            }
            description={remainingInterest > 0 ? `Còn thiếu: ${formatCurrencyVND(remainingInterest)}` : isInstallmentType ? "Đã thanh toán đủ" : "Đã đóng đủ lãi"}
            isRequired
            isDisabled={isSubmitting}
          />

          {/* Total Amount */}
          {totalAmount > 0 && (
            <Card shadow="sm" className="bg-gradient-to-r from-primary-50 to-success-50 dark:from-primary-900/20 dark:to-success-900/20">
              <CardBody>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tổng cộng:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrencyVND(totalAmount)}
                  </span>
                </div>
              </CardBody>
            </Card>
          )}

          <Textarea
            label="Ghi chú (tùy chọn)"
            placeholder="Ví dụ: Khách chuộc đồ, thanh toán đầy đủ..."
            value={notes}
            onValueChange={setNotes}
            minRows={2}
            isDisabled={isSubmitting}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={handleClose} isDisabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={isSubmitting || !interestAmount || (isInstallmentType ? false : !principalAmount)}
            startContent={
              isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )
            }
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận chuộc đồ"}
          </Button>
        </ModalFooter>
      </ModalContent>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Xác nhận chuộc đồ"
        message={confirmMessage}
        onConfirm={handleConfirmRedeem}
        confirmColor="success"
        confirmText="Xác nhận chuộc đồ"
        isLoading={isSubmitting}
      />
    </Modal>
  );
};

export default RedeemModal;
