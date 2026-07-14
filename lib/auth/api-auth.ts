import { NextResponse } from "next/server";

import { ROLES, isLoanApproverRole } from "@/constants/roles";
import { LOAN_STATUS } from "@/constants/loan";
import { USER_STATUS } from "@/lib/constants";
import { env } from "@/config/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileById } from "@/services/profiles.service";

export type TAuthUser = {
  id: string;
  email?: string;
};

export type TStaffProfile = NonNullable<
  Awaited<ReturnType<typeof getProfileById>>
>;

type TAuthFail = { ok: false; response: NextResponse };
type TAuthOk<T> = { ok: true } & T;

export async function getOptionalAuthUser(): Promise<TAuthUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return { id: user.id, email: user.email };
}

export async function requireAuthenticatedUser(): Promise<
  TAuthOk<{ user: TAuthUser }> | TAuthFail
> {
  const user = await getOptionalAuthUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  return { ok: true, user };
}

export async function requireActiveStaffUser(): Promise<
  TAuthOk<{ user: TAuthUser; profile: TStaffProfile }> | TAuthFail
> {
  const auth = await requireAuthenticatedUser();

  if (!auth.ok) return auth;

  const profile = await getProfileById(auth.user.id);

  if (!profile || profile.deleted_at) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  if (profile.status !== USER_STATUS.ACTIVE) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Tài khoản chưa được kích hoạt" },
        { status: 403 },
      ),
    };
  }

  return { ok: true, user: auth.user, profile };
}

export async function requireLoanApproverUser(): Promise<
  TAuthOk<{ user: TAuthUser; profile: TStaffProfile }> | TAuthFail
> {
  const staff = await requireActiveStaffUser();

  if (!staff.ok) return staff;

  if (!isLoanApproverRole(staff.profile.role)) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      ),
    };
  }

  return staff;
}

const CUSTOMER_EDIT_BLOCKED_STATUSES = [
  LOAN_STATUS.APPROVED,
  LOAN_STATUS.SIGNED,
  LOAN_STATUS.DISBURSED,
  LOAN_STATUS.REDEEMED,
  LOAN_STATUS.COMPLETED,
  LOAN_STATUS.LIQUIDATED,
] as const;

export async function requireAdminForPendingLoan(
  loanId: string,
): Promise<TAuthOk<{ user: TAuthUser; profile: TStaffProfile }> | TAuthFail> {
  const admin = await requireAdminUser();

  if (!admin.ok) return admin;

  const supabase = await createSupabaseServerClient();
  const { data: loan, error } = await supabase
    .from("loans")
    .select("status")
    .eq("id", loanId)
    .single();

  if (error || !loan) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Không tìm thấy khoản vay" },
        { status: 404 },
      ),
    };
  }

  if (loan.status !== LOAN_STATUS.PENDING) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Chỉ được sửa khi khoản vay ở trạng thái chờ duyệt",
        },
        { status: 400 },
      ),
    };
  }

  return admin;
}

export async function requireAdminForCustomerEdit(
  customerId: string,
): Promise<TAuthOk<{ user: TAuthUser; profile: TStaffProfile }> | TAuthFail> {
  const admin = await requireAdminUser();

  if (!admin.ok) return admin;

  const supabase = await createSupabaseServerClient();
  const { data: blockingLoans, error } = await supabase
    .from("loans")
    .select("id")
    .eq("customer_id", customerId)
    .in("status", [...CUSTOMER_EDIT_BLOCKED_STATUSES])
    .limit(1);

  if (error) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Không thể kiểm tra khoản vay của khách hàng",
        },
        { status: 500 },
      ),
    };
  }

  if (blockingLoans && blockingLoans.length > 0) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error:
            "Không thể sửa khách hàng đang có khoản vay đã duyệt hoặc đang hoạt động",
        },
        { status: 400 },
      ),
    };
  }

  return admin;
}

export async function requireAdminUser(): Promise<
  TAuthOk<{ user: TAuthUser; profile: TStaffProfile }> | TAuthFail
> {
  const staff = await requireActiveStaffUser();

  if (!staff.ok) return staff;

  if (staff.profile.role !== ROLES.ADMIN) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      ),
    };
  }

  return staff;
}

export async function verifyStaffCanAccessDriveFile(
  fileId: string,
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();

  const { data: loanFile } = await supabase
    .from("loan_files")
    .select("id")
    .eq("file_id", fileId)
    .maybeSingle();

  if (loanFile) return true;

  const { data: loan } = await supabase
    .from("loans")
    .select("id")
    .or(
      `draft_signature_file_id.eq.${fileId},official_signature_file_id.eq.${fileId}`,
    )
    .maybeSingle();

  return Boolean(loan);
}

export function isValidInternalApiSecret(secret: string | null): boolean {
  return Boolean(secret && secret === env.INTERNAL_API_SECRET);
}
