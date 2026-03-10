"use client";

import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";

import type { TCreateLoanForm } from "@/types/loan.types";
import { formatNumberInput } from "@/lib/format";
import { DatePicker } from "@heroui/date-picker";
import { getLocalTimeZone, today } from "@internationalized/date";
import { CCCD_ISSUE_PLACE } from "@/constants/loan";

type TProps = {
  form: TCreateLoanForm;
  onChange: (field: keyof TCreateLoanForm, value: string) => void;
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
        <DatePicker
          label="Ngày cấp CCCD"
          showMonthAndYearPickers
          maxValue={today(getLocalTimeZone())}
          onChange={(date) => {
             if (!date) {
            onChange("cccd_issue_date", "");
            return;
          }

            // Chuyển sang ISO yyyy-mm-dd để lưu
          const isoDate = String(date); // DateValue có toString()
          onChange("cccd_issue_date", isoDate);

          // So sánh với 01/07/2024
          const cutoffDate = new Date("2024-07-01");
          const selectedDate = new Date(isoDate);

          if (selectedDate >= cutoffDate) {
            onChange("cccd_issue_place", CCCD_ISSUE_PLACE.MINISTRY_OF_PUBLIC_SECURITY);
          } else {
            onChange(
              "cccd_issue_place",
              CCCD_ISSUE_PLACE.POLICE_ADMIN
            );
          }
          }}
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
