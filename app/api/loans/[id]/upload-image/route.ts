/**
 * Upload Image API Route
 * Feature: chat-va-trao-doi-nhat-ky
 * 
 * Upload image to Google Drive for chat messages
 */

import { NextRequest, NextResponse } from "next/server";
import { uploadToDrive } from "@/lib/google-drive";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: loanId } = await params;
    const formData = await request.formData();
    
    const file = formData.get("file") as File;
    const driveFolderId = formData.get("driveFolderId") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Không có file được chọn" },
        { status: 400 }
      );
    }

    if (!driveFolderId) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin folder Drive" },
        { status: 400 }
      );
    }

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB." },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Chỉ hỗ trợ định dạng JPG, PNG, WEBP." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}_${random}_${file.name}`;

    // Upload to Google Drive
    const { fileId } = await uploadToDrive(
      buffer,
      fileName,
      file.type,
      driveFolderId
    );

    return NextResponse.json({ 
      success: true, 
      fileId,
      fileName 
    });
  } catch (error) {
    console.error("Error in POST /api/loans/[id]/upload-image:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Lỗi server" 
      },
      { status: 500 }
    );
  }
}
