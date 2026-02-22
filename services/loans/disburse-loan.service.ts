/**
 * 💰 DISBURSE LOAN SERVICE
 * Service để giải ngân khoản vay
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";

type TDisburseResult = {
  success: boolean;
  error?: string;
};

/**
 * Giải ngân khoản vay
 * 
 * Hệ quả:
 * 1. Chốt con số tài chính: Lưu disbursed_at làm mốc tính lãi
 * 2. Khóa chỉnh sửa: Status = disbursed sẽ khóa các field nhạy cảm ở UI
 * 3. Kích hoạt bộ chứng từ: Có đủ dữ liệu để tạo hợp đồng
 */
export async function disburseLoanService(
  loanId: string,
): Promise<TDisburseResult> {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Kiểm tra loan tồn tại và status hợp lệ
    const { data: loan, error: fetchError } = await supabase
      .from("loans")
      .select("id, status, disbursed_at")
      .eq("id", loanId)
      .single();

    if (fetchError || !loan) {
      return {
        success: false,
        error: "Không tìm thấy khoản vay",
      };
    }

    // Chỉ cho phép giải ngân khi status = approved
    if (loan.status !== "approved") {
      return {
        success: false,
        error: `Không thể giải ngân. Trạng thái hiện tại: ${loan.status}`,
      };
    }

    // Kiểm tra đã giải ngân chưa
    if (loan.disbursed_at) {
      return {
        success: false,
        error: "Khoản vay đã được giải ngân trước đó",
      };
    }

    // 2. Cập nhật status và disbursed_at
    const now = new Date().toISOString();
    
    const { error: updateError } = await supabase
      .from("loans")
      .update({
        status: "disbursed",
        disbursed_at: now,
      })
      .eq("id", loanId);

    if (updateError) {
      console.error("[DISBURSE_LOAN_ERROR]", updateError);
      return {
        success: false,
        error: "Không thể cập nhật trạng thái giải ngân",
      };
    }

    // 3. Ghi log activity
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (userId) {
      await supabase.from("loan_activity_logs").insert({
        loan_id: loanId,
        user_id: userId,
        type: "disbursement",
        system_message: `Đã giải ngân khoản vay vào ${new Date(now).toLocaleString("vi-VN")}`,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("[DISBURSE_LOAN_SERVICE_ERROR]", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Lỗi khi giải ngân",
    };
  }
}
