import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireLoanApproverUser } from "@/lib/auth/api-auth";
import { generateSignedContractsService } from "@/services/contracts/contracts.service";

/**
 * POST /api/loans/[id]/generate-signed-contracts
 * Generate or repair signed contract PDFs for a signed loan
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: loanId } = await params;

    const admin = await requireLoanApproverUser();

    if (!admin.ok) return admin.response;

    // Verify loan exists, is signed, and has signatures
    const { data: loan, error: fetchError } = await supabase
      .from("loans")
      .select("id, status, draft_signature_file_id, official_signature_file_id")
      .eq("id", loanId)
      .single();

    if (fetchError || !loan) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khoản vay" },
        { status: 404 },
      );
    }

    if (loan.status !== "signed") {
      return NextResponse.json(
        { success: false, error: "Khoản vay chưa được ký" },
        { status: 400 },
      );
    }

    if (!loan.draft_signature_file_id || !loan.official_signature_file_id) {
      return NextResponse.json(
        { success: false, error: "Chưa có chữ ký để tạo PDF" },
        { status: 400 },
      );
    }

    // Generate or repair signed PDFs
    console.log(
      "[GENERATE_CONTRACTS] Starting PDF generation for loan:",
      loanId,
    );
    const result = await generateSignedContractsService(loanId);

    if (!result.success) {
      console.error("[GENERATE_CONTRACTS] Failed:", result.error);

      return NextResponse.json(
        { success: false, error: result.error || "Lỗi khi tạo PDF" },
        { status: 500 },
      );
    }

    console.log(
      "[GENERATE_CONTRACTS] Successfully generated",
      result.contracts?.length,
      "PDFs",
    );

    return NextResponse.json({
      success: true,
      message: "Tạo hợp đồng PDF thành công",
      data: result.contracts,
    });
  } catch (error) {
    console.error("[GENERATE_CONTRACTS] Error:", error);

    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 },
    );
  }
}

// Increase timeout for PDF generation (Vercel Pro only)
export const maxDuration = 60; // 60 seconds
