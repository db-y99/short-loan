import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * POST /api/loans/[id]/pay-interest
 * Đóng lãi cho khoản vay
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
    const { amount, notes } = body;

    // Validate
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Số tiền không hợp lệ" },
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
        { success: false, error: "Khoản vay chưa được giải ngân" },
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

    // Get payment periods for progress tracking
    const { data: periods } = await supabase
      .from("loan_payment_periods")
      .select("milestone_day, fee_amount, status")
      .eq("cycle_id", cycle.id)
      .eq("period_type", "current")
      .order("period_number", { ascending: true });

    // Insert payment transaction
    const { data: payment, error: paymentError } = await supabase
      .from("loan_payment_transactions")
      .insert({
        loan_id: loanId,
        cycle_id: cycle.id,
        transaction_type: "interest_payment",
        amount: amount,
        payment_method: "cash", // Default, có thể thêm field trong form
        notes: notes || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (paymentError) {
      console.error("[PAY_INTEREST_ERROR]", paymentError);
      return NextResponse.json(
        { success: false, error: "Không thể tạo giao dịch thanh toán" },
        { status: 500 }
      );
    }

    // Update total_interest_paid in cycle
    const newTotalInterestPaid = Number(cycle.total_interest_paid || 0) + Number(amount);
    
    const { error: updateError } = await supabase
      .from("loan_payment_cycles")
      .update({
        total_interest_paid: newTotalInterestPaid,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cycle.id);

    if (updateError) {
      console.error("[UPDATE_CYCLE_ERROR]", updateError);
      // Không return error vì transaction đã được tạo
    }

    // Log activity
    await supabase.from("loan_activity_logs").insert({
      loan_id: loanId,
      type: "system_event",
      user_id: user.id,
      user_name: user.email || "System",
      system_message: `Đóng lãi ${amount.toLocaleString("vi-VN")} VNĐ${notes ? ` - ${notes}` : ""}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        payment,
        totalInterestPaid: newTotalInterestPaid,
        periods: periods || [],
      },
    });
  } catch (error) {
    console.error("[PAY_INTEREST_ERROR]", error);
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
 * GET /api/loans/[id]/pay-interest
 * Lấy lịch sử đóng lãi
 */
export async function GET(
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

    // Get payment history
    const { data: payments, error } = await supabase
      .from("loan_payment_transactions")
      .select("*")
      .eq("loan_id", loanId)
      .eq("transaction_type", "interest_payment")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET_PAYMENT_HISTORY_ERROR]", error);
      return NextResponse.json(
        { success: false, error: "Không thể lấy lịch sử thanh toán" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payments || [],
    });
  } catch (error) {
    console.error("[GET_PAYMENT_HISTORY_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
