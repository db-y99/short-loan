-- Add 'signed' status to loan_status enum if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'signed' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'loan_status')
    ) THEN
        ALTER TYPE loan_status ADD VALUE 'signed' AFTER 'approved';
    END IF;
END $$;

-- Add signature file ID columns to loans table
-- These columns store Google Drive file IDs for signature images

ALTER TABLE loans
ADD COLUMN IF NOT EXISTS draft_signature_file_id TEXT,
ADD COLUMN IF NOT EXISTS official_signature_file_id TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN loans.draft_signature_file_id IS 'Google Drive file ID of draft signature (Chữ ký nháy) - used by Bên A';
COMMENT ON COLUMN loans.official_signature_file_id IS 'Google Drive file ID of official signature (Chữ ký chính thức) - used by Bên B';
