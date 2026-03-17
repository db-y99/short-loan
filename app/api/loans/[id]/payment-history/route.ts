import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/actions/auth";

/**
 * GET /api/loans/[id]/payment-history
 * Lấy tất cả lịch sử đóng tiền (bao gồm cả đóng lãi và đóng tiền linh hoạt)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: loanId } = await params;
    const supabase = await createSupabaseServerClient();

    // Kiểm tra khoản vay tồn tại
    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select("id, code, status")
      .eq("id", loanId)
      .single();

    if (loanError || !loan) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khoản vay" },
        { status: 404 }
      );
    }

    // Lấy tất cả lịch sử thanh toán với thông tin user bằng join
    const { data: payments, error: paymentsError } = await supabase
      .from("loan_payment_transactions")
      .select(`
        id,
        amount,
        transaction_type,
        payment_method,
        notes,
        created_at,
        created_by,
        profiles (
          id,
          email,
          full_name
        )
      `)
      .eq("loan_id", loanId)
      .order("created_at", { ascending: false });

    if (paymentsError) {
      console.error("Payment history error:", paymentsError);
      return NextResponse.json(
        { success: false, error: "Lỗi khi lấy lịch sử thanh toán" },
        { status: 500 }
      );
    }

    // Format dữ liệu để dễ sử dụng
    const formattedPayments = (payments || []).map((payment: any) => ({
      id: payment.id,
      amount: payment.amount,
      transaction_type: payment.transaction_type,
      payment_method: payment.payment_method,
      notes: payment.notes,
      created_at: payment.created_at,
      created_by_user: payment.profiles ? {
        id: payment.profiles.id,
        email: payment.profiles.email,
        full_name: payment.profiles.full_name,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedPayments,
      total: formattedPayments.length,
    });

  } catch (error) {
    console.error("Payment history API error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}