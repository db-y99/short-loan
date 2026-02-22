/**
 * 📸 ASSET IMAGES SERVICE
 * Service để upload và quản lý ảnh tài sản
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uploadToDrive } from "@/lib/google-drive";

type TUploadImagesResult = {
  success: boolean;
  images?: Array<{
    id: string;
    name: string;
    fileId: string;
    provider: string;
  }>;
  error?: string;
};

/**
 * Upload nhiều ảnh lên Drive và lưu vào DB (loan_assets)
 */
export async function uploadAssetImagesService(
  loanId: string,
  files: Array<{ buffer: Buffer; name: string; mimeType: string }>,
): Promise<TUploadImagesResult> {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Lấy thông tin loan để có drive_folder_id
    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select("drive_folder_id")
      .eq("id", loanId)
      .single();

    if (loanError || !loan) {
      return {
        success: false,
        error: "Không tìm thấy khoản vay",
      };
    }

    if (!loan.drive_folder_id) {
      return {
        success: false,
        error: "Khoản vay chưa có folder Drive",
      };
    }

    // 2. Upload từng file lên Drive
    const uploadedImages = [];

    for (const file of files) {
      try {
        // Upload lên Drive
        const { fileId } = await uploadToDrive(
          file.buffer,
          file.name,
          file.mimeType,
          loan.drive_folder_id,
        );

        // Lưu vào DB (loan_assets)
        const { data: dbData, error: dbError } = await supabase
          .from("loan_assets")
          .insert({
            loan_id: loanId,
            name: file.name,
            provider: "google_drive",
            file_id: fileId,
          })
          .select("id, name, file_id, provider")
          .single();

        if (dbError) {
          console.error(`[DB_INSERT_ERROR] ${file.name}:`, dbError);
          continue;
        }

        uploadedImages.push({
          id: dbData.id,
          name: dbData.name,
          fileId: dbData.file_id,
          provider: dbData.provider,
        });
      } catch (err) {
        console.error(`[FILE_UPLOAD_ERROR] ${file.name}:`, err);
        // Continue với các file khác
      }
    }

    if (uploadedImages.length === 0) {
      return {
        success: false,
        error: "Không thể upload ảnh. Vui lòng thử lại.",
      };
    }

    return {
      success: true,
      images: uploadedImages,
    };
  } catch (error) {
    console.error("[UPLOAD_ASSET_IMAGES_ERROR]", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Lỗi khi upload ảnh",
    };
  }
}

/**
 * Xóa ảnh tài sản
 */
export async function deleteAssetImageService(imageId: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("loan_assets")
      .delete()
      .eq("id", imageId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    console.error("[DELETE_ASSET_IMAGE_ERROR]", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Lỗi khi xóa ảnh",
    };
  }
}
