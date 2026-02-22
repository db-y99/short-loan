# 💾 Payment Persistence - Lưu Payment Periods Vào DB

## 🎯 Vấn Đề Đã Giải Quyết

**Trước**: Payment periods chỉ tính động mỗi lần load → Không tốt vì:
- Dữ liệu có thể thay đổi nếu công thức thay đổi
- Không thể audit/track lịch sử
- Performance kém (phải tính lại mỗi lần)

**Sau**: Payment periods được lưu vào DB → Tốt hơn vì:
- ✅ Dữ liệu cố định, không thay đổi theo thời gian
- ✅ Có thể audit/track lịch sử thanh toán
- ✅ Performance tốt (query từ DB nhanh hơn tính toán)
- ✅ Hỗ trợ cập nhật status (pending, paid, overdue)

## 📊 Cấu Trúc DB

### Bảng: `loan_payment_cycles`
Lưu thông tin chu kỳ vay (mỗi loan có thể có nhiều chu kỳ nếu gia hạn)

```sql
CREATE TABLE loan_payment_cycles (
  id UUID PRIMARY KEY,
  loan_id UUID NOT NULL,
  cycle_number INTEGER NOT NULL, -- 1, 2, 3...
  principal NUMERIC(18,2) NOT NULL, -- Số tiền gốc của chu kỳ
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP
);
```

### Bảng: `loan_payment_periods`
Lưu chi tiết từng kỳ thanh toán

```sql
CREATE TABLE loan_payment_periods (
  id UUID PRIMARY KEY,
  loan_id UUID NOT NULL,
  cycle_id UUID NOT NULL,
  period_number INTEGER NOT NULL, -- 1, 2, 3 (mốc 7, 18, 30 ngày)
  period_type TEXT NOT NULL, -- 'current' hoặc 'next'
  milestone_day INTEGER NOT NULL, -- 7, 18, 30
  due_date DATE NOT NULL, -- Ngày đáo hạn
  
  -- Chi tiết tính toán (Gói 1: Trả góp)
  principal NUMERIC(18,2), -- Tiền gốc phải trả
  interest NUMERIC(18,2) NOT NULL DEFAULT 0, -- Tiền lãi (0.033%/ngày)
  rental_fee NUMERIC(18,2) NOT NULL DEFAULT 0, -- Phí thuê tài sản
  
  -- Chi tiết tính toán (Gói 2, 3: Gốc cuối kỳ)
  rate NUMERIC(5,4), -- Tỷ lệ % (0.05, 0.08, 0.12 hoặc 0.0125, 0.035, 0.05)
  
  -- Tổng kết
  fee_amount NUMERIC(18,2) NOT NULL, -- Tổng phí (interest + rental_fee hoặc rate × principal)
  total_due NUMERIC(18,2) NOT NULL, -- Tổng phải trả
  
  status payment_period_status NOT NULL DEFAULT 'pending', -- pending, paid, overdue
  created_at TIMESTAMP
);
```

## 🔄 Luồng Dữ Liệu

### 1. Khi Tạo Loan Mới

```typescript
// features/loans/actions/create-loan.action.ts

// 1. Tạo loan
const { id, code } = await createLoanService({...});

// 2. Tạo payment cycle
const cycleId = await createPaymentCycleService({
  loanId: id,
  cycleNumber: 1,
  principal: amount,
  startDate: today,
  endDate: today + 30 days,
});

// 3. Lưu payment periods vào DB
await saveDetailedPaymentPeriodsService({
  loanId: id,
  cycleId,
  loanAmount: amount,
  loanType: loanPackage,
  signedAt: now,
});
```

### 2. Khi Xem Loan Details

```typescript
// services/loans/loans.service.ts

// 1. Lấy loan từ DB
const loan = await supabase.from('loans').select('*').eq('id', loanId).single();

// 2. Lấy payment periods từ DB
const { currentPeriod, nextPeriod } = await getPaymentPeriodsService(
  loanId,
  cycleId
);

// 3. Fallback: Tính động nếu chưa có trong DB (cho loan cũ)
if (!currentPeriod) {
  const calculated = calculatePaymentPeriods(...);
  currentPeriod = calculated.currentPeriod;
  nextPeriod = calculated.nextPeriod;
}
```

## 📁 Files Đã Tạo/Cập Nhật

### Mới Tạo:
1. ✅ `supabase/migrations/20260222_update_payment_structure.sql` - Migration
2. ✅ `services/payments/payment-periods.service.ts` - Service layer
3. ✅ `scripts/run-migration.md` - Hướng dẫn chạy migration
4. ✅ `docs/PAYMENT_PERSISTENCE_SUMMARY.md` - File này

### Đã Cập Nhật:
1. ✅ `features/loans/actions/create-loan.action.ts` - Lưu payment periods khi tạo loan
2. ✅ `services/loans/loans.service.ts` - Lấy payment periods từ DB

