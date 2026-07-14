import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LOAN_STATUS, type TLoanType } from "@/constants/loan";
import { requireLoanApproverUser } from "@/lib/auth/api-auth";
import { calculateAppraisalFee } from "@/lib/loan-calculation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: loanId } = await params;

    const admin = await requireLoanApproverUser();

    if (!admin.ok) return admin.response;

    const body = await request.json();
    const loanAmount = Number(body.loanAmount);

    if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Số tiền vay không hợp lệ" },
        { status: 400 },
      );
    }

    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select("id, status, loan_type, amount")
      .eq("id", loanId)
      .single();

    if (loanError || !loan) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khoản vay" },
        { status: 404 },
      );
    }

    const canEditAmount = loan.status === LOAN_STATUS.PENDING;

    if (!canEditAmount) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Chỉ được sửa số tiền vay khi khoản vay ở trạng thái chờ duyệt",
        },
        { status: 400 },
      );
    }

    const appraisalFee = calculateAppraisalFee(
      loanAmount,
      loan.loan_type as TLoanType,
    );

    const { data: updatedLoans, error: updateError } = await supabase
      .from("loans")
      .update({
        amount: loanAmount,
        appraisal_fee: appraisalFee,
      })
      .eq("id", loanId)
      .eq("status", LOAN_STATUS.PENDING)
      .select("id");

    if (updateError || !updatedLoans || updatedLoans.length === 0) {
      console.error("[UPDATE_LOAN_AMOUNT_ERROR]", updateError);

      return NextResponse.json(
        {
          success: false,
          error: updateError
            ? "Không thể cập nhật số tiền vay"
            : "Khoản vay không còn ở trạng thái chờ duyệt",
        },
        { status: updateError ? 500 : 409 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        loanAmount,
        appraisalFee,
      },
    });
  } catch (error) {
    console.error("[PATCH_LOAN_AMOUNT_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Lỗi server",
      },
      { status: 500 },
    );
  }
}
