-- Migration: Cập nhật cấu trúc payment để lưu chi tiết tính toán
-- Date: 2024-02-22
-- Purpose: Thêm columns để lưu chi tiết payment periods và fix unique constraint

-- ============================================================================
-- PART 1: Thêm columns mới
-- ============================================================================

-- 1. Thêm columns để lưu chi tiết tính toán
ALTER TABLE public.loan_payment_periods
ADD COLUMN IF NOT EXISTS principal numeric(18,2), -- Tiền gốc (chỉ cho Gói 1)
ADD COLUMN IF NOT EXISTS interest numeric(18,2) NOT NULL DEFAULT 0, -- Tiền lãi
ADD COLUMN IF NOT EXISTS rental_fee numeric(18,2) NOT NULL DEFAULT 0, -- Phí thuê tài sản
ADD COLUMN IF NOT EXISTS rate numeric(5,4); -- Tỷ lệ % (cho Gói 2, 3)

-- 2. Rename column để rõ nghĩa hơn
ALTER TABLE public.loan_payment_periods
RENAME COLUMN interest_fee TO fee_amount;

-- 3. Thêm column để phân biệt loại period
ALTER TABLE public.loan_payment_periods
ADD COLUMN IF NOT EXISTS period_type text NOT NULL DEFAULT 'current';

-- 4. Comments để giải thích
COMMENT ON COLUMN public.loan_payment_periods.principal IS 'Tiền gốc phải trả (chỉ áp dụng cho Gói 1: Trả góp)';
COMMENT ON COLUMN public.loan_payment_periods.interest IS 'Tiền lãi (0.033%/ngày cho Gói 1)';
COMMENT ON COLUMN public.loan_payment_periods.rental_fee IS 'Phí thuê tài sản (để đạt mục tiêu lợi nhuận)';
COMMENT ON COLUMN public.loan_payment_periods.rate IS 'Tỷ lệ % (5%, 8%, 12% cho Gói 2 hoặc 1.25%, 3.5%, 5% cho Gói 3)';
COMMENT ON COLUMN public.loan_payment_periods.fee_amount IS 'Tổng phí (interest + rental_fee cho Gói 1, hoặc rate × principal cho Gói 2,3)';
COMMENT ON COLUMN public.loan_payment_periods.total_due IS 'Tổng phải trả = principal + fee_amount';
COMMENT ON COLUMN public.loan_payment_periods.period_type IS 'Loại kỳ: current (hiện tại) hoặc next (kế tiếp nếu gia hạn)';

-- ============================================================================
-- PART 2: Fix unique constraint
-- ============================================================================

-- 5. Drop constraint cũ (không bao gồm period_type)
ALTER TABLE public.loan_payment_periods
DROP CONSTRAINT IF EXISTS loan_period_unique;

-- 6. Drop index cũ nếu có
DROP INDEX IF EXISTS public.loan_period_unique;

-- 7. Tạo unique constraint mới bao gồm period_type
CREATE UNIQUE INDEX IF NOT EXISTS loan_period_unique_with_type
ON public.loan_payment_periods (cycle_id, period_number, period_type);

-- 8. Add constraint sử dụng index mới
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'loan_period_unique_with_type'
  ) THEN
    ALTER TABLE public.loan_payment_periods
    ADD CONSTRAINT loan_period_unique_with_type 
    UNIQUE USING INDEX loan_period_unique_with_type;
  END IF;
END $$;

-- ============================================================================
-- PART 3: Thêm indexes và constraints
-- ============================================================================

-- 9. Thêm index để query nhanh hơn
CREATE INDEX IF NOT EXISTS loan_payment_periods_type_idx
ON public.loan_payment_periods (loan_id, period_type);

-- 10. Thêm constraint để đảm bảo dữ liệu hợp lệ
ALTER TABLE public.loan_payment_periods
DROP CONSTRAINT IF EXISTS check_period_type;

ALTER TABLE public.loan_payment_periods
ADD CONSTRAINT check_period_type CHECK (period_type IN ('current', 'next'));

-- ============================================================================
-- PART 4: Update existing data
-- ============================================================================

-- 11. Update existing data (nếu có)
UPDATE public.loan_payment_periods
SET 
  interest = COALESCE(interest, 0),
  rental_fee = COALESCE(rental_fee, 0),
  period_type = COALESCE(period_type, 'current')
WHERE interest IS NULL OR rental_fee IS NULL OR period_type IS NULL;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify constraints
DO $$
DECLARE
  constraint_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO constraint_count
  FROM pg_constraint
  WHERE conrelid = 'loan_payment_periods'::regclass
    AND conname = 'loan_period_unique_with_type';
  
  IF constraint_count > 0 THEN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE '✅ Constraint loan_period_unique_with_type is active';
  ELSE
    RAISE WARNING '⚠️ Constraint not found, please check manually';
  END IF;
END $$;
