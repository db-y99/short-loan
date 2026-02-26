"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/constants/routes";
import { env } from "@/config/env";

/**
 * Sign in with email and password
 */
export async function signInWithEmailPassword(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Error signing in with email and password:", error);
    return { error: error.message };
  }

  if (data.user) {
    return { success: true };
  }

  return { error: "Đăng nhập thất bại" };
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmailPassword(
  email: string,
  password: string,
  fullName?: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { full_name: fullName?.trim() || email.trim().split("@")[0] },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Không thể tạo tài khoản" };
  }

  // Nếu bật xác thực email, Supabase không trả session ngay
  if (data.session) {
    redirect(ROUTES.HOME || "/");
  }

  return {
    success: true,
    message:
      "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản.",
  };
}

/**
 * Gửi email đặt lại mật khẩu
 */
export async function resetPasswordForEmail(email: string) {
  const supabase = await createClient();
  const origin = env.NEXT_PUBLIC_SITE_URL;

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${origin}${ROUTES.LOGIN}?reset=success`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  redirect(ROUTES.LOGIN);
}

/**
 * Get current user session
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
