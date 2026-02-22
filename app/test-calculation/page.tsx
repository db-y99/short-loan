"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { calculateLoan, formatMoney } from "@/lib/loan-calculation";
import { LOAN_TYPES, LOAN_TYPE_LABEL } from "@/constants/loan";

export default function TestCalculationPage() {
  const [loanAmount, setLoanAmount] = useState("10000000");
  const [loanType, setLoanType] = useState(LOAN_TYPES.INSTALLMENT_3_PERIODS);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    const amount = parseInt(loanAmount.replace(/\D/g, ""), 10);
    const calculationResult = calculateLoan(amount, loanType);
    setResult(calculationResult);
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">🧪 Test Loan Calculation</h1>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-semibold">Input</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Số tiền vay"
            value={loanAmount}
            onValueChange={setLoanAmount}
            placeholder="10000000"
          />

          <Select
            label="Gói vay"
            selectedKeys={[loanType]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setLoanType(selected as any);
            }}
          >
            {Object.entries(LOAN_TYPE_LABEL).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </Select>

          <Button color="primary" onPress={handleCalculate}>
            Tính toán
          </Button>
        </CardBody>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Kết quả</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <p className="text-sm text-default-600">Số tiền vay:</p>
              <p className="text-lg font-semibold">
                {formatMoney(result.loanAmount)}
              </p>
            </div>

            <div>
              <p className="text-sm text-default-600">Phí thẩm định:</p>
              <p className="text-lg font-semibold text-danger">
                {formatMoney(result.appraisalFee)}
              </p>
            </div>

            <div>
              <p className="text-sm text-default-600">Thực nhận:</p>
              <p className="text-lg font-semibold text-success">
                {formatMoney(result.netAmount)}
              </p>
            </div>

            {result.installments && (
              <div>
                <p className="text-sm text-default-600 mb-2">
                  Chi tiết trả góp:
                </p>
                {result.installments.map((period: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 mb-2 bg-default-100 rounded-lg"
                  >
                    <p className="font-semibold">Kỳ {period.period}</p>
                    <p className="text-sm">
                      Tiền gốc: {formatMoney(period.principal)}
                    </p>
                    <p className="text-sm">
                      Tiền lãi: {formatMoney(period.interest)}
                    </p>
                    <p className="text-sm">
                      Phí thuê: {formatMoney(period.rentalFee)}
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      Tổng: {formatMoney(period.total)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {result.bulletPayments && (
              <div>
                <p className="text-sm text-default-600 mb-2">Các mốc:</p>
                {result.bulletPayments.map((payment: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 mb-2 bg-default-100 rounded-lg"
                  >
                    <p className="font-semibold">
                      Mốc {payment.days} ngày ({(payment.rate * 100).toFixed(2)}
                      %)
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      Tổng chuộc: {formatMoney(payment.total)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
