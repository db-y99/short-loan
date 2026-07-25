---
inclusion: manual
---

# Gói 3: Gốc Cuối Kỳ + Giữ Tài Sản - Công Thức Tính

## Công Thức Chung

```
Tổng chuộc = Vay + Lãi + Phí thuê + Phí dịch vụ
```

Trong đó:
- **Lãi** = Vay × 0.033% × số ngày
- **Phí thuê** = (Vay × %) - Lãi
- **Phí dịch vụ** = 30,000 đ (nếu Vay ≤ 2,000,000), ngược lại = 0

## Chi Tiết Từng Mốc

### Mốc 1: 7 Ngày
- Lãi = Vay × 0.033% × 7
- Phí thuê = (Vay × 4%) - Lãi
- Phí dịch vụ = 30,000 đ (nếu Vay ≤ 2,000,000)
- **Tổng chuộc = Vay + Lãi + Phí thuê + Phí dịch vụ**

### Mốc 2: 18 Ngày
- Lãi = Vay × 0.033% × 18
- Phí thuê = (Vay × 5%) - Lãi
- Phí dịch vụ = 30,000 đ (nếu Vay ≤ 2,000,000)
- **Tổng chuộc = Vay + Lãi + Phí thuê + Phí dịch vụ**

### Mốc 3: 30 Ngày
- Lãi = Vay × 0.033% × 30
- Phí thuê = (Vay × 6.5%) - Lãi
- Phí dịch vụ = 30,000 đ (nếu Vay ≤ 2,000,000)
- **Tổng chuộc = Vay + Lãi + Phí thuê + Phí dịch vụ**

## Ví Dụ Cụ Thể

### Vay 1.5 Triệu (Có Phí Dịch Vụ)

**Mốc 1 (7 ngày):**
- Lãi = 1,500,000 × 0.033% × 7 = 3,465 đ
- Phí thuê = (1,500,000 × 4%) - 3,465 = 60,000 - 3,465 = 56,535 đ
- Phí dịch vụ = 30,000 đ
- **Tổng chuộc = 1,500,000 + 3,465 + 56,535 + 30,000 = 1,590,000 đ**

**Mốc 2 (18 ngày):**
- Lãi = 1,500,000 × 0.033% × 18 = 8,910 đ
- Phí thuê = (1,500,000 × 5%) - 8,910 = 75,000 - 8,910 = 66,090 đ
- Phí dịch vụ = 30,000 đ
- **Tổng chuộc = 1,500,000 + 8,910 + 66,090 + 30,000 = 1,605,000 đ**

**Mốc 3 (30 ngày):**
- Lãi = 1,500,000 × 0.033% × 30 = 14,850 đ
- Phí thuê = (1,500,000 × 6.5%) - 14,850 = 97,500 - 14,850 = 82,650 đ
- Phí dịch vụ = 30,000 đ
- **Tổng chuộc = 1,500,000 + 14,850 + 82,650 + 30,000 = 1,627,500 đ**

### Vay 5 Triệu (Không Có Phí Dịch Vụ)

**Mốc 1 (7 ngày):**
- Lãi = 5,000,000 × 0.033% × 7 = 11,550 đ
- Phí thuê = (5,000,000 × 4%) - 11,550 = 200,000 - 11,550 = 188,450 đ
- Phí dịch vụ = 0 đ
- **Tổng chuộc = 5,000,000 + 11,550 + 188,450 = 5,200,000 đ**

**Mốc 2 (18 ngày):**
- Lãi = 5,000,000 × 0.033% × 18 = 29,700 đ
- Phí thuê = (5,000,000 × 5%) - 29,700 = 250,000 - 29,700 = 220,300 đ
- Phí dịch vụ = 0 đ
- **Tổng chuộc = 5,000,000 + 29,700 + 220,300 = 5,250,000 đ**

**Mốc 3 (30 ngày):**
- Lãi = 5,000,000 × 0.033% × 30 = 49,500 đ
- Phí thuê = (5,000,000 × 6.5%) - 49,500 = 325,000 - 49,500 = 275,500 đ
- Phí dịch vụ = 0 đ
- **Tổng chuộc = 5,000,000 + 49,500 + 275,500 = 5,325,000 đ**

## Quy Định Khi Thanh Toán Trễ Hạn

### Trễ Qua 31 Ngày (Ngày 31)

- **Phí = Vay × (5% + 1.25%) = Vay × 6.25%** — *tạm giữ công thức cũ*
- **Tổng chuộc = Vay + Phí**

### Trễ Từ Ngày Thứ 6 Của Tháng Mới (Khoảng Ngày 36 Trở Đi)

- **Phí = Vay × (5% + 1.25% + 2%) = Vay × 8.25%** — *tạm giữ công thức cũ*
- **Tổng chuộc = Vay + Phí**

> Xem `docs/GOI_3_RATE_CHANGE_2026-07.md` — mốc 4/5/6.5% đã áp dụng; phí trễ chưa đổi theo.

## Cập Nhật Code

- `lib/loan-calculation.ts` - Hàm tính toán
- `lib/__tests__/loan-calculation.test.ts` - Unit tests
