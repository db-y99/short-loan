# Loan Status Flow - Quy trình trạng thái khoản vay

## Các trạng thái hiện tại

### 1. Chờ duyệt (pending)
- Trạng thái ban đầu khi tạo khoản vay mới
- Chờ nhân viên phê duyệt

### 2. Đã duyệt (Chờ ký) (approved)
- Khoản vay đã được phê duyệt
- Chờ khách hàng ký hợp đồng
- Có thể ký trực tiếp hoặc qua QR code

### 3. Đã ký (Chờ giải ngân) (signed)
- Hợp đồng đã được ký kết
- Chờ giải ngân tiền cho khách hàng

### 4. Đang cầm (disbursed)
- Đã giải ngân tiền cho khách hàng
- Tài sản đang được cầm cố
- Khách hàng có thể trả lãi định kỳ

### 5. Đã chuộc (redeemed)
- Khách hàng đã trả đủ gốc + lãi
- Tài sản đã được trả lại cho khách hàng
- Khoản vay hoàn thành

### 6. Từ chối (rejected)
- Khoản vay bị từ chối
- Không tiếp tục quy trình

## Trạng thái Legacy (không dùng nữa)

### 7. Hoàn thành (completed) - LEGACY
- Trạng thái cũ, đã được thay thế bằng "redeemed"
- Chỉ giữ lại để tương thích với dữ liệu cũ

### 8. Thanh lý (liquidated) - LEGACY
- Trạng thái cũ, không còn sử dụng
- Chỉ giữ lại để tương thích với dữ liệu cũ

## Quy trình chuẩn

```
pending → approved → signed → disbursed → redeemed
   ↓
rejected
```

## Các thay đổi trong code

### Migration
- File: `supabase/migrations/20260227120000_update_loan_status_enum.sql`
- Thêm status "redeemed" vào enum

### Constants
- File: `constants/loan.ts`
- Cập nhật LOAN_STATUS, LOAN_STATUS_LABEL, LOAN_STATUS_COLOR
- Đánh dấu completed và liquidated là legacy

### Types
- File: `types/loan.types.ts`
- TLoanStatus đã bao gồm tất cả các status

### API Routes
- `app/api/loans/[id]/redeem/route.ts`: Cập nhật từ "completed" → "redeemed"

### Components
- `components/loan-details/loan-profile-section.tsx`: Loại bỏ check COMPLETED status

## Lưu ý khi phát triển

1. Không sử dụng status "completed" hoặc "liquidated" cho khoản vay mới
2. Khi check status, ưu tiên sử dụng constants từ `LOAN_STATUS`
3. Đảm bảo UI hiển thị đúng label cho từng status
4. Khi migrate dữ liệu cũ, có thể cần convert "completed" → "redeemed"
