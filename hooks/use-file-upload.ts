// hooks/use-file-upload.ts
import type { TUploadResult } from "@/types/google-drive.types";

import { useState } from "react";
import pMap from "p-map";

import { FOLDER_NAMES, UPLOAD_CONCURRENCY } from "@/constants/google-drive";
import {
  getUploadErrorMessage,
  parseUploadResponse,
} from "@/lib/parse-upload-response";

type TUploadFilesOptions = {
  feature?: string;
  folderId?: string;
  onProgress?: (current: number, total: number) => void;
};

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFiles = async (
    files: File[],
    options?: TUploadFilesOptions,
  ): Promise<TUploadResult[]> => {
    const feature = options?.feature ?? FOLDER_NAMES.SHORT_LOAN;
    const folderId = options?.folderId;
    const onProgress = options?.onProgress;

    setIsUploading(true);
    setUploadError(null);

    try {
      let completedCount = 0;

      // 1 file / request, song song có giới hạn concurrency (p-map)
      const results = await pMap(
        files,
        async (file) => {
          const formData = new FormData();

          formData.append("file", file);
          formData.append("feature", feature);
          if (folderId) {
            formData.append("folderId", folderId);
          }

          const res = await fetch("/api/drive/upload", {
            method: "POST",
            body: formData,
          });

          const data = await parseUploadResponse<{
            error?: string;
            fileId?: string;
            fileName?: string;
            uploadedName?: string;
          }>(res);

          if (!res.ok) {
            throw new Error(getUploadErrorMessage(res, data, file.name));
          }

          if (!data?.fileId || !data.fileName) {
            throw new Error(`Upload failed for ${file.name}`);
          }

          completedCount += 1;
          onProgress?.(completedCount, files.length);

          return {
            fileId: data.fileId,
            fileName: data.fileName,
            uploadedName: data.uploadedName,
          } as TUploadResult;
        },
        { concurrency: UPLOAD_CONCURRENCY },
      );

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
