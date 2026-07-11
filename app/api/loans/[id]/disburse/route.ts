import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LOAN_STATUS } from "@/constants/loan";
import {
  isPostgrestSchemaCacheError,
  isRpcNotFoundError,
  parseRpcResult,
} from "@/lib/supabase/rpc-result";

export async function POST(
  _request: NextRequest,
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

    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "disburse_loan",
      { p_loan_id: loanId }
    );

    if (!rpcError && rpcResult) {
      const result = parseRpcResult(rpcResult);
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: "Giải ngân thành công",
        });
      }
      const status = result.error?.includes("ký hợp đồng") ? 400 : 409;
      return NextResponse.json(
        { success: false, error: result.error ?? "Không thể giải ngân" },
        { status }
      );
    }

    if (rpcError && !isRpcNotFoundError(rpcError)) {
      if (isPostgrestSchemaCacheError(rpcError)) {
        console.error("[DISBURSE_LOAN_SCHEMA_CACHE_ERROR]", rpcError);
        return NextResponse.json(
          {
            success: false,
            error:
              "Schema database chưa được đồng bộ. Vui lòng chạy: npx supabase stop && npx supabase start",
          },
          { status: 503 }
        );
      }

      console.error("[DISBURSE_LOAN_RPC_ERROR]", rpcError);
      return NextResponse.json(
        { success: false, error: "Lỗi khi giải ngân" },
        { status: 500 }
      );
    }

    // Fallback: optimistic lock khi RPC chưa deploy hoặc chưa có trong schema cache
    const { data: updatedLoans, error: updateError } = await supabase
      .from("loans")
      .update({
        status: LOAN_STATUS.DISBURSED,
        disbursed_at: new Date().toISOString(),
      })
      .eq("id", loanId)
      .eq("status", LOAN_STATUS.SIGNED)
      .select("id");

    if (updateError) {
      console.error("[DISBURSE_LOAN_UPDATE_ERROR]", updateError);

      if (isPostgrestSchemaCacheError(updateError)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Schema database chưa được đồng bộ. Vui lòng chạy: npx supabase stop && npx supabase start",
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Lỗi khi cập nhật trạng thái" },
        { status: 500 }
      );
    }

    if (!updatedLoans || updatedLoans.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Khoản vay chưa được ký hợp đồng hoặc đã được giải ngân",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Giải ngân thành công",
    });
  } catch (error) {
    console.error("[DISBURSE_LOAN_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}
