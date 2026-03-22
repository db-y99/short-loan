import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { USER_STATUS } from "@/lib/constants";

/**
 * PUT /api/users/[id]/status
 * Toggle user status between active and inactive
 */
export async function PUT(
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

    const { status } = await request.json();

    if (!Object.values(USER_STATUS).includes(status)) {
      return NextResponse.json(
        { success: false, error: "Status không hợp lệ" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("[UPDATE_STATUS_ERROR]", error);
      return NextResponse.json(
        { success: false, error: "Không thể cập nhật trạng thái" },
        { status: 500 }
      );
    }

    // Nếu chuyển sang inactive thì ép đăng xuất tất cả session của user đó
    if (status === USER_STATUS.INACTIVE) {
      const adminClient = createSupabaseAdminClient();
      await adminClient.auth.admin.signOut(id, "others");
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[UPDATE_STATUS_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
