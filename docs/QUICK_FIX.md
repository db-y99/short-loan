# ⚡ Quick Fix - Duplicate Key Error

## Tình Huống

Index `loan_period_unique_with_type` đã tồn tại (từ migration trước), nhưng constraint cũ `loan_period_unique` vẫn còn → Conflict!

## ✅ Giải Pháp Đơn Giản

Chỉ cần **drop constraint cũ** và **xóa dữ liệu cũ**.

## 🚀 Chạy Ngay (Copy & Paste)

Mở **Supabase Dashboard** → **SQL Editor** → Paste và Run:

```sql
-- 1. Drop constraint cũ
ALTER TABLE public.loan_payment_periods
DROP CONSTRAINT IF EXISTS loan_period_unique;

-- 2. Xóa dữ liệu cũ (để tránh conflict)
DELETE FROM loan_payment_periods;
DELETE FROM loan_payment_cycles;

-- 3. Verify
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'loan_payment_periods'::regclass
  AND contype = 'u';
```

## ✅ Kết Quả Mong Đợi

Sau khi chạy, bạn sẽ thấy:

```
constraint_name                | constraint_definition
-------------------------------|------------------------------------------
loan_period_unique_with_type   | UNIQUE (cycle_id, period_number, period_type)
```

**KHÔNG** còn `loan_period_unique` nữa!

## 🧪 Test

```bash
# 1. Restart app (nếu đang chạy)
npm run dev

# 2. Tạo loan mới
# 3. Không còn lỗi duplicate key!

# 4. Kiểm tra DB
```

```sql
-- Xem payment periods vừa tạo
SELECT 
  cycle_id,
  period_number,
  period_type,
  milestone_day,
  total_due
FROM loan_payment_periods
ORDER BY created_at DESC, period_type, period_number
LIMIT 10;

-- Kết quả: 6 records (3 current + 3 next) ✅
```

## 🎉 Done!

Hệ thống giờ đã hoạt động bình thường!
