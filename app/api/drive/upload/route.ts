// app/api/drive/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { uploadToDrive } from "@/lib/google-drive";
import { env } from "@/config/env";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const feature = formData.get("feature") as string | null;

    console.log("File:", file?.name);
    console.log("Feature:", feature);

    // Validate input
    if (!file) {
      return NextResponse.json({ error: "File là bắt buộc" }, { status: 400 });
    }

    if (!feature) {
      return NextResponse.json(
        { error: "Feature là bắt buộc" },
        { status: 400 },
      );
    }

    // Get folder ID
    const folderId = env.SHORT_LOAN_GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) {
      return NextResponse.json(
        { error: `Feature không hợp lệ: ${feature}` },
        { status: 400 },
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().slice(0, 8);
    const safeName = file.name
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    const filename = `${timestamp}_${randomId}_${safeName}`;

    // Upload to Google Drive
    const { fileId } = await uploadToDrive(
      buffer,
      filename,
      file.type,
      folderId,
    );

    return NextResponse.json({
      fileId,
      fileName: file.name,
      uploadedName: filename,
    });
  } catch (err) {
    console.error("[DRIVE_UPLOAD_ERROR]", err);

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Upload failed",
        details:
          process.env.NODE_ENV === "development" ? String(err) : undefined,
      },
      { status: 500 },
    );
  }
}
