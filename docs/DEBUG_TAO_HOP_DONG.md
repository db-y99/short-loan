# 🔍 Hướng dẫn Debug lỗi tạo hợp đồng

## Các bước kiểm tra và sửa lỗi

### 1. Kiểm tra biến môi trường

Mở file `.env` hoặc `.env.local` và đảm bảo có đủ các biến sau:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Drive
GOOGLE_SERVICE_ACCOUNT_JSON=your-google-service-account-json
SHORT_LOAN_GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
```

### 2. Kiểm tra Chrome/Chromium (Windows)

Puppeteer cần Chrome để tạo PDF. Kiểm tra xem Chrome đã được cài đặt chưa:

**Đường dẫn Chrome thường gặp:**
- `C:\Program Files\Google\Chrome\Application\chrome.exe`
- `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`
- `%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe`

**Nếu chưa có Chrome:**
1. Tải và cài đặt Google Chrome
2. Hoặc cài Chromium: `pnpm add puppeteer` (sẽ tự động tải Chromium)

### 3. Kiểm tra Google Drive setup

Đảm bảo:
- Service Account JSON đã được cấu hình đúng
- Folder Drive ID tồn tại và Service Account có quyền write
- Khoản vay đã có `driveFolderId` (kiểm tra trong DB)

### 4. Xem log lỗi chi tiết

Mở Developer Console (F12) khi tạo hợp đồng và xem:
- Tab **Console**: Lỗi JavaScript
- Tab **Network**: Lỗi API calls
  - Tìm request đến `/api/contracts/generate-pdf`
  - Xem response status và error message

### 5. Kiểm tra server logs

Chạy lệnh sau để xem log server:

```bash
# Nếu đang chạy dev server
# Xem terminal đang chạy `pnpm dev`
```

Tìm các log sau:
- `[GENERATE_CONTRACTS]` - Log từ service
- `[PDF_GEN_ERROR]` - Lỗi tạo PDF
- `[DRIVE_UPLOAD_ERROR]` - Lỗi upload Drive
- `[DB_INSERT_ERROR]` - Lỗi insert database

### 6. Test từng bước

#### Test 1: Kiểm tra loan có folder Drive chưa
Vào database và chạy query:
```sql
SELECT id, code, drive_folder_id 
FROM loans 
WHERE id = 'your-loan-id';
```

Nếu `drive_folder_id` là NULL, cần tạo folder trước.

### 7. Các lỗi thường gặp và cách fix

#### ❌ Lỗi: "Không tìm thấy khoản vay"
- Kiểm tra `loanId` có đúng không
- Kiểm tra user có quyền truy cập loan không

#### ❌ Lỗi: "Khoản vay chưa có folder Drive"
- Tạo folder Drive cho khoản vay trước
- Hoặc cập nhật `drive_folder_id` trong DB

#### ❌ Lỗi: "Failed to generate PDF"
- Kiểm tra Chrome đã cài đặt chưa
- Xem chi tiết lỗi trong server logs
- Kiểm tra Puppeteer có hoạt động không

#### ❌ Lỗi: "Không thể upload hợp đồng lên Drive"
- Kiểm tra Google Service Account JSON
- Kiểm tra quyền của Service Account trên folder
- Kiểm tra folder ID có đúng không

#### ❌ Lỗi: "Không thể tạo hợp đồng. Vui lòng thử lại"
- Kiểm tra database connection
- Kiểm tra bảng `loan_files` có tồn tại không
- Xem chi tiết lỗi trong server logs

### 8. Restart và thử lại

Sau khi fix các vấn đề trên:

```bash
# Stop dev server (Ctrl+C)
# Xóa cache
rm -rf .next

# Start lại
pnpm dev
```

## 🆘 Nếu vẫn lỗi

Gửi cho team:
1. Screenshot lỗi trong Console (F12)
2. Screenshot Network tab (request/response)
3. Server logs (terminal output)
4. Thông tin môi trường:
   - Node version: `node -v`
   - OS: Windows version
   - Chrome installed: Yes/No

## 📚 Tài liệu liên quan

- [QUICK_START_DEPLOY.md](../QUICK_START_DEPLOY.md) - Deploy nhanh
- [docs/SOLUTION_SUMMARY.md](./SOLUTION_SUMMARY.md) - Tóm tắt giải pháp
- [docs/DEPLOY_PRODUCTION.md](./DEPLOY_PRODUCTION.md) - Hướng dẫn deploy chi tiết
