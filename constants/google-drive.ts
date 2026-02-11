export const FOLDER_NAMES = {
  SHORT_LOAN: "short-loan",
} as const;

export const PROVIDER_TYPES = {
  GOOGLE_DRIVE: "google_drive",
} as const;

export type TProviderType =
  (typeof PROVIDER_TYPES)[keyof typeof PROVIDER_TYPES];
