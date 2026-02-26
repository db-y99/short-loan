/**
 * API Route: Stream file from Google Drive
 * Feature: chat-va-trao-doi-nhat-ky
 * 
 * Stream files from Google Drive using service account
 */

import { NextRequest, NextResponse } from "next/server";
import { streamFileFromDrive } from "@/lib/google-drive";

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Stream file from Drive
    const result = await streamFileFromDrive(fileId);

    if (!result) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const { stream, mimeType, fileName } = result;

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    // Return file with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error streaming file from Drive:", error);
    return NextResponse.json(
      { error: "Failed to stream file" },
      { status: 500 }
    );
  }
}
