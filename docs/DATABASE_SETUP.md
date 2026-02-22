# 🗄️ Database Setup - Hướng Dẫn Đầy Đủ

## 📋 Tổng Quan

Hệ thống sử dụng Supabase (PostgreSQL) với cấu trúc:
- **Migrations**: Tự động tạo/cập nhật schema
- **Seed**: Dữ liệu mẫu cho testing
- **Auto-calculation**: Payment periods tự động tính và lưu vào DB

## 🚀 Setup Từ Đầu

### Bước 1: Cài Đặt Supabase CLI

```bash
# Windows (PowerShell)
scoop install supabase

# macOS
brew install supabase/tap/supabase

# Linux
brew install supabase/tap/supabase
```

### Bước 2: Link Project

```bash
# Link với Supabase project của bạn
supabase link --project-ref <YOUR_PROJECT_REF>

# Lấy project ref từ: Supabase Dashboard → Settings → General → Reference ID
```

### Bước 3: Chạy Migrations

```bash
# Push tất cả migrations lên Supabase
supabase db push

# Hoặc reset và chạy lại từ đầu
supabase db reset
```

### Bước 4: Chạy Seed Data (Optional)

```bash
# Load dữ liệu mẫu
supabase db seed
```

### Bước 5: Verify

```bash
# Kiểm tra status
supabase status

# Hoặc check trực tiếp trong Supabase Dashboard
```

## 📁 Cấu Trúc Files

```
supabase/
├── migrations/
│   ├── README.md                              # Hướng dẫn migrations
│   ├── 20260209093109_init_loans.sql         # Migration 1: Init schema
│   └── 20260222100000_update_payment_structure.sql  # Migration 2: Update payment
├── seed.sql                                   # Dữ liệu mẫu
└── config.toml                                # Supabase config
```

## 🔄 Workflow

### Khi Tạo Loan Mới

```typescript
// 1. Tạo loan
const loan = await createLoanService({...});

// 2. Tạo payment cycle
const cycle = await createPaymentCycleService({
  loanId: loan.id,
  cycleNumber: 1,
  principal: loanAmount,
  startDate: today,
  endDate: today + 30 days,
});

// 3. Tính và lưu payment periods
await saveDetailedPaymentPeriodsService({
  loanId: loan.id,
  cycleId: cycle.id,
  loanAmount,
  loanType,
  signedAt: now,
});
```

### Khi Xem Loan Details

```typescript
// 1. Lấy loan từ DB
const loan = await getLoanDetailsService(loanId);

// 2. Payment periods đã có sẵn trong loan.currentPeriod và loan.nextPeriod
// (được load từ DB, không cần tính lại)
```

## 📊 Database Schema

### Bảng Chính

#### `loans`
- Thông tin khoản vay
- Liên kết với customer, payment cycles

#### `loan_payment_cycles`
- Chu kỳ vay (cycle 1, 2, 3...)
- Mỗi loan có thể có nhiều cycles (khi gia hạn)

#### `loan_payment_periods`
- Chi tiết từng kỳ thanh toán
- Lưu đầy đủ: principal, interest, rental_fee, rate, fee_amount, total_due
- Phân biệt: current (kỳ hiện tại) và next (kỳ kế tiếp)

### Unique Constraint

```sql
UNIQUE (cycle_id, period_number, period_type)
```

Cho phép:
- ✅ (cycle_1, period_1, 'current')
- ✅ (cycle_1, period_1, 'next')
- ✅ (cycle_1, period_2, 'current')
- ✅ (cycle_1, period_2, 'next')

## 🧪 Testing

### Test Migrations

```bash
# Reset và chạy lại
supabase db reset

# Verify
supabase db diff
```

### Test Seed Data

```sql
-- Xem customers
SELECT * FROM customers;

-- Xem loans
SELECT * FROM loans ORDER BY created_at DESC;

-- Xem payment periods
SELECT 
  l.code,
  lpp.period_type,
  lpp.period_number,
  lpp.milestone_day,
  lpp.total_due
FROM loan_payment_periods lpp
JOIN loans l ON l.id = lpp.loan_id
ORDER BY l.created_at DESC, lpp.period_type, lpp.period_number;
```

### Test Application

```bash
# 1. Chạy app
npm run dev

# 2. Tạo loan mới
# 3. Kiểm tra DB có payment periods

# 4. Xem loan details
# 5. Verify UI hiển thị đúng
```

## 🐛 Troubleshooting

### Lỗi: "duplicate key value violates unique constraint"

**Nguyên nhân**: Constraint cũ chưa được drop

**Fix**:
```sql
ALTER TABLE loan_payment_periods
DROP CONSTRAINT IF EXISTS loan_period_unique;

DELETE FROM loan_payment_periods;
```

### Lỗi: "relation already exists"

**Nguyên nhân**: Migration đã chạy rồi

**Fix**: Skip hoặc reset:
```bash
supabase db reset
```

### Lỗi: "permission denied"

**Nguyên nhân**: Chưa link project hoặc sai credentials

**Fix**:
```bash
supabase link --project-ref <YOUR_PROJECT_REF>
```

## 📚 Tài Liệu

- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Project README](../README.md)

## ✅ Checklist Setup

- [ ] Cài Supabase CLI
- [ ] Link project
- [ ] Chạy migrations
- [ ] Chạy seed (optional)
- [ ] Verify schema
- [ ] Test tạo loan
- [ ] Test xem loan details
- [ ] Verify payment periods trong DB

## 🎉 Done!

Database đã sẵn sàng! Giờ có thể:
- ✅ Tạo loan mới
- ✅ Payment periods tự động lưu vào DB
- ✅ Dữ liệu cố định, không thay đổi
- ✅ Có thể audit/track lịch sử
