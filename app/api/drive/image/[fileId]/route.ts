import { Readable } from "stream";

import { create as createContentDisposition } from "content-disposition";
import { NextRequest, NextResponse } from "next/server";

import { requireActiveStaffUser } from "@/lib/auth/api-auth";
import {
  streamFileFromDrive,
  streamFileMediaFromDrive,
} from "@/lib/google-drive";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await ctx.params;
  const isThumb = req.nextUrl.searchParams.get("thumb") === "1";

  try {
    const staff = await requireActiveStaffUser();

    if (!staff.ok) return staff.response;

    // Thumbnail: 1 lần gọi Drive (bỏ metadata) — gallery load nhiều ảnh cùng lúc
    const result = isThumb
      ? await streamFileMediaFromDrive(fileId)
      : await streamFileFromDrive(fileId);

    if (!result) {
      return new NextResponse("File not found", { status: 404 });
    }

    const webStream = Readable.toWeb(result.stream) as ReadableStream;
    const headers: Record<string, string> = {
      "Content-Type": result.mimeType || "application/octet-stream",
      // Cache mạnh hơn cho thumb — grid 50 ảnh đỡ gọi lại Drive
      "Cache-Control": isThumb
        ? "private, max-age=86400, stale-while-revalidate=604800"
        : "private, max-age=3600",
    };

    if (!isThumb) {
      headers["Content-Disposition"] = createContentDisposition(
        result.fileName,
        { type: "inline" },
      );
    }

    return new NextResponse(webStream, { headers });
  } catch (err) {
    console.error("[DRIVE_IMAGE_STREAM]", err);

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
