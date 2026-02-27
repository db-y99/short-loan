-- Add asset_condition field to loans table
-- Lưu tình trạng tài sản (ví dụ: "Còn mới, hoạt động tốt", "Đang cầm cố", "Đã qua sử dụng", etc.)

ALTER TABLE public.loans
ADD COLUMN IF NOT EXISTS asset_condition TEXT;

COMMENT ON COLUMN public.loans.asset_condition IS 'Tình trạng tài sản cầm cố (ví dụ: Còn mới, hoạt động tốt)';
