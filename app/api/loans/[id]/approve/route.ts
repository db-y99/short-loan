import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LOAN_STATUS } from "@/constants/loan";
import { requireLoanApproverUser } from "@/lib/auth/api-auth";
import { isRpcNotFoundError, parseRpcResult } from "@/lib/supabase/rpc-result";

/**
 * POST /api/loans/[id]/approve
 * Duyệt khoản vay (chuyển từ pending sang approved)
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: loanId } = await params;

    const admin = await requireLoanApproverUser();

    if (!admin.ok) return admin.response;

    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "approve_loan",
      { p_loan_id: loanId },
    );

    if (!rpcError && rpcResult) {
      const result = parseRpcResult(rpcResult);

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: "Duyệt khoản vay thành công",
        });
      }
      const status = result.error?.includes("chờ duyệt") ? 400 : 409;

      return NextResponse.json(
        { success: false, error: result.error ?? "Không thể duyệt khoản vay" },
        { status },
      );
    }

    if (!isRpcNotFoundError(rpcError)) {
      console.error("[APPROVE_LOAN_RPC_ERROR]", rpcError);

      return NextResponse.json(
        { success: false, error: "Lỗi khi duyệt khoản vay" },
        { status: 500 },
      );
    }

    // Fallback: optimistic lock khi RPC chưa deploy
    const { data: updatedLoans, error: updateError } = await supabase
      .from("loans")
      .update({
        status: LOAN_STATUS.APPROVED,
        approved_at: new Date().toISOString(),
      })
      .eq("id", loanId)
      .eq("status", LOAN_STATUS.PENDING)
      .select("id");

    if (updateError) {
      console.error("[APPROVE_LOAN_UPDATE_ERROR]", updateError);

      return NextResponse.json(
        { success: false, error: "Lỗi khi cập nhật trạng thái" },
        { status: 500 },
      );
    }

    if (!updatedLoans || updatedLoans.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Khoản vay không ở trạng thái chờ duyệt hoặc đã được xử lý",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Duyệt khoản vay thành công",
    });
  } catch (error) {
    console.error("[APPROVE_LOAN_ERROR]", error);

    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 },
    );
  }
}
