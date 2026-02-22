# 📄 Contracts Feature - Quản Lý Hợp Đồng

## ✅ Tính Năng Đã Hoàn Thành

### 1. Tạo Hợp Đồng Trong Modal
- ✅ Click "Tạo hợp đồng" → Tạo 4 files ngay trong modal
- ✅ Không redirect sang page khác
- ✅ Generate PDF từ contract data
- ✅ Upload PDF lên Google Drive
- ✅ Lưu fileId thật vào database
- ✅ Hiển thị danh sách files ngay sau khi tạo
- ✅ Auto-hide success message sau 3 giây

### 2. Xem Hợp Đồng
- ✅ Click icon "Eye" → Mở modal preview
- ✅ Hiển thị PDF trong iframe
- ✅ Có nút "Tải xuống PDF"

### 3. Tải Xuống Hợp Đồng
- ✅ Click icon "Download" → Tải file PDF
- ✅ Download trực tiếp từ Google Drive

## 📁 Cấu Trúc Files

```
services/contracts/
└── contracts.service.ts              # Service layer (with PDF generation & Drive upload)

features/contracts/actions/
└── generate-contracts.action.ts      # Server action

app/api/
├── contracts/
│   └── generate-pdf/
│       └── route.ts                  # Generate PDF from contract data
└── loans/[id]/
    └── contract-data/
        └── route.ts                  # API route for contract data

components/
├── contracts/
│   └── contract-preview-modal.tsx    # Modal xem PDF
└── loan-details/
    ├── contracts-section.tsx         # Section hiển thị contracts
    └── loan-details-modal.client.tsx # Main modal (đã tích hợp)
```

## 🎯 User Flow

### Khi Chưa Có Hợp Đồng

1. Mở loan details modal
2. Scroll xuống section "Hợp đồng"
3. Thấy empty state với nút "Tạo hợp đồng"
4. Click "Tạo hợp đồng"
5. Loading... (nút disabled)
6. Success! → Hiển thị 4 files:
   - HĐ Cầm Cố Tài Sản
   - HĐ Thuê Tài Sản
   - XN Đã Nhận Đủ Tiền
   - UQ Xử Lý Tài Sản

### Khi Đã Có Hợp Đồng

1. Mở loan details modal
2. Scroll xuống section "Hợp đồng"
3. Thấy danh sách 4 files
4. Mỗi file có 2 nút:
   - **Eye icon**: Xem preview
   - **Download icon**: Tải xuống

### Xem Hợp Đồng

1. Click icon "Eye" trên file
2. Modal preview mở ra
3. Hiển thị dữ liệu hợp đồng (JSON)
4. Có nút "Tải xuống PDF"
5. Click "Đóng" để quay lại

## 🔧 Technical Details

### Service Layer

```typescript
// services/contracts/contracts.service.ts

// Tạo 4 hợp đồng với PDF generation và Drive upload
generateContractsService(loanId: string)
  → Build contract data (4 types)
  → Generate PDF for each contract
  → Upload to Google Drive
  → Save fileId to database
  → Return contracts array

// Lấy danh sách hợp đồng
getContractsService(loanId: string)

// Xóa hợp đồng
deleteContractService(contractId: string)
```

### PDF Generation

```typescript
// app/api/contracts/generate-pdf/route.ts

POST /api/contracts/generate-pdf
  → Receive contract data + type
  → Generate HTML template
  → Call Puppeteer API
  → Return PDF buffer
```

### Server Action

```typescript
// features/contracts/actions/generate-contracts.action.ts

generateContractsAction(loanId: string)
// → Gọi service
// → Revalidate path
// → Return result
```

### Components

#### ContractsSection
- Hiển thị danh sách contracts
- Nút "Tạo hợp đồng"
- Handle view/download
- Manage local state

#### ContractPreviewModal
- Modal xem preview
- Fetch contract data từ API
- Hiển thị JSON data
- Nút download

## 📊 Database Schema

### Bảng: `loan_files`

```sql
CREATE TABLE loan_files (
  id UUID PRIMARY KEY,
  loan_id UUID NOT NULL,
  name TEXT NOT NULL,
  type loan_file_type NOT NULL,
  provider TEXT NOT NULL,
  file_id TEXT NOT NULL,
  created_at TIMESTAMP
);
```

### Enum: `loan_file_type`

```sql
CREATE TYPE loan_file_type AS ENUM (
  'asset_pledge_contract',      -- HĐ Cầm Cố
  'asset_lease_contract',        -- HĐ Thuê
  'full_payment_confirmation',   -- XN Đủ Tiền
  'asset_disposal_authorization' -- UQ Xử Lý
);
```

