import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LOAN_STATUS } from "@/constants/loan";
import { getCurrentUser } from "@/lib/actions/auth";
import { isRpcNotFoundError, parseRpcResult } from "@/lib/supabase/rpc-result";

async function recordFlexiblePaymentFallback({
  supabase,
  loanId,
  amount,
  note,
  userId,
  userEmail,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  loanId: string;
  amount: number;
  note?: string;
  userId: string;
  userEmail: string;
}) {
  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("id, status, amount, current_cycle")
    .eq("id", loanId)
    .single();

  if (loanError || !loan) {
    return { success: false as const, error: "Không tìm thấy khoản vay", status: 404 };
  }

  if (loan.status !== LOAN_STATUS.DISBURSED) {
    return {
      success: false as const,
      error: "Khoản vay chưa được giải ngân",
      status: 400,
    };
  }

  const cycleNumber = loan.current_cycle || 1;

  let { data: currentCycle } = await supabase
    .from("loan_payment_cycles")
    .select("id")
    .eq("loan_id", loanId)
    .eq("cycle_number", cycleNumber)
    .maybeSingle();

  if (!currentCycle) {
    const { data: newCycle, error: cycleError } = await supabase
      .from("loan_payment_cycles")
      .insert({
        loan_id: loanId,
        cycle_number: cycleNumber,
        principal: loan.amount,
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      })
      .select("id")
      .maybeSingle();

    if (cycleError?.code === "23505") {
      const { data: existingCycle, error: existingCycleError } = await supabase
        .from("loan_payment_cycles")
        .select("id")
        .eq("loan_id", loanId)
        .eq("cycle_number", cycleNumber)
        .single();

      if (existingCycleError || !existingCycle) {
        return {
          success: false as const,
          error: "Lỗi khi tạo chu kỳ thanh toán",
          status: 500,
        };
      }

      currentCycle = existingCycle;
    } else if (cycleError || !newCycle) {
      console.error("[FLEXIBLE_PAYMENT_CYCLE_ERROR]", cycleError);
      return {
        success: false as const,
        error: "Lỗi khi tạo chu kỳ thanh toán",
        status: 500,
      };
    } else {
      currentCycle = newCycle;
    }
  }

  const paymentNote =
    note?.trim() ||
    `Thanh toán linh hoạt ${amount.toLocaleString("vi-VN")} VNĐ`;

  const { data: payment, error: paymentError } = await supabase
    .from("loan_payment_transactions")
    .insert({
      loan_id: loanId,
      cycle_id: currentCycle.id,
      period_id: null,
      transaction_type: "fee_payment",
      amount,
      payment_method: "cash",
      notes: paymentNote,
      created_by: userId,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (paymentError) {
    console.error("[FLEXIBLE_PAYMENT_INSERT_ERROR]", paymentError);
    return {
      success: false as const,
      error: "Lỗi khi tạo bản ghi thanh toán",
      status: 500,
    };
  }

  await supabase.from("loan_activity_logs").insert({
    loan_id: loanId,
    type: "system_event",
    user_id: userId,
    user_name: userEmail || "System",
    system_message: `Đóng tiền linh hoạt ${amount.toLocaleString("vi-VN")} VNĐ${note ? ` - ${note}` : ""}`,
  });

  const { data: totalPaidData } = await supabase
    .from("loan_payment_transactions")
    .select("amount")
    .eq("loan_id", loanId);

  const totalPaid =
    totalPaidData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

  return {
    success: true as const,
    data: {
      payment,
      totalPaid,
      message: `Đã ghi nhận thanh toán ${amount.toLocaleString("vi-VN")} VNĐ`,
    },
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { amount, note } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Số tiền không hợp lệ" },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();
    const { id: loanId } = await params;

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "record_flexible_payment",
      {
        p_loan_id: loanId,
        p_amount: amount,
        p_notes: note ?? null,
        p_user_id: user.id,
        p_user_name: user.email || "System",
      },
    );

    if (!rpcError) {
      const result = parseRpcResult(rpcData);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || "Không thể ghi nhận thanh toán" },
          { status: 400 },
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          paymentId: result.payment_id,
          totalPaid: result.total_paid,
          message: `Đã ghi nhận thanh toán ${Number(amount).toLocaleString("vi-VN")} VNĐ`,
        },
      });
    }

    if (!isRpcNotFoundError(rpcError)) {
      console.error("[FLEXIBLE_PAYMENT_RPC_ERROR]", rpcError);
      return NextResponse.json(
        { success: false, error: "Lỗi khi ghi nhận thanh toán" },
        { status: 500 },
      );
    }

    const fallback = await recordFlexiblePaymentFallback({
      supabase,
      loanId,
      amount,
      note,
      userId: user.id,
      userEmail: user.email || "System",
    });

    if (!fallback.success) {
      return NextResponse.json(
        { success: false, error: fallback.error },
        { status: fallback.status },
      );
    }

    return NextResponse.json({
      success: true,
      data: fallback.data,
    });
  } catch (error) {
    console.error("[FLEXIBLE_PAYMENT_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 },
    );
  }
}
