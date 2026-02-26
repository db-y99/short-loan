import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: loanId } = await params;
    const body = await request.json();
    const { content, userId, userName } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { success: false, error: "Nội dung tin nhắn không được để trống" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Insert message into loan_activity_logs
    const { data, error } = await supabase
      .from("loan_activity_logs")
      .insert({
        loan_id: loanId,
        type: "message",
        user_id: userId,
        user_name: userName,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting message:", error);
      return NextResponse.json(
        { success: false, error: "Không thể gửi tin nhắn" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in POST /api/loans/[id]/messages:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}
