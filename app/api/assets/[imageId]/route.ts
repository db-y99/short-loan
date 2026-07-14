import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
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

    const result = await deleteAssetImageService(imageId);

    if (!result.success) {
      const status = result.error?.includes("chờ duyệt") ? 400 : 404;

      return NextResponse.json(
        { success: false, error: result.error ?? "Lỗi khi xóa ảnh" },
        { status },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE_ASSET_IMAGE_API_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Lỗi khi xóa ảnh",
      },
      { status: 500 },
    );
  }
}
