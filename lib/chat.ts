/**
 * Chat Data Layer
 * Feature: chat-va-trao-doi-nhat-ky
 * 
 * Core functions for chat messaging and image upload
 */

import { supabaseClient } from "./supabase/client";
import { ActivityLog } from "@/types/chat.types";

/**
 * Insert a text message into activity logs
 * 
 * @param loanId - The loan ID
 * @param userId - The user ID sending the message
 * @param userName - The user name sending the message
 * @param content - The message content
 * @returns The created activity log entry
 */
export async function insertMessage(
  loanId: string,
  userId: string,
  userName: string,
  content: string
): Promise<ActivityLog> {
  const { data, error } = await supabaseClient
    .from("loan_activity_logs")
    .insert({
      loan_id: loanId,
      type: "message",
      user_id: userId,
      user_name: userName,
      content: content,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to insert message:", error);
    throw new Error(`Failed to send message: ${error.message}`);
  }

  return data as ActivityLog;
}

/**
 * Upload an image to Google Drive via API and return the file ID
 * 
 * @param loanId - The loan ID
 * @param file - The image file to upload
 * @param driveFolderId - The Google Drive folder ID for this loan
 * @returns The file ID of the uploaded image
 */
export async function uploadImage(
  loanId: string,
  file: File,
  driveFolderId: string
): Promise<string> {
  // Validate file
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Chỉ hỗ trợ định dạng JPG, PNG, WEBP.");
  }

  // Create form data
  const formData = new FormData();
  formData.append("file", file);
  formData.append("driveFolderId", driveFolderId);

  // Upload via API
  const response = await fetch(`/api/loans/${loanId}/upload-image`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Không thể upload ảnh");
  }

  return result.fileId;
}

/**
 * Insert an image upload log entry
 * 
 * @param loanId - The loan ID
 * @param userId - The user ID uploading the image
 * @param userName - The user name uploading the image
 * @param imageUrl - The image URL/fileId
 * @returns The created activity log entry
 */
export async function insertImageLog(
  loanId: string,
  userId: string,
  userName: string,
  imageUrl: string
): Promise<ActivityLog> {
  const { data, error } = await supabaseClient
    .from("loan_activity_logs")
    .insert({
      loan_id: loanId,
      type: "image_upload",
      user_id: userId,
      user_name: userName,
      images: [imageUrl],
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to insert image log:", error);
    throw new Error(`Failed to save image: ${error.message}`);
  }

  return data as ActivityLog;
}

/**
 * Fetch activity logs for a loan with pagination
 * 
 * @param loanId - The loan ID
 * @param limit - Number of logs to fetch (default: 50)
 * @param offset - Offset for pagination (default: 0)
 * @returns Array of activity log entries sorted by created_at ASC
 */
export async function fetchActivityLogs(
  loanId: string,
  limit: number = 50,
  offset: number = 0
): Promise<ActivityLog[]> {
  const { data, error } = await supabaseClient
    .from("loan_activity_logs")
    .select("*")
    .eq("loan_id", loanId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Failed to fetch activity logs:", error);
    throw new Error(`Failed to load messages: ${error.message}`);
  }

  return (data as ActivityLog[]) || [];
}
