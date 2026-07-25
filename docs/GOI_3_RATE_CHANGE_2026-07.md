# Gói 3 — Đổi tỷ lệ Lãi + Phí bảo quản (2026-07)

## Tóm tắt

Ngày **25/07/2026**: đổi tỷ lệ **Lãi + Phí bảo quản tài sản** (gói 3) theo mốc thanh toán.

| Mốc | Thời hạn | Tỷ lệ cũ | Tỷ lệ mới |
|-----|----------|----------|-----------|
| 1 | 7 ngày | 1,25% | **4%** |
| 2 | 18 ngày | 3,5% | **5%** |
| 3 | 30 ngày | 5% | **6,5%** |

Công thức không đổi:

```
Lãi          = Vay × 0,033%/ngày × số ngày
Phí bảo quản = (Vay × tỷ lệ mốc) − Lãi
Phí dịch vụ  = 30.000đ nếu Vay ≤ 2.000.000đ (ngược lại = 0)
Tổng chuộc   = Vay + Lãi + Phí bảo quản + Phí dịch vụ
```

## Phí trễ hạn — chưa đổi

**Giữ công thức cũ** (chưa align theo 4% / 5% / 6,5%):

| Khoảng ngày | Tỷ lệ | Cách tính (cũ) |
|-------------|-------|----------------|
| ≤ 30 | 0% | Không tính phí trễ |
| 31–35 | **6,25%** | 5% (tháng cũ) + 1,25% (tháng mới) |
| ≥ 36 | **8,25%** | 6,25% + 2% phạt |

> TODO sau: cân nhắc đổi phí trễ thành `6,5% + 4% = 10,5%` và `6,5% + 4% + 2% = 12,5%` cho khớp mốc mới.

Code: `calculateBulletPaymentWithCollateralHoldLate` trong `lib/loan-calculation.ts`.

## Ảnh hưởng

- Preview tạo khoản vay, bảng thanh toán, hợp đồng (khi tạo/tạo lại) dùng % mới.
- Kỳ thanh toán / HĐ đã lưu trước ngày đổi **vẫn giữ số cũ** trong DB — cần regenerate periods / tạo lại HĐ nếu muốn áp dụng %.

## File liên quan

- `lib/loan-calculation.ts` — `calculateBulletPaymentWithCollateralHold`
- `lib/__tests__/loan-calculation.test.ts`
- `.kiro/steering/goi-3-calculation.md`
- `docs/FEE_NAMING_NOTE.md` — nhãn UI “Phí bảo quản tài sản” ↔ `rentalFee`
