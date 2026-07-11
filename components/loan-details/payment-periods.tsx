"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { Clock, Calendar, History, MessageSquare } from "lucide-react";

import type { TLoanDetails } from "@/types/loan.types";
import { LOAN_STATUS, LOAN_TYPES } from "@/constants/loan";
import PaymentTable from "@/components/loan-details/payment-table";
import SectionHeader from "@/components/section-header";

type TPaymentTransaction = {
  id: string;
  amount: number;
  transaction_type: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  created_by_user?: {
    id: string;
    email: string;
    full_name?: string;
  } | null;
};

type TProps = {
  loanDetails: TLoanDetails;
  refreshKey?: number;
  onOpenPaymentHistory?: () => void; // Thêm callback để mở modal
};

const PaymentPeriods = ({ loanDetails, refreshKey, onOpenPaymentHistory }: TProps) => {
  const [payments, setPayments] = useState<TPaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (
      loanDetails.id &&
      (loanDetails.status === LOAN_STATUS.DISBURSED ||
        loanDetails.status === LOAN_STATUS.REDEEMED ||
        loanDetails.status === LOAN_STATUS.COMPLETED)
    ) {
      fetchPaymentHistory();
    }
  }, [loanDetails.id, loanDetails.status, refreshKey]); // Thêm refreshKey vào dependencies

  console.log({payments})

  const fetchPaymentHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/loans/${loanDetails.id}/payment-history`);
      
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

  // Nếu không có payment periods, không hiển thị
  if (!loanDetails.currentPeriod || !loanDetails.nextPeriod) {
    console.log('PaymentPeriods - Missing data:', {
      hasCurrentPeriod: !!loanDetails.currentPeriod,
      hasNextPeriod: !!loanDetails.nextPeriod,
      currentPeriod: loanDetails.currentPeriod,
      nextPeriod: loanDetails.nextPeriod
    });
    return null;
  }

  console.log('PaymentPeriods - Rendering with:', {
    paymentsCount: payments.length,
    currentPeriodMilestones: loanDetails.currentPeriod.milestones?.length,
    nextPeriodMilestones: loanDetails.nextPeriod.milestones?.length
  });


  // Kiểm tra xem có phải gói 1 không (Gói 1 chỉ có 1 kỳ thanh toán)
  const isPackage1 = loanDetails.loanType === LOAN_TYPES.INSTALLMENT_3_PERIODS;
  
  // Kiểm tra xem có phải gói 3 không (Gốc cuối kỳ + Giữ TS)
  const isPackage3 = loanDetails.loanType === LOAN_TYPES.BULLET_PAYMENT_WITH_COLLATERAL_HOLD;

  return (
    <div className="col-span-2 grid grid-cols-1 gap-4">
      {/* Button xem lịch sử đóng tiền - hiển thị nếu có payments */}
      {payments.length > 0 && onOpenPaymentHistory && (
        <Button
          color="default"
          variant="flat"
          className="w-full"
          size="md"
          startContent={<MessageSquare size={16} />}
          onPress={onOpenPaymentHistory}
        >
          Xem lịch sử đóng tiền ({payments.length})
        </Button>
      )}

      {/* Lịch sử đóng tiền - hiển thị nếu có payments */}
      {payments.length > 0 && (
        <Card shadow="sm" className="border-2 border-success-200 dark:border-success-800">
          <CardHeader className="pb-2">
            <SectionHeader icon={History} title="🔄 LỊCH SỬ ĐÓNG TIỀN" />
          </CardHeader>
          <CardBody className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-default-200">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-default-600">THỜI GIAN</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-default-600">LOẠI</th>
                    <th className="text-right py-2 px-3 text-sm font-semibold text-default-600">SỐ TIỀN</th>
                    <th className="text-right py-2 px-3 text-sm font-semibold text-default-600">NHÂN VIÊN</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const date = new Date(payment.created_at);
                    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                    
                    // Lấy tên nhân viên từ user info
                    const userName = payment.created_by_user?.full_name 
                      || payment.created_by_user?.email?.split('@')[0] 
                      || 'N/A';
                    
                    // Định nghĩa loại thanh toán
                    const getPaymentTypeLabel = (type: string) => {
                      switch (type) {
                        case 'interest_payment':
                          return '💰 Đóng lãi';
                        case 'principal_payment':
                          return '🏦 Đóng gốc';
                        case 'fee_payment':
                          return '💸 Đóng phí';
                        case 'penalty_payment':
                          return '⚠️ Phạt';
                        default:
                          return '💳 Thanh toán';
                      }
                    };
                    
                    return (
                      <tr key={payment.id} className="border-b border-default-100 hover:bg-default-50">
                        <td className="py-2 px-3 text-sm">{formattedDate}</td>
                        <td className="py-2 px-3 text-sm">
                          <span className="text-xs bg-default-100 px-2 py-1 rounded-full">
                            {getPaymentTypeLabel(payment.transaction_type)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-sm text-right font-semibold text-success-600">
                          {Number(payment.amount).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-2 px-3 text-sm text-right text-default-600">
                          {userName}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Kỳ hiện tại */}
      <Card shadow="sm">
        <CardHeader className="pb-2">
          <SectionHeader icon={Clock} title={loanDetails.currentPeriod.title} />
        </CardHeader>
        <CardBody className="pt-0">
          {loanDetails.currentPeriod.subtitle && (
            <p className="text-sm text-default-500 mb-3">
              {loanDetails.currentPeriod.subtitle}
            </p>
          )}
          <PaymentTable 
            milestones={loanDetails.currentPeriod.milestones} 
            showTotal={isPackage1}
            showPrincipal={isPackage1}
            showDetailedBreakdown={isPackage3}
          />
        </CardBody>
      </Card>

      {/* Kỳ kế tiếp - chỉ hiển thị nếu không phải gói 1 */}
      {!isPackage1 && (
        <Card shadow="sm">
          <CardHeader className="pb-2">
            <SectionHeader icon={Calendar} title={loanDetails.nextPeriod.title} />
          </CardHeader>
          <CardBody className="pt-0">
            {loanDetails.nextPeriod.subtitle && (
              <p className="text-sm text-default-500 mb-3">
                {loanDetails.nextPeriod.subtitle}
              </p>
            )}
            {loanDetails.nextPeriod.milestones && loanDetails.nextPeriod.milestones.length > 0 ? (
              <PaymentTable 
                milestones={loanDetails.nextPeriod.milestones}
                showDetailedBreakdown={isPackage3}
              />
            ) : (
              <p className="text-sm text-default-400">Không có dữ liệu kỳ kế tiếp</p>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default PaymentPeriods;
