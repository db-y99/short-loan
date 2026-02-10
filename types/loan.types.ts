export type TLoanStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "disbursed"
  | "completed";

/** Loan row từ DB (loans + customer full_name) - dùng cho danh sách */
export type TLoan = {
  id: string;
  code: string;
  creator: string;
  customer: string;
  asset: string;
  amount: number;
  loan_package: string | null;
  created_at: string;
  approved_at: string | null;
  status: TLoanStatus;
};

export type TReference = {
  id: string;
  full_name: string;
  phone: string;
  relationship: string;
};

export type TCreateLoanForm = {
  full_name: string;
  cccd: string;
  phone: string;
  cccd_issue_date: string;
  cccd_issue_place: string;
  address: string;
  facebook_link: string;
  job: string;
  income: string;
  bank_name: string;
  bank_account_holder: string;
  bank_account_number: string;
  asset_type: string;
  asset_name: string;
  chassis_number: string;
  engine_number: string;
  imei: string;
  serial: string;
  loan_amount: string;
  loan_type: string;
  notes: string;
  references: TReference[];
  attachments: File[];
};

// ==================== Contract Details Types ====================

export type TLoanFile = {
  id: string;
  name: string;
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

export type TLoanDetails = {
  id: string;
  code: string;
  signedAt: string;
  originalFileUrl?: string;
  notes: string;
  isSigned?: boolean;
  originalFiles?: TLoanFile[];

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

  loanAmount: number;
  loanType: string;
  appraisalFeePercentage?: number;
  appraisalFee?: number;

  references: TReference[];

  asset: {
    type: string;
    name: string;
    imei?: string;
    serial?: string;
    chassisNumber?: string;
    engineNumber?: string;
    images: string[];
  };

  bank: {
    name: string;
    accountNumber: string;
    accountHolder: string;
  };

  currentPeriod: TPaymentPeriod;
  nextPeriod: TPaymentPeriod;

  status: TLoanStatus;
  statusMessage?: string;

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
