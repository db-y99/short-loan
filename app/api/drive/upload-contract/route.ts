import { NextRequest, NextResponse } from "next/server";
import { uploadToDrive } from "@/lib/google-drive";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;
    const fileName = formData.get("fileName") as string | null;
    const folderId = formData.get("folderId") as string | null;
    const loanId = formData.get("loanId") as string | null;
    const fileType = (formData.get("fileType") as string | null) ?? "asset_pledge_contract";

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "File là bắt buộc" },
        { status: 400 },
      );
    }

    if (!folderId?.trim()) {
      return NextResponse.json(
        { error: "folderId là bắt buộc" },
        { status: 400 },
      );
    }

    const safeFileName =
      (fileName?.trim() && fileName.endsWith(".pdf")
        ? fileName
        : `${fileName ?? "contract"}.pdf`) || "hop-dong.pdf";

    const buffer = Buffer.from(await file.arrayBuffer());

    const { fileId } = await uploadToDrive(
      buffer,
      safeFileName,
      "application/pdf",
      folderId,
    );

    if (loanId?.trim()) {
      const supabase = await createSupabaseServerClient();
      await supabase.from("loan_files").insert({
        loan_id: loanId,
        name: safeFileName,
        type: fileType,
        provider: "google_drive",
        file_id: fileId,
      });
    }

    return NextResponse.json({
      success: true,
      fileId,
    });
  } catch (err) {
    console.error("[DRIVE_UPLOAD_CONTRACT_ERROR]", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Upload failed",
      },
      { status: 500 },
    );
  }
}
