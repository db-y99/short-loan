# Tính năng Chuộc đồ

## Mô tả

Tính năng cho phép khách hàng chuộc đồ (trả gốc + lãi còn thiếu) để hoàn thành khoản vay.

## Luồng hoạt động

```
1. Khách hàng muốn chuộc đồ
2. Nhân viên click "Chuộc đồ"
3. Hệ thống hiển thị:
   - Tổng lãi phải trả
   - Đã đóng lãi
   - Lãi còn thiếu
4. Nhân viên nhập:
   - Tiền gốc (phải = số tiền vay)
   - Tiền lãi (có thể < lãi còn thiếu nếu thỏa thuận)
   - Ghi chú (tùy chọn)
5. Xác nhận chuộc đồ
6. Hệ thống:
   - Tạo 2 giao dịch: principal_payment + interest_payment
   - Cập nhật total_interest_paid
   - Chuyển loan status → "completed"
   - Ghi log activity
```

## API Endpoint

### POST `/api/loans/[id]/redeem`

**Request Body:**
```json
{
  "principalAmount": 50000000,
  "interestAmount": 2500000,
  "notes": "Khách chuộc đồ, thanh toán đầy đủ"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAmount": 52500000,
    "principalAmount": 50000000,
    "interestAmount": 2500000,
    "message": "Chuộc đồ thành công!"
  }
}
```

**Validation:**
- `principalAmount` phải = loan.amount
- `interestAmount` >= 0
- Loan status phải là "disbursed"

## Database Changes

### Bảng `loan_payment_transactions`

Tạo 2 transactions:

1. **Principal Payment**
```sql
INSERT INTO loan_payment_transactions (
  loan_id,
  cycle_id,
  transaction_type,
  amount,
  payment_method,
  notes,
  created_by
) VALUES (
  'loan-id',
  'cycle-id',
  'principal_payment',
  50000000,
  'cash',
  'Chuộc đồ - Trả gốc',
  'user-id'
);
```

2. **Interest Payment**
```sql
INSERT INTO loan_payment_transactions (
  loan_id,
  cycle_id,
  transaction_type,
  amount,
  payment_method,
  notes,
  created_by
) VALUES (
  'loan-id',
  'cycle-id',
  'interest_payment',
  2500000,
  'cash',
  'Chuộc đồ - Trả lãi',
  'user-id'
);
```

### Bảng `loans`

```sql
UPDATE loans
SET 
  status = 'completed',
  status_message = 'Đã chuộc đồ - Trả gốc 50,000,000 VNĐ + Lãi 2,500,000 VNĐ',
  updated_at = NOW()
WHERE id = 'loan-id';
```

### Bảng `loan_payment_cycles`

```sql
UPDATE loan_payment_cycles
SET 
  total_interest_paid = total_interest_paid + 2500000,
  updated_at = NOW()
WHERE id = 'cycle-id';
```

## UI Components

### 1. RedeemModal Component
**File:** `components/loan-details/redeem-modal.client.tsx`

**Features:**
- Hiển thị tổng quan lãi (phải trả, đã đóng, còn thiếu)
- Auto-fill số tiền gốc = loan amount
- Auto-fill lãi còn thiếu
- Tính tổng cộng real-time
- Validation trước khi submit
- Confirm dialog với thông tin chi tiết

**Props:**
```typescript
type TProps = {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  loanAmount: number;
  onSuccess?: () => void;
};
```

### 2. Button trong Loan Details Modal

```tsx
<Button
  color="success"
  variant="solid"
  className="w-full"
  size="lg"
  startContent={<ShoppingCart size={16} />}
  onPress={() => setIsRedeemOpen(true)}
>
  Chuộc đồ
</Button>
```

## Ví dụ sử dụng

### Case 1: Chuộc đồ với đủ lãi

```
Loan: 50,000,000 VNĐ
Tổng lãi phải trả: 12,500,000 VNĐ (3 kỳ)
Đã đóng: 12,500,000 VNĐ
Còn thiếu: 0 VNĐ

→ Nhập:
  - Tiền gốc: 50,000,000
  - Tiền lãi: 0
  - Tổng: 50,000,000
```

### Case 2: Chuộc đồ với thiếu lãi

```
Loan: 50,000,000 VNĐ
Tổng lãi phải trả: 12,500,000 VNĐ
Đã đóng: 2,500,000 VNĐ
Còn thiếu: 10,000,000 VNĐ

→ Nhập:
  - Tiền gốc: 50,000,000
  - Tiền lãi: 10,000,000
  - Tổng: 60,000,000
```

### Case 3: Chuộc đồ với thỏa thuận giảm lãi

```
Loan: 50,000,000 VNĐ
Tổng lãi phải trả: 12,500,000 VNĐ
Đã đóng: 2,500,000 VNĐ
Còn thiếu: 10,000,000 VNĐ

→ Thỏa thuận chỉ đóng thêm 5,000,000
→ Nhập:
  - Tiền gốc: 50,000,000
  - Tiền lãi: 5,000,000
  - Tổng: 55,000,000
  - Ghi chú: "Thỏa thuận giảm 5 triệu lãi"
```

## Security & Validation

1. **Authentication**: Phải đăng nhập
2. **Loan Status**: Chỉ cho phép chuộc đồ khi status = "disbursed"
3. **Principal Amount**: Phải bằng chính xác loan.amount
4. **Interest Amount**: Phải >= 0
5. **Transaction Atomicity**: Nếu 1 transaction fail, rollback toàn bộ

## Testing

### Test Cases

1. ✅ Chuộc đồ thành công với đủ lãi
2. ✅ Chuộc đồ thành công với thiếu lãi
3. ✅ Chuộc đồ thành công với thỏa thuận giảm lãi
4. ❌ Chuộc đồ với số tiền gốc sai
5. ❌ Chuộc đồ với loan status không phải "disbursed"
6. ❌ Chuộc đồ khi chưa đăng nhập

### Manual Testing

```bash
# 1. Tạo loan mới
# 2. Duyệt & giải ngân
# 3. Đóng lãi 1 vài kỳ
# 4. Click "Chuộc đồ"
# 5. Kiểm tra:
#    - Hiển thị đúng tổng lãi, đã đóng, còn thiếu
#    - Auto-fill đúng số tiền
#    - Tính tổng đúng
#    - Confirm dialog hiển thị đầy đủ thông tin
# 6. Xác nhận chuộc đồ
# 7. Kiểm tra:
#    - Loan status = "completed"
#    - 2 transactions được tạo
#    - total_interest_paid được cập nhật
#    - Activity log được ghi
```

## Files Changed

1. **New API**: `app/api/loans/[id]/redeem/route.ts`
2. **New Component**: `components/loan-details/redeem-modal.client.tsx`
3. **Updated**: `components/loan-details/loan-details-modal.client.tsx`
4. **New Doc**: `docs/CHUOC_DO_FEATURE.md`

## Next Steps

- [ ] Thêm in hóa đơn chuộc đồ
- [ ] Thêm SMS/Email thông báo chuộc đồ thành công
- [ ] Thêm báo cáo thống kê chuộc đồ
- [ ] Thêm tính năng hoàn trả phí thẩm định (nếu có)
