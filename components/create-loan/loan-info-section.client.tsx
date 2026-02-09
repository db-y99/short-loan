"use client";

import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Textarea } from "@heroui/input";
import { Divider } from "@heroui/divider";

import type { TCreateLoanForm } from "@/types/loan.types";
import { formatNumberInput } from "@/lib/format";
import {
  ASSET_TYPES,
  ASSET_TYPE_LABEL,
  LOAN_TYPES,
  LOAN_TYPE_LABEL,
} from "@/constants/loan";

type TProps = {
  form: TCreateLoanForm;
  onChange: (field: keyof TCreateLoanForm, value: string) => void;
};

const ASSET_TYPE_OPTIONS = Object.values(ASSET_TYPES).map((type) => ({
  key: type,
  label: ASSET_TYPE_LABEL[type],
}));

const LOAN_TYPE_OPTIONS = Object.values(LOAN_TYPES).map((type) => ({
  key: type,
  label: LOAN_TYPE_LABEL[type],
}));

const VEHICLE_TYPES: readonly string[] = [ASSET_TYPES.MOTORBIKE, ASSET_TYPES.CAR];
const DEVICE_TYPES: readonly string[] = [ASSET_TYPES.PHONE, ASSET_TYPES.LAPTOP];

const LoanInfoSection = ({ form, onChange }: TProps) => {
  const isVehicle = VEHICLE_TYPES.includes(form.asset_type);
  const isDevice = DEVICE_TYPES.includes(form.asset_type);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Thông tin khoản vay</h3>
      <Divider />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          isRequired
          label="Loại tài sản"
          placeholder="Chọn loại tài sản"
          selectedKeys={form.asset_type ? [form.asset_type] : []}
          onChange={(e) => onChange("asset_type", e.target.value)}
        >
          {ASSET_TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.key}>{option.label}</SelectItem>
          ))}
        </Select>

        <Input
          isRequired
          label="Tên tài sản"
          placeholder="Honda Wave RSX 2024"
          value={form.asset_name}
          onValueChange={(v) => onChange("asset_name", v)}
        />

        {/* Xe máy, Ô tô → Số khung, Số máy */}
        {isVehicle && (
          <>
            <Input
              label="Số khung"
              placeholder="Nhập số khung"
              value={form.chassis_number}
              onValueChange={(v) => onChange("chassis_number", v)}
            />
            <Input
              label="Số máy"
              placeholder="Nhập số máy"
              value={form.engine_number}
              onValueChange={(v) => onChange("engine_number", v)}
            />
          </>
        )}

        {/* Điện thoại, Laptop → IMEI, Serial */}
        {isDevice && (
          <>
            <Input
              label="IMEI"
              placeholder="Nhập số IMEI"
              value={form.imei}
              onValueChange={(v) => onChange("imei", v)}
            />
            <Input
              label="Serial"
              placeholder="Nhập số Serial"
              value={form.serial}
              onValueChange={(v) => onChange("serial", v)}
            />
          </>
        )}

        <Input
          isRequired
          label="Số tiền vay"
          placeholder="5.000.000"
          value={form.loan_amount}
          onValueChange={(v) => onChange("loan_amount", formatNumberInput(v))}
        />

        <Select
          isRequired
          label="Hình thức"
          placeholder="Chọn gói vay"
          selectedKeys={form.loan_type ? [form.loan_type] : []}
          onChange={(e) => onChange("loan_type", e.target.value)}
        >
          {LOAN_TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.key}>{option.label}</SelectItem>
          ))}
        </Select>
      </div>

      <Textarea
        label="Ghi chú"
        placeholder="Ghi chú thêm về hợp đồng..."
        value={form.notes}
        onValueChange={(v) => onChange("notes", v)}
      />
    </div>
  );
};

export default LoanInfoSection;
