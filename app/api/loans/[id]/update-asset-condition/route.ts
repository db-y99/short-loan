import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * PATCH /api/loans/[id]/update-asset-condition
 * Cập nhật tình trạng tài sản
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: loanId } = await params;

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

    // Get request body
    const body = await request.json();
    const { asset_condition } = body;

    if (!asset_condition || typeof asset_condition !== "string") {
      return NextResponse.json(
        { success: false, error: "Tình trạng tài sản không hợp lệ" },
        { status: 400 }
      );
    }

    // Update asset condition
    const { error } = await supabase
      .from("loans")
      .update({ asset_condition: asset_condition.trim() })
      .eq("id", loanId);

    if (error) {
      console.error("Error updating asset condition:", error);
      return NextResponse.json(
        { success: false, error: "Không thể cập nhật tình trạng tài sản" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật tình trạng tài sản thành công",
    });
  } catch (error) {
    console.error("Error in update-asset-condition route:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}
