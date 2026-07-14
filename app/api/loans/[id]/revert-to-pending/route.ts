import type { SupabaseClient } from "@supabase/supabase-js";

import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LOAN_STATUS } from "@/constants/loan";
import { requireLoanApproverUser } from "@/lib/auth/api-auth";
import { GENERATABLE_CONTRACT_TYPES } from "@/constants/contracts";

type TRpcRevertResult = {
  success: boolean;
  error?: string;
};

const isRpcNotFoundError = (
  error: { code?: string; message?: string } | null,
) => {
  if (!error) return false;

  return (
    error.code === "PGRST202" ||
    error.code === "42883" ||
    error.message?.includes("revert_loan_to_pending") === true
  );
};

/**
 * Fallback khi RPC chưa được deploy: đổi trạng thái trước, xóa hợp đồng sau, rollback nếu xóa thất bại.
 */
const revertLoanToPendingFallback = async (
  supabase: SupabaseClient,
  loanId: string,
) => {
  const { data: loan, error: fetchError } = await supabase
    .from("loans")
    .select("id, status, approved_at")
    .eq("id", loanId)
    .single();

  if (fetchError || !loan) {
    return {
      ok: false as const,
      status: 404,
      error: "Không tìm thấy khoản vay",
    };
  }

  if (loan.status !== LOAN_STATUS.APPROVED) {
    return {
      ok: false as const,
      status: 400,
      error:
        "Chỉ được trả về chờ duyệt khi khoản vay đang ở trạng thái đã duyệt",
    };
  }

  const previousApprovedAt = loan.approved_at;

  const { data: updatedLoans, error: updateError } = await supabase
    .from("loans")
    .update({
      status: LOAN_STATUS.PENDING,
      approved_at: null,
    })
    .eq("id", loanId)
    .eq("status", LOAN_STATUS.APPROVED)
    .select("id");

  if (updateError) {
    console.error("[REVERT_TO_PENDING_UPDATE_ERROR]", updateError);

    return {
      ok: false as const,
      status: 500,
      error: "Lỗi khi cập nhật trạng thái",
    };
  }

  if (!updatedLoans || updatedLoans.length === 0) {
    return {
      ok: false as const,
      status: 409,
      error:
        "Khoản vay không còn ở trạng thái đã duyệt hoặc đã được xử lý bởi thao tác khác",
    };
  }

  const { error: deleteFilesError } = await supabase
    .from("loan_files")
    .delete()
    .eq("loan_id", loanId)
    .in("type", GENERATABLE_CONTRACT_TYPES);

  if (!deleteFilesError) {
    return { ok: true as const };
  }

  console.error("[REVERT_TO_PENDING_DELETE_FILES_ERROR]", deleteFilesError);

  const { data: rolledBackLoans, error: rollbackError } = await supabase
    .from("loans")
    .update({
      status: LOAN_STATUS.APPROVED,
      approved_at: previousApprovedAt,
    })
    .eq("id", loanId)
    .eq("status", LOAN_STATUS.PENDING)
    .select("id");

  if (rollbackError || !rolledBackLoans || rolledBackLoans.length === 0) {
    console.error("[REVERT_TO_PENDING_ROLLBACK_ERROR]", {
      loanId,
      rollbackError,
      deleteFilesError,
    });

    return {
      ok: false as const,
      status: 500,
      error:
        "Không thể hoàn tất thao tác. Vui lòng tải lại trang và thử lại. Nếu lỗi vẫn tiếp diễn, liên hệ quản trị viên.",
    };
  }

  return {
    ok: false as const,
    status: 500,
    error: "Không thể xóa hợp đồng đã tạo. Trạng thái đã được khôi phục.",
  };
};

/**
 * POST /api/loans/[id]/revert-to-pending
 * Trả khoản vay từ trạng thái "Đã duyệt" về "Chờ duyệt" để chỉnh sửa thông tin.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: loanId } = await params;

  try {
    const supabase = await createSupabaseServerClient();

    const admin = await requireLoanApproverUser();

    if (!admin.ok) return admin.response;

    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "revert_loan_to_pending",
      { p_loan_id: loanId },
    );

    if (!rpcError && rpcResult) {
      const result = rpcResult as TRpcRevertResult;

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: "Đã trả khoản vay về trạng thái chờ duyệt",
        });
      }

      const status = result.error?.includes("Không tìm thấy") ? 404 : 400;

      return NextResponse.json(
        { success: false, error: result.error ?? "Không thể trả về chờ duyệt" },
        { status },
      );
    }

    if (!isRpcNotFoundError(rpcError)) {
      console.error("[REVERT_TO_PENDING_RPC_ERROR]", rpcError);

      return NextResponse.json(
        { success: false, error: "Lỗi khi xử lý trả về chờ duyệt" },
        { status: 500 },
      );
    }

    const fallbackResult = await revertLoanToPendingFallback(supabase, loanId);

    if (!fallbackResult.ok) {
      return NextResponse.json(
        { success: false, error: fallbackResult.error },
        { status: fallbackResult.status },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã trả khoản vay về trạng thái chờ duyệt",
    });
  } catch (error) {
    console.error("[REVERT_TO_PENDING_ERROR]", error);

    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 },
    );
  }
}
