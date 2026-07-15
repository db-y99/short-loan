type TUploadErrorBody = {
  error?: string;
  success?: boolean;
};

/**
 * Đọc body response upload an toàn — tránh crash khi server trả HTML/text
 * (vd. 413 Request Entity Too Large).
 */
export const parseUploadResponse = async <T = TUploadErrorBody>(
  response: Response,
): Promise<T | null> => {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

export const getUploadErrorMessage = (
  response: Response,
  body: TUploadErrorBody | null,
  fallbackFileName?: string,
): string => {
  if (response.status === 413) {
    return "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn hoặc giảm số lượng ảnh.";
  }

  if (body?.error) {
    const lower = body.error.toLowerCase();

    if (
      lower.includes("too large") ||
      lower.includes("payload") ||
      lower.includes("entity too large")
    ) {
      return "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn hoặc giảm số lượng ảnh.";
    }

    return body.error;
  }

  if (fallbackFileName) {
    return `Lỗi khi upload ảnh: ${fallbackFileName}`;
  }

  return "Lỗi khi upload ảnh. Vui lòng thử lại.";
};
