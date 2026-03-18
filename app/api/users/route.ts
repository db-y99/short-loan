import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/users
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (search.trim()) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("[GET_USERS_ERROR]", error);
      return NextResponse.json(
        { success: false, error: "Không thể lấy danh sách người dùng" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { users: data || [], total: count || 0, page, limit } });
  } catch (error) {
    console.error("[GET_USERS_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create auth user + profile using service role key
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { email, password, full_name, role = "user" } = await request.json();

    if (!email?.trim() || !full_name?.trim() || !password?.trim()) {
      return NextResponse.json(
        { success: false, error: "Email, mật khẩu và tên là bắt buộc" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password.trim(),
      email_confirm: true,
      user_metadata: { full_name: full_name.trim() },
    });

    if (authError || !authData.user) {
      console.error("[CREATE_AUTH_USER_ERROR]", authError);
      return NextResponse.json(
        { success: false, error: authError?.message || "Không thể tạo tài khoản" },
        { status: 400 }
      );
    }

    // Update profile role (profile auto-created by Supabase trigger)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ role })
      .eq("id", authData.user.id)
      .select()
      .single();

    if (profileError) {
      console.error("[UPDATE_PROFILE_ROLE_ERROR]", profileError);
    }

    return NextResponse.json({ success: true, data: profile || authData.user });
  } catch (error) {
    console.error("[CREATE_USER_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
