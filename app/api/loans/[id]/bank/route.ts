import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LOAN_STATUS } from "@/constants/loan";

/**
 * PATCH /api/loans/[id]/bank
 * Cập nhật thông tin ngân hàng của khoản vay
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: loanId } = await params;

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { bank_name, bank_account_holder, bank_account_number } = body;

    // Validate required fields
    if (!bank_name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Tên ngân hàng không được để trống" },
        { status: 400 }
      );
    }

    if (!bank_account_holder?.trim()) {
      return NextResponse.json(
        { success: false, error: "Chủ tài khoản không được để trống" },
        { status: 400 }
      );
    }

    if (!bank_account_number?.trim()) {
      return NextResponse.json(
        { success: false, error: "Số tài khoản không được để trống" },
        { status: 400 }
      );
    }

    // Update loan bank information (chỉ khi chờ duyệt)
    const { data, error } = await supabase
      .from("loans")
      .update({
        bank_name: bank_name.trim(),
        bank_account_holder: bank_account_holder.trim(),
        bank_account_number: bank_account_number.trim(),
      })
      .eq("id", loanId)
      .eq("status", LOAN_STATUS.PENDING)
      .select()
      .single();

    if (error?.code === "PGRST116") {
      return NextResponse.json(
        {
          success: false,
          error: "Chỉ được sửa thông tin ngân hàng khi khoản vay ở trạng thái chờ duyệt",
        },
        { status: 400 },
      );
    }

    if (error) {
      console.error("[UPDATE_BANK_ERROR]", error);
      return NextResponse.json(
        { success: false, error: "Không thể cập nhật thông tin ngân hàng" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[UPDATE_BANK_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
