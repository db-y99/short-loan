import type { TActivityLogType, TLoanStatus } from "@/types/loan.types";
import {
  MessageCircle,
  AlertCircle,
  Upload,
  CheckCircle2,
  FileText,
  FileSignature,
  Banknote,
  type LucideIcon,
} from "lucide-react";

export const LOAN_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  DISBURSED: "disbursed",
  COMPLETED: "completed",
} as const;

export const LOAN_STATUS_LABEL: Record<TLoanStatus, string> = {
  [LOAN_STATUS.PENDING]: "Chờ duyệt",
  [LOAN_STATUS.APPROVED]: "Đã duyệt",
  [LOAN_STATUS.REJECTED]: "Từ chối",
  [LOAN_STATUS.DISBURSED]: "Đã giải ngân",
  [LOAN_STATUS.COMPLETED]: "Hoàn thành",
} as const;

export const LOAN_STATUS_COLOR: Record<
  TLoanStatus,
  "warning" | "success" | "danger" | "primary" | "default"
> = {
  [LOAN_STATUS.PENDING]: "warning",
  [LOAN_STATUS.APPROVED]: "success",
  [LOAN_STATUS.REJECTED]: "danger",
  [LOAN_STATUS.DISBURSED]: "primary",
  [LOAN_STATUS.COMPLETED]: "default",
} as const;

export const ASSET_TYPES = {
  MOTORBIKE: "motorbike",
  CAR: "car",
  LAPTOP: "laptop",
  PHONE: "phone",
  JEWELRY: "jewelry",
  OTHER: "other",
} as const;

export const ASSET_TYPE_LABEL: Record<string, string> = {
  [ASSET_TYPES.MOTORBIKE]: "Xe máy",
  [ASSET_TYPES.CAR]: "Ô tô",
  [ASSET_TYPES.LAPTOP]: "Laptop",
  [ASSET_TYPES.PHONE]: "Điện thoại",
  [ASSET_TYPES.JEWELRY]: "Vàng/Trang sức",
  [ASSET_TYPES.OTHER]: "Khác",
} as const;

export const LOAN_TYPES = {
  INSTALLMENT_3_PERIODS: "installment_3_periods",
  BULLET_PAYMENT_BY_MILESTONE: "bullet_payment_by_milestone",
  BULLET_PAYMENT_WITH_COLLATERAL_HOLD: "bullet_payment_with_collateral_hold",
} as const;

export type TLoanType = (typeof LOAN_TYPES)[keyof typeof LOAN_TYPES];

export const LOAN_TYPE_LABEL: Record<TLoanType, string> = {
  [LOAN_TYPES.INSTALLMENT_3_PERIODS]: "Gói 1: Vay trả góp (3 kỳ)",
  [LOAN_TYPES.BULLET_PAYMENT_BY_MILESTONE]: "Gói 2: Gốc cuối kỳ (Theo mốc)",
  [LOAN_TYPES.BULLET_PAYMENT_WITH_COLLATERAL_HOLD]:
    "Gói 3: Gốc cuối kỳ + Giữ TS",
} as const;

export const LOANS_TABLE_COLUMNS = [
  { key: "code", label: "Mã khoản vay" },
  { key: "creator", label: "Người tạo" },
  { key: "customer", label: "Khách hàng" },
  { key: "asset", label: "Tài sản" },
  { key: "amount", label: "Số tiền" },
  { key: "loan_package", label: "Gói vay" },
  { key: "created_at", label: "Thời gian tạo" },
  { key: "approved_at", label: "Thời gian duyệt" },
  { key: "status", label: "Trạng thái" },
] as const;

/** Activity log entry types - dùng constants thay vì hardcode string */
export const ACTIVITY_LOG_TYPE = {
  MESSAGE: "message",
  SYSTEM_EVENT: "system_event",
  IMAGE_UPLOAD: "image_upload",
  APPROVAL: "approval",
  CONTRACT_CREATED: "contract_created",
  CONTRACT_SIGNED: "contract_signed",
  DISBURSEMENT: "disbursement",
} as const;

/** Activity types considered "system" (icon/style khác message) */
export const ACTIVITY_SYSTEM_TYPES = [
  ACTIVITY_LOG_TYPE.SYSTEM_EVENT,
  ACTIVITY_LOG_TYPE.APPROVAL,
  ACTIVITY_LOG_TYPE.CONTRACT_CREATED,
  ACTIVITY_LOG_TYPE.CONTRACT_SIGNED,
  ACTIVITY_LOG_TYPE.DISBURSEMENT,
] as const;

export const ACTIVITY_ICON_MAP: Record<TActivityLogType, LucideIcon> = {
  [ACTIVITY_LOG_TYPE.MESSAGE]: MessageCircle,
  [ACTIVITY_LOG_TYPE.SYSTEM_EVENT]: AlertCircle,
  [ACTIVITY_LOG_TYPE.IMAGE_UPLOAD]: Upload,
  [ACTIVITY_LOG_TYPE.APPROVAL]: CheckCircle2,
  [ACTIVITY_LOG_TYPE.CONTRACT_CREATED]: FileText,
  [ACTIVITY_LOG_TYPE.CONTRACT_SIGNED]: FileSignature,
  [ACTIVITY_LOG_TYPE.DISBURSEMENT]: Banknote,
};

export const ACTIVITY_COLOR_MAP: Record<TActivityLogType, string> = {
  [ACTIVITY_LOG_TYPE.MESSAGE]: "text-primary",
  [ACTIVITY_LOG_TYPE.SYSTEM_EVENT]: "text-secondary",
  [ACTIVITY_LOG_TYPE.IMAGE_UPLOAD]: "text-warning",
  [ACTIVITY_LOG_TYPE.APPROVAL]: "text-success",
  [ACTIVITY_LOG_TYPE.CONTRACT_CREATED]: "text-secondary",
  [ACTIVITY_LOG_TYPE.CONTRACT_SIGNED]: "text-success",
  [ACTIVITY_LOG_TYPE.DISBURSEMENT]: "text-success",
};
