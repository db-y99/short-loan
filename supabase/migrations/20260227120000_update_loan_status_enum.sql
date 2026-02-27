-- Update loan_status enum to match new business requirements
-- New statuses: pending, approved, signed, disbursed, redeemed, rejected

-- Add 'redeemed' status if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'redeemed' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'loan_status')
    ) THEN
        ALTER TYPE loan_status ADD VALUE 'redeemed' AFTER 'disbursed';
    END IF;
END $$;

-- Note: 'completed' and 'liquidated' statuses are kept for backward compatibility
-- but are considered legacy and should not be used for new loans
-- The new flow is: pending -> approved -> signed -> disbursed -> redeemed
-- Or: pending -> rejected (for rejected loans)

COMMENT ON TYPE loan_status IS 'Loan status enum: pending (Chờ duyệt), approved (Đã duyệt - Chờ ký), signed (Đã ký - Chờ giải ngân), disbursed (Đang cầm), redeemed (Đã chuộc), rejected (Từ chối). Legacy: completed, liquidated';
