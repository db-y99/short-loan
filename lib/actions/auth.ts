"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import { USER_STATUS } from "@/lib/constants";
import { getProfileByEmail, getProfileById } from "@/services/profiles.service";
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
    return { error: "Email hoặc mật khẩu không đúng." };
  }

  if (data.user) {
    const profile = await getProfileById(data.user.id);
    if (!profile) {
      await supabase.auth.signOut();
      return { error: "Tài khoản chưa được cấp trong hệ thống. Vui lòng liên hệ Admin." };
    }

    if (profile.deleted_at) {
      await supabase.auth.signOut();
      return { error: "Tài khoản đã bị xóa. Vui lòng liên hệ Admin." };
    }

    if (profile.status !== USER_STATUS.ACTIVE) {
      await supabase.auth.signOut();
      return { error: "Tài khoản chưa được kích hoạt. Vui lòng liên hệ Admin." };
    }

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

/**
 * Gửi mã OTP đến email (passwordless login).
 * Chỉ gửi khi email đã tồn tại trong hệ thống.
 */
export async function sendOtpToEmail(email: string) {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return { error: "Vui lòng nhập email." };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { error: "Định dạng email không hợp lệ." };
  }

  // Check if email exists in profiles table using service
  const profile = await getProfileByEmail(trimmedEmail);
  if (!profile) {
    return {
      error: "Email chưa được đăng ký trong hệ thống. Vui lòng liên hệ Admin nếu bạn cần truy cập.",
    };
  }

  if (profile.deleted_at) {
    return { error: "Tài khoản đã bị xóa. Vui lòng liên hệ Admin." };
  }

  if (profile.status !== USER_STATUS.ACTIVE) {
    return { error: "Tài khoản chưa được kích hoạt. Vui lòng liên hệ Admin." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: trimmedEmail,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    // Handle rate limiting
    if (error.message.includes('rate limit') || error.message.includes('too many')) {
      return { error: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút." };
    }
    return { error: error.message };
  }

  return { 
    success: true,
    message: `Mã OTP đã được gửi đến ${trimmedEmail}. Mã có hiệu lực trong 60 phút.`
  };
}

/**
 * Xác thực mã OTP và tạo session (passwordless login).
 */
export async function verifyEmailOtp(email: string, token: string) {
  const trimmedEmail = email.trim();
  const trimmedToken = token.trim();

  if (!trimmedEmail || !trimmedToken) {
    return { error: "Vui lòng nhập đầy đủ email và mã OTP." };
  }

  if (trimmedToken.length !== 6 || !/^\d{6}$/.test(trimmedToken)) {
    return { error: "Mã OTP phải là 6 chữ số." };
  }

  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.verifyOtp({
    email: trimmedEmail,
    token: trimmedToken,
    type: "email",
  });

  if (error) {
    if (error.message.includes('expired')) {
      return { error: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới." };
    }
    if (error.message.includes('invalid')) {
      return { error: "Mã OTP không đúng. Vui lòng kiểm tra lại." };
    }
    return { error: error.message };
  }

  if (!session?.user) {
    return { error: "Xác thực OTP thất bại" };
  }

  // Check if user has profile in system using service
  const profile = await getProfileById(session.user.id);
  if (!profile) {
    return {
      error: "Tài khoản chưa được cấp trong hệ thống. Vui lòng liên hệ Admin.",
    };
  }

  if (profile.deleted_at) {
    return { error: "Tài khoản đã bị xóa. Vui lòng liên hệ Admin." };
  }

  if (profile.status !== USER_STATUS.ACTIVE) {
    return { error: "Tài khoản chưa được kích hoạt. Vui lòng liên hệ Admin." };
  }

  return { success: true };
}

/**
 * Gửi lại mã OTP
 */
export async function resendOtp(email: string) {
  const result = await sendOtpToEmail(email);
  
  if (result.success) {
    return {
      success: true,
      message: "Mã OTP mới đã được gửi lại."
    };
  }
  
  return result;
}
