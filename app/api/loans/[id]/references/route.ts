import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * POST /api/loans/[id]/references
 * Thêm tham chiếu cho khoản vay
 */
export async function POST(
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

    // Get request body
    const body = await request.json();
    const { fullName, phone, relationship } = body;

    // Validate required fields
    if (!fullName || !phone || !relationship) {
      return NextResponse.json(
        {
          success: false,
          error: "Thiếu thông tin bắt buộc",
        },
        { status: 400 }
      );
    }

    // Check if loan exists
    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select("id")
      .eq("id", loanId)
      .single();

    if (loanError || !loan) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khoản vay" },
        { status: 404 }
      );
    }

    // Insert reference
    const { data: reference, error: insertError } = await supabase
      .from("loan_references")
      .insert({
        loan_id: loanId,
        full_name: fullName,
        phone: phone,
        relationship: relationship,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[ADD_REFERENCE_ERROR]", insertError);
      return NextResponse.json(
        { success: false, error: "Không thể thêm tham chiếu" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: reference,
    });
  } catch (error) {
    console.error("[ADD_REFERENCE_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/loans/[id]/references
 * Lấy danh sách tham chiếu của khoản vay
 */
export async function GET(
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

    // Get references
    const { data: references, error } = await supabase
      .from("loan_references")
      .select("*")
      .eq("loan_id", loanId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET_REFERENCES_ERROR]", error);
      return NextResponse.json(
        { success: false, error: "Không thể lấy danh sách tham chiếu" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: references || [],
    });
  } catch (error) {
    console.error("[GET_REFERENCES_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
