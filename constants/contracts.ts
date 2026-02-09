import type {
  TActivityLogType,
  TContractStatus,
} from "@/types/contracts.types";
import type { ElementType } from "react";
import {
  MessageCircle,
  AlertCircle,
  Upload,
  CheckCircle2,
  FileText,
  FileSignature,
  Banknote,
} from "lucide-react";

export const CONTRACT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  DISBURSED: "disbursed",
  COMPLETED: "completed",
} as const;

export const CONTRACT_STATUS_LABEL: Record<TContractStatus, string> = {
  [CONTRACT_STATUS.PENDING]: "Chờ duyệt",
  [CONTRACT_STATUS.APPROVED]: "Đã duyệt",
  [CONTRACT_STATUS.REJECTED]: "Từ chối",
  [CONTRACT_STATUS.DISBURSED]: "Đã giải ngân",
  [CONTRACT_STATUS.COMPLETED]: "Hoàn thành",
} as const;

export const CONTRACT_STATUS_COLOR: Record<
  TContractStatus,
  "warning" | "success" | "danger" | "primary" | "default"
> = {
  [CONTRACT_STATUS.PENDING]: "warning",
  [CONTRACT_STATUS.APPROVED]: "success",
  [CONTRACT_STATUS.REJECTED]: "danger",
  [CONTRACT_STATUS.DISBURSED]: "primary",
  [CONTRACT_STATUS.COMPLETED]: "default",
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
  SEVEN_DAYS: "7_days",
  FIFTEEN_DAYS: "15_days",
  THIRTY_DAYS: "30_days",
  SIXTY_DAYS: "60_days",
  NINETY_DAYS: "90_days",
} as const;

export const LOAN_TYPE_LABEL: Record<string, string> = {
  [LOAN_TYPES.SEVEN_DAYS]: "Gói 7 ngày",
  [LOAN_TYPES.FIFTEEN_DAYS]: "Gói 15 ngày",
  [LOAN_TYPES.THIRTY_DAYS]: "Gói 30 ngày",
  [LOAN_TYPES.SIXTY_DAYS]: "Gói 60 ngày",
  [LOAN_TYPES.NINETY_DAYS]: "Gói 90 ngày",
} as const;

export const CONTRACT_TABLE_COLUMNS = [
  { key: "code", label: "Mã HĐ" },
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

export const ACTIVITY_ICON_MAP: Record<TActivityLogType, ElementType> = {
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
