import { NextResponse } from "next/server";
import { deleteAssetImageService } from "@/services/assets/asset-images.service";

export const runtime = "nodejs";

/**
 * Xóa mềm ảnh tài sản — chỉ gỡ khỏi DB, giữ file trên Drive
 * DELETE /api/assets/[imageId]
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ imageId: string }> },
) {
  try {
    const { imageId } = await params;

    if (!imageId) {
      return NextResponse.json(
        { success: false, error: "imageId là bắt buộc" },
        { status: 400 },
      );
    }

    const result = await deleteAssetImageService(imageId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error ?? "Lỗi khi xóa ảnh" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE_ASSET_IMAGE_API_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Lỗi khi xóa ảnh",
      },
      { status: 500 },
    );
  }
}
