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
import { Loader2, History } from "lucide-react";
import PaymentHistorySection from "./payment-history-section";

type TPaymentTransaction = {
  id: string;
  amount: number;
  transaction_type: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
};

type TPaymentPeriod = {
  milestone_day: number;
  fee_amount: number;
  status: string;
};

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
};

const PaymentHistoryModal = ({ isOpen, onClose, loanId }: TProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [payments, setPayments] = useState<TPaymentTransaction[]>([]);
  const [totalInterestPaid, setTotalInterestPaid] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentHistory();
    }
  }, [isOpen, loanId]);

  const fetchPaymentHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/loans/${loanId}/pay-interest`);
      
      if (!response.ok) {
        console.error("Failed to fetch payment history:", response.status);
        return;
      }

      const result = await response.json();

      if (result.success) {
        setPayments(result.data || []);
        // Tính tổng tiền đã đóng
        const total = (result.data || []).reduce((sum: number, p: TPaymentTransaction) => sum + Number(p.amount), 0);
        setTotalInterestPaid(total);
      }
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <span>Lịch sử đóng tiền</span>
        </ModalHeader>
        <ModalBody>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Hiển thị lịch sử đóng tiền */}
              {payments.length > 0 ? (
                <PaymentHistorySection
                  payments={payments}
                  totalInterestPaid={totalInterestPaid}
                />
              ) : (
                <div className="text-center py-12 text-default-500">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Chưa có lịch sử đóng tiền</p>
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
