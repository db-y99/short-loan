import { z } from "zod";
import { ASSET_TYPES, LOAN_TYPES } from "@/constants/loan";
import { parseFormattedNumber } from "@/lib/format";

const ReferenceSchema = z.object({
  full_name: z.string(),
  phone: z.string(),
  relationship: z.string().optional().nullable(),
});

export const CreateLoanSchema = z
  .object({
    full_name: z.string().min(1, "Họ tên không được để trống"),
    cccd: z.string().min(1, "Số CCCD không được để trống"),
    phone: z.string().min(1, "Số điện thoại không được để trống"),
    cccd_issue_date: z.string().optional(),
    cccd_issue_place: z.string().optional(),
    address: z.string().min(1, "Địa chỉ không được để trống"),
    facebook_link: z.string().optional(),
    job: z.string().optional(),
    income: z.string().optional(),

    bank_name: z.string().optional(),
    bank_account_holder: z.string().optional(),
    bank_account_number: z.string().optional(),

    asset_type: z
      .string()
      .min(1, "Vui lòng chọn loại tài sản")
      .refine(
        (v) =>
          Object.values(ASSET_TYPES).includes(
            v as (typeof ASSET_TYPES)[keyof typeof ASSET_TYPES],
          ),
        "Loại tài sản không hợp lệ",
      ),
    asset_name: z.string().min(1, "Tên tài sản không được để trống"),
    chassis_number: z.string().optional(),
    engine_number: z.string().optional(),
    imei: z.string().optional(),
    serial: z.string().optional(),
    loan_amount: z.string().min(1, "Số tiền vay không được để trống"),
    loan_type: z
      .string()
      .min(1, "Vui lòng chọn hình thức vay")
      .refine(
        (v) =>
          Object.values(LOAN_TYPES).includes(
            v as (typeof LOAN_TYPES)[keyof typeof LOAN_TYPES],
          ),
        "Hình thức vay không hợp lệ",
      ),
    notes: z.string().optional(),

    references: z.array(ReferenceSchema).optional().default([]),
  })
  .refine((data) => parseFormattedNumber(data.loan_amount) > 0, {
    message: "Số tiền vay phải lớn hơn 0",
    path: ["loan_amount"],
  });

export type CreateLoanInput = z.infer<typeof CreateLoanSchema>;
