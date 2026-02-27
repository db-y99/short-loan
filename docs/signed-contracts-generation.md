# Signed Contracts Generation - Tạo hợp đồng có chữ ký

## Tổng quan

Khi ký hợp đồng, hệ thống sẽ tự động generate 4 file PDF hợp đồng có chữ ký và lưu vào DB + Google Drive.

## Quy trình

### 1. Người dùng ký hợp đồng

Trong modal ký hợp đồng (`components/contracts/contract-signing-modal.tsx`):
- Người dùng vẽ 2 loại chữ ký:
  - **Chữ ký nháy** (Draft Signature): Dùng cho Bên A (công ty)
  - **Chữ ký chính thức** (Official Signature): Dùng cho Bên B (khách hàng)
- Chữ ký được lưu dưới dạng base64 data URL

### 2. API xử lý ký hợp đồng

API endpoint: `POST /api/loans/[id]/sign`

**Bước 1: Upload chữ ký lên Google Drive**
- Convert base64 data URL thành Buffer
- Upload 2 file PNG lên Drive folder của loan:
  - `chu-ky-nhay-{loan_code}.png`
  - `chu-ky-chinh-thuc-{loan_code}.png`

**Bước 2: Cập nhật loan status**
- Chuyển status từ `approved` → `signed`
- Lưu `signed_at` timestamp
- Lưu `draft_signature_file_id` và `official_signature_file_id`

**Bước 3: Generate 4 PDF có chữ ký**
- Gọi `generateSignedContractsService()` để tạo 4 PDF:
  1. Hợp đồng cầm cố tài sản (Đã ký)
  2. Hợp đồng thuê tài sản (Đã ký)
  3. Xác nhận đã nhận đủ tiền (Đã ký)
  4. Ủy quyền xử lý tài sản (Đã ký)

### 3. Generate Signed PDFs Service

Service: `generateSignedContractsService()` trong `services/contracts/contracts.service.ts`

**Quy trình:**

1. **Lấy loan details và signature file IDs**
   ```typescript
   const draftSignatureUrl = `/api/drive/image/${draft_signature_file_id}`;
   const officialSignatureUrl = `/api/drive/image/${official_signature_file_id}`;
   ```

2. **Build contract data với signatures**
   ```typescript
   {
     ...buildAssetPledgeContractData(loan, folderId),
     DRAFT_SIGNATURE: draftSignatureUrl,
     OFFICIAL_SIGNATURE: officialSignatureUrl,
   }
   ```

3. **Generate PDFs song song**
   - Sử dụng Puppeteer để render HTML thành PDF
   - Chữ ký được embed vào PDF dưới dạng `<img>` tag

4. **Upload PDFs lên Drive**
   - Tên file: `HD-CamCo-DaKy-{loan_code}.pdf`, etc.
   - Version suffix: `-v2`, `-v3` nếu tạo lại

5. **Lưu vào DB**
   - Insert records vào bảng `loan_files`
   - Type: `asset_pledge_contract`, `asset_lease_contract`, etc.
   - Name: "HĐ Cầm Cố Tài Sản (Đã ký)", etc.

6. **Cập nhật metadata**
   - Tăng `signed_contract_version` trong loan metadata

## Contract Types

### 1. Asset Pledge Contract (Hợp đồng cầm cố tài sản)
- Type: `asset_pledge_contract`
- File: `HD-CamCo-DaKy-{code}.pdf`
- Chữ ký:
  - Bên A (Draft): Đại diện công ty
  - Bên B (Official): Khách hàng

### 2. Asset Lease Contract (Hợp đồng thuê tài sản)
- Type: `asset_lease_contract`
- File: `HD-Thue-DaKy-{code}.pdf`
- Chữ ký:
  - Bên cho thuê (Draft): Đại diện công ty
  - Bên thuê (Official): Khách hàng

