# Setup Google Apps Script PDF Generator

## Tổng quan

Google Apps Script có thể chuyển đổi HTML thành PDF một cách native, không cần Puppeteer hay Chrome. Điều này giúp:

- **Miễn phí**: Không tốn tiền hosting PDF service
- **Nhanh**: Không cần launch browser
- **Ổn định**: Google infrastructure
- **Đơn giản**: Chỉ cần HTML → PDF

## Bước 1: Tạo Google Apps Script Project

1. Vào https://script.google.com/
2. Click **New Project**
3. Đặt tên: `PDF Generator for Short Loan`
4. Copy code từ file `scripts/google-apps-script-code.js` vào editor
5. Save project (Ctrl+S)

## Bước 2: Deploy Web App

1. Click **Deploy** → **New deployment**
2. **Type**: Web app
3. **Description**: PDF Generator API
4. **Execute as**: Me
5. **Who has access**: Anyone (hoặc Anyone with Google account)
6. Click **Deploy**
7. **Copy URL** (dạng: `https://script.google.com/macros/s/...../exec`)

## Bước 3: Test Google Apps Script

### Test trong GAS Editor
```javascript
// Chạy function testPDFGeneration() trong GAS Editor
// Sẽ tạo file PDF test trong Google Drive
```

### Test từ command line
```bash
# Set environment variable first
export PDF_SERVICE_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"

# Then run test
cd scripts
node test-gas-pdf.js
```

### Test bằng curl
```bash
# Health check
curl "$PDF_SERVICE_URL"

# Generate PDF
curl -X POST "$PDF_SERVICE_URL" \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Test PDF</h1>"}' \
  | jq .
```

## Bước 4: Cập nhật Environment Variable

Thêm Google Apps Script URL vào file `.env.local`:
```bash
PDF_SERVICE_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

**Thay `YOUR_SCRIPT_ID` bằng Script ID thực tế của bạn!**

File `lib/pdf-generator-app-scripts.ts` sẽ tự động đọc từ `process.env.PDF_SERVICE_URL`.

## Bước 5: Cập nhật Service

File `services/contracts/contracts.service.ts` đã được cập nhật để dùng Google Apps Script.

## API Response Format

### Success Response
```json
{
  "status": "ok",
  "filename": "contract.pdf",
  "data": "base64-encoded-pdf-data",
  "contentType": "application/pdf"
}
```

### Error Response
```json
{
  "error": "PDF generation failed",
  "details": "Error details here"
}
```

## Performance

- **Cold start**: ~2-3 giây (lần đầu sau khi idle)
- **Warm**: ~500ms - 1s
- **Concurrent**: Google Apps Script handle được multiple requests
- **Limits**: 6 phút timeout, 100MB memory

## Troubleshooting

### Lỗi: "Script function not found"
- Kiểm tra đã save code chưa
- Kiểm tra function `doPost` và `doGet` có tồn tại

### Lỗi: "Authorization required"
- Vào Deploy settings
- Đổi "Who has access" thành "Anyone"

### Lỗi: "HTML is required"
- Kiểm tra request body có field `html`
- Kiểm tra Content-Type: application/json

### PDF không đúng format
- Google Apps Script HTML→PDF có hạn chế về CSS
- Tránh dùng CSS phức tạp (flexbox, grid)
- Dùng table layout cho responsive

### Timeout
- HTML quá lớn (>1MB)
- CSS quá phức tạp
- Tối ưu HTML trước khi gửi

## Security

- **Public endpoint**: Ai cũng có thể gọi
- **Rate limiting**: Google tự động handle
- **Input validation**: Đã validate HTML required
- **Error handling**: Không expose sensitive info

## Monitoring

- **Logs**: Google Apps Script → Executions
- **Quota**: Google Apps Script → Quotas
- **Performance**: Check execution time trong logs

## Migration từ PDF Service

1. ✅ Tạo Google Apps Script
2. ✅ Update `pdf-generator-app-scripts.ts`
3. ✅ Update `contracts.service.ts`
4. 🔄 Test tạo hợp đồng
5. 🔄 Deploy production

## Lợi ích so với PDF Service

| Feature | PDF Service | Google Apps Script |
|---------|-------------|-------------------|
| Cost | $5/month Railway | Free |
| Setup | Docker + Deploy | Copy/paste code |
| Performance | Fast | Medium |
| Reliability | Depends on hosting | Google infrastructure |
| Maintenance | Need updates | Google handles |
| CSS Support | Full (Puppeteer) | Limited |
| Concurrent | Limited by server | Google handles |

## Kết luận

Google Apps Script là giải pháp tốt cho:
- **Prototype/MVP**: Setup nhanh, miễn phí
- **Simple PDF**: HTML đơn giản, ít CSS phức tạp
- **Low traffic**: < 1000 requests/day

Nếu cần CSS phức tạp hoặc high traffic, vẫn nên dùng PDF Service với Puppeteer.