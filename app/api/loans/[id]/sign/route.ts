import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LOAN_STATUS } from "@/constants/loan";
import { uploadToDrive } from "@/lib/google-drive";
import { env } from "@/config/env";

/**
 * Helper function to convert base64 data URL to Buffer
 */
function base64ToBuffer(dataUrl: string): Buffer {
  const base64Data = dataUrl.split(",")[1];
  return Buffer.from(base64Data, "base64");
}

/**
 * POST /api/loans/[id]/sign
 * Ký hợp đồng (chuyển từ approved sang signed)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: loanId } = await params;

    // Get signatures from request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }
    
    const { draftSignature, officialSignature } = body;

    if (!draftSignature || !officialSignature) {
      return NextResponse.json(
        { success: false, error: "Thiếu chữ ký. Vui lòng ký cả chữ ký nháy và chữ ký chính thức." },
        { status: 400 }
      );
    }

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

    // Kiểm tra loan tồn tại và đang ở trạng thái approved
    const { data: loan, error: fetchError } = await supabase
      .from("loans")
      .select("id, status, code, drive_folder_id")
      .eq("id", loanId)
      .single();

    if (fetchError || !loan) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khoản vay" },
        { status: 404 }
      );
    }

    if (loan.status !== LOAN_STATUS.APPROVED) {
      return NextResponse.json(
        { success: false, error: "Khoản vay chưa được duyệt" },
        { status: 400 }
      );
    }

    const signedAt = new Date().toISOString();

    // Get loan folder ID
    const loanFolderId = loan.drive_folder_id;
    if (!loanFolderId) {
      return NextResponse.json(
        { success: false, error: "Loan folder not found" },
        { status: 400 }
      );
    }

    // Upload signatures to Google Drive in parallel
    let draftSignatureFileId: string | null = null;
    let officialSignatureFileId: string | null = null;

    try {
      const uploadPromises = [];
      
      if (draftSignature) {
        const draftBuffer = base64ToBuffer(draftSignature);
        uploadPromises.push(
          uploadToDrive(
            draftBuffer,
            `chu-ky-nhay-${loan.code}.png`,
            "image/png",
            loanFolderId
          )
        );
      }

      if (officialSignature) {
        const officialBuffer = base64ToBuffer(officialSignature);
        uploadPromises.push(
          uploadToDrive(
            officialBuffer,
            `chu-ky-chinh-thuc-${loan.code}.png`,
            "image/png",
            loanFolderId
          )
        );
      }

      const [draftResult, officialResult] = await Promise.all(uploadPromises);
      draftSignatureFileId = draftResult?.fileId || null;
      officialSignatureFileId = officialResult?.fileId || null;
    } catch (uploadError) {
      console.error("Error uploading signatures:", uploadError);
      return NextResponse.json(
        { success: false, error: "Lỗi khi upload chữ ký" },
        { status: 500 }
      );
    }

    // Cập nhật trạng thái và log activity song song
    const [updateResult] = await Promise.all([
      supabase
        .from("loans")
        .update({
          status: LOAN_STATUS.SIGNED,
          signed_at: signedAt,
          draft_signature_file_id: draftSignatureFileId,
          official_signature_file_id: officialSignatureFileId,
        })
        .eq("id", loanId),
      supabase.from("loan_activity_logs").insert({
        loan_id: loanId,
        type: "contract_signed",
        user_id: user.id,
        user_name: user.email || "System",
        system_message: `Hợp đồng đã được ký kết`,
      }),
    ]);

    if (updateResult.error) {
      console.error("Error updating loan status:", updateResult.error);
      return NextResponse.json(
        { success: false, error: "Lỗi khi cập nhật trạng thái" },
        { status: 500 }
      );
    }

    // Return immediately - PDF generation will be triggered from client
    return NextResponse.json({
      success: true,
      message: "Ký hợp đồng thành công",
      data: {
        signedAt,
        loanId, // Return loanId so client can trigger PDF generation
      },
    });
  } catch (error) {
    console.error("Error signing contract:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}
