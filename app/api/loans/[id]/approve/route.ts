import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LOAN_STATUS } from "@/constants/loan";

/**
 * POST /api/loans/[id]/approve
 * Duyệt khoản vay (chuyển từ pending sang approved)
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: loanId } = await params;

    // Kiểm tra loan tồn tại và đang ở trạng thái pending
    const { data: loan, error: fetchError } = await supabase
      .from("loans")
      .select("id, status")
      .eq("id", loanId)
      .single();

    if (fetchError || !loan) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khoản vay" },
        { status: 404 }
      );
    }

    if (loan.status !== LOAN_STATUS.PENDING) {
      return NextResponse.json(
        { success: false, error: "Khoản vay không ở trạng thái chờ duyệt" },
        { status: 400 }
      );
    }

    // Cập nhật trạng thái sang approved
    const { error: updateError } = await supabase
      .from("loans")
      .update({
        status: LOAN_STATUS.APPROVED,
        approved_at: new Date().toISOString(),
      })
      .eq("id", loanId);

    if (updateError) {
      console.error("Error updating loan status:", updateError);
      return NextResponse.json(
        { success: false, error: "Lỗi khi cập nhật trạng thái" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Duyệt khoản vay thành công",
    });
  } catch (error) {
    console.error("Error approving loan:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}
