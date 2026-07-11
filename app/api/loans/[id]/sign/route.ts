import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LOAN_STATUS } from "@/constants/loan";
import { uploadToDrive, deleteManyFromDrive } from "@/lib/google-drive";
import { generateSignedContractsService } from "@/services/contracts/contracts.service";
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

    // Cập nhật trạng thái (optimistic lock: chỉ khi đang approved)
    const { data: updatedLoans, error: updateError } = await supabase
      .from("loans")
      .update({
        status: LOAN_STATUS.SIGNED,
        signed_at: signedAt,
        is_signed: true,
        draft_signature_file_id: draftSignatureFileId,
        official_signature_file_id: officialSignatureFileId,
      })
      .eq("id", loanId)
      .eq("status", LOAN_STATUS.APPROVED)
      .select("id");

    if (updateError || !updatedLoans || updatedLoans.length === 0) {
      console.error("Error updating loan status:", updateError);
      // Bù trừ: xóa chữ ký đã upload lên Drive
      const uploadedIds = [draftSignatureFileId, officialSignatureFileId].filter(
        (id): id is string => Boolean(id)
      );
      if (uploadedIds.length > 0) {
        await deleteManyFromDrive(uploadedIds).catch((cleanupError) => {
          console.error("[SIGN_DRIVE_CLEANUP_ERROR]", cleanupError);
        });
      }
      return NextResponse.json(
        {
          success: false,
          error: updateError
            ? "Lỗi khi cập nhật trạng thái"
            : "Khoản vay không còn ở trạng thái đã duyệt hoặc đã được ký",
        },
        { status: updateError ? 500 : 409 }
      );
    }

    await supabase.from("loan_activity_logs").insert({
      loan_id: loanId,
      type: "contract_signed",
      user_id: user.id,
      user_name: user.email || "System",
      system_message: "Hợp đồng đã được ký kết",
    });

    const pdfResult = await generateSignedContractsService(loanId);

    if (!pdfResult.success) {
      const signatureFileIds = [draftSignatureFileId, officialSignatureFileId].filter(
        (id): id is string => Boolean(id),
      );

      const { error: revertError } = await supabase
        .from("loans")
        .update({
          status: LOAN_STATUS.APPROVED,
          signed_at: null,
          is_signed: false,
          draft_signature_file_id: null,
          official_signature_file_id: null,
        })
        .eq("id", loanId)
        .eq("status", LOAN_STATUS.SIGNED);

      if (revertError) {
        console.error("[SIGN_REVERT_STATUS_ERROR]", revertError);
      }

      if (signatureFileIds.length > 0) {
        await deleteManyFromDrive(signatureFileIds).catch((cleanupError) => {
          console.error("[SIGN_REVERT_DRIVE_CLEANUP_ERROR]", cleanupError);
        });
      }

      return NextResponse.json(
        {
          success: false,
          error:
            pdfResult.error ||
            "Không thể tạo hợp đồng PDF. Trạng thái ký đã được hoàn tác.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Ký hợp đồng và tạo PDF thành công",
      data: {
        signedAt,
        loanId,
        contracts: pdfResult.contracts,
      },
    });  } catch (error) {
    console.error("Error signing contract:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}

export const maxDuration = 60;
