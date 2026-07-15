import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LOAN_STATUS } from "@/constants/loan";
import {
  requireActiveStaffUser,
  requireLoanApproverUser,
} from "@/lib/auth/api-auth";
import { isRpcNotFoundError, parseRpcResult } from "@/lib/supabase/rpc-result";

/**
 * POST /api/loans/[id]/pay-interest
 * Đóng tiền cho khoản vay (Gói 1: Gốc + Lãi + Phí, Gói 2/3: Lãi + Phí)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: loanId } = await params;

    const staff = await requireLoanApproverUser();

    if (!staff.ok) return staff.response;

    const { user } = staff;

    // Get request body
    const body = await request.json();
    const { amount, notes } = body;

    // Validate
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Số tiền không hợp lệ" },
        { status: 400 },
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
        { status: 404 },
      );
    }

    if (loan.status !== LOAN_STATUS.DISBURSED) {
      return NextResponse.json(
        { success: false, error: "Khoản vay chưa được giải ngân" },
        { status: 400 },
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
        { status: 404 },
      );
    }

    // Kế toán chỉ nhập số tiền — không validate theo gói / mốc
    const { data: periods } = await supabase
      .from("loan_payment_periods")
      .select("id, milestone_day, fee_amount, principal, status, paid_amount")
      .eq("cycle_id", cycle.id)
      .eq("period_type", "current")
      .order("period_number", { ascending: true });

    const systemMessage = `Đóng tiền ${amount.toLocaleString("vi-VN")} VNĐ${notes ? ` - ${notes}` : ""}`;

    // Gắn vào kỳ đầu chưa paid nếu có — không chặn khi vượt mốc
    const targetPeriod =
      periods?.find((p) => p.status !== "paid") || periods?.[periods.length - 1];

    let newPeriodStatus: string | undefined;

    if (targetPeriod?.id) {
      const feeAmount = Number(targetPeriod.fee_amount || 0);
      const principalAmount = Number(targetPeriod.principal || 0);
      const totalRequired = principalAmount + feeAmount;
      const newPaidAmount =
        Number(targetPeriod.paid_amount || 0) + Number(amount);

      newPeriodStatus =
        totalRequired > 0 && newPaidAmount >= totalRequired
          ? "paid"
          : targetPeriod.status;
    }

    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "record_interest_payment",
      {
        p_loan_id: loanId,
        p_cycle_id: cycle.id,
        p_period_id: targetPeriod?.id ?? null,
        p_amount: amount,
        p_notes: notes || null,
        p_user_id: user.id,
        p_user_name: user.email || "System",
        p_new_period_status:
          newPeriodStatus ?? targetPeriod?.status ?? "pending",
        p_system_message: systemMessage,
      },
    );

    if (!rpcError && rpcResult) {
      const result = parseRpcResult(rpcResult);

      if (result.success) {
        return NextResponse.json({
          success: true,
          data: {
            totalInterestPaid: result.total_interest_paid,
            periods: periods || [],
          },
        });
      }
      const status = result.error?.includes("Không tìm thấy") ? 404 : 400;

      return NextResponse.json(
        {
          success: false,
          error: result.error ?? "Không thể tạo giao dịch thanh toán",
        },
        { status },
      );
    }

    if (!isRpcNotFoundError(rpcError)) {
      console.error("[PAY_INTEREST_RPC_ERROR]", rpcError);

      return NextResponse.json(
        { success: false, error: "Lỗi khi ghi nhận thanh toán" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Chức năng đóng tiền chưa sẵn sàng. Vui lòng chạy migration database.",
      },
      { status: 503 },
    );
  } catch (error) {
    console.error("[PAY_INTEREST_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/loans/[id]/pay-interest
 * Lấy lịch sử đóng tiền
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: loanId } = await params;

    const staff = await requireActiveStaffUser();

    if (!staff.ok) return staff.response;

    // Get payment history with user info
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
        { status: 500 },
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
      { status: 500 },
    );
  }
}
