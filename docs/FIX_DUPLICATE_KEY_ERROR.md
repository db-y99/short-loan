# 🔧 Fix: Duplicate Key Error - loan_period_unique

## ❌ Lỗi

```
Failed to save payment periods: duplicate key value violates unique constraint "loan_period_unique"
```

## 🔍 Nguyên Nhân

Constraint `loan_period_unique` hiện tại:
```sql
UNIQUE (cycle_id, period_number)
```

Nhưng chúng ta cần insert cả `current` và `next` periods với cùng `period_number`:
- `(cycle_id=1, period_number=1, period_type='current')` ✅
- `(cycle_id=1, period_number=1, period_type='next')` ❌ Duplicate!

## ✅ Giải Pháp

Thêm `period_type` vào unique constraint:
```sql
UNIQUE (cycle_id, period_number, period_type)
```

## 🔄 Các Bước Fix

### Bước 1: Cleanup Dữ Liệu Cũ (Nếu Có)

Mở Supabase Dashboard → SQL Editor → Chạy:

```sql
-- Xem có duplicate không
SELECT 
  cycle_id, 
  period_number, 
  COUNT(*) as count
FROM loan_payment_periods 
GROUP BY cycle_id, period_number 
HAVING COUNT(*) > 1;

-- Nếu có duplicate, xóa hết để reset
DELETE FROM loan_payment_periods;

-- Hoặc xóa chỉ duplicate (giữ lại record đầu tiên)
DELETE FROM loan_payment_periods
WHERE id NOT IN (
  SELECT DISTINCT ON (cycle_id, period_number, period_type) id
  FROM loan_payment_periods
  ORDER BY cycle_id, period_number, period_type, created_at
);
```

### Bước 2: Apply Migration Fix

Chạy migration mới:

```sql
-- Drop constraint cũ
ALTER TABLE public.loan_payment_periods
DROP CONSTRAINT IF EXISTS loan_period_unique;

-- Drop index cũ
DROP INDEX IF EXISTS public.loan_period_unique;

-- Tạo unique constraint mới
CREATE UNIQUE INDEX loan_period_unique_with_type
ON public.loan_payment_periods (cycle_id, period_number, period_type);

-- Add constraint
ALTER TABLE public.loan_payment_periods
ADD CONSTRAINT loan_period_unique_with_type 
UNIQUE USING INDEX loan_period_unique_with_type;
```

Hoặc dùng file migration:
```bash
# Copy nội dung file này vào SQL Editor
cat supabase/migrations/20260222_fix_unique_constraint.sql
```

### Bước 3: Verify

```sql
-- Kiểm tra constraint mới
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'loan_payment_periods'::regclass
  AND conname LIKE '%unique%';

-- Kết quả mong đợi:
-- loan_period_unique_with_type | UNIQUE (cycle_id, period_number, period_type)
```

### Bước 4: Test Lại

```bash
# 1. Restart app
npm run dev

# 2. Tạo loan mới
# 3. Kiểm tra không còn lỗi

# 4. Verify DB
```

```sql
-- Xem payment periods vừa tạo
SELECT 
  lpp.cycle_id,
  lpp.period_number,
  lpp.period_type,
  lpp.milestone_day,
  lpp.total_due
FROM loan_payment_periods lpp
JOIN loans l ON l.id = lpp.loan_id
ORDER BY l.created_at DESC, lpp.period_type, lpp.period_number
LIMIT 10;

-- Kết quả mong đợi: 6 records (3 current + 3 next)
```

## 📊 Kết Quả Mong Đợi

Sau khi fix, mỗi loan sẽ có 6 payment periods:

| cycle_id | period_number | period_type | milestone_day |
|----------|---------------|-------------|---------------|
| uuid-1   | 1             | current     | 7             |
| uuid-1   | 2             | current     | 18            |
| uuid-1   | 3             | current     | 30            |
| uuid-1   | 1             | next        | 7             |
| uuid-1   | 2             | next        | 18            |
| uuid-1   | 3             | next        | 30            |

## 🔄 Nếu Vẫn Lỗi

### Lỗi: "constraint already exists"

```sql
-- Drop tất cả constraints liên quan
ALTER TABLE public.loan_payment_periods
DROP CONSTRAINT IF EXISTS loan_period_unique;

ALTER TABLE public.loan_payment_periods
DROP CONSTRAINT IF EXISTS loan_period_unique_with_type;

-- Drop indexes
DROP INDEX IF EXISTS public.loan_period_unique;
DROP INDEX IF EXISTS public.loan_period_unique_with_type;

-- Tạo lại từ đầu
CREATE UNIQUE INDEX loan_period_unique_with_type
ON public.loan_payment_periods (cycle_id, period_number, period_type);
```

### Lỗi: "still duplicate key"

Có thể còn dữ liệu cũ, xóa hết:

```sql
-- Xóa tất cả payment periods
DELETE FROM loan_payment_periods;

-- Xóa tất cả payment cycles
DELETE FROM loan_payment_cycles;

-- Tạo loan mới để test
```

## ✅ Checklist

- [ ] Cleanup dữ liệu cũ
- [ ] Apply migration fix
- [ ] Verify constraint mới
- [ ] Test tạo loan mới
- [ ] Kiểm tra DB có 6 records (3 current + 3 next)
- [ ] Kiểm tra UI hiển thị đúng

## 🎉 Hoàn Tất

Sau khi fix, hệ thống sẽ:
- ✅ Lưu được cả current và next periods
- ✅ Không còn duplicate key error
- ✅ Dữ liệu nhất quán trong DB
