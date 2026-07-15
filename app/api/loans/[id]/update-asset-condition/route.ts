import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LOAN_STATUS } from "@/constants/loan";
import { requireAdminForPendingLoan } from "@/lib/auth/api-auth";

/**
 * PATCH /api/loans/[id]/update-asset-condition
 * Cập nhật tình trạng tài sản
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: loanId } = await params;

    const admin = await requireAdminForPendingLoan(loanId);

    if (!admin.ok) return admin.response;

    // Get request body
    const body = await request.json();
    const { asset_condition } = body;

    if (!asset_condition || typeof asset_condition !== "string") {
      return NextResponse.json(
        { success: false, error: "Tình trạng tài sản không hợp lệ" },
        { status: 400 },
      );
    }

    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select("id, status")
      .eq("id", loanId)
      .single();

    if (loanError || !loan) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khoản vay" },
        { status: 404 },
      );
    }

    if (loan.status !== LOAN_STATUS.PENDING) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Chỉ được cập nhật tình trạng tài sản khi khoản vay ở trạng thái chờ duyệt",
        },
        { status: 400 },
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
        { status: 500 },
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
      { status: 500 },
    );
  }
}
