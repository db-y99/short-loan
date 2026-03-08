-- ============================================================================
-- Migration: Add foreign key for created_by in loan_payment_transactions
-- Description: Fix relationship between loan_payment_transactions and profiles
-- ============================================================================

-- Step 1: Change created_by from text to uuid (if there's data, update it first)
DO $$ 
BEGIN
  -- Check if column is text type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loan_payment_transactions' 
    AND column_name = 'created_by' 
    AND data_type = 'text'
  ) THEN
    -- Try to convert existing text values to uuid
    -- If they're already valid UUIDs, this will work
    -- If not, you may need to update them manually first
    ALTER TABLE public.loan_payment_transactions 
    ALTER COLUMN created_by TYPE uuid USING created_by::uuid;
    
    RAISE NOTICE '✅ Changed created_by column type from text to uuid';
  ELSE
    RAISE NOTICE 'ℹ️ Column created_by is already uuid type';
  END IF;
END $$;

-- Step 2: Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'loan_payment_transactions_created_by_fkey'
    AND table_name = 'loan_payment_transactions'
  ) THEN
    ALTER TABLE public.loan_payment_transactions
    ADD CONSTRAINT loan_payment_transactions_created_by_fkey
    FOREIGN KEY (created_by)
    REFERENCES public.profiles(id)
    ON DELETE SET NULL;
    
    RAISE NOTICE '✅ Added foreign key constraint for created_by';
  ELSE
    RAISE NOTICE 'ℹ️ Foreign key constraint already exists';
  END IF;
END $$;

-- Step 3: Add index for better query performance
CREATE INDEX IF NOT EXISTS loan_payment_transactions_created_by_idx
ON public.loan_payment_transactions (created_by);

-- Step 4: Update comment
COMMENT ON COLUMN public.loan_payment_transactions.created_by IS 'User ID (UUID) của người tạo giao dịch - references profiles(id)';

-- Verification
DO $$
DECLARE
  constraint_exists boolean;
  column_type text;
BEGIN
  -- Check constraint
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'loan_payment_transactions_created_by_fkey'
  ) INTO constraint_exists;
  
  -- Check column type
  SELECT data_type INTO column_type
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'loan_payment_transactions' 
  AND column_name = 'created_by';
  
  RAISE NOTICE '=== Verification ===';
  RAISE NOTICE 'Column type: %', column_type;
  RAISE NOTICE 'Foreign key exists: %', constraint_exists;
  
  IF constraint_exists AND column_type = 'uuid' THEN
    RAISE NOTICE '✅ Migration completed successfully';
  ELSE
    RAISE WARNING '⚠️ Migration may have issues';
  END IF;
END $$;
