# Fix Database Schema - Payment Structure

## Vấn đề

Khi implement tính năng "Đóng lãi", phát hiện các vấn đề về database schema:

### 1. Thiếu columns trong `loan_payment_cycles`
- `total_interest_paid` - Để track tổng lãi đã đóng
- `updated_at` - Để track thời gian cập nhật
- Code đang cố gắng insert `status` nhưng column này không tồn tại

### 2. Thiếu table `loan_payment_transactions`
- Table này hoàn toàn không tồn tại trong database
- Code đang cố gắng insert vào table này để lưu lịch sử thanh toán

### 3. Sai tên columns trong `loan_activity_logs`
- Code dùng: `activity_type`, `description`, `created_by`
- Schema có: `type`, `system_message`, `user_id`

## Giải pháp

### Migration: `20260226130000_fix_payment_structure.sql`

#### 1. Thêm columns vào `loan_payment_cycles`
```sql
ALTER TABLE loan_payment_cycles
ADD COLUMN total_interest_paid numeric(18,2) NOT NULL DEFAULT 0;

ALTER TABLE loan_payment_cycles
ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT now();
```

#### 2. Tạo table `loan_payment_transactions`
```sql
CREATE TABLE loan_payment_transactions (
  id uuid PRIMARY KEY,
  loan_id uuid NOT NULL,
  cycle_id uuid NOT NULL,
  period_id uuid,
  transaction_type payment_transaction_type NOT NULL,
  amount numeric(18,2) NOT NULL,
  payment_method payment_method_type NOT NULL DEFAULT 'cash',
  notes text,
  created_by text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
```

#### 3. Tạo enums
```sql
CREATE TYPE payment_transaction_type AS ENUM (
  'interest_payment',
  'principal_payment',
  'fee_payment',
  'penalty_payment'
);

CREATE TYPE payment_method_type AS ENUM (
  'cash',
  'bank_transfer',
  'momo',
  'zalopay',
  'other'
);
```

### Code fixes

#### 1. `scripts/migrate-payment-cycles.ts`
- Xóa field `status` khỏi insert statement (column không tồn tại)

#### 2. `app/api/loans/[id]/pay-interest/route.ts`
- Sửa activity log để dùng đúng column names:
  - `type` thay vì `activity_type`
  - `user_id` thay vì `created_by`
  - `user_name` thêm vào
  - `system_message` thay vì `description`

## Cách chạy migration

### 1. Local development
```bash
# Reset database (nếu cần)
npx supabase db reset

# Hoặc chỉ chạy migration mới
npx supabase db push
```

### 2. Production
```bash
# Push migration lên Supabase
npx supabase db push --linked
```

### 3. Verify migration
Sau khi chạy migration, kiểm tra:
```sql
-- Check columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'loan_payment_cycles';

-- Check table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'loan_payment_transactions';
```

## Kết quả

Sau khi apply migration và fix code:
- ✅ `loan_payment_cycles` có đủ columns để track interest payments
- ✅ `loan_payment_transactions` table được tạo để lưu lịch sử thanh toán
- ✅ Activity logs được insert đúng schema
- ✅ Tính năng "Đóng lãi" hoạt động bình thường

## Files changed

1. **New migration**: `supabase/migrations/20260226130000_fix_payment_structure.sql`
2. **Fixed**: `scripts/migrate-payment-cycles.ts` - Removed `status` field
3. **Fixed**: `app/api/loans/[id]/pay-interest/route.ts` - Fixed activity log columns
