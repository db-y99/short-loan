import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * PATCH /api/customers/[id]
 * Cập nhật thông tin khách hàng
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: customerId } = await params;

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
    const {
      full_name,
      cccd,
      phone,
      address,
      cccd_issue_date,
      cccd_issue_place,
      facebook_link,
      job,
      income,
    } = body;

    // Validate required fields
    if (!full_name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Họ tên không được để trống" },
        { status: 400 }
      );
    }

    if (!cccd?.trim()) {
      return NextResponse.json(
        { success: false, error: "Số CCCD không được để trống" },
        { status: 400 }
      );
    }

    if (!phone?.trim()) {
      return NextResponse.json(
        { success: false, error: "Số điện thoại không được để trống" },
        { status: 400 }
      );
    }

    // Convert DD/MM/YYYY to YYYY-MM-DD if needed
    let formattedDate = cccd_issue_date;
    if (cccd_issue_date && cccd_issue_date.includes('/')) {
      const parts = cccd_issue_date.split('/');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    // Update customer
    const { data, error } = await supabase
      .from("customers")
      .update({
        full_name: full_name.trim(),
        cccd: cccd.trim(),
        phone: phone.trim(),
        address: address?.trim() || null,
        cccd_issue_date: formattedDate || null,
        cccd_issue_place: cccd_issue_place?.trim() || null,
        facebook_link: facebook_link?.trim() || null,
        job: job?.trim() || null,
        income: income || null,
      })
      .eq("id", customerId)
      .select()
      .single();

    if (error) {
      console.error("[UPDATE_CUSTOMER_ERROR]", error);
      return NextResponse.json(
        { success: false, error: "Không thể cập nhật thông tin khách hàng" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[UPDATE_CUSTOMER_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
