# 💰 Tính năng Đóng lãi

## 📋 Tổng quan

Tính năng cho phép ghi nhận các lần đóng lãi của khách hàng trong quá trình vay.

## 🎯 Chức năng

### 1. Đóng lãi
- Nhập số tiền đóng lãi
- Thêm ghi chú (tùy chọn)
- Tự động format số tiền (1.000.000 VNĐ)
- Validation số tiền hợp lệ
- Ghi nhận vào database

### 2. Lịch sử đóng lãi
- Hiển thị tất cả lần đóng lãi
- Thông tin: Số tiền, thời gian, ghi chú
- Tổng số tiền đã đóng
- Sắp xếp theo thời gian (mới nhất trước)

## 🗄️ Database Schema

### Bảng: `loan_payment_transactions`

```sql
CREATE TABLE loan_payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id),
  cycle_id UUID NOT NULL REFERENCES loan_payment_cycles(id),
  transaction_type VARCHAR(50) NOT NULL, -- 'interest_payment', 'principal_payment', 'redemption'
  amount DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash', -- 'cash', 'bank_transfer', 'momo', etc.
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Bảng: `loan_payment_cycles`

Cập nhật thêm cột:
```sql
ALTER TABLE loan_payment_cycles 
ADD COLUMN total_interest_paid DECIMAL(15,2) DEFAULT 0;
```

### Bảng: `loan_activity_logs`

Tự động log activity khi đóng lãi:
```sql
INSERT INTO loan_activity_logs (
  loan_id,
  activity_type,
  description,
  created_by
) VALUES (
  'loan-id',
  'interest_payment',
  'Đóng lãi 1.000.000 VNĐ - Đóng lãi tháng 1',
  'user-id'
);
```

## 📁 Files

### API Routes
- `app/api/loans/[id]/pay-interest/route.ts`
  - POST: Đóng lãi
  - GET: Lấy lịch sử đóng lãi

### Components
- `components/loan-details/pay-interest-modal.client.tsx`
  - Modal form đóng lãi
  - Format số tiền tự động
  - Validation và error handling

- `components/loan-details/payment-history-section.tsx`
  - Hiển thị lịch sử đóng lãi
  - Tổng số tiền đã đóng

### Integration
- `components/loan-details/loan-details-modal.client.tsx`
  - Button "Đóng lãi" (chỉ hiện khi status = "disbursed")
  - Mở PayInterestModal
  - Refresh data sau khi đóng lãi thành công

## 🔄 Flow

### 1. User Flow

```
1. Mở loan details modal
2. Click button "Đóng lãi" (nếu loan đã giải ngân)
3. Nhập số tiền và ghi chú
4. Click "Xác nhận đóng lãi"
5. Hiển thị success message
6. Auto refresh loan details
7. Đóng modal
```

### 2. API Flow

```
POST /api/loans/[id]/pay-interest
  ↓
1. Check authentication
  ↓
2. Validate amount > 0
  ↓
3. Check loan exists & status = "disbursed"
  ↓
4. Get current payment cycle
  ↓
5. Insert payment transaction
  ↓
6. Update total_interest_paid in cycle
  ↓
7. Log activity
  ↓
8. Return success
```

## 💡 Cách sử dụng

### Đóng lãi

1. Vào loan details (status = "disbursed")
2. Click button "Đóng lãi"
3. Nhập số tiền: `1000000` → Tự động format: `1.000.000`
4. Thêm ghi chú (optional): "Đóng lãi tháng 1"
5. Click "Xác nhận đóng lãi"

### Xem lịch sử

Lịch sử đóng lãi sẽ hiển thị trong loan details modal (nếu có component PaymentHistorySection được thêm vào).

## 🎨 UI/UX

### Modal đóng lãi
- Title: "Đóng lãi" với icon DollarSign
- Info box: Hướng dẫn nhập số tiền
- Input số tiền: Auto format với dấu phân cách hàng nghìn
- Textarea ghi chú: Optional
- Buttons: Hủy / Xác nhận đóng lãi
- Success/Error messages với icons

### Lịch sử đóng lãi
- Card header: "Lịch sử đóng lãi" với số lượng
- Chip tổng tiền: Hiển thị tổng đã đóng
- List items:
  - Số tiền (màu xanh success)
  - Phương thức thanh toán (chip)
  - Thời gian
  - Ghi chú (nếu có)

## 🔒 Security

- ✅ Authentication required
- ✅ Validate loan ownership (implicit qua RLS)
- ✅ Validate loan status = "disbursed"
- ✅ Validate amount > 0
- ✅ Log all activities với user_id

## 📊 Business Logic

### Tính tổng lãi đã đóng

```typescript
total_interest_paid = SUM(amount) 
WHERE transaction_type = 'interest_payment'
AND cycle_id = current_cycle_id
```

### Kiểm tra đã đóng đủ lãi chưa

```typescript
// So sánh với lãi cần đóng trong period
const interestDue = currentPeriod.interest;
const interestPaid = cycle.total_interest_paid;
const remaining = interestDue - interestPaid;

if (remaining <= 0) {
  // Đã đóng đủ lãi
}
```

## 🚀 Future Enhancements

1. **Phương thức thanh toán**
   - Thêm dropdown chọn: Tiền mặt, Chuyển khoản, MoMo, etc.
   - Lưu thông tin chuyển khoản (nếu có)

2. **Upload chứng từ**
   - Upload ảnh biên lai
   - Lưu vào Drive
   - Hiển thị trong lịch sử

3. **Tính toán tự động**
   - Hiển thị lãi cần đóng
   - Tính lãi còn thiếu
   - Gợi ý số tiền cần đóng

4. **Thông báo**
   - Nhắc nhở đóng lãi
   - Thông báo khi đã đóng đủ

5. **Báo cáo**
   - Thống kê đóng lãi theo tháng
   - Export lịch sử đóng lãi
   - Dashboard tổng quan

## 🐛 Troubleshooting

### Lỗi: "Khoản vay chưa được giải ngân"
- Kiểm tra loan.status = "disbursed"
- Chỉ loan đã giải ngân mới đóng lãi được

### Lỗi: "Không tìm thấy chu kỳ thanh toán"
- Chạy migration: `npm run migrate-payment-cycles`
- Hoặc tự động tạo khi load loan details

### Button "Đóng lãi" không hiện
- Kiểm tra loan.status = "disbursed"
- Kiểm tra isDisbursed condition trong code

## 📚 Related Docs

- [Payment Cycles Migration](./FIX_PAYMENT_CYCLES_WARNING.md)
- [Loan Calculation](./LOAN_CALCULATION_README.md)
