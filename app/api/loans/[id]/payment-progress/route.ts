import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/loans/[id]/payment-progress
 * Lấy thông tin tiến độ thanh toán (periods + total paid)
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

    // Get loan info
    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select("id, current_cycle")
      .eq("id", loanId)
      .single();

    if (loanError || !loan) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khoản vay" },
        { status: 404 }
      );
    }

    // Get current payment cycle
    const { data: cycle, error: cycleError } = await supabase
      .from("loan_payment_cycles")
      .select("id, principal, total_interest_paid, start_date, end_date")
      .eq("loan_id", loanId)
      .eq("cycle_number", loan.current_cycle)
      .single();

    if (cycleError || !cycle) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy chu kỳ thanh toán" },
        { status: 404 }
      );
    }

    // Get payment periods
    const { data: periods, error: periodsError } = await supabase
      .from("loan_payment_periods")
      .select("milestone_day, fee_amount, status, due_date, period_number")
      .eq("cycle_id", cycle.id)
      .eq("period_type", "current")
      .order("period_number", { ascending: true });

    if (periodsError) {
      console.error("[GET_PERIODS_ERROR]", periodsError);
      return NextResponse.json(
        { success: false, error: "Không thể lấy thông tin kỳ thanh toán" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        cycle: {
          id: cycle.id,
          principal: cycle.principal,
          totalInterestPaid: cycle.total_interest_paid || 0,
          startDate: cycle.start_date,
          endDate: cycle.end_date,
        },
        periods: periods || [],
      },
    });
  } catch (error) {
    console.error("[GET_PAYMENT_PROGRESS_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
