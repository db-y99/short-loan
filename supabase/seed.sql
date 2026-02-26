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
    'Nguyễn Văn A',
    '001234567890',
    '0901234567',
    '123 Đường ABC, Quận 1, TP.HCM',
    '2020-01-01',
    'Công an TP.HCM',
    'Nhân viên văn phòng',
    15000000.00
  ),
  (
    'Trần Thị B',
    '001234567891',
    '0901234568',
    '456 Đường XYZ, Quận 2, TP.HCM',
    '2020-02-01',
    'Công an TP.HCM',
    'Kinh doanh',
    20000000.00
  )
ON CONFLICT (cccd) DO NOTHING;

-- ============================================================================
-- Sample Loan
-- ============================================================================

-- Get customer_id for Nguyễn Văn A
DO $$
DECLARE
  v_customer_id uuid;
  v_loan_id uuid;
  v_cycle_id uuid;
BEGIN
  -- Get customer ID
  SELECT id INTO v_customer_id
  FROM public.customers
  WHERE cccd = '001234567890'
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'Customer not found';
  END IF;

  -- Insert loan
  INSERT INTO public.loans (
    code,
    creator,
    customer_id,
    asset_type,
    asset_name,
    asset_identity,
    amount,
    loan_package,
    loan_type,
    appraisal_fee_percentage,
    appraisal_fee,
    bank_name,
    bank_account_holder,
    bank_account_number,
    notes,
    status,
    signed_at,
    approved_at,
    is_signed,
    drive_folder_id,
    current_cycle,
    cycle_start_date,
    cycle_end_date
  ) VALUES (
    'HD-2026-001',
    'system',
    v_customer_id,
    'xe_may',
    'Honda Wave RSX 2023',
    '{"chassis_number": "RLHPC4108N5123456", "engine_number": "PC41E2123456"}'::jsonb,
    50000000.00,
    'Gói 2: Trả lãi định kỳ',
    'goi_2',
    5.00,
    2500000.00,
    'Vietcombank',
    'Nguyễn Văn A',
    '1234567890',
    'Khách hàng uy tín, đã vay 2 lần trước đây',
    'disbursed',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '14 days',
    true,
    'sample-drive-folder-id',
    1,
    (NOW() - INTERVAL '15 days')::date,
    (NOW() + INTERVAL '15 days')::date
  )
  ON CONFLICT (code) DO NOTHING
  RETURNING id INTO v_loan_id;

  -- Only continue if loan was inserted
  IF v_loan_id IS NOT NULL THEN
    -- Insert loan references
    INSERT INTO public.loan_references (
      loan_id,
      full_name,
      phone,
      relationship
    ) VALUES
      (
        v_loan_id,
        'Nguyễn Văn C',
        '0901234569',
        'Anh trai'
      ),
      (
        v_loan_id,
        'Trần Thị D',
        '0901234570',
        'Bạn thân'
      );

    -- Insert payment cycle
    INSERT INTO public.loan_payment_cycles (
      loan_id,
      cycle_number,
      principal,
      start_date,
      end_date,
      total_interest_paid
    ) VALUES (
      v_loan_id,
      1,
      50000000.00,
      (NOW() - INTERVAL '15 days')::date,
      (NOW() + INTERVAL '15 days')::date,
      0.00
    )
    RETURNING id INTO v_cycle_id;

    -- Insert payment periods
    INSERT INTO public.loan_payment_periods (
      loan_id,
      cycle_id,
      period_number,
      milestone_day,
      due_date,
      principal,
      interest,
      rental_fee,
      rate,
      fee_amount,
      total_due,
      status,
      period_type
    ) VALUES
      -- Kỳ 1: 10 ngày - 5%
      (
        v_loan_id,
        v_cycle_id,
        1,
        10,
        (NOW() - INTERVAL '5 days')::date,
        0.00,
        0.00,
        0.00,
        0.05,
        2500000.00,
        2500000.00,
        'pending',
        'current'
      ),
      -- Kỳ 2: 20 ngày - 8%
      (
        v_loan_id,
        v_cycle_id,
        2,
        20,
        (NOW() + INTERVAL '5 days')::date,
        0.00,
        0.00,
        0.00,
        0.08,
        4000000.00,
        4000000.00,
        'pending',
        'current'
      ),
      -- Kỳ 3: 30 ngày - 12%
      (
        v_loan_id,
        v_cycle_id,
        3,
        30,
        (NOW() + INTERVAL '15 days')::date,
        0.00,
        0.00,
        0.00,
        0.12,
        6000000.00,
        6000000.00,
        'pending',
        'current'
      );

    -- Insert activity logs
    INSERT INTO public.loan_activity_logs (
      loan_id,
      type,
      user_id,
      user_name,
      system_message
    ) VALUES
      (
        v_loan_id,
        'system_event',
        'system',
        'System',
        'Khoản vay được tạo'
      ),
      (
        v_loan_id,
        'approval',
        'system',
        'Admin',
        'Khoản vay được phê duyệt'
      ),
      (
        v_loan_id,
        'disbursement',
        'system',
        'Admin',
        'Đã giải ngân 50,000,000 VNĐ'
      );

    RAISE NOTICE '✅ Sample loan HD-2026-001 created successfully';
  ELSE
    RAISE NOTICE '⏭️  Loan HD-2026-001 already exists, skipping';
  END IF;
