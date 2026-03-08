-- Migration: Add paid_amount to loan_payment_periods
-- Author: Kiro
-- Date: 2026-03-08
-- Purpose: Track payment amount for each period separately (for Package 1 independent periods)

-- ============================================================================
-- Add paid_amount column to track payment for each period
-- ============================================================================

ALTER TABLE public.loan_payment_periods
ADD COLUMN IF NOT EXISTS paid_amount numeric(18,2) NOT NULL DEFAULT 0;

-- Add comment
COMMENT ON COLUMN public.loan_payment_periods.paid_amount IS 'Số tiền đã đóng cho kỳ/mốc này (riêng biệt, không cộng dồn)';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS loan_payment_periods_paid_amount_idx
ON public.loan_payment_periods (cycle_id, paid_amount);
