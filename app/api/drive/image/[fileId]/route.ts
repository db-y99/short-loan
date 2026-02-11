import { NextRequest, NextResponse } from "next/server";
import { streamFileFromDrive } from "@/lib/google-drive";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await ctx.params;

  try {
    /**
     * TODO:
     * - verify session
     * - verify fileId thuộc bulletin / approve / loan của user
     */

    const result = await streamFileFromDrive(fileId);

    if (!result) {
      return new NextResponse("File not found", { status: 404 });
    }

    return new NextResponse(result.stream as any, {
      headers: {
        "Content-Type": result.mimeType,
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": `inline; filename="${result.fileName}"`,
      },
    });
  } catch (err) {
    console.error("[DRIVE_IMAGE_STREAM]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
