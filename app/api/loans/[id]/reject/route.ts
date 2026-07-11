import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ACTIVITY_LOG_TYPE, LOAN_STATUS } from "@/constants/loan";
import { isRpcNotFoundError, parseRpcResult } from "@/lib/supabase/rpc-result";

const RejectLoanBodySchema = z.object({
  reason: z.string().max(500).optional(),
});

const buildRejectMessages = (reason?: string) => {
  const trimmedReason = reason?.trim();
  const statusMessage = trimmedReason
    ? `Từ chối khoản vay - ${trimmedReason}`
    : "Từ chối khoản vay";

  return { statusMessage, systemMessage: statusMessage };
};

/**
 * POST /api/loans/[id]/reject
 * Từ chối khoản vay (chuyển từ pending sang rejected)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: loanId } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const rawBody = await request.json().catch(() => ({}));
    const parsedBody = RejectLoanBodySchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsedBody.error.issues.map((issue) => issue.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { reason } = parsedBody.data;
    const userName =
      (typeof user.user_metadata?.full_name === "string" &&
        user.user_metadata.full_name) ||
      user.email ||
      "User";

    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "reject_loan",
      {
        p_loan_id: loanId,
        p_reason: reason ?? null,
        p_user_id: user.id,
        p_user_name: userName,
      }
    );

    if (!rpcError && rpcResult) {
      const result = parseRpcResult(rpcResult);
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: "Đã từ chối khoản vay",
        });
      }

      const status = result.error?.includes("chờ duyệt") ? 400 : 409;
      return NextResponse.json(
        { success: false, error: result.error ?? "Không thể từ chối khoản vay" },
        { status }
      );
    }

    if (!isRpcNotFoundError(rpcError)) {
      console.error("[REJECT_LOAN_RPC_ERROR]", rpcError);
      return NextResponse.json(
        { success: false, error: "Lỗi khi từ chối khoản vay" },
        { status: 500 }
      );
    }

    const { statusMessage, systemMessage } = buildRejectMessages(reason);

    const { data: updatedLoans, error: updateError } = await supabase
      .from("loans")
      .update({
        status: LOAN_STATUS.REJECTED,
        status_message: statusMessage,
      })
      .eq("id", loanId)
      .eq("status", LOAN_STATUS.PENDING)
      .select("id");

    if (updateError) {
      console.error("[REJECT_LOAN_UPDATE_ERROR]", updateError);
      return NextResponse.json(
        { success: false, error: "Lỗi khi cập nhật trạng thái" },
        { status: 500 }
      );
    }

    if (!updatedLoans || updatedLoans.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Khoản vay không ở trạng thái chờ duyệt hoặc đã được xử lý",
        },
        { status: 409 }
      );
    }

    const { error: logError } = await supabase.from("loan_activity_logs").insert({
      loan_id: loanId,
      type: ACTIVITY_LOG_TYPE.APPROVAL,
      user_id: user.id,
      user_name: userName,
      system_message: systemMessage,
    });

    if (logError) {
      console.error("[REJECT_LOAN_ACTIVITY_LOG_ERROR]", logError);
    }

    return NextResponse.json({
      success: true,
      message: "Đã từ chối khoản vay",
    });
  } catch (error) {
    console.error("[REJECT_LOAN_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}
