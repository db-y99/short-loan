import { Readable } from "stream";

export type StreamFileResult = {
  stream: Readable;
  mimeType: string;
  fileName: string;
};

export type TUploadResult = {
  fileId: string;
  fileName: string;
  uploadedName?: string;
};
