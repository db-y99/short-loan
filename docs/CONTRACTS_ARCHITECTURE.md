# 🏗️ Contracts Architecture

## 📋 Tổng Quan

Hệ thống quản lý hợp đồng sử dụng kiến trúc phân tầng với React components để render nội dung hợp đồng.

## 🎨 Component Architecture

### Contract View Components

Các component này chịu trách nhiệm render nội dung hợp đồng với styling đầy đủ:

```
components/contracts/
├── asset-pledge-contract-view.client.tsx       # HĐ Cầm Cố
├── asset-lease-contract-view.client.tsx        # HĐ Thuê TS
├── full-payment-confirmation-view.client.tsx   # XN Nhận Tiền
└── asset-disposal-authorization-view.client.tsx # UQ Xử Lý TS
```

Mỗi component:
- Nhận `data` prop với type tương ứng
- Render HTML với inline styles (CSS-in-JS)
- Tối ưu cho in ấn (A4, page breaks)
- Có thể dùng cho cả web view và PDF generation

## 🔄 PDF Generation Flow

### 1. User Action
```
User clicks "Tạo hợp đồng" in modal
  ↓
ContractsSection.handleGenerateContracts()
  ↓
generateContractsAction(loanId)
```

### 2. Service Layer
```
generateContractsService(loanId)
  ↓
For each contract type:
  1. Build contract data
  2. Generate PDF
  3. Upload to Drive
  4. Save to DB
```

### 3. PDF Generation Pipeline
```
generateContractPDF(contractData, contractType)
  ↓
POST /api/contracts/generate-pdf
  ↓
Step 1: Render React Component to HTML
  POST /api/contracts/render-html
    → renderToStaticMarkup(Component)
    → Return HTML string
  ↓
Step 2: Generate PDF from HTML
  POST /api/generate-pdf
    → Puppeteer renders HTML
    → Return PDF buffer
  ↓
Return PDF buffer to service
```

### 4. Upload & Save
```
uploadToDrive(pdfBuffer, fileName, folderId)
  ↓
Google Drive API
  ↓
Return fileId
  ↓
Insert into loan_files table
```

## 📂 File Structure

### API Routes
```
app/api/
├── contracts/
│   ├── generate-pdf/
│   │   └── route.ts              # Orchestrate PDF generation
│   └── render-html/
│       └── route.ts              # Render React → HTML
│
├── generate-pdf/
│   └── route.ts                  # Puppeteer PDF generation
│
└── loans/[id]/
    └── contract-data/
        └── route.ts              # Get contract data by type
```

### Services
```
services/contracts/
└── contracts.service.ts
    - generateContractsService()  # Main orchestrator
    - getContractsService()
    - deleteContractService()
```

### Components
```
components/
├── contracts/
│   ├── asset-pledge-contract-view.client.tsx
│   ├── asset-lease-contract-view.client.tsx
│   ├── full-payment-confirmation-view.client.tsx
│   ├── asset-disposal-authorization-view.client.tsx
│   └── contract-preview-modal.tsx
│
└── loan-details/
    ├── contracts-section.tsx
    └── loan-details-modal.client.tsx
```

## 🔧 Technical Details

### React Server-Side Rendering

```typescript
// app/api/contracts/render-html/route.ts

import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

// Create React element
const component = createElement(AssetPledgeContractView, {
  data: contractData,
  id: "contract-content",
});

// Render to HTML string
const htmlContent = renderToStaticMarkup(component);

// Wrap in complete HTML document
const fullHtml = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <style>...</style>
    </head>
    <body>${htmlContent}</body>
  </html>
`;
```

### PDF Generation with Puppeteer

```typescript
// app/api/generate-pdf/route.ts

const browser = await puppeteer.launch();
const page = await browser.newPage();

await page.setContent(html, {
  waitUntil: "networkidle0",
});

const pdfBuffer = await page.pdf({
  format: "A4",
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});

await browser.close();
```

### Google Drive Upload

```typescript
// lib/google-drive.ts

