"use server";

import { ROLES, isLoanApproverRole } from "@/constants/roles";
import { USER_STATUS } from "@/lib/constants";
import { getCurrentUser } from "@/lib/actions/auth";
import { getProfileById } from "@/services/profiles.service";

type TActionAuthFail = { ok: false; error: string };
type TActionAuthOk<T> = { ok: true } & T;

export async function requireActionStaffUser(): Promise<
  | TActionAuthOk<{
      userId: string;
      profile: NonNullable<Awaited<ReturnType<typeof getProfileById>>>;
    }>
  | TActionAuthFail
> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, error: "Bạn cần đăng nhập để thực hiện thao tác này" };
  }

  const profile = await getProfileById(user.id);

  if (!profile || profile.deleted_at) {
    return { ok: false, error: "Tài khoản không hợp lệ" };
  }

  if (profile.status !== USER_STATUS.ACTIVE) {
    return { ok: false, error: "Tài khoản chưa được kích hoạt" };
  }

  return { ok: true, userId: user.id, profile };
}

export async function requireActionLoanApproverUser(): Promise<
  | TActionAuthOk<{
      userId: string;
      profile: NonNullable<Awaited<ReturnType<typeof getProfileById>>>;
    }>
  | TActionAuthFail
> {
  const staff = await requireActionStaffUser();

  if (!staff.ok) return staff;

  if (!isLoanApproverRole(staff.profile.role)) {
    return { ok: false, error: "Bạn không có quyền thực hiện thao tác này" };
  }

  return staff;
}

export async function requireActionAdminUser(): Promise<
  | TActionAuthOk<{
      userId: string;
      profile: NonNullable<Awaited<ReturnType<typeof getProfileById>>>;
    }>
  | TActionAuthFail
> {
  const staff = await requireActionStaffUser();

  if (!staff.ok) return staff;

  if (staff.profile.role !== ROLES.ADMIN) {
    return { ok: false, error: "Bạn không có quyền thực hiện thao tác này" };
  }

  return staff;
}