END $$;

-- ============================================================================
-- Verification
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Seed data loaded successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '  - Customers: 2';
  RAISE NOTICE '  - Loans: 1 (HD-2026-001)';
  RAISE NOTICE '  - References: 2';
  RAISE NOTICE '  - Payment cycles: 1';
  RAISE NOTICE '  - Payment periods: 3';
  RAISE NOTICE '  - Activity logs: 3';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Sample Loan Details:';
  RAISE NOTICE '  - Code: HD-2026-001';
  RAISE NOTICE '  - Customer: Nguyễn Văn A';
  RAISE NOTICE '  - Amount: 50,000,000 VNĐ';
  RAISE NOTICE '  - Type: Gói 2 (Trả lãi định kỳ)';
  RAISE NOTICE '  - Status: disbursed';
  RAISE NOTICE '  - Asset: Honda Wave RSX 2023';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next steps:';
  RAISE NOTICE '  1. Run: npm run dev';
  RAISE NOTICE '  2. View loan HD-2026-001 in the UI';
  RAISE NOTICE '  3. Test "Đóng lãi" feature';
END $$;

-- ============================================================================
-- Useful Queries for Testing
-- ============================================================================

-- View all customers
-- SELECT * FROM customers ORDER BY created_at DESC;

-- View all loans with customer info
-- SELECT 
--   l.code,
--   c.full_name,
--   l.amount,
--   l.loan_package,
--   l.status,
--   l.created_at
-- FROM loans l
-- JOIN customers c ON c.id = l.customer_id
-- ORDER BY l.created_at DESC;

-- View payment cycles
-- SELECT * FROM loan_payment_cycles ORDER BY created_at DESC;

-- View payment periods with details
-- SELECT 
--   l.code,
--   lpp.period_type,
--   lpp.period_number,
--   lpp.milestone_day,
--   lpp.due_date,
--   lpp.rate,
--   lpp.fee_amount,
--   lpp.total_due,
--   lpp.status
-- FROM loan_payment_periods lpp
-- JOIN loans l ON l.id = lpp.loan_id
-- ORDER BY l.created_at DESC, lpp.period_type, lpp.period_number;

-- View payment transactions
-- SELECT 
--   l.code,
--   lpt.transaction_type,
--   lpt.amount,
--   lpt.payment_method,
--   lpt.notes,
--   lpt.created_at
-- FROM loan_payment_transactions lpt
-- JOIN loans l ON l.id = lpt.loan_id
-- ORDER BY lpt.created_at DESC;
