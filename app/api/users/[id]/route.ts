import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { updateProfile, getProfileById } from "@/services/profiles.service";

/**
 * GET /api/users/[id]
 * Get user by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await params;
    
    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const profile = await getProfileById(id);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("[GET_USER_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]
 * Update user
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await params;
    
    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, full_name, status, branch_id } = body;

    // Validation
    if (!email?.trim() || !full_name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Email và tên là bắt buộc" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await getProfileById(id);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    // Check if email is taken by another user
    if (email.trim() !== existingUser.email) {
      const { data: emailCheck } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.trim())
        .neq("id", id)
        .single();

      if (emailCheck) {
        return NextResponse.json(
          { success: false, error: "Email đã được sử dụng bởi người dùng khác" },
          { status: 400 }
        );
      }
    }

    // Update user using service
    const updatedUser = await updateProfile(id, {
      email: email.trim(),
      full_name: full_name.trim(),
      status,
      branch_id: branch_id ?? undefined,
      updated_at: new Date().toISOString(),
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "Không thể cập nhật người dùng" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("[UPDATE_USER_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Soft delete user (set deleted_at) and force sign out all sessions
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const existing = await getProfileById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[DELETE_USER_ERROR]", error);
      return NextResponse.json({ success: false, error: "Không thể xóa người dùng" }, { status: 500 });
    }

    // Ép đăng xuất tất cả session của user bị xóa
    const adminClient = createSupabaseAdminClient();
    await adminClient.auth.admin.signOut(id, "others");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE_USER_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
