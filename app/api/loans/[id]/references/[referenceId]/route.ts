import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminForPendingLoan } from "@/lib/auth/api-auth";

const getPendingLoan = async (loanId: string) => {
  const admin = await requireAdminForPendingLoan(loanId);

  if (!admin.ok) {
    return { ok: false as const, response: admin.response };
  }

  return { ok: true as const };
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; referenceId: string }> },
) {
  try {
    const { id: loanId, referenceId } = await params;
    const precheck = await getPendingLoan(loanId);

    if (!precheck.ok) {
      return precheck.response;
    }

    const supabase = await createSupabaseServerClient();
    const { fullName, phone, relationship } = await request.json();

    if (!fullName || !phone || !relationship) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin bắt buộc" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
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

    if (!precheck.ok) {
      return precheck.response;
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
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