export async function uploadToDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId: string,
): Promise<{ fileId: string }> {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });

  const { data } = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id",
    supportsAllDrives: true,
  });

  return { fileId: data.id! };
}
```

## 🎯 Design Decisions

### Why React Components for PDF?

1. **Single Source of Truth**: Cùng một component cho web view và PDF
2. **Maintainability**: Chỉ cần update component, không cần sync HTML templates
3. **Type Safety**: TypeScript types cho contract data
4. **Reusability**: Components có thể dùng ở nhiều nơi

### Why Server-Side Rendering?

1. **Consistency**: HTML giống nhau cho mọi request
2. **Performance**: Không cần client-side rendering
3. **SEO**: HTML tĩnh tốt cho indexing (nếu cần)

### Why Puppeteer?

1. **Accurate Rendering**: Chrome engine render chính xác như browser
2. **CSS Support**: Full CSS support including print styles
3. **Flexibility**: Có thể customize PDF options

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                          │
│  (ContractsSection in loan-details-modal)                   │
└────────────────────┬────────────────────────────────────────┘
                     │ Click "Tạo hợp đồng"
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              Server Action Layer                            │
│  generateContractsAction(loanId)                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              Service Layer                                  │
│  generateContractsService(loanId)                           │
│    1. Get loan details                                      │
│    2. Build 4 contract data objects                         │
│    3. For each contract:                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ↓                         ↓
┌──────────────────┐    ┌──────────────────┐
│  Generate PDF    │    │  Contract Data   │
│                  │    │  Builders        │
│  POST /api/      │    │  - buildAsset... │
│  contracts/      │    │  - buildLease... │
│  generate-pdf    │    │  - buildFull...  │
└────────┬─────────┘    │  - buildDisp...  │
         │              └──────────────────┘
         ↓
┌──────────────────────────────────────────┐
│  Render HTML                             │
│  POST /api/contracts/render-html         │
│    - createElement(Component, data)      │
│    - renderToStaticMarkup()              │
│    - Return HTML string                  │
└────────┬─────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────┐
│  Generate PDF                            │
│  POST /api/generate-pdf                  │
│    - Puppeteer launch                    │
│    - page.setContent(html)               │
│    - page.pdf()                          │
│    - Return PDF buffer                   │
└────────┬─────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────┐
│  Upload to Google Drive                  │
│  uploadToDrive(buffer, fileName, folder) │
│    - Google Drive API                    │
│    - Return fileId                       │
└────────┬─────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────┐
│  Save to Database                        │
│  INSERT INTO loan_files                  │
│    - loan_id, name, type                 │
│    - provider, file_id                   │
└────────┬─────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────┐
│  Return Success                          │
│  contracts[] with real fileIds           │
└──────────────────────────────────────────┘
```

## 🔐 Security Considerations

### 1. Authentication
- All API routes require authentication
- Service account for Google Drive access
- No public access to contracts

### 2. Authorization
- Users can only access their own loan contracts
- Admin can access all contracts
- File access controlled by Drive permissions

### 3. Data Validation
- Contract data validated before PDF generation
- Type checking with TypeScript
- Sanitize user input

### 4. File Storage
- PDFs stored in Google Drive (not local)
- Folder structure per loan
- Automatic cleanup on loan deletion

## 🚀 Performance Optimization

### 1. Caching
- Contract data cached in memory (short-lived)
- PDF generation on-demand only
- Drive fileIds cached in database

### 2. Parallel Processing
- Generate 4 contracts in parallel (future enhancement)
- Upload to Drive in parallel
- Database inserts batched

### 3. Error Handling
- Retry logic for Drive uploads
- Graceful degradation if one contract fails
- Detailed error logging

## 📝 Future Enhancements

### 1. Template System
- Allow admin to customize contract templates
- Store templates in database
- Version control for templates

### 2. Digital Signatures
- Integrate e-signature service
- Track signature status
- Store signed PDFs

### 3. Batch Generation
- Generate contracts for multiple loans
- Background job processing
- Progress tracking

### 4. Contract Versioning
- Keep history of contract changes
- Allow regeneration with old data
- Audit trail

## 🎉 Conclusion

Kiến trúc này cung cấp:
- ✅ Separation of concerns
- ✅ Reusable components
- ✅ Type safety
- ✅ Easy maintenance
- ✅ Scalable architecture
- ✅ Production-ready