### 3. Full Payment Confirmation (Xác nhận đã nhận đủ tiền)
- Type: `full_payment_confirmation`
- File: `XN-NhanTien-DaKy-{code}.pdf`
- Chữ ký:
  - Bên giao tiền (Draft): Đại diện công ty
  - Bên nhận tiền (Official): Khách hàng

### 4. Asset Disposal Authorization (Ủy quyền xử lý tài sản)
- Type: `asset_disposal_authorization`
- File: `UQ-XuLy-DaKy-{code}.pdf`
- Chữ ký:
  - Bên được ủy quyền (Draft): Đại diện công ty
  - Bên ủy quyền (Official): Khách hàng

## HTML Generators

Các file HTML generator đã được cập nhật để hiển thị chữ ký:

### Signature Section Template

```html
<div class="signature-box">
  <p class="bold">BÊN A</p>
  <p>(Ký, ghi rõ họ tên)</p>
  ${data.DRAFT_SIGNATURE ? 
    `<img src="${data.DRAFT_SIGNATURE}" 
         alt="Chữ ký nháy" 
         style="max-width: 200px; max-height: 100px; margin: 10px auto; display: block;" />` 
    : '<div style="height: 100px;"></div>'}
  <p class="bold" style="margin-top: 10px;">${data.BEN_A_DAI_DIEN}</p>
</div>
```

### Files Updated

- `lib/contract-html-generators/asset-pledge.ts`
- `lib/contract-html-generators/asset-lease.ts`
- `lib/contract-html-generators/full-payment.ts`
- `lib/contract-html-generators/asset-disposal.ts`

## Database Schema

### Bảng `loans`

Thêm 2 columns:
```sql
draft_signature_file_id TEXT
official_signature_file_id TEXT
```

### Bảng `loan_files`

Lưu thông tin PDF đã ký:
```sql
id UUID
loan_id UUID
name TEXT -- "HĐ Cầm Cố Tài Sản (Đã ký)"
type TEXT -- "asset_pledge_contract"
provider TEXT -- "google_drive"
file_id TEXT -- Google Drive file ID
created_at TIMESTAMP
```

## Versioning

Hệ thống hỗ trợ versioning cho signed contracts:

- Version được lưu trong `loan.metadata.signed_contract_version`
- Mỗi lần tạo lại, version tăng lên
- File name có suffix: `-v2`, `-v3`, etc.
- Ví dụ: `HD-CamCo-DaKy-LN001-v2.pdf`

## Error Handling

Service không fail toàn bộ quá trình ký nếu PDF generation lỗi:

```typescript
try {
  const result = await generateSignedContractsService(loanId);
  if (!result.success) {
    console.error("Failed to generate PDFs:", result.error);
    // Don't fail the signing process, just log
  }
} catch (pdfError) {
  console.error("Error generating PDFs:", pdfError);
  // Don't fail the signing process
}
```

Lý do: Ký hợp đồng là bước quan trọng, không nên fail vì PDF generation lỗi. PDF có thể tạo lại sau.

## Performance

- PDFs được generate song song (Promise.all)
- Upload lên Drive song song
- Insert DB records song song
- Thời gian ước tính: 10-15 giây cho 4 PDFs

## Testing

Để test chức năng:

1. Tạo loan mới và approve
2. Mở modal ký hợp đồng
3. Vẽ 2 chữ ký (nháy và chính thức)
4. Click "Hoàn tất và ký hợp đồng"
5. Kiểm tra:
   - Loan status chuyển sang `signed`
   - 2 file chữ ký PNG được upload lên Drive
   - 4 file PDF có chữ ký được tạo và upload lên Drive
   - 4 records được insert vào `loan_files`
   - Metadata có `signed_contract_version`

## Future Improvements

1. **Watermark**: Thêm watermark "ĐÃ KÝ" vào PDF
2. **QR Code**: Thêm QR code để verify tính hợp lệ của hợp đồng
3. **Digital Signature**: Sử dụng digital signature chuẩn (PKI)
4. **Audit Trail**: Log chi tiết quá trình ký và generate PDF
5. **Notification**: Gửi email/SMS cho khách hàng khi ký xong
