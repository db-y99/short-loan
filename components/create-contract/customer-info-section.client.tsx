"use client";

import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";

import type { TCreateContractForm } from "@/types/contracts.types";
import { formatNumberInput } from "@/lib/format";

type TProps = {
  form: TCreateContractForm;
  onChange: (field: keyof TCreateContractForm, value: string) => void;
};

const CustomerInfoSection = ({ form, onChange }: TProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Thông tin khách hàng</h3>
      <Divider />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          isRequired
          label="Họ tên"
          placeholder="Nguyễn Văn A"
          value={form.full_name}
          onValueChange={(v) => onChange("full_name", v)}
        />
        <Input
          isRequired
          label="Số CCCD"
          placeholder="001234567890"
          value={form.cccd}
          onValueChange={(v) => onChange("cccd", v)}
        />
        <Input
          isRequired
          label="Số điện thoại"
          placeholder="0901234567"
          type="tel"
          value={form.phone}
          onValueChange={(v) => onChange("phone", v)}
        />
        <Input
          label="Ngày cấp CCCD"
          placeholder="dd/mm/yyyy"
          type="date"
          value={form.cccd_issue_date}
          onValueChange={(v) => onChange("cccd_issue_date", v)}
        />
        <Input
          label="Nơi cấp"
          placeholder="Cục Cảnh sát QLHC về TTXH"
          value={form.cccd_issue_place}
          onValueChange={(v) => onChange("cccd_issue_place", v)}
        />
        <Input
          label="Link Facebook"
          placeholder="https://facebook.com/..."
          type="url"
          value={form.facebook_link}
          onValueChange={(v) => onChange("facebook_link", v)}
        />
        <Input
          label="Công việc"
          placeholder="Nhân viên văn phòng"
          value={form.job}
          onValueChange={(v) => onChange("job", v)}
        />
        <Input
          label="Thu nhập"
          placeholder="10.000.000"
          value={form.income}
          onValueChange={(v) => onChange("income", formatNumberInput(v))}
        />
      </div>
      <Input
        label="Địa chỉ"
        placeholder="123 Đường ABC, Quận 1, TP.HCM"
        value={form.address}
        onValueChange={(v) => onChange("address", v)}
      />
    </div>
  );
};

export default CustomerInfoSection;
