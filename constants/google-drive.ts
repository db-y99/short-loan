export const FOLDER_NAMES = {
  SHORT_LOAN: "short-loan",
} as const;

export const PROVIDER_TYPES = {
  GOOGLE_DRIVE: "google_drive",
} as const;

export type TProviderType =
  (typeof PROVIDER_TYPES)[keyof typeof PROVIDER_TYPES];

/** Vercel serverless body limit ~4.5MB — giữ margin cho multipart overhead */
export const UPLOAD_MAX_PAYLOAD_BYTES = 3.5 * 1024 * 1024;

/** Số request upload chạy song song (mỗi request = 1 file) */
export const UPLOAD_CONCURRENCY = 3;