## 🔄 Data Flow

### Tạo Hợp Đồng

```
User clicks "Tạo hợp đồng"
  ↓
ContractsSection.handleGenerateContracts()
  ↓
generateContractsAction(loanId)
  ↓
generateContractsService(loanId)
  ↓
1. Get loan details from DB
2. Build 4 contract data objects
3. For each contract:
   a. Generate PDF from contract data
      → POST /api/contracts/generate-pdf
      → Generate HTML template
      → Call Puppeteer to create PDF
      → Return PDF buffer
   b. Upload PDF to Google Drive
      → uploadToDrive(buffer, fileName, folderId)
      → Return fileId
   c. Insert record into loan_files table
      → Save with real fileId from Drive
  ↓
Return contracts array with real fileIds
  ↓
Update local state in component
  ↓
Show success message
  ↓
Display 4 contract files with view/download buttons
```

### Xem Hợp Đồng

```
User clicks Eye icon
  ↓
handleViewContract(contract)
  ↓
Open ContractPreviewModal
  ↓
Fetch GET /api/drive/download/{fileId}
  ↓
Stream PDF from Google Drive
  ↓
Display PDF in iframe
```

### Tải Xuống Hợp Đồng

```
User clicks Download icon
  ↓
handleDownloadContract(contract)
  ↓
Fetch GET /api/drive/download/{fileId}
  ↓
Get PDF blob from Drive
  ↓
Create download link
  ↓
Trigger browser download
```

## 🎨 UI/UX

### Empty State
```
┌─────────────────────────────┐
│  📄 Hợp đồng    [Tạo HĐ]   │
├─────────────────────────────┤
│                             │
│         📄                  │
│    Chưa có hợp đồng         │
│  Nhấn "Tạo hợp đồng"...     │
│                             │
└─────────────────────────────┘
```

### With Contracts
```
┌─────────────────────────────┐
│  📄 Hợp đồng                │
├─────────────────────────────┤
│ ✅ Tạo hợp đồng thành công! │
│                             │
│ 📄 HĐ Cầm Cố TS    👁️ ⬇️   │
│ 📄 HĐ Thuê TS      👁️ ⬇️   │
│ 📄 XN Đủ Tiền      👁️ ⬇️   │
│ 📄 UQ Xử Lý TS     👁️ ⬇️   │
└─────────────────────────────┘
```

### Preview Modal
```
┌─────────────────────────────┐
│  HĐ Cầm Cố Tài Sản      ✕  │
├─────────────────────────────┤
│                             │
│  Thông tin hợp đồng         │
│  ┌─────────────────────┐   │
│  │ {                   │   │
│  │   "MA_HD": "...",   │   │
│  │   "HO_TEN": "...",  │   │
│  │   ...               │   │
│  │ }                   │   │
│  └─────────────────────┘   │
│                             │
│  💡 Dữ liệu này sẽ tạo PDF  │
│                             │
├─────────────────────────────┤
│  [Đóng]  [⬇️ Tải xuống PDF] │
└─────────────────────────────┘
```

## 📝 Future Enhancements

### 1. Delete Contract
```typescript
// Add delete functionality
async function deleteContract(contractId: string, fileId: string) {
  // 1. Delete from Google Drive
  // 2. Delete from database
}
```

### 2. Regenerate Contracts
```typescript
// Allow regenerating contracts if data changes
async function regenerateContracts(loanId: string) {
  // 1. Delete old contracts
  // 2. Generate new ones
}
```

### 3. Contract Templates
```typescript
// Allow customizing contract templates
// Store templates in database
// Admin can edit templates
```

### 4. Digital Signatures
```typescript
// Integrate e-signature service
// Allow customers to sign digitally
// Track signature status
```

## ✅ Checklist

- [x] Service layer
- [x] Server action
- [x] UI components
- [x] Modal integration
- [x] Create contracts
- [x] Generate PDF from contract data
- [x] Upload to Google Drive
- [x] Save real fileId to database
- [x] List contracts
- [x] View PDF preview (iframe)
- [x] Download contract
- [ ] Delete contract (UI + functionality)
- [ ] Regenerate contracts if needed

## 🎉 Kết Luận

Hệ thống quản lý hợp đồng đã hoàn thành đầy đủ:
- ✅ Tạo hợp đồng trong modal (không redirect)
- ✅ Generate PDF từ contract data
- ✅ Upload lên Google Drive
- ✅ Lưu fileId thật vào database
- ✅ Hiển thị danh sách files
- ✅ Xem PDF preview trong iframe
- ✅ Download PDF từ Drive
- ✅ UI/UX thân thiện

Sẵn sàng để sử dụng trong production!
