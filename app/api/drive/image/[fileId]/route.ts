import { Readable } from "stream";

import { create as createContentDisposition } from "content-disposition";
import { NextRequest, NextResponse } from "next/server";

import {
  requireActiveStaffUser,
  verifyStaffCanAccessDriveFile,
} from "@/lib/auth/api-auth";
import { streamFileFromDrive } from "@/lib/google-drive";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await ctx.params;

  try {
    const staff = await requireActiveStaffUser();

    if (!staff.ok) return staff.response;

    const canAccess = await verifyStaffCanAccessDriveFile(fileId);

    if (!canAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const result = await streamFileFromDrive(fileId);

    if (!result) {
      return new NextResponse("File not found", { status: 404 });
    }

    const webStream = Readable.toWeb(result.stream) as ReadableStream;

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": result.mimeType || "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": createContentDisposition(result.fileName, {
          type: "inline",
        }),
      },
    });
  } catch (err) {
    console.error("[DRIVE_IMAGE_STREAM]", err);

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
