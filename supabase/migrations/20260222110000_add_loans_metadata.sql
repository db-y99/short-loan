-- Add metadata column to loans table for storing contract version and other metadata
ALTER TABLE loans ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add comment
COMMENT ON COLUMN loans.metadata IS 'Metadata for storing contract_version and other flexible data';

-- Create index for better performance when querying metadata
CREATE INDEX IF NOT EXISTS idx_loans_metadata ON loans USING gin(metadata);
