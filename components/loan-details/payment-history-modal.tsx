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
import PaymentProgressCard from "./payment-progress-card";

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
  const [periods, setPeriods] = useState<TPaymentPeriod[]>([]);
  const [totalInterestPaid, setTotalInterestPaid] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentHistory();
      fetchPaymentProgress();
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
      }
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentProgress = async () => {
    try {
      const response = await fetch(`/api/loans/${loanId}/payment-progress`);
      
      if (!response.ok) {
        console.error("Failed to fetch payment progress:", response.status);
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        setPeriods(result.data.periods || []);
        setTotalInterestPaid(Number(result.data.cycle?.totalInterestPaid || 0));
      }
    } catch (error) {
      console.error("Failed to fetch payment progress:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <span>Lịch sử đóng lãi</span>
        </ModalHeader>
        <ModalBody>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Hiển thị lịch sử đóng lãi trước nếu có */}
              {payments.length > 0 && (
                <PaymentHistorySection
                  payments={payments}
                  totalInterestPaid={totalInterestPaid}
                />
              )}
              
              {/* Sau đó hiển thị payment progress */}
              {periods.length > 0 && (
                <PaymentProgressCard
                  periods={periods}
                  totalInterestPaid={totalInterestPaid}
                  cycleTitle="Kỳ hiện tại"
                />
              )}
              
              {/* Nếu không có gì thì hiển thị empty state */}
              {payments.length === 0 && periods.length === 0 && (
                <div className="text-center py-12 text-default-500">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Chưa có lịch sử đóng lãi</p>
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
