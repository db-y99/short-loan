"use client";

import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Calculator, Calendar, Clock } from "lucide-react";
import { useMemo } from "react";
import type { TCreateLoanForm, TPaymentMilestone } from "@/types/loan.types";
import { formatCurrencyVND, parseFormattedNumber } from "@/lib/format";
import { calculateLoan } from "@/lib/loan-calculation";
import { LOAN_TYPES, type TLoanType } from "@/constants/loan";
import SectionHeader from "@/components/section-header";
import PaymentTable from "@/components/loan-details/payment-table";

type TProps = {
  form: TCreateLoanForm;
};

const LoanPreviewSection = ({ form }: TProps) => {
  const previewData = useMemo(() => {
    // Chỉ hiển thị preview khi có đủ thông tin cơ bản
    if (!form.loan_amount || !form.loan_type) {
      return null;
    }

    try {
      const loanAmount = parseFormattedNumber(form.loan_amount);
      const loanType = form.loan_type as TLoanType;
      
      if (loanAmount <= 0) return null;

      const result = calculateLoan(loanAmount, loanType);
      
      // Tạo mock milestones cho current period
      const currentMilestones: (TPaymentMilestone & { principal?: number })[] = result.bulletPayments?.map((payment, index) => ({
        days: payment.days,
        date: new Date(Date.now() + payment.days * 24 * 60 * 60 * 1000).toISOString(),
        interestAndFee: payment.interest + payment.rentalFee,
        totalRedemption: payment.total,
      })) || result.installments?.map((installment, index) => ({
        days: installment.dueDay,
        date: new Date(Date.now() + installment.dueDay * 24 * 60 * 60 * 1000).toISOString(),
        interestAndFee: installment.interest + installment.rentalFee,
        totalRedemption: installment.total,
        principal: installment.principal, // Thêm thông tin gốc cho gói 1
      })) || [];

      // Next period milestones (chỉ cho bullet payments - gói 2 & 3)
      const nextMilestones: TPaymentMilestone[] = result.bulletPayments?.map((payment, index) => ({
        days: payment.days,
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + payment.days * 24 * 60 * 60 * 1000).toISOString(),
        interestAndFee: payment.interest + payment.rentalFee,
        totalRedemption: loanAmount + payment.interest + payment.rentalFee, // Gốc + lãi (không chuộc gốc)
      })) || [];

      return {
        ...result,
        currentMilestones,
        nextMilestones,
        isInstallment: loanType === LOAN_TYPES.INSTALLMENT_3_PERIODS,
      };
    } catch (error) {
      console.error("Error calculating loan preview:", error);
      return null;
    }
  }, [form.loan_amount, form.loan_type]);

  if (!previewData) {
    return null;
  }

  const { loanAmount, appraisalFee, netAmount, currentMilestones, nextMilestones, isInstallment } = previewData;
  const showAppraisalFee = appraisalFee > 0;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Dự kiến thanh toán</h3>
      <Divider />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Loan Amount Summary */}
        <Card shadow="sm">
          <CardHeader className="pb-2">
            <SectionHeader icon={Calculator} title="Thông tin số tiền" />
          </CardHeader>
          <CardBody className="pt-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-default-600">Số tiền vay:</span>
              <span className="text-base font-semibold text-default-900">
                {formatCurrencyVND(loanAmount)}
              </span>
            </div>

            {showAppraisalFee && (
              <>
                <Divider />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-default-600">
                    Phí thẩm định (5%):
                  </span>
                  <span className="text-base font-semibold text-danger">
                    -{formatCurrencyVND(appraisalFee)}
                  </span>
                </div>
              </>
            )}

            <Divider />

            <div className="flex items-center justify-between p-3 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800">
              <span className="text-sm font-semibold text-success-700 dark:text-success-400">
                THỰC NHẬN:
              </span>
              <span className="text-lg font-bold text-success-700 dark:text-success-400">
                {formatCurrencyVND(netAmount)}
              </span>
            </div>

            {showAppraisalFee && (
              <p className="text-xs text-default-500 italic mt-2">
                * Phí thẩm định chỉ thu 1 lần đầu (áp dụng cho khoản vay ≥ 5 triệu đồng, Gói 1 & 2).
              </p>
            )}
          </CardBody>
        </Card>

        {/* Current Period */}
        <Card shadow="sm">
          <CardHeader className="pb-2">
            <SectionHeader icon={Clock} title="Lịch thanh toán dự kiến" />
          </CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-3">
              {currentMilestones.map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-default-50 dark:bg-default-900/20 rounded-lg"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      {isInstallment ? `Kỳ ${index + 1}` : `Mốc ${milestone.days}`}
                    </span>
                    <span className="text-xs text-default-500">
                      {new Date(milestone.date).toLocaleDateString('vi-VN')} (Ngày {milestone.days})
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {formatCurrencyVND(milestone.totalRedemption)}
                    </div>
                    {isInstallment && milestone.principal ? (
                      <div className="text-xs text-default-500">
                        Gốc: {formatCurrencyVND(milestone.principal)} | Lãi: {formatCurrencyVND(milestone.interestAndFee)}
                      </div>
                    ) : (
                      <div className="text-xs text-default-500">
                        Lãi: {formatCurrencyVND(milestone.interestAndFee)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Tổng cộng cho gói 1 */}
              {isInstallment && currentMilestones.length > 0 && (
                <>
                  <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800 mt-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">
                        TỔNG CỘNG
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-primary-700 dark:text-primary-400">
                        {formatCurrencyVND(currentMilestones.reduce((sum, m) => sum + m.totalRedemption, 0))}
                      </div>
                    </div>
                  </div>
                  
               
                </>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Next Period - chỉ hiển thị cho gói 2 và 3 */}
      {!isInstallment && nextMilestones.length > 0 && (
        <Card shadow="sm" className="mt-4">
          <CardHeader className="pb-2">
            <SectionHeader icon={Calendar} title="Kỳ kế tiếp" />
          </CardHeader>
          <CardBody className="pt-0">
            <p className="text-sm text-default-500 mb-3">
              Nếu gia hạn (Đóng lãi ngày 30)
            </p>
            <PaymentTable milestones={nextMilestones} />
          </CardBody>
        </Card>
      )}

      <div className="p-2 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
        <p className="text-xs text-warning-700 dark:text-warning-400">
          {isInstallment 
            ? "* Lãi Cầm Cố: 0.033%/ngày (theo luật). Phần còn lại là Phí Thuê TS."
            : "* Ngày bắt đầu Kỳ kế tiếp = Ngày đến hạn 30 ngày của Kỳ hiện tại."
          }
        </p>
      </div>
    </div>
  );
};

export default LoanPreviewSection;