import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uploadAssetImagesService } from "@/services/assets/asset-images.service";

export const runtime = "nodejs";

/**
 * Upload ảnh tài sản (1 hoặc nhiều file trong 1 request).
 * Client nên chia batch theo UPLOAD_MAX_PAYLOAD_BYTES để tránh 413.
 * POST /api/assets/upload-images
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const formData = await req.formData();

    const loanId = formData.get("loanId") as string;

    if (!loanId) {
      return NextResponse.json(
        { error: "loanId là bắt buộc" },
        { status: 400 },
      );
    }

    const files: Array<{ buffer: Buffer; name: string; mimeType: string }> = [];
    const entries = Array.from(formData.entries());

    for (const [key, value] of entries) {
      const isFileField = key === "file" || key.startsWith("file_");

      if (!isFileField || !(value instanceof File)) continue;

      const arrayBuffer = await value.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      files.push({
        buffer,
        name: value.name,
        mimeType: value.type,
      });
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Không có file nào được chọn" },
        { status: 400 },
      );
    }

    const result = await uploadAssetImagesService(loanId, files);

    if (!result.success) {
      const status = result.error?.includes("chờ duyệt") ? 400 : 500;

      return NextResponse.json(
        { success: false, error: result.error ?? "Lỗi không xác định" },
        { status },
      );
    }

    return NextResponse.json({
      success: true,
      data: result.images ?? [],
    });
  } catch (error) {
    console.error("[UPLOAD_IMAGES_API_ERROR]", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Lỗi khi upload ảnh",
      },
      { status: 500 },
    );
  }
}
