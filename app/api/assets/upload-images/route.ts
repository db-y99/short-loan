import { NextRequest, NextResponse } from "next/server";
import { uploadAssetImagesService } from "@/services/assets/asset-images.service";

export const runtime = "nodejs";

/**
 * Upload nhiều ảnh tài sản
 * POST /api/assets/upload-images
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const loanId = formData.get("loanId") as string;
    if (!loanId) {
      return NextResponse.json(
        { error: "loanId là bắt buộc" },
        { status: 400 }
      );
    }

    // Lấy tất cả files từ FormData
    const files: Array<{ buffer: Buffer; name: string; mimeType: string }> = [];
    
    // Convert FormData entries to array to avoid iterator issues
    const entries = Array.from(formData.entries());
    
    for (const [key, value] of entries) {
      if (key.startsWith("file_") && value instanceof File) {
        const arrayBuffer = await value.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        files.push({
          buffer,
          name: value.name,
          mimeType: value.type,
        });
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Không có file nào được chọn" },
        { status: 400 }
      );
    }

    const result = await uploadAssetImagesService(loanId, files);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Lỗi không xác định" },
        { status: 500 }
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
        error:
          error instanceof Error ? error.message : "Lỗi khi upload ảnh",
      },
      { status: 500 }
    );
  }
}
