/**
 * 📸 ASSET IMAGES SERVICE
 * Service để upload và quản lý ảnh tài sản
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uploadToDrive, deleteManyFromDrive } from "@/lib/google-drive";
import { LOAN_STATUS } from "@/constants/loan";

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
      .select("drive_folder_id, status")
      .eq("id", loanId)
      .single();

    if (loanError || !loan) {
      return {
        success: false,
        error: "Không tìm thấy khoản vay",
      };
    }

    if (loan.status !== LOAN_STATUS.PENDING) {
      return {
        success: false,
        error: "Chỉ được thêm ảnh khi khoản vay ở trạng thái chờ duyệt",
      };
    }

    if (!loan.drive_folder_id) {
      return {
        success: false,
        error: "Khoản vay chưa có folder Drive",
      };
    }

    // 2. Upload tất cả file lên Drive trước (rollback Drive nếu lỗi giữa chừng)
    const uploadedFiles: Array<{
      name: string;
      fileId: string;
    }> = [];

    try {
      for (const file of files) {
        const { fileId } = await uploadToDrive(
          file.buffer,
          file.name,
          file.mimeType,
          loan.drive_folder_id,
        );

        uploadedFiles.push({ name: file.name, fileId });
      }
    } catch (uploadError) {
      if (uploadedFiles.length > 0) {
        await deleteManyFromDrive(uploadedFiles.map((f) => f.fileId));
      }
      console.error("[UPLOAD_ASSET_IMAGES_DRIVE_ERROR]", uploadError);

      return {
        success: false,
        error: "Không thể upload ảnh lên Drive. Vui lòng thử lại.",
      };
    }

    // 3. Insert tất cả vào DB trong một lần — nếu fail thì xóa file Drive
    const rows = uploadedFiles.map((f) => ({
      loan_id: loanId,
      name: f.name,
      provider: "google_drive",
      file_id: f.fileId,
    }));

    const { data: dbRows, error: dbError } = await supabase
      .from("loan_assets")
      .insert(rows)
      .select("id, name, file_id, provider");

    if (dbError || !dbRows || dbRows.length === 0) {
      await deleteManyFromDrive(uploadedFiles.map((f) => f.fileId));
      console.error("[UPLOAD_ASSET_IMAGES_DB_ERROR]", dbError);

      return {
        success: false,
        error: "Không thể lưu ảnh vào hệ thống. Vui lòng thử lại.",
      };
    }

    const uploadedImages = dbRows.map((row) => ({
      id: row.id,
      name: row.name,
      fileId: row.file_id,
      provider: row.provider,
    }));

    return {
      success: true,
      images: uploadedImages,
    };
  } catch (error) {
    console.error("[UPLOAD_ASSET_IMAGES_ERROR]", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi khi upload ảnh",
    };
  }
}

/**
 * Xóa mềm ảnh tài sản — chỉ gỡ khỏi DB, giữ file trên Drive
 */
export async function deleteAssetImageService(imageId: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: asset, error: assetError } = await supabase
      .from("loan_assets")
      .select("id, loan_id")
      .eq("id", imageId)
      .is("deleted_at", null)
      .single();

    if (assetError || !asset) {
      return { success: false, error: "Không tìm thấy ảnh" };
    }

    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select("status")
      .eq("id", asset.loan_id)
      .single();

    if (loanError || !loan) {
      return { success: false, error: "Không tìm thấy khoản vay" };
    }

    if (loan.status !== LOAN_STATUS.PENDING) {
      return {
        success: false,
        error: "Chỉ được xóa ảnh khi khoản vay ở trạng thái chờ duyệt",
      };
    }

    const { data, error } = await supabase
      .from("loan_assets")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", imageId)
      .is("deleted_at", null)
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "Không tìm thấy ảnh" };
    }

    return { success: true };
  } catch (error) {
    console.error("[DELETE_ASSET_IMAGE_ERROR]", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi khi xóa ảnh",
    };
  }
}
