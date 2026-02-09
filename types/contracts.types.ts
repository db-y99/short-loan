export type TContractStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "disbursed"
  | "completed";

export type TContract = {
  id: string;
  code: string;
  creator: string;
  customer: string;
  asset: string;
  amount: number;
  loan_package: string;
  created_at: string;
  approved_at: string | null;
  status: TContractStatus;
};

export type TReference = {
  id: string;
  full_name: string;
  phone: string;
  relationship: string;
};

export type TCreateContractForm = {
  // Customer info
  full_name: string;
  cccd: string;
  phone: string;
  cccd_issue_date: string;
  cccd_issue_place: string;
  address: string;
  facebook_link: string;
  job: string;
  income: string;
  // Bank info
  bank_name: string;
  bank_account_holder: string;
  bank_account_number: string;
  // Loan info
  asset_type: string;
  asset_name: string;
  // Vehicle fields (xe máy, ô tô)
  chassis_number: string;
  engine_number: string;
  // Device fields (điện thoại, laptop)
  imei: string;
  serial: string;
  loan_amount: string;
  loan_type: string;
  notes: string;
  // References
  references: TReference[];
  // Attachments
  attachments: File[];
};

// ==================== Contract Details Types ====================

export type TContractFile = {
  id: string;
  name: string; // "HĐ Chính", "XN Đủ Tiền", "UQ Xử Lý", "HD Thuê"
  url: string;
};

export type TPaymentMilestone = {
  days: number;
  date: string;
  interestAndFee: number;
  totalRedemption: number;
};

export type TPaymentPeriod = {
  title: string;
  subtitle?: string;
  milestones: TPaymentMilestone[];
};

export type TContractDetails = {
  // Contract info
  id: string;
  code: string;
  signedAt: string;
  originalFileUrl?: string;
  notes: string;
  isSigned?: boolean; // Hợp đồng đã được ký kết
  originalFiles?: TContractFile[]; // File Gốc (Soạn thảo)

  // Customer info
  customer: {
    fullName: string;
    cccd: string;
    phone: string;
    address: string;
    cccdIssueDate: string;
    cccdIssuePlace: string;
    facebookUrl?: string;
    job: string;
    income: number;
  };

  // Loan info
  loanAmount: number;
  loanType: string;
  appraisalFeePercentage?: number; // Phần trăm phí thẩm định (mặc định 5%)
  appraisalFee?: number; // Phí thẩm định (nếu không có thì tính từ loanAmount * appraisalFeePercentage)

  // Reference contacts
  references: TReference[];

  // Asset info
  asset: {
    type: string;
    name: string;
    imei?: string;
    serial?: string;
    chassisNumber?: string;
    engineNumber?: string;
    images: string[];
  };

  // Bank info
  bank: {
    name: string;
    accountNumber: string;
    accountHolder: string;
  };

  // Payment periods
  currentPeriod: TPaymentPeriod;
  nextPeriod: TPaymentPeriod;

  // Status
  status: TContractStatus;
  statusMessage?: string;

  // Activity log (Trao đổi & Nhật ký)
  activityLog?: TActivityLogEntry[];
};

// ==================== Activity Log Types ====================

export type TActivityLogType =
  | "message"
  | "system_event"
  | "image_upload"
  | "approval"
  | "contract_created"
  | "contract_signed"
  | "disbursement";

export type TActivityLogEntry = {
  id: string;
  type: TActivityLogType;
  userId: string;
  userName: string;
  timestamp: string;
  content?: string;
  images?: string[];
  links?: string[];
  systemMessage?: string;
  mentions?: string[];
};
