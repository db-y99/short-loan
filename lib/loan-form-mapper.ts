import { LOAN_TYPES } from "@/constants/loan";
import { formatNumberInput } from "@/lib/format";
import type { TCreateLoanForm, TLoanDetails, TUploadFiles } from "@/types/loan.types";

const toIsoDate = (dateStr: string): string => {
  if (!dateStr) return "";
  if (dateStr.includes("-")) return dateStr;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

/** Map chi tiết khoản vay cũ sang form tạo đơn mới (không copy attachments, id, mã HĐ) */
export const mapLoanDetailsToCreateForm = (
  details: TLoanDetails,
): TCreateLoanForm => ({
  full_name: details.customer.fullName,
  cccd: details.customer.cccd,
  phone: details.customer.phone,
  cccd_issue_date: toIsoDate(details.customer.cccdIssueDate),
  cccd_issue_place: details.customer.cccdIssuePlace,
  address: details.customer.address,
  facebook_link: details.customer.facebookUrl ?? "",
  job: details.customer.job,
  income: details.customer.income
    ? formatNumberInput(String(details.customer.income))
    : "",
  bank_name: details.bank.name,
  bank_account_holder: details.bank.accountHolder,
  bank_account_number: details.bank.accountNumber,
  asset_type: details.assetTypeKey ?? "",
  asset_name: details.asset.name,
  chassis_number: details.asset.chassisNumber ?? "",
  engine_number: details.asset.engineNumber ?? "",
  imei: details.asset.imei ?? "",
  serial: details.asset.serial ?? "",
  asset_condition: details.assetCondition ?? "",
  loan_amount: formatNumberInput(String(details.loanAmount)),
  loan_type: details.loanType || LOAN_TYPES.BULLET_PAYMENT_BY_MILESTONE,
  notes: details.notes,
  references: details.references.map((r) => ({
    id: crypto.randomUUID(),
    full_name: r.full_name,
    phone: r.phone,
    relationship: r.relationship,
  })),
  attachments: [],
});

export const mapLoanAssetImagesToAttachments = (
  details: TLoanDetails,
): TUploadFiles[] =>
  details.asset.images.map((img) => ({
    name: img.name,
    provider: img.provider,
    file_id: img.fileId,
  }));
