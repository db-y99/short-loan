import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/actions/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { amount, type = "flexible", note } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Số tiền không hợp lệ" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { id: loanId } = await params;

    // Kiểm tra khoản vay tồn tại và trạng thái
    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select("*, loan_payment_cycles(*)")
      .eq("id", loanId)
      .single();

    if (loanError || !loan) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khoản vay" },
        { status: 404 }
      );
    }

    if (loan.status !== "disbursed") {
      return NextResponse.json(
        { success: false, error: "Khoản vay chưa được giải ngân" },
        { status: 400 }
      );
    }

    // Lấy cycle hiện tại hoặc tạo mới nếu chưa có
    let currentCycle = loan.loan_payment_cycles?.find((cycle: any) => 
      cycle.cycle_number === loan.current_cycle
    );

    if (!currentCycle) {
      // Tạo cycle mới nếu chưa có
      const { data: newCycle, error: cycleError } = await supabase
        .from("loan_payment_cycles")
        .insert({
          loan_id: loanId,
          cycle_number: loan.current_cycle || 1,
          principal: loan.amount,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 ngày sau
        })
        .select()
        .single();

      if (cycleError) {
        console.error("Cycle creation error:", cycleError);
        return NextResponse.json(
          { success: false, error: "Lỗi khi tạo chu kỳ thanh toán" },
          { status: 500 }
        );
      }
      currentCycle = newCycle;
    }

    // Tạo bản ghi thanh toán
    const { data: payment, error: paymentError } = await supabase
      .from("loan_payment_transactions")
      .insert({
        loan_id: loanId,
        cycle_id: currentCycle.id, // Sử dụng cycle_id từ cycle hiện tại
        period_id: null, // Thanh toán linh hoạt không thuộc kỳ cụ thể
        transaction_type: "fee_payment", // Sử dụng fee_payment cho thanh toán linh hoạt
        amount: amount,
        payment_method: "cash", // Mặc định là tiền mặt
        notes: note || `Thanh toán linh hoạt ${amount.toLocaleString('vi-VN')} VNĐ`,
        created_by: user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Payment creation error:", paymentError);
      return NextResponse.json(
        { success: false, error: "Lỗi khi tạo bản ghi thanh toán" },
        { status: 500 }
      );
    }

    // Log activity cho thanh toán linh hoạt
    await supabase.from("loan_activity_logs").insert({
      loan_id: loanId,
      type: "system_event",
      user_id: user.id,
      user_name: user.email || "System",
      system_message: `Đóng tiền linh hoạt ${amount.toLocaleString("vi-VN")} VNĐ${note ? ` - ${note}` : ""}`,
    });

    // Tính tổng số tiền đã thanh toán
    const { data: totalPaidData } = await supabase
      .from("loan_payment_transactions")
      .select("amount")
      .eq("loan_id", loanId);

    const totalAmount = totalPaidData?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;

    // Cập nhật thông tin khoản vay (nếu có trường total_paid)
    // Lưu ý: Bảng loans hiện tại không có trường total_paid, có thể bỏ qua hoặc thêm sau
    
    return NextResponse.json({
      success: true,
      data: {
        payment,
        totalPaid: totalAmount,
        message: `Đã ghi nhận thanh toán ${amount.toLocaleString('vi-VN')} VNĐ`,
      },
    });

  } catch (error) {
    console.error("Payment API error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}