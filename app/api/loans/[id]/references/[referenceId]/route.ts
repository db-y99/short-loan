import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LOAN_STATUS } from "@/constants/loan";

const getPendingLoan = async (loanId: string) => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, error: "Unauthorized", status: 401 as const };
  }

  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("id, status")
    .eq("id", loanId)
    .single();

  if (loanError || !loan) {
    return { supabase, error: "Không tìm thấy khoản vay", status: 404 as const };
  }

  if (loan.status !== LOAN_STATUS.PENDING) {
    return {
      supabase,
      error: "Chỉ được sửa/xóa tham chiếu khi khoản vay ở trạng thái chờ duyệt",
      status: 400 as const,
    };
  }

  return { supabase, error: null, status: 200 as const };
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; referenceId: string }> },
) {
  try {
    const { id: loanId, referenceId } = await params;
    const precheck = await getPendingLoan(loanId);

    if (precheck.error) {
      return NextResponse.json(
        { success: false, error: precheck.error },
        { status: precheck.status },
      );
    }

    const { fullName, phone, relationship } = await request.json();

    if (!fullName || !phone || !relationship) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin bắt buộc" },
        { status: 400 },
      );
    }

    const { data, error } = await precheck.supabase
      .from("loan_references")
      .update({
        full_name: fullName,
        phone,
        relationship,
      })
      .eq("id", referenceId)
      .eq("loan_id", loanId)
      .select("id, full_name, phone, relationship")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Không thể cập nhật tham chiếu" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[UPDATE_REFERENCE_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; referenceId: string }> },
) {
  try {
    const { id: loanId, referenceId } = await params;
    const precheck = await getPendingLoan(loanId);

    if (precheck.error) {
      return NextResponse.json(
        { success: false, error: precheck.error },
        { status: precheck.status },
      );
    }

    const { error } = await precheck.supabase
      .from("loan_references")
      .delete()
      .eq("id", referenceId)
      .eq("loan_id", loanId);

    if (error) {
      return NextResponse.json(
        { success: false, error: "Không thể xóa tham chiếu" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[DELETE_REFERENCE_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
