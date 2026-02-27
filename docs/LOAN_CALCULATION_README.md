# 📊 Hệ Thống Tính Toán Vay - Loan Calculation System

## 🎯 Tổng Quan

Hệ thống tính toán tài chính cho 3 gói vay, tuân thủ quy định pháp luật với việc chia tách rõ ràng:
- **Lãi suất**: 0.033%/ngày
- **Phí thuê tài sản**: Bù vào để đạt mục tiêu lợi nhuận

## 📦 Cấu Trúc Files

```
lib/
├── loan-calculation.ts           # Core calculation logic
├── loan-calculation-demo.ts      # Demo & examples
├── LOAN_CALCULATION_README.md    # Documentation (file này)
└── __tests__/
    └── loan-calculation.test.ts  # Unit tests
```

## 🔢 Công Thức Chi Tiết

### 1️⃣ Phí Thẩm Định (Appraisal Fee)

**Điều kiện áp dụng:**
- Khoản vay >= 5.000.000đ
- Áp dụng cho Gói 1 (Trả góp) và Gói 2 (Theo mốc)
- Gói 3 không có phí thẩm định

**Công thức:**
```
Phí thẩm định = Số tiền vay × 5%
Tiền thực nhận = Số tiền vay - Phí thẩm định
```

**Ví dụ:**
```typescript
Vay: 10.000.000đ
Phí: 10.000.000 × 5% = 500.000đ
Thực nhận: 10.000.000 - 500.000 = 9.500.000đ
```

---

### 2️⃣ Gói 1: Vay Trả Góp (3 Kỳ)

**Đặc điểm:**
- Chia thành 3 kỳ thanh toán
- Lãi suất: 0.033%/ngày (tính trên số dư gốc còn lại)
- Phí thuê: Bù vào để đạt mục tiêu lợi nhuận

#### Kỳ 1 - Ngày thứ 7

```typescript
Tiền gốc (G1) = Vay × 20%
Tiền lãi (L1) = Vay × 0.033% × 7 ngày
Mục tiêu lợi nhuận = Vay × 3%
Phí thuê = Mục tiêu - Lãi = (Vay × 3%) - L1
Tổng đóng = G1 + L1 + Phí thuê
```

**Ví dụ với 10.000.000đ:**
```
G1 = 10.000.000 × 20% = 2.000.000đ
L1 = 10.000.000 × 0.00033 × 7 = 23.100đ
Mục tiêu = 10.000.000 × 3% = 300.000đ
Phí thuê = 300.000 - 23.100 = 276.900đ
Tổng = 2.000.000 + 23.100 + 276.900 = 2.300.000đ
```

#### Kỳ 2 - Ngày thứ 18

```typescript
Tiền gốc (G2) = Vay × 30%
Số dư còn lại = Vay - G1
Tiền lãi (L2) = (Vay - G1) × 0.033% × 11 ngày
Mục tiêu lợi nhuận = Vay × 5%
Phí thuê = (Vay × 5%) - L2
Tổng đóng = G2 + L2 + Phí thuê
```

**Ví dụ với 10.000.000đ:**
```
G2 = 10.000.000 × 30% = 3.000.000đ
Số dư = 10.000.000 - 2.000.000 = 8.000.000đ
L2 = 8.000.000 × 0.00033 × 11 = 29.040đ
Mục tiêu = 10.000.000 × 5% = 500.000đ
Phí thuê = 500.000 - 29.040 = 470.960đ
Tổng = 3.000.000 + 29.040 + 470.960 = 3.500.000đ
```

#### Kỳ 3 - Ngày thứ 30

```typescript
Tiền gốc (G3) = Vay - G1 - G2 (còn lại 50%)
Số dư còn lại = Vay - G1 - G2
Tiền lãi (L3) = (Vay - G1 - G2) × 0.033% × 12 ngày
Mục tiêu lợi nhuận = Vay × 7%
Phí thuê = (Vay × 7%) - L3
Tổng đóng = G3 + L3 + Phí thuê
```

**Ví dụ với 10.000.000đ:**
```
G3 = 10.000.000 - 2.000.000 - 3.000.000 = 5.000.000đ
L3 = 5.000.000 × 0.00033 × 12 = 19.800đ
Mục tiêu = 10.000.000 × 7% = 700.000đ
Phí thuê = 700.000 - 19.800 = 680.200đ
Tổng = 5.000.000 + 19.800 + 680.200 = 5.700.000đ
```

**Tổng cộng 3 kỳ:**
```
2.300.000 + 3.500.000 + 5.700.000 = 11.500.000đ
Lợi nhuận: 1.500.000đ (15%)
```

---

### 3️⃣ Gói 2: Gốc Cuối Kỳ (Theo Mốc)

**Đặc điểm:**
- Khách giữ tài sản để sử dụng (xe máy/ô tô)
- Phí cao hơn vì khách được sử dụng tài sản
- Trả 1 lần gốc + phí tại mốc đáo hạn

**Công thức:**

| Mốc | Thời hạn | Tỷ lệ | Công thức |
|-----|----------|-------|-----------|
| 1   | 7 ngày   | 5%    | Tổng = Vay × 1.05 |
| 2   | 18 ngày  | 8%    | Tổng = Vay × 1.08 |
| 3   | 30 ngày  | 12%   | Tổng = Vay × 1.12 |

