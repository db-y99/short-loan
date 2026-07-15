import { NextRequest, NextResponse } from "next/server";

import { requireActiveStaffUser } from "@/lib/auth/api-auth";
import { getLoanDetailsService } from "@/services/loans/loans.service";

/**
 * GET /api/loans/[id]
 * Lấy chi tiết khoản vay
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const staff = await requireActiveStaffUser();

    if (!staff.ok) return staff.response;

    const { id: loanId } = await params;

    // Get loan details
    const loanDetails = await getLoanDetailsService(loanId);

    if (!loanDetails) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khoản vay" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: loanDetails,
    });
  } catch (error) {
    console.error("[GET_LOAN_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
