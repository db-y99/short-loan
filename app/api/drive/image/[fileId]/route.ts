import { NextRequest, NextResponse } from "next/server";

import {
  requireActiveStaffUser,
  verifyStaffCanAccessDriveFile,
} from "@/lib/auth/api-auth";
import { streamFileFromDrive } from "@/lib/google-drive";

export async function GET(
  req: NextRequest,
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
