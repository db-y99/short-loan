# 📁 Database Migrations

## Thứ Tự Chạy Migrations

Migrations sẽ tự động chạy theo thứ tự timestamp trong tên file:

1. **20260209093109_init_loans.sql** - Khởi tạo database schema
   - Tạo tables: customers, loans, loan_payment_cycles, loan_payment_periods, etc.
   - Tạo enums, indexes, constraints
   - Setup foreign keys và triggers

2. **20260222100000_update_payment_structure.sql** - Cập nhật payment structure
   - Thêm columns: principal, interest, rental_fee, rate, period_type
   - Fix unique constraint để hỗ trợ current/next periods
   - Thêm indexes và comments

## 🚀 Cách Chạy Migrations

### Option 1: Supabase CLI (Khuyến Nghị)

```bash
# Link project (chỉ cần 1 lần)
supabase link --project-ref <YOUR_PROJECT_REF>

# Push tất cả migrations
supabase db push

# Hoặc reset database và chạy lại từ đầu
supabase db reset
```

### Option 2: Supabase Dashboard

1. Mở Supabase Dashboard
2. Vào **SQL Editor**
3. Copy nội dung từng file migration theo thứ tự
4. Paste và Run

### Option 3: Tự Động (Production)

Migrations sẽ tự động chạy khi deploy lên Supabase nếu bạn:
- Link project với GitHub
- Enable auto-migrations trong settings

## 🧪 Chạy Seed Data

Sau khi migrations hoàn tất:

```bash
# Supabase CLI
supabase db seed

# Hoặc chạy trực tiếp
psql -h <HOST> -U postgres -d postgres -f supabase/seed.sql
```

## ✅ Verify Migrations

```sql
-- Kiểm tra tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Kiểm tra columns của loan_payment_periods
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'loan_payment_periods'
ORDER BY ordinal_position;

-- Kiểm tra constraints
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'loan_payment_periods'::regclass
  AND contype = 'u';

-- Kết quả mong đợi:
-- loan_period_unique_with_type | UNIQUE (cycle_id, period_number, period_type)
```

## 🔄 Rollback (Nếu Cần)

```bash
# Rollback migration cuối cùng
supabase migration down

# Hoặc reset toàn bộ
supabase db reset
```

## 📝 Tạo Migration Mới

```bash
# Tạo migration file mới
supabase migration new <migration_name>

# Ví dụ:
supabase migration new add_payment_status
```

## 🐛 Troubleshooting

### Lỗi: "relation already exists"

Migration đã chạy rồi. Skip hoặc:

```sql
-- Check migration history
SELECT * FROM supabase_migrations.schema_migrations;
```

### Lỗi: "duplicate key value violates unique constraint"

Chạy cleanup trước:

```sql
DELETE FROM loan_payment_periods;
DELETE FROM loan_payment_cycles;
```

### Lỗi: "constraint already exists"

Drop constraint cũ:

```sql
ALTER TABLE loan_payment_periods
DROP CONSTRAINT IF EXISTS loan_period_unique;
```

## 📚 Tài Liệu Tham Khảo

- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [PostgreSQL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
