import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireLoanApproverUser } from "@/lib/auth/api-auth";
import { isRpcNotFoundError, parseRpcResult } from "@/lib/supabase/rpc-result";

/**
 * POST /api/loans/[id]/redeem
 * Chuộc đồ (trả gốc + lãi còn thiếu)
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

    const body = await request.json();
    const { principalAmount, interestAmount, notes } = body;

    if (!principalAmount || principalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Số tiền gốc không hợp lệ" },
        { status: 400 },
      );
    }

    if (
      interestAmount === undefined ||
      interestAmount === null ||
      interestAmount < 0
    ) {
      return NextResponse.json(
        { success: false, error: "Số tiền lãi không hợp lệ" },
        { status: 400 },
      );
    }

    const totalAmount = Number(principalAmount) + Number(interestAmount);
    const statusMessage = `Đã chuộc đồ - Trả gốc ${Number(principalAmount).toLocaleString("vi-VN")} VNĐ + Lãi ${Number(interestAmount).toLocaleString("vi-VN")} VNĐ`;

    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "redeem_loan",
      {
        p_loan_id: loanId,
        p_principal_amount: principalAmount,
        p_interest_amount: interestAmount,
        p_notes: notes || null,
        p_user_id: user.id,
        p_user_name: user.email || "System",
        p_status_message: statusMessage,
      },
    );

    if (!rpcError && rpcResult) {
      const result = parseRpcResult(rpcResult);

      if (result.success) {
        return NextResponse.json({
          success: true,
          data: {
            totalAmount,
            principalAmount,
            interestAmount,
            message: "Chuộc đồ thành công!",
          },
        });
      }
      const status = result.error?.includes("Không tìm thấy") ? 404 : 400;

      return NextResponse.json(
        { success: false, error: result.error ?? "Không thể chuộc đồ" },
        { status },
      );
    }

    if (!isRpcNotFoundError(rpcError)) {
      console.error("[REDEEM_LOAN_RPC_ERROR]", rpcError);

      return NextResponse.json(
        { success: false, error: "Lỗi khi chuộc đồ" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Chức năng chuộc đồ chưa sẵn sàng. Vui lòng chạy migration database.",
      },
      { status: 503 },
    );
  } catch (error) {
    console.error("[REDEEM_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
