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
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Loader2, History, Calendar, CreditCard, FileText, DollarSign } from "lucide-react";
import { formatCurrencyVND } from "@/lib/format";

type TPaymentTransaction = {
  id: string;
  amount: number;
  transaction_type: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
};

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
};

const PaymentHistoryModal = ({ isOpen, onClose, loanId }: TProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [payments, setPayments] = useState<TPaymentTransaction[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentHistory();
    }
  }, [isOpen, loanId]);

  const fetchPaymentHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/loans/${loanId}/payment-history`);
      
      if (!response.ok) {
        console.error("Failed to fetch payment history:", response.status);
        return;
      }

      const result = await response.json();

      if (result.success) {
        setPayments(result.data || []);
        // Tính tổng tiền đã đóng
        const total = (result.data || []).reduce((sum: number, p: TPaymentTransaction) => sum + Number(p.amount), 0);
        setTotalPaid(total);
      }
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "interest_payment":
        return "Đóng lãi";
      case "principal_payment":
        return "Đóng gốc";
      case "redemption":
        return "Chuộc đồ";
      default:
        return "Thanh toán";
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "interest_payment":
        return "primary";
      case "principal_payment":
        return "success";
      case "redemption":
        return "warning";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <span>Lịch sử thanh toán</span>
        </ModalHeader>
        <ModalBody>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tổng kết */}
              {payments.length > 0 && (
                <Card className="bg-gradient-to-r from-success-50 to-primary-50 dark:from-success-900/20 dark:to-primary-900/20">
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-success" />
                        <span className="font-medium">Tổng đã thanh toán:</span>
                      </div>
                      <span className="text-xl font-bold text-success">
                        {formatCurrencyVND(totalPaid)}
                      </span>
                    </div>
                    <p className="text-sm text-default-600 mt-1">
                      Từ {payments.length} giao dịch
                    </p>
                  </CardBody>
                </Card>
              )}

              {/* Danh sách giao dịch */}
              {payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment, index) => (
                    <Card key={payment.id} shadow="sm" className="hover:shadow-md transition-shadow">
                      <CardBody className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Chip
                                color={getTransactionTypeColor(payment.transaction_type)}
                                size="sm"
                                variant="flat"
                              >
                                {getTransactionTypeLabel(payment.transaction_type)}
                              </Chip>
                              <span className="text-lg font-semibold text-success">
                                {formatCurrencyVND(payment.amount)}
                              </span>
                            </div>
                            
                            <div className="space-y-1 text-sm text-default-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(payment.created_at)}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                <span>{payment.payment_method || "Tiền mặt"}</span>
                              </div>
                              
                              {payment.notes && (
                                <div className="flex items-start gap-2">
                                  <FileText className="w-4 h-4 mt-0.5" />
                                  <span className="italic">{payment.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right text-sm text-default-500">
                            #{index + 1}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-default-500">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-1">Chưa có giao dịch nào</p>
                  <p className="text-sm">Lịch sử thanh toán sẽ hiển thị tại đây</p>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Đóng
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PaymentHistoryModal;
