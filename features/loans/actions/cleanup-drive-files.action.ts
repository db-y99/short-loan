"use server";

import { deleteManyFromDrive } from "@/lib/google-drive";

export const cleanupDriveFilesAction = async (
  fileIds: string[],
): Promise<void> => {
  if (fileIds.length === 0) return;
  await deleteManyFromDrive(fileIds);
};
