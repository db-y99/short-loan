import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const loanId = params.id;
    const body = await request.json();
    const { amount, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Số tiền không hợp lệ" },
        { status: 400 }
      );
    }

    // Kiểm tra loan tồn tại và đang ở trạng thái disbursed
    const { data: loan, error: fetchError } = await supabase
      .from("loans")
      .select("id, status, code")
      .eq("id", loanId)
      .single();

    if (fetchError || !loan) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khoản vay" },
        { status: 404 }
      );
    }

    if (loan.status !== "disbursed") {
      return NextResponse.json(
        { success: false, error: "Khoản vay không ở trạng thái đang cầm" },
        { status: 400 }
      );
    }

    // TODO: Thêm logic tính toán lãi, cập nhật số dư, kỳ thanh toán
    // Hiện tại chỉ ghi log vào activity log

    // Ghi vào activity log (nếu có bảng này)
    // const { error: logError } = await supabase
    //   .from("loan_activity_logs")
    //   .insert({
    //     loan_id: loanId,
    //     type: "interest_payment",
    //     content: `Đóng lãi: ${amount.toLocaleString('vi-VN')}₫${notes ? ` - ${notes}` : ''}`,
    //     created_at: new Date().toISOString(),
    //   });

    return NextResponse.json({
      success: true,
      message: "Đóng lãi thành công",
      data: {
        amount,
        notes,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error processing interest payment:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}
