import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  TLoan,
  TLoanDetails,
  TLoanStatus,
  TPaymentMilestone,
  TPaymentPeriod,
  TReference,
  TActivityLogEntry,
  TActivityLogType,
  TLoanFile,
  TCreateLoanInput,
  TUploadFiles,
} from "@/types/loan.types";
import {
  LOAN_TYPE_LABEL,
  ASSET_TYPE_LABEL,
  type TLoanType,
} from "@/constants/loan";
import { formatDateShortVN } from "@/lib/format";
import { calculatePaymentPeriods } from "@/lib/payment-calculator";
import { getPaymentPeriodsService } from "@/services/payments/payment-periods.service";

/** Lấy danh sách loans với thông tin customer (full_name) */
export const getLoansService = async (): Promise<TLoan[]> => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("loans")
    .select(
      `
      id,
      code,
      creator,
      amount,
      loan_package,
      loan_type,
      asset_name,
      created_at,
      approved_at,
      status,
      customers!inner (
        full_name
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const cust = row.customers as
      | { full_name: string }
      | { full_name: string }[]
      | null;
    const customer = Array.isArray(cust) ? cust[0] : cust;
    const loanTypeKey = row.loan_type as TLoanType;
    return {
      id: row.id,
      code: row.code,
      creator: row.creator,
      customer: (customer?.full_name as string | undefined) ?? "—",
      asset: row.asset_name ?? "—",
      amount: Number(row.amount),
      loan_package:
        row.loan_package ?? LOAN_TYPE_LABEL[loanTypeKey] ?? row.loan_type,
      created_at: row.created_at,
      approved_at: row.approved_at,
      status: row.status as TLoanStatus,
    } satisfies TLoan;
  });
};

/**
 * 🔹 Tạo khoản vay
 * @param input - Thông tin khoản vay
 * @returns ID và mã khoản vay
 */
export const createLoanService = async (
  input: TCreateLoanInput,
): Promise<{ id: string; code: string }> => {
  const supabase = await createSupabaseServerClient();

  /**
   * 🔹 1. Build asset_identity JSONB
   * Chỉ giữ các field có giá trị
   */
  const assetIdentity = {
    ...(input.asset_identity.chassis_number && {
      chassis_number: input.asset_identity.chassis_number,
    }),
    ...(input.asset_identity.engine_number && {
      engine_number: input.asset_identity.engine_number,
    }),
    ...(input.asset_identity.imei && { imei: input.asset_identity.imei }),
    ...(input.asset_identity.serial && { serial: input.asset_identity.serial }),
  };

  /**
   * 🔹 2. Create loan
   */
  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .insert({
      code: input.code,
      creator: input.creator,
      customer_id: input.customer_id,
      asset_type: input.asset_type,
      asset_name: input.asset_name,
      asset_identity: assetIdentity, // ✅ jsonb đúng schema
      amount: input.amount,
      loan_package: input.loan_package ?? null,
      loan_type: input.loan_type,
      appraisal_fee_percentage: input.appraisal_fee_percentage ?? null,
      appraisal_fee: input.appraisal_fee ?? null,
      bank_name: input.bank_name ?? null,
      bank_account_holder: input.bank_account_holder ?? null,
      bank_account_number: input.bank_account_number ?? null,
      notes: input.notes ?? null,
      drive_folder_id: input.drive_folder_id, // 🔥 bắt buộc vì NOT NULL
      status: "pending",
    })
    .select("id, code")
    .single();

  if (loanError) throw new Error(loanError.message);
  if (!loan) throw new Error("Failed to create loan");

  // 🔹 2. Insert references
  if (input.references.length > 0) {
    const refRows = input.references
      .filter((r) => r.full_name.trim() || r.phone.trim())
      .map((r) => ({
        loan_id: loan.id,
        full_name: r.full_name.trim() || "—",
        phone: r.phone.trim() || "—",
        relationship: r.relationship?.trim() || null,
      }));

    if (refRows.length > 0) {
      const { error } = await supabase.from("loan_references").insert(refRows);

      if (error) throw new Error(error.message);
    }
  }

  /**
   * 🔹 Insert asset images
   */
  if (input.attachments?.length) {
    const assetRows = input.attachments.map((f, index) => ({
      loan_id: loan.id,
      name: f.name ?? null,
      provider: f.provider,
      file_id: f.file_id,
      position: index, // để sort ảnh
    }));

    const { error: assetError } = await supabase
      .from("loan_assets")
      .insert(assetRows);

    if (assetError) throw new Error(assetError.message);
  }

  return { id: loan.id, code: loan.code };
};

/**
 * 🔹 Update drive folder id cho loan (sau khi tạo folder Drive)
 */
export const updateLoanDriveFolderIdService = async ({
  loanId,
  driveFolderId,
}: {
  loanId: string;
  driveFolderId: string;
}): Promise<true> => {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("loans")
    .update({ drive_folder_id: driveFolderId })
    .eq("id", loanId);

  if (error) throw new Error(error.message);
  return true;
};

/**
 * 🔹 Lưu attachments (asset images) cho loan
 * - Chỉ insert DB, KHÔNG upload file
 */
export const addLoanAssetsService = async ({
  loanId,
  attachments,
}: {
  loanId: string;
  attachments: TUploadFiles[];
}): Promise<true> => {
  const supabase = await createSupabaseServerClient();

  if (!attachments.length) return true;

  const assetRows = attachments.map((f, index) => ({
    loan_id: loanId,
    name: f.name ?? null,
    provider: f.provider,
    file_id: f.file_id,
    position: index,
  }));

  const { error } = await supabase.from("loan_assets").insert(assetRows);
  if (error) throw new Error(error.message);
  return true;
};

const EMPTY_MILESTONES: TPaymentMilestone[] = [];
const EMPTY_PERIOD: TPaymentPeriod = {
  title: "—",
  subtitle: "—",
  milestones: EMPTY_MILESTONES,
};

/** Lấy chi tiết khoản vay theo id */
export const getLoanDetailsService = async (
  loanId: string,
): Promise<TLoanDetails | null> => {
  const supabase = await createSupabaseServerClient();

  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select(
      `
      id,
      code,
      amount,
      loan_package,
      loan_type,
      appraisal_fee_percentage,
      appraisal_fee,
      asset_type,
      asset_name,
      asset_identity,
      bank_name,
      bank_account_holder,
      bank_account_number,
      notes,
      status,
      status_message,
      signed_at,
      is_signed,
      created_at,
      drive_folder_id,
      customers!inner (
        full_name,
        cccd,
        phone,
        address,
        cccd_issue_date,
        cccd_issue_place,
        facebook_link,
        job,
        income
      )
    `,
    )
    .eq("id", loanId)
    .single();

  if (loanError || !loan) return null;

  const [refsRes, filesRes, assetsRes, logsRes] = await Promise.all([
    supabase
      .from("loan_references")
      .select("id, full_name, phone, relationship")
      .eq("loan_id", loanId)
      .order("created_at", { ascending: true }),

    supabase
      .from("loan_files")
      .select("id, name, file_id, provider, type")
      .eq("loan_id", loanId)
      .order("created_at", { ascending: true }),

    supabase
      .from("loan_assets")
      .select("id, file_id, provider, name")
      .eq("loan_id", loanId)
      .order("position", { ascending: true }),

    supabase
      .from("loan_activity_logs")
      .select(
        "id, type, user_id, user_name, created_at, content, images, links, system_message, mentions",
      )
      .eq("loan_id", loanId)
      .order("created_at", { ascending: true }),
  ]);

  /* =========================
     CUSTOMER
  ========================== */

  const customer = Array.isArray(loan.customers)
    ? loan.customers[0]
    : loan.customers;

  if (!customer) return null;

  /* =========================
     REFERENCES
  ========================== */

  const references: TReference[] = (refsRes.data ?? []).map((r) => ({
    id: r.id,
    full_name: r.full_name,
    phone: r.phone,
    relationship: r.relationship ?? "",
  }));

  /* =========================
     FILES (HỢP ĐỒNG)
  ========================== */

  const originalFiles: TLoanFile[] = (filesRes.data ?? []).map((f) => ({
    id: f.id,
    name: f.name,
    fileId: f.file_id,
    provider: f.provider,
    type: f.type,
  }));

  /* =========================
     ASSET IMAGES
  ========================== */

  const assetImages = (assetsRes.data ?? []).map((a) => ({
    id: a.id,
    fileId: a.file_id,
    provider: a.provider,
    name: a.name,
  }));

  /* =========================
     ACTIVITY LOG
  ========================== */

  const activityLog: TActivityLogEntry[] = (logsRes.data ?? []).map((l) => ({
    id: l.id,
    type: l.type as TActivityLogType,
    userId: l.user_id,
    userName: l.user_name,
    timestamp: l.created_at,
    content: l.content ?? undefined,
    images: l.images ?? undefined,
    links: l.links ?? undefined,
    systemMessage: l.system_message ?? undefined,
    mentions: l.mentions ?? undefined,
  }));

  /* =========================
     ASSET IDENTITY (jsonb)
  ========================== */

  const identity = loan.asset_identity as {
    chassis_number?: string;
    engine_number?: string;
    imei?: string;
    serial?: string;
  } | null;

  /* =========================
     PAYMENT PERIODS (Lấy từ DB hoặc tính động)
  ========================== */

  const loanTypeStr =
    loan.loan_package ??
    LOAN_TYPE_LABEL[loan.loan_type as TLoanType] ??
    loan.loan_type;

  let currentPeriod: TPaymentPeriod | undefined;
  let nextPeriod: TPaymentPeriod | undefined;

  try {
    // Lấy cycle hiện tại
    const { data: cycle } = await supabase
      .from("loan_payment_cycles")
      .select("id")
      .eq("loan_id", loanId)
      .eq("cycle_number", loan.current_cycle)
      .single();

    if (cycle) {
      // Lấy payment periods từ DB
      const periods = await getPaymentPeriodsService(loanId, cycle.id);
      currentPeriod = periods.currentPeriod;
      nextPeriod = periods.nextPeriod;

      console.log("✅ Payment periods loaded from DB");
    } else {
      // Fallback: Tính động nếu chưa có trong DB
      console.log("⚠️ No payment periods in DB, calculating dynamically");
      const calculated = calculatePaymentPeriods(
        Number(loan.amount),
        loanTypeStr,
        loan.signed_at ?? loan.created_at,
      );
      currentPeriod = calculated.currentPeriod;
      nextPeriod = calculated.nextPeriod;
    }
  } catch (error) {
    // Fallback: Tính động nếu có lỗi
    console.error("❌ Error loading payment periods from DB:", error);
    const calculated = calculatePaymentPeriods(
      Number(loan.amount),
      loanTypeStr,
      loan.signed_at ?? loan.created_at,
    );
    currentPeriod = calculated.currentPeriod;
    nextPeriod = calculated.nextPeriod;
  }

  return {
    id: loan.id,
    code: loan.code,
    signedAt: loan.signed_at ?? loan.created_at,
    notes: loan.notes ?? "",
    isSigned: loan.is_signed ?? false,
    originalFiles: originalFiles.length ? originalFiles : undefined,

    customer: {
      fullName: customer.full_name,
      cccd: customer.cccd,
      phone: customer.phone,
      address: customer.address,
      cccdIssueDate: customer.cccd_issue_date
        ? formatDateShortVN(customer.cccd_issue_date)
        : "",
      cccdIssuePlace: customer.cccd_issue_place ?? "",
      facebookUrl: customer.facebook_link ?? "",
      job: customer.job ?? "",
      income: Number(customer.income) || 0,
    },

    loanAmount: Number(loan.amount),
    loanType: loanTypeStr,

    appraisalFeePercentage: loan.appraisal_fee_percentage
      ? Number(loan.appraisal_fee_percentage)
      : undefined,
    appraisalFee: loan.appraisal_fee ? Number(loan.appraisal_fee) : undefined,

    references,

    asset: {
      type: ASSET_TYPE_LABEL[loan.asset_type] ?? loan.asset_type,
      name: loan.asset_name,
      imei: identity?.imei ?? "",
      serial: identity?.serial ?? "",
      chassisNumber: identity?.chassis_number ?? "",
      engineNumber: identity?.engine_number ?? "",
      images: assetImages,
    },

    bank: {
      name: loan.bank_name ?? "",
      accountNumber: loan.bank_account_number ?? "",
      accountHolder: loan.bank_account_holder ?? "",
    },

    status: loan.status as TLoanStatus,
    statusMessage: loan.status_message ?? undefined,

    driveFolderId: loan.drive_folder_id ?? undefined,

    currentPeriod,
    nextPeriod,

    activityLog: activityLog.length ? activityLog : undefined,
  } satisfies TLoanDetails;
};

/** Sinh mã khoản vay HD-YYYY-NNN */
export const generateLoanCodeService = async (): Promise<string> => {
  const supabase = await createSupabaseServerClient();
  const year = new Date().getFullYear();
  const prefix = `HD-${year}-`;

  const { data, error } = await supabase
    .from("loans")
    .select("code")
    .like("code", `${prefix}%`)
    .order("code", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);

  let nextNum = 1;
  if (data?.code) {
    const match = data.code.match(new RegExp(`^${prefix}(\\d+)$`));
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }

  return `${prefix}${String(nextNum).padStart(3, "0")}`;
};
