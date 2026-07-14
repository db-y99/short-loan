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
      .select("id, code, status, amount, current_cycle, loan_type")
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

    // Kiểm tra loan_type để áp dụng logic đóng tiền phù hợp
    const isInstallmentType =
      loan.loan_type === "installment_3_periods" ||
      loan.loan_type?.includes("trả góp") ||
      loan.loan_type?.includes("Gói 1");

    const isBulletPaymentType =
      loan.loan_type === "bullet_payment_by_milestone" ||
      loan.loan_type === "bullet_payment_with_collateral_hold" ||
      loan.loan_type?.includes("Gói 2") ||
      loan.loan_type?.includes("Gói 3");

    // Get payment periods để kiểm tra mốc hiện tại
    const { data: periods } = await supabase
      .from("loan_payment_periods")
      .select("id, milestone_day, fee_amount, principal, status, paid_amount")
      .eq("cycle_id", cycle.id)
      .eq("period_type", "current")
      .order("period_number", { ascending: true });

    // Gói 1: Đóng tiền tổng chuộc theo mốc (Gốc + Lãi + Phí)
    // Mỗi kỳ độc lập, không cộng dồn
    if (isInstallmentType && periods && periods.length > 0) {
      // Tìm kỳ đầu tiên CHƯA hoàn thành (status !== 'paid')
      const currentPeriod =
        periods.find((p: any) => p.status !== "paid") ||
        periods[periods.length - 1];

      if (currentPeriod) {
        // Tổng = Gốc + Lãi + Phí của kỳ hiện tại
        const feeAmount = Number(currentPeriod.fee_amount || 0);
        const principalAmount = Number(currentPeriod.principal || 0);
        const currentMilestoneFee = principalAmount + feeAmount;

        const paidForThisPeriod = Number(currentPeriod.paid_amount || 0);
        const remaining = currentMilestoneFee - paidForThisPeriod;

        // Kiểm tra không vượt quá số tiền còn thiếu
        if (amount > remaining) {
          return NextResponse.json(
            {
              success: false,
              error: `Số tiền vượt quá số tiền còn thiếu của kỳ ${currentPeriod.milestone_day} ngày (${remaining.toLocaleString("vi-VN")} VNĐ)`,
            },
            { status: 400 },
          );
        }
      }
    }

    // Gói 2, 3: Luôn đóng lãi + phí của mốc 30 ngày, chỉ đóng được 1 mốc duy nhất
    if (isBulletPaymentType && periods && periods.length > 0) {
      // Tìm mốc 30 ngày (mốc cuối cùng)
      const milestone30 =
        periods.find((p: any) => p.milestone_day === 30) ||
        periods[periods.length - 1];

      if (milestone30) {
        const milestone30Fee = Number(milestone30.fee_amount || 0);
        const paidForMilestone30 = Number(milestone30.paid_amount || 0);

        // Kiểm tra xem đã đóng đủ mốc 30 ngày chưa
        if (paidForMilestone30 >= milestone30Fee && milestone30Fee > 0) {
          return NextResponse.json(
            {
              success: false,
              error: `Gói 2/3 đã đóng xong mốc 30 ngày rồi. Không cho đóng thêm nữa.`,
            },
            { status: 400 },
          );
        }

        // Kiểm tra không vượt quá số tiền còn thiếu của mốc 30 ngày
        const remaining = milestone30Fee - paidForMilestone30;

        if (amount > remaining) {
          return NextResponse.json(
            {
              success: false,
              error: `Số tiền vượt quá số tiền còn thiếu của mốc 30 ngày (${remaining.toLocaleString("vi-VN")} VNĐ)`,
            },
            { status: 400 },
          );
        }
      }
    }

    // Insert payment transaction — atomic via RPC
    const loanTypeLabel = isInstallmentType
      ? "Gói 1 (Đóng tiền tổng chuộc)"
      : "Gói 2/3 (Đóng tiền lãi + phí)";
    const systemMessage = `Đóng tiền ${amount.toLocaleString("vi-VN")} VNĐ - ${loanTypeLabel}${notes ? ` - ${notes}` : ""}`;

    let targetPeriod: NonNullable<typeof periods>[number] | undefined;
    let newPeriodStatus: string | undefined;

    if (periods && periods.length > 0) {
      if (isBulletPaymentType) {
        targetPeriod =
          periods.find((p) => p.milestone_day === 30) ||
          periods[periods.length - 1];
      } else {
        targetPeriod =
          periods.find((p) => p.status !== "paid") ||
          periods[periods.length - 1];
      }

      if (targetPeriod?.id) {
        const feeAmount = Number(targetPeriod.fee_amount || 0);
        const principalAmount = Number(targetPeriod.principal || 0);
        const totalRequired = isInstallmentType
          ? principalAmount + feeAmount
          : feeAmount;
        const newPaidAmount =
          Number(targetPeriod.paid_amount || 0) + Number(amount);

        newPeriodStatus =
          newPaidAmount >= totalRequired ? "paid" : targetPeriod.status;
      }
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
