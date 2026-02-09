"use client";

import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";

import type { TCreateLoanForm } from "@/types/loan.types";

type TProps = {
  form: TCreateLoanForm;
  onChange: (field: keyof TCreateLoanForm, value: string) => void;
};

const BankInfoSection = ({ form, onChange }: TProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Thông tin ngân hàng</h3>
      <Divider />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Ngân hàng"
          placeholder="Vietcombank"
          value={form.bank_name}
          onValueChange={(v) => onChange("bank_name", v)}
        />
        <Input
          label="Chủ tài khoản"
          placeholder="NGUYEN VAN A"
          value={form.bank_account_holder}
          onValueChange={(v) => onChange("bank_account_holder", v)}
        />
        <Input
          label="Số tài khoản"
          placeholder="1234567890"
          value={form.bank_account_number}
          onValueChange={(v) => onChange("bank_account_number", v)}
        />
      </div>
    </div>
  );
};

export default BankInfoSection;
