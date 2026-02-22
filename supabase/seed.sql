-- ============================================================================
-- SEED DATA - Development & Testing
-- ============================================================================
-- Purpose: Sample data for testing the loan system
-- Run after: All migrations have been applied
-- ============================================================================

-- ============================================================================
-- Sample Customers
-- ============================================================================

INSERT INTO public.customers (
  id,
  full_name,
  cccd,
  phone,
  address,
  cccd_issue_date,
  cccd_issue_place,
  job,
  income
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Nguyễn Văn A',
    '001234567890',
    '0901234567',
    '123 Đường ABC, Quận 1, TP.HCM',
    '2020-01-01',
    'Công an TP.HCM',
    'Nhân viên văn phòng',
    15000000
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Trần Thị B',
    '001234567891',
    '0901234568',
    '456 Đường XYZ, Quận 2, TP.HCM',
    '2020-02-01',
    'Công an TP.HCM',
    'Kinh doanh',
    20000000
  )
ON CONFLICT (cccd) DO NOTHING;

-- ============================================================================
-- Verification
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Seed data loaded successfully!';
  RAISE NOTICE 'Sample customers: 2';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run the application: npm run dev';
  RAISE NOTICE '2. Create test loans through the UI';
  RAISE NOTICE '3. Payment periods will be created automatically';
END $$;

-- ============================================================================
-- Useful Queries for Testing
-- ============================================================================

-- View all customers
-- SELECT * FROM customers ORDER BY created_at DESC;

-- View all loans
-- SELECT * FROM loans ORDER BY created_at DESC;

-- View payment cycles
-- SELECT * FROM loan_payment_cycles ORDER BY created_at DESC;

-- View payment periods with details
-- SELECT 
--   l.code,
--   lpp.period_type,
--   lpp.period_number,
--   lpp.milestone_day,
--   lpp.principal,
--   lpp.interest,
--   lpp.rental_fee,
--   lpp.rate,
--   lpp.fee_amount,
--   lpp.total_due
-- FROM loan_payment_periods lpp
-- JOIN loans l ON l.id = lpp.loan_id
-- ORDER BY l.created_at DESC, lpp.period_type, lpp.period_number;
