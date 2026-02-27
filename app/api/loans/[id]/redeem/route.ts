import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * POST /api/loans/[id]/redeem
 * Chuộc đồ (trả gốc + lãi còn thiếu)
 */
export async function POST(
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
    const { principalAmount, interestAmount, notes } = body;

    // Validate
    if (!principalAmount || principalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Số tiền gốc không hợp lệ" },
        { status: 400 }
      );
    }

    if (!interestAmount || interestAmount < 0) {
      return NextResponse.json(
        { success: false, error: "Số tiền lãi không hợp lệ" },
        { status: 400 }
      );
    }

    // Check if loan exists and is disbursed
    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select("id, code, status, amount, current_cycle")
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
        { success: false, error: "Khoản vay chưa được giải ngân hoặc đã hoàn thành" },
        { status: 400 }
      );
    }

    // Verify principal amount matches loan amount
    if (Number(principalAmount) !== Number(loan.amount)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Số tiền gốc phải bằng ${Number(loan.amount).toLocaleString("vi-VN")} VNĐ` 
        },
        { status: 400 }
      );
    }

    // Get current payment cycle
    const { data: cycle, error: cycleError } = await supabase
      .from("loan_payment_cycles")
      .select("id, principal, total_interest_paid")
      .eq("loan_id", loanId)
      .eq("cycle_number", loan.current_cycle)
      .single();

    if (cycleError || !cycle) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy chu kỳ thanh toán" },
        { status: 404 }
      );
    }

    // Start transaction: Create payment transactions and update loan status
    const totalAmount = Number(principalAmount) + Number(interestAmount);

    // 1. Insert principal payment transaction
    const { error: principalError } = await supabase
      .from("loan_payment_transactions")
      .insert({
        loan_id: loanId,
        cycle_id: cycle.id,
        transaction_type: "principal_payment",
        amount: principalAmount,
        payment_method: "cash",
        notes: notes || "Chuộc đồ - Trả gốc",
        created_by: user.id,
      });

    if (principalError) {
      console.error("[REDEEM_PRINCIPAL_ERROR]", principalError);
      return NextResponse.json(
        { success: false, error: "Không thể tạo giao dịch trả gốc" },
        { status: 500 }
      );
    }

    // 2. Insert interest payment transaction (if any)
    if (Number(interestAmount) > 0) {
      const { error: interestError } = await supabase
        .from("loan_payment_transactions")
        .insert({
          loan_id: loanId,
          cycle_id: cycle.id,
          transaction_type: "interest_payment",
          amount: interestAmount,
          payment_method: "cash",
          notes: notes || "Chuộc đồ - Trả lãi",
          created_by: user.id,
        });

      if (interestError) {
        console.error("[REDEEM_INTEREST_ERROR]", interestError);
        return NextResponse.json(
          { success: false, error: "Không thể tạo giao dịch trả lãi" },
          { status: 500 }
        );
      }

      // Update total_interest_paid in cycle
      const newTotalInterestPaid = Number(cycle.total_interest_paid || 0) + Number(interestAmount);
      
      await supabase
        .from("loan_payment_cycles")
        .update({
          total_interest_paid: newTotalInterestPaid,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cycle.id);
    }

    // 3. Update loan status to redeemed
    const { error: updateError } = await supabase
      .from("loans")
      .update({
        status: "redeemed",
        status_message: `Đã chuộc đồ - Trả gốc ${principalAmount.toLocaleString("vi-VN")} VNĐ + Lãi ${interestAmount.toLocaleString("vi-VN")} VNĐ`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", loanId);

    if (updateError) {
      console.error("[UPDATE_LOAN_STATUS_ERROR]", updateError);
      return NextResponse.json(
        { success: false, error: "Không thể cập nhật trạng thái khoản vay" },
        { status: 500 }
      );
    }

    // 4. Log activity
    await supabase.from("loan_activity_logs").insert({
      loan_id: loanId,
      type: "system_event",
      user_id: user.id,
      user_name: user.email || "System",
      system_message: `Chuộc đồ thành công - Tổng: ${totalAmount.toLocaleString("vi-VN")} VNĐ (Gốc: ${principalAmount.toLocaleString("vi-VN")} + Lãi: ${interestAmount.toLocaleString("vi-VN")})`,
    });

    return NextResponse.json({
      success: true,
      data: {
        totalAmount,
        principalAmount,
        interestAmount,
        message: "Chuộc đồ thành công!",
      },
    });
  } catch (error) {
    console.error("[REDEEM_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
