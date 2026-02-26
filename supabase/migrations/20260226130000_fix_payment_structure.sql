-- Migration: Fix payment structure for interest payment feature
-- Date: 2026-02-26
-- Purpose: Add missing columns and tables for payment tracking

-- ============================================================================
-- PART 1: Add missing columns to loan_payment_cycles
-- ============================================================================

-- Add total_interest_paid column to track accumulated interest payments
ALTER TABLE public.loan_payment_cycles
ADD COLUMN IF NOT EXISTS total_interest_paid numeric(18,2) NOT NULL DEFAULT 0;

-- Add updated_at column for tracking updates
ALTER TABLE public.loan_payment_cycles
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Add comment
COMMENT ON COLUMN public.loan_payment_cycles.total_interest_paid IS 'Tổng số tiền lãi đã đóng trong chu kỳ này';

-- ============================================================================
-- PART 2: Create loan_payment_transactions table
-- ============================================================================

-- Create enum for transaction types
DO $$ BEGIN
  CREATE TYPE public.payment_transaction_type AS ENUM (
    'interest_payment',
    'principal_payment',
    'fee_payment',
    'penalty_payment'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for payment methods
DO $$ BEGIN
  CREATE TYPE public.payment_method_type AS ENUM (
    'cash',
    'bank_transfer',
    'momo',
    'zalopay',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create loan_payment_transactions table
CREATE TABLE IF NOT EXISTS public.loan_payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL,
  cycle_id uuid NOT NULL,
  period_id uuid,
  transaction_type public.payment_transaction_type NOT NULL,
  amount numeric(18,2) NOT NULL,
  payment_method public.payment_method_type NOT NULL DEFAULT 'cash',
  notes text,
  created_by text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add foreign keys
ALTER TABLE public.loan_payment_transactions
ADD CONSTRAINT loan_payment_transactions_loan_id_fkey
FOREIGN KEY (loan_id)
REFERENCES public.loans(id)
ON DELETE CASCADE;

ALTER TABLE public.loan_payment_transactions
ADD CONSTRAINT loan_payment_transactions_cycle_id_fkey
FOREIGN KEY (cycle_id)
REFERENCES public.loan_payment_cycles(id)
ON DELETE CASCADE;

ALTER TABLE public.loan_payment_transactions
ADD CONSTRAINT loan_payment_transactions_period_id_fkey
FOREIGN KEY (period_id)
REFERENCES public.loan_payment_periods(id)
ON DELETE SET NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS loan_payment_transactions_loan_idx
ON public.loan_payment_transactions (loan_id);

CREATE INDEX IF NOT EXISTS loan_payment_transactions_cycle_idx
ON public.loan_payment_transactions (cycle_id);

CREATE INDEX IF NOT EXISTS loan_payment_transactions_created_at_idx
ON public.loan_payment_transactions (created_at DESC);

CREATE INDEX IF NOT EXISTS loan_payment_transactions_type_idx
ON public.loan_payment_transactions (transaction_type);

-- Add comments
COMMENT ON TABLE public.loan_payment_transactions IS 'Lịch sử giao dịch thanh toán (đóng lãi, đóng gốc, phí, phạt)';
COMMENT ON COLUMN public.loan_payment_transactions.transaction_type IS 'Loại giao dịch: interest_payment, principal_payment, fee_payment, penalty_payment';
COMMENT ON COLUMN public.loan_payment_transactions.payment_method IS 'Phương thức thanh toán: cash, bank_transfer, momo, zalopay, other';
COMMENT ON COLUMN public.loan_payment_transactions.created_by IS 'User ID của người tạo giao dịch';

-- ============================================================================
-- PART 3: Add trigger for updated_at
-- ============================================================================

-- Add trigger for loan_payment_cycles.updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.loan_payment_cycles;
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.loan_payment_cycles
FOR EACH ROW
EXECUTE PROCEDURE extensions.moddatetime(updated_at);

-- Add trigger for loan_payment_transactions.updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.loan_payment_transactions;
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.loan_payment_transactions
FOR EACH ROW
EXECUTE PROCEDURE extensions.moddatetime(updated_at);

-- ============================================================================
-- PART 4: Grant permissions
-- ============================================================================

GRANT ALL ON public.loan_payment_transactions TO authenticated;
GRANT ALL ON public.loan_payment_transactions TO service_role;
GRANT SELECT ON public.loan_payment_transactions TO anon;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  column_exists BOOLEAN;
  table_exists BOOLEAN;
BEGIN
  -- Check if total_interest_paid column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'loan_payment_cycles'
    AND column_name = 'total_interest_paid'
  ) INTO column_exists;
  
  IF column_exists THEN
    RAISE NOTICE '✅ Column loan_payment_cycles.total_interest_paid exists';
  ELSE
    RAISE WARNING '⚠️ Column loan_payment_cycles.total_interest_paid not found';
  END IF;
  
  -- Check if loan_payment_transactions table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'loan_payment_transactions'
  ) INTO table_exists;
  
  IF table_exists THEN
    RAISE NOTICE '✅ Table loan_payment_transactions exists';
  ELSE
    RAISE WARNING '⚠️ Table loan_payment_transactions not found';
  END IF;
  
  RAISE NOTICE '✅ Migration completed successfully!';
END $$;