**Ví dụ với 10.000.000đ:**
```
Mốc 7 ngày:  10.000.000 × 1.05 = 10.500.000đ
Mốc 18 ngày: 10.000.000 × 1.08 = 10.800.000đ
Mốc 30 ngày: 10.000.000 × 1.12 = 11.200.000đ
```

---

### 4️⃣ Gói 3: Gốc Cuối Kỳ + Giữ Tài Sản

**Đặc điểm:**
- Tài sản được lưu kho tại cửa hàng
- Phí thấp hơn Gói 2 vì khách không sử dụng tài sản
- Trả 1 lần gốc + phí tại mốc đáo hạn

**Công thức:**

| Mốc | Thời hạn | Tỷ lệ  | Công thức |
|-----|----------|--------|-----------|
| 1   | 7 ngày   | 1.25%  | Tổng = Vay × 1.0125 |
| 2   | 18 ngày  | 3.5%   | Tổng = Vay × 1.035 |
| 3   | 30 ngày  | 5%     | Tổng = Vay × 1.05 |

**Ví dụ với 10.000.000đ:**
```
Mốc 7 ngày:  10.000.000 × 1.0125 = 10.125.000đ
Mốc 18 ngày: 10.000.000 × 1.035  = 10.350.000đ
Mốc 30 ngày: 10.000.000 × 1.05   = 10.500.000đ
```

---

## 💻 Cách Sử Dụng

### Import

```typescript
import {
  calculateLoan,
  calculateAppraisalFee,
  calculateInstallment3Periods,
  calculateBulletPaymentByMilestone,
  calculateBulletPaymentWithCollateralHold,
  formatMoney,
  unformatMoney,
} from "@/lib/loan-calculation";
import { LOAN_TYPES } from "@/constants/loan";
```

### Tính toán đầy đủ cho 1 khoản vay

```typescript
const result = calculateLoan(10_000_000, LOAN_TYPES.INSTALLMENT_3_PERIODS);

console.log(result);
// {
//   loanAmount: 10000000,
//   loanType: "installment_3_periods",
//   appraisalFee: 500000,
//   netAmount: 9500000,
//   installments: [
//     { period: 1, dueDay: 7, principal: 2000000, interest: 23100, ... },
//     { period: 2, dueDay: 18, principal: 3000000, interest: 29040, ... },
//     { period: 3, dueDay: 30, principal: 5000000, interest: 19800, ... }
//   ]
// }
```

### Tính phí thẩm định riêng

```typescript
const fee = calculateAppraisalFee(10_000_000, LOAN_TYPES.INSTALLMENT_3_PERIODS);
console.log(fee); // 500000
```

### Tính chi tiết từng gói

```typescript
// Gói 1
const installments = calculateInstallment3Periods(10_000_000);

// Gói 2
const goi2Payments = calculateBulletPaymentByMilestone(10_000_000);

// Gói 3
const goi3Payments = calculateBulletPaymentWithCollateralHold(10_000_000);
```

### Format số tiền

```typescript
formatMoney(10_000_000);  // "10.000.000 ₫"
unformatMoney("10.000.000 ₫");  // 10000000
```

---

## 🧪 Testing

Chạy unit tests:

```bash
npm test lib/__tests__/loan-calculation.test.ts
```

Chạy demo:

```typescript
import { runLoanCalculationDemo } from "@/lib/loan-calculation-demo";

runLoanCalculationDemo();
```

---

## 📋 Checklist Tính Năng

- ✅ Tính phí thẩm định (5% cho khoản vay >= 5.000.000đ)
- ✅ Gói 1: Trả góp 3 kỳ với lãi suất 0.033%/ngày
- ✅ Gói 1: Phí thuê tài sản để đạt mục tiêu lợi nhuận (3%, 5%, 7%)
- ✅ Gói 2: Gốc cuối kỳ theo mốc (5%, 8%, 12%)
- ✅ Gói 3: Gốc cuối kỳ + Giữ TS (1.25%, 3.5%, 5%)
- ✅ Làm tròn tất cả số tiền (Math.round)
- ✅ Format hiển thị VND (1.000.000 ₫)
- ✅ Unformat để lưu vào Google Sheets
- ✅ Unit tests đầy đủ
- ✅ Demo examples

---

## 🔐 Tuân Thủ Pháp Luật

Hệ thống được thiết kế để tuân thủ quy định pháp luật:

1. **Chia tách rõ ràng**: Lãi suất (0.033%/ngày) và Phí thuê tài sản
2. **Minh bạch**: Tất cả công thức được document chi tiết
3. **Chính xác**: Làm tròn đến đơn vị đồng, tránh số lẻ
4. **Nhất quán**: Đảm bảo số liệu trên UI, DB, và hợp đồng giấy khớp 100%

---

## 📞 Support

Nếu có thắc mắc về công thức tính toán, vui lòng tham khảo:
- File test: `lib/__tests__/loan-calculation.test.ts`
- File demo: `lib/loan-calculation-demo.ts`
- File này: `lib/LOAN_CALCULATION_README.md`

---

## 🔄 Version History

- **v1.0.0** (2024-02-22): Initial implementation
  - 3 gói vay đầy đủ
  - Phí thẩm định
  - Unit tests
  - Documentation
