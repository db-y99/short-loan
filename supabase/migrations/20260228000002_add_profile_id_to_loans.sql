-- Thêm profile_id vào loans table
ALTER TABLE public.loans
ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Tạo index cho performance
CREATE INDEX IF NOT EXISTS idx_loans_profile_id ON public.loans(profile_id);

-- Comment
COMMENT ON COLUMN public.loans.profile_id IS 'FK đến profiles.id - người tạo khoản vay';

-- Migrate dữ liệu: Tìm profile theo email trong creator (nếu có)
-- Chỉ update nếu creator là email hợp lệ
UPDATE public.loans l
SET profile_id = p.id
FROM public.profiles p
WHERE l.creator = p.email
  AND l.profile_id IS NULL
  AND l.creator ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'; -- Regex kiểm tra email

-- Log số lượng đã migrate
DO $$
DECLARE
  migrated_count integer;
BEGIN
  SELECT COUNT(*) INTO migrated_count
  FROM public.loans
  WHERE profile_id IS NOT NULL;
  
  RAISE NOTICE 'Migrated % loans with profile_id', migrated_count;
END $$;

-- Xóa column creator cũ (không dùng nữa)
ALTER TABLE public.loans
DROP COLUMN IF EXISTS creator;
