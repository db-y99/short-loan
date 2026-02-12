// app/api/drive/download/[fileId]/route.ts

import { NextResponse } from "next/server";
import { streamFileFromDrive } from "@/lib/google-drive";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await ctx.params;

  const result = await streamFileFromDrive(fileId);
  if (!result) {
    return new NextResponse("File not found", { status: 404 });
  }
  const { stream, fileName, mimeType } = result;
  await streamFileFromDrive(fileId);

  return new NextResponse(stream as any, {
    headers: {
      "Content-Type": mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
