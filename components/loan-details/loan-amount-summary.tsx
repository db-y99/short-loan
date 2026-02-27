import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Calculator } from "lucide-react";
import type { TLoanDetails } from "@/types/loan.types";
import { formatCurrencyVND } from "@/lib/format";
import SectionHeader from "@/components/section-header";
import { calculateAppraisalFee } from "@/lib/loan-calculation";
import { LOAN_TYPES, type TLoanType } from "@/constants/loan";

type TProps = {
  loanDetails: TLoanDetails;
};

const LoanAmountSummary = ({ loanDetails }: TProps) => {
  // Xác định loan type để tính phí thẩm định
  // Check tất cả các pattern có thể của loanType string
  let loanType: TLoanType = LOAN_TYPES.INSTALLMENT_3_PERIODS;
  
  const loanTypeStr = loanDetails.loanType.toLowerCase();
  
  // Gói 2: Gốc cuối kỳ / Trả lãi định kỳ / Theo mốc
  if (
    loanTypeStr.includes("gói 2") || 
    loanTypeStr.includes("theo mốc") ||
    loanTypeStr.includes("trả lãi định kỳ") ||
    loanTypeStr.includes("gốc cuối kỳ") && !loanTypeStr.includes("giữ")
  ) {
    loanType = LOAN_TYPES.BULLET_PAYMENT_BY_MILESTONE;
  } 
  // Gói 3: Giữ TS / Giữ tài sản
  else if (
    loanTypeStr.includes("gói 3") || 
    loanTypeStr.includes("giữ ts") ||
    loanTypeStr.includes("giữ tài sản")
  ) {
    loanType = LOAN_TYPES.BULLET_PAYMENT_WITH_COLLATERAL_HOLD;
  }

  // Tính phí thẩm định theo công thức mới
  const appraisalFee =
    loanDetails.appraisalFee ??
    calculateAppraisalFee(loanDetails.loanAmount, loanType);

  const actualAmount = loanDetails.loanAmount - appraisalFee;

  // Chỉ hiển thị phí thẩm định nếu > 0
  const showAppraisalFee = appraisalFee > 0;

  return (
    <Card shadow="sm" className="col-span-2">
      <CardHeader className="pb-2">
        <SectionHeader icon={Calculator} title="Thông tin số tiền" />
      </CardHeader>
      <CardBody className="pt-0 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-default-600">Số tiền vay:</span>
          <span className="text-base font-semibold text-default-900">
            {formatCurrencyVND(loanDetails.loanAmount)}
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
            {formatCurrencyVND(actualAmount)}
          </span>
        </div>

        {showAppraisalFee && (
          <p className="text-xs text-default-500 italic mt-2">
            * Phí thẩm định chỉ thu 1 lần đầu (áp dụng cho khoản vay ≥ 5 triệu
            đồng, Gói 1 & 2).
          </p>
        )}
      </CardBody>
    </Card>
  );
};

export default LoanAmountSummary;
