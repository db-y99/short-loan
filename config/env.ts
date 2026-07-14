import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional().default(""),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default(""),
  NEXT_PUBLIC_SITE_URL: z.string().optional().default("http://localhost:3000"),
  GOOGLE_SERVICE_ACCOUNT_JSON: z.string().optional().default(""),
  SHORT_LOAN_GOOGLE_DRIVE_FOLDER_ID: z.string().optional().default(""),
  CONVERT_PDF_TO_WORD_SERVICE_URL: z.string().optional().default(""),
  PDF_SERVICE_URL: z.string().optional().default(""),
  INTERNAL_API_SECRET: z.string().optional().default("dev-secret-key"),
});

export const env = EnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  GOOGLE_SERVICE_ACCOUNT_JSON: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
  SHORT_LOAN_GOOGLE_DRIVE_FOLDER_ID:
    process.env.SHORT_LOAN_GOOGLE_DRIVE_FOLDER_ID,
  CONVERT_PDF_TO_WORD_SERVICE_URL: process.env.CONVERT_PDF_TO_WORD_SERVICE_URL,
  PDF_SERVICE_URL: process.env.PDF_SERVICE_URL,
  INTERNAL_API_SECRET: process.env.INTERNAL_API_SECRET,
});
