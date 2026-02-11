// hooks/use-file-upload.ts
import { useState } from "react";
import { FOLDER_NAMES } from "@/constants/google-drive";
import type { TUploadResult } from "@/types/google-drive.types";

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFiles = async (
    files: File[],
    feature: string = FOLDER_NAMES.SHORT_LOAN,
  ): Promise<TUploadResult[]> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("feature", feature);

        const res = await fetch("/api/drive/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || `Upload failed for ${file.name}`);
        }

        const data = await res.json();
        return {
          fileId: data.fileId,
          fileName: data.fileName,
          uploadedName: data.uploadedName,
        } as TUploadResult;
      });

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setUploadError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const resetError = () => setUploadError(null);

  return {
    uploadFiles,
    isUploading,
    uploadError,
    resetError,
  };
};
