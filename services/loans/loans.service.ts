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
  CONTRACT_CODE_PREFIX,
  getContractCodeSuffix,
  type TLoanType,
} from "@/constants/loan";
import { formatDateShortVN } from "@/lib/format";
import { calculatePaymentPeriods } from "@/lib/payment-calculator";
import { getPaymentPeriodsService } from "@/services/payments/payment-periods.service";

export type TLoanFilters = {
  search?: string;
  status?: string;
  loanType?: string;
  creator?: string;
};

/** Lấy danh sách loans với thông tin customer (full_name) */
export const getLoansService = async (
  filters?: TLoanFilters,
): Promise<TLoan[]> => {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("loans")
    .select(
      `
      id,
      code,
      amount,
      loan_package,
      loan_type,
      asset_name,
      created_at,
      approved_at,
      status,
      customers!inner (
        full_name
      ),
      profiles!inner (
        full_name,
        email
      )
    `,
    )
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters?.loanType && filters.loanType !== "all") {
    query = query.eq("loan_type", filters.loanType);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  let results = data ?? [];

  // Client-side filters (search, creator)
  if (filters?.search) {
    const keyword = filters.search.toLowerCase();
    results = results.filter((row) => {
      const cust = row.customers as
        | { full_name: string }
        | { full_name: string }[]
        | null;
      const customer = Array.isArray(cust) ? cust[0] : cust;
      const customerName = customer?.full_name?.toLowerCase() ?? "";

      return (
        row.code.toLowerCase().includes(keyword) ||
        row.asset_name?.toLowerCase().includes(keyword) ||
        customerName.includes(keyword)
      );
    });
  }

  return results
    .map((row) => {
      const cust = row.customers as
        | { full_name: string }
        | { full_name: string }[]
        | null;
      const customer = Array.isArray(cust) ? cust[0] : cust;

      const prof = row.profiles as
        | { full_name: string; email: string }
        | { full_name: string; email: string }[]
        | null;
      const profile = Array.isArray(prof) ? prof[0] : prof;

      const loanTypeKey = row.loan_type as TLoanType;
      const creator = profile?.full_name ?? profile?.email ?? "—";

      // Filter by creator (client-side vì cần join data)
      if (
        filters?.creator &&
        filters.creator !== "all" &&
        creator !== filters.creator
      ) {
        return null;
      }

      return {
        id: row.id,
        code: row.code,
        creator,
        customer: (customer?.full_name as string | undefined) ?? "—",
        asset: row.asset_name ?? "—",
        amount: Number(row.amount),
        loan_package:
          row.loan_package ?? LOAN_TYPE_LABEL[loanTypeKey] ?? row.loan_type,
        created_at: row.created_at,
        approved_at: row.approved_at,
        status: row.status as TLoanStatus,
      } satisfies TLoan;
    })
    .filter((loan): loan is TLoan => loan !== null);
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
      profile_id: input.profile_id,
      customer_id: input.customer_id,
      asset_type: input.asset_type,
      asset_name: input.asset_name,
      asset_identity: assetIdentity, // ✅ jsonb đúng schema
      asset_condition: input.asset_condition ?? null,
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
      asset_condition,
      bank_name,
      bank_account_holder,
      bank_account_number,
      notes,
      status,
      status_message,
      current_cycle,
      signed_at,
      is_signed,
      created_at,
      drive_folder_id,
      customer_id,
      customers!inner (
        id,
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

  const allFiles: TLoanFile[] = (filesRes.data ?? []).map((f) => ({
    id: f.id,
    name: f.name,
    fileId: f.file_id,
    provider: f.provider,
    type: f.type,
  }));

  // Tách file gốc và file đã ký
  const signedContractTypes = [
    "asset_pledge",
    "asset_lease",
    "full_payment",
    "asset_disposal",
  ];
  const originalFiles = allFiles.filter(
    (f) => !signedContractTypes.includes(f.type),
  );
  const signedFiles = allFiles.filter((f) =>
    signedContractTypes.includes(f.type),
  );

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

  // Ưu tiên loan_type (enum) thay vì loan_package (description)
  const loanTypeStr = loan.loan_type;

  let currentPeriod: TPaymentPeriod | undefined;
  let nextPeriod: TPaymentPeriod | undefined;

  try {
    // Lấy cycle hiện tại
    let { data: cycle } = await supabase
      .from("loan_payment_cycles")
      .select("id")
      .eq("loan_id", loanId)
      .eq("cycle_number", loan.current_cycle)
      .single();

    // Nếu chưa có cycle, tự động tạo
    if (!cycle) {
      console.log("⚠️ No payment cycle found, creating one...");

      const startDate = new Date(loan.signed_at ?? loan.created_at)
        .toISOString()
        .split("T")[0];
      const endDate = new Date(
        new Date(loan.signed_at ?? loan.created_at).getTime() +
          30 * 24 * 60 * 60 * 1000,
      )
        .toISOString()
        .split("T")[0];

      const { data: newCycle, error: createError } = await supabase
        .from("loan_payment_cycles")
        .insert({
          loan_id: loanId,
          cycle_number: loan.current_cycle,
          principal: loan.amount,
          start_date: startDate,
          end_date: endDate,
        })
        .select("id")
        .single();

      if (createError) {
        console.error("❌ Failed to create payment cycle:", createError);
      } else {
        cycle = newCycle;
        console.log("✅ Payment cycle created successfully");
      }
    }

    if (cycle) {
      // Lấy payment periods từ DB
      const periods = await getPaymentPeriodsService(loanId, cycle.id);
      currentPeriod = periods.currentPeriod;
      nextPeriod = periods.nextPeriod;

      console.log("✅ Payment periods loaded from DB");
    } else {
      // Fallback: Tính động nếu không thể tạo cycle
      console.log("⚠️ Using calculated payment periods");
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
    signedFiles: signedFiles.length ? signedFiles : undefined,

    customer: {
      id: loan.customer_id,
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

    assetCondition: loan.asset_condition ?? undefined,

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

/**
 * Sinh mã hợp đồng: [CT] + [Số thứ tự 3 chữ số] + [Hậu tố theo gói vay].
 * Số thứ tự lấy atomic từ app_sequences (CONTRACT_SEQ) để tránh trùng khi tạo đồng thời.
 * Hậu tố: /Y99GTS (giữ TS), /Y99GCK (gốc cuối kỳ), /Y99DNGD (trả góp).
 */
export const generateLoanCodeService = async (
  loanPackage: string | null,
): Promise<string> => {
  const supabase = await createSupabaseServerClient();

  const { data: seq, error } = await supabase.rpc("get_next_contract_seq");

  if (error) throw new Error(error.message);
  const num = typeof seq === "number" ? seq : parseInt(String(seq), 10);
  if (Number.isNaN(num) || num < 1) {
    throw new Error("Invalid contract sequence from get_next_contract_seq");
  }

  const sequencePart = String(num).padStart(3, "0");
  const suffix = getContractCodeSuffix(loanPackage);

  return `${CONTRACT_CODE_PREFIX}${sequencePart}${suffix}`;
};