## 🧪 Cách Test

### 1. Chạy Migration

```bash
# Xem hướng dẫn chi tiết
cat scripts/run-migration.md

# Hoặc chạy trực tiếp trên Supabase Dashboard
# Copy nội dung file migration và paste vào SQL Editor
```

### 2. Test Tạo Loan Mới

```bash
# 1. Chạy app
npm run dev

# 2. Tạo loan mới với:
- Số tiền: 10.000.000đ
- Gói vay: "Gói 1: Vay trả góp (3 kỳ)"

# 3. Kiểm tra DB
```

### 3. Kiểm Tra DB

```sql
-- Xem payment cycles
SELECT * FROM loan_payment_cycles
ORDER BY created_at DESC
LIMIT 5;

-- Xem payment periods chi tiết
SELECT 
  l.code AS loan_code,
  lpp.period_type,
  lpp.period_number,
  lpp.milestone_day,
  lpp.due_date,
  lpp.principal,
  lpp.interest,
  lpp.rental_fee,
  lpp.rate,
  lpp.fee_amount,
  lpp.total_due,
  lpp.status
FROM loan_payment_periods lpp
JOIN loans l ON l.id = lpp.loan_id
WHERE l.code = 'HD-2024-001' -- Thay bằng mã loan của bạn
ORDER BY lpp.period_type, lpp.period_number;
```

### 4. Kiểm Tra UI

1. Mở loan details modal
2. Xem "Kỳ hiện tại" và "Kỳ kế tiếp"
3. Đảm bảo dữ liệu khớp với DB

## 📊 Ví Dụ Dữ Liệu

### Gói 1: Trả Góp 3 Kỳ (10 triệu)

| period_type | period_number | milestone_day | principal | interest | rental_fee | fee_amount | total_due |
|-------------|---------------|---------------|-----------|----------|------------|------------|-----------|
| current     | 1             | 7             | 2,000,000 | 23,100   | 276,900    | 300,000    | 2,300,000 |
| current     | 2             | 18            | 3,000,000 | 29,040   | 470,960    | 500,000    | 3,500,000 |
| current     | 3             | 30            | 5,000,000 | 19,800   | 680,200    | 700,000    | 5,700,000 |
| next        | 1             | 7             | 2,000,000 | 23,100   | 276,900    | 300,000    | 2,300,000 |
| next        | 2             | 18            | 3,000,000 | 29,040   | 470,960    | 500,000    | 3,500,000 |
| next        | 3             | 30            | 5,000,000 | 19,800   | 680,200    | 700,000    | 5,700,000 |

### Gói 2: Gốc Cuối Kỳ (12 triệu)

| period_type | period_number | milestone_day | principal  | rate   | fee_amount | total_due  |
|-------------|---------------|---------------|------------|--------|------------|------------|
| current     | 1             | 7             | 12,000,000 | 0.05   | 600,000    | 12,600,000 |
| current     | 2             | 18            | 12,000,000 | 0.08   | 960,000    | 12,960,000 |
| current     | 3             | 30            | 12,000,000 | 0.12   | 1,440,000  | 13,440,000 |

### Gói 3: Gốc Cuối Kỳ + Giữ TS (8 triệu)

| period_type | period_number | milestone_day | principal | rate    | fee_amount | total_due |
|-------------|---------------|---------------|-----------|---------|------------|-----------|
| current     | 1             | 7             | 8,000,000 | 0.0125  | 100,000    | 8,100,000 |
| current     | 2             | 18            | 8,000,000 | 0.035   | 280,000    | 8,280,000 |
| current     | 3             | 30            | 8,000,000 | 0.05    | 400,000    | 8,400,000 |

## ✨ Lợi Ích

1. **Dữ liệu cố định**: Không thay đổi nếu công thức thay đổi
2. **Audit trail**: Có thể xem lịch sử thanh toán
3. **Performance**: Query nhanh hơn tính toán
4. **Status tracking**: Có thể cập nhật trạng thái (pending → paid → overdue)
5. **Gia hạn**: Dễ dàng tạo cycle mới khi gia hạn
6. **Báo cáo**: Dễ dàng tạo báo cáo thống kê

## 🔄 Tương Lai

Có thể mở rộng thêm:
- Lưu lịch sử thanh toán (loan_interest_payments)
- Tự động cập nhật status (pending → overdue nếu quá hạn)
- Gửi thông báo nhắc nhở trước khi đến hạn
- Tạo báo cáo doanh thu theo kỳ
- Hỗ trợ thanh toán một phần

## 🎉 Kết Luận

Hệ thống đã được nâng cấp để lưu payment periods vào DB, đảm bảo:
- ✅ Dữ liệu nhất quán và cố định
- ✅ Có thể audit/track
- ✅ Performance tốt
- ✅ Dễ dàng mở rộng

Sẵn sàng để chạy migration và test!
