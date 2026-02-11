import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional().default(""),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default(""),
  GOOGLE_SERVICE_ACCOUNT_JSON: z.string().optional().default(""),
  SHORT_LOAN_GOOGLE_DRIVE_FOLDER_ID: z.string().optional().default(""),
});

export const env = EnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  GOOGLE_SERVICE_ACCOUNT_JSON: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
  SHORT_LOAN_GOOGLE_DRIVE_FOLDER_ID:
    process.env.SHORT_LOAN_GOOGLE_DRIVE_FOLDER_ID,
});
