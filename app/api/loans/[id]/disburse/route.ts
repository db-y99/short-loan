import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
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

    if (loan.status !== "pending") {
      return NextResponse.json(
        { success: false, error: "Khoản vay không ở trạng thái chờ duyệt" },
        { status: 400 }
      );
    }

    // Cập nhật trạng thái sang disbursed và ghi nhận thời gian giải ngân
    const { error: updateError } = await supabase
      .from("loans")
      .update({
        status: "disbursed",
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
      message: "Duyệt và giải ngân thành công",
    });
  } catch (error) {
    console.error("Error disbursing loan:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}
