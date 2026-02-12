import { z } from "zod";

export const SaveLoanAttachmentsSchema = z.object({
  loanId: z.string().min(1, "loanId là bắt buộc"),
  attachments: z
    .array(
      z.object({
        name: z.string().optional(),
        provider: z.string().min(1, "provider là bắt buộc"),
        file_id: z.string().min(1, "file_id là bắt buộc"),
      }),
    )
    .default([]),
});

export type TSaveLoanAttachmentsInput = z.infer<typeof SaveLoanAttachmentsSchema>;

