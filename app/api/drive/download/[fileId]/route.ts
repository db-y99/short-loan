import { Readable } from "stream";

import { NextResponse } from "next/server";

import { streamFileFromDrive } from "@/lib/google-drive";
import { env } from "@/config/env";
import {
  requireActiveStaffUser,
  verifyStaffCanAccessDriveFile,
} from "@/lib/auth/api-auth";
import { create as createContentDisposition } from "content-disposition";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await ctx.params;

  const staff = await requireActiveStaffUser();

  if (!staff.ok) return staff.response;

  const canAccess = await verifyStaffCanAccessDriveFile(fileId);

  if (!canAccess) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format");

  // Export sang Word qua Apps Script service
  if (format === "docx") {
    try {
      const serviceUrl = env.CONVERT_PDF_TO_WORD_SERVICE_URL;

      if (!serviceUrl) {
        return new NextResponse(
          "CONVERT_PDF_TO_WORD_SERVICE_URL chưa được cấu hình",
          { status: 500 },
        );
      }

      // Gọi Apps Script để convert PDF → Google Docs → DOCX
      const scriptRes = await fetch(serviceUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });

      const json = await scriptRes.json();

      if (!json.success) {
        return new NextResponse(json.error || "Convert thất bại", {
          status: 400,
        });
      }

      // Dùng token từ Apps Script để tải file DOCX
      const docxRes = await fetch(json.downloadUrl, {
        headers: { Authorization: `Bearer ${json.token}` },
      });

      if (!docxRes.ok) {
        return new NextResponse("Không thể tải file Word từ Google", {
          status: 502,
        });
      }

      const buffer = await docxRes.arrayBuffer();

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": createContentDisposition(
            String(json.fileName || "document.docx"),
          ),
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Export thất bại";

      return new NextResponse(message, { status: 500 });
    }
  }

  // Stream file gốc (PDF hoặc bất kỳ định dạng nào)
  const result = await streamFileFromDrive(fileId);

  if (!result) {
    return new NextResponse("File not found", { status: 404 });
  }
  const { stream, fileName, mimeType } = result;
  const webStream = Readable.toWeb(stream) as ReadableStream;

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": mimeType || "application/octet-stream",
      "Content-Disposition": createContentDisposition(fileName),
    },
  });
}
