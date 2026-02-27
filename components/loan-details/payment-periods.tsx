"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Clock, Calendar, History } from "lucide-react";

import type { TLoanDetails } from "@/types/loan.types";
import { LOAN_STATUS } from "@/constants/loan";
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
    raw_user_meta_data?: {
      full_name?: string;
    };
  };
};

type TProps = {
  loanDetails: TLoanDetails;
  refreshKey?: number; // Thêm key để force refresh
};

const PaymentPeriods = ({ loanDetails, refreshKey }: TProps) => {
  const [payments, setPayments] = useState<TPaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (loanDetails.id && loanDetails.status === LOAN_STATUS.DISBURSED) {
      fetchPaymentHistory();
    }
  }, [loanDetails.id, loanDetails.status, refreshKey]); // Thêm refreshKey vào dependencies

  const fetchPaymentHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/loans/${loanDetails.id}/pay-interest`);
      
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

  // Tính tổng tiền đã đóng lãi
  const totalInterestPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="col-span-2 grid grid-cols-1 gap-4">
      {/* Lịch sử đóng lãi - hiển thị nếu có payments */}
      {payments.length > 0 && (
        <Card shadow="sm" className="border-2 border-success-200 dark:border-success-800">
          <CardHeader className="pb-2">
            <SectionHeader icon={History} title="🔄 LỊCH SỬ ĐÓNG LÃI" />
          </CardHeader>
          <CardBody className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-default-200">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-default-600">THỜI GIAN</th>
                    <th className="text-right py-2 px-3 text-sm font-semibold text-default-600">SỐ TIỀN</th>
                    <th className="text-right py-2 px-3 text-sm font-semibold text-default-600">NHÂN VIÊN</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const date = new Date(payment.created_at);
                    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                    
                    // Lấy tên nhân viên từ user info
                    const userName = payment.created_by_user?.raw_user_meta_data?.full_name 
                      || payment.created_by_user?.email?.split('@')[0] 
                      || 'N/A';
                    
                    return (
                      <tr key={payment.id} className="border-b border-default-100 hover:bg-default-50">
                        <td className="py-2 px-3 text-sm">{formattedDate}</td>
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

      {/* Đã cập nhật theo lịch đóng lãi (Kỳ 2) */}
      {payments.length > 0 && (
        <Card shadow="sm" className="bg-success-50 dark:bg-success-900/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <span className="text-success-600 dark:text-success-400">✅ Đã cập nhật theo lịch đóng lãi (Kỳ 2):</span>
            </div>
          </CardHeader>
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
          <PaymentTable milestones={loanDetails.currentPeriod.milestones} />
        </CardBody>
      </Card>

      {/* Kỳ kế tiếp */}
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
            <PaymentTable milestones={loanDetails.nextPeriod.milestones} />
          ) : (
            <p className="text-sm text-default-400">Không có dữ liệu kỳ kế tiếp</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default PaymentPeriods;
