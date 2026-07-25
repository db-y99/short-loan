# Note: Tên phí trên UI vs trong code

## Kết luận ngắn

**Đúng.** Cùng một khoản phí:

| Ngữ cảnh | Tên gọi |
|----------|---------|
| **Hiển thị UI** (preview tạo đơn, bảng thanh toán) | **Phí quản lý tài sản** (đôi khi nói tắt / ngoài app: *phí quản lý khoản vay*) |
| **Code / DB / hợp đồng (logic nội bộ)** | **Phí thuê** (`rentalFee`, `rental_fee`, `phiThue`) |

Không phải hai loại phí khác nhau — chỉ khác **nhãn hiển thị** và **tên biến**.

---

## Mapping chi tiết

| Layer | Identifier / label |
|-------|-------------------|
| UI — `payment-table.tsx`, `loan-preview-section.client.tsx` | `Phí quản lý tài sản` |
| Type / calc — `types/loan.types.ts`, `lib/loan-calculation.ts` | `rentalFee` — comment: *Phí thuê tài sản* |
| DB — `loan_payment_periods` | `rental_fee` |
| Hợp đồng thuê — `lib/contract-data.ts`, `types/contract.types.ts` | `phiThue` |

Công thức (gói 3): `Phí thuê = (Vay × %) − Lãi` — giá trị này chính là số hiện trên UI là “Phí quản lý tài sản”.

---

## Lưu ý khi sửa code

- Đổi label UI → sửa component (ví dụ cột bảng thanh toán).
- Đổi tên field code/DB → migration + refactor rộng (`rentalFee` / `rental_fee` / `phiThue`).
- **Không** cộng thêm một dòng “phí quản lý” riêng nếu đã có `rentalFee` — sẽ bị **nhân đôi**.

---

## Phí liên quan (không nhầm)

| Tên | Code | Ghi chú |
|-----|------|---------|
| Lãi | `interest` | 0.033%/ngày |
| Phí quản lý tài sản / phí thuê | `rentalFee` | Mục note này |
| Phí dịch vụ | `serviceFee` | Gói 3, 30.000đ nếu vay ≤ 2 triệu |
