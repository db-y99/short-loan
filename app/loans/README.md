# PDF Generation với Puppeteer trên Vercel

## Tổng quan

Hệ thống này sử dụng Puppeteer và Chromium để tạo PDF chất lượng cao từ HTML trên Vercel.

## Cài đặt

Các package đã được cài đặt:
- `puppeteer-core` - Core Puppeteer library (production)
- `@sparticuz/chromium` - Chromium binary tối ưu cho Vercel (production)
- `puppeteer` - Full Puppeteer cho development (dev dependency)

## Cấu trúc

### API Route: `/api/generate-pdf`
- Nhận HTML content qua POST request
- Sử dụng Puppeteer để render HTML thành PDF
- Trả về PDF file với format A4
- Timeout: 60 giây (cấu hình trong `vercel.json`)

### Hook: `usePdfGenerator`
- Client-side hook để tạo và tải PDF
- Tự động lấy tất cả styles từ document
- Hiển thị progress bar trong quá trình tạo PDF
- Hỗ trợ download và upload lên Google Drive

### Contract Page: `/loans/[id]/contract`
- Hiển thị các loại hợp đồng khác nhau
- Nút "Tải xuống PDF" để download
- Nút "Lưu lên Drive" để upload lên Google Drive

## Ưu điểm so với html2canvas + jsPDF

1. **Chất lượng cao hơn**: Puppeteer render trực tiếp từ HTML, không qua canvas
2. **Text có thể select**: PDF giữ nguyên text, không phải image
3. **File size nhỏ hơn**: Không cần convert sang image
4. **Hỗ trợ CSS tốt hơn**: Đầy đủ CSS features, flexbox, grid, etc.
5. **Multi-page tự động**: Tự động chia trang theo nội dung

## Lưu ý khi Deploy lên Vercel

1. **Function timeout**: Đã cấu hình 60s trong `vercel.json`
2. **Memory**: Chromium cần ~50MB RAM, đảm bảo plan Vercel đủ
3. **Cold start**: Lần đầu có thể chậm do load Chromium binary
4. **Region**: Nên deploy ở region gần người dùng

## Sử dụng

```typescript
import { usePdfGenerator } from "@/hooks/use-pdf-generator";

function MyComponent() {
  const { generating, progress, downloadPDF } = usePdfGenerator();

  const handleDownload = async () => {
    await downloadPDF("element-id", "filename.pdf");
  };

  return (
    <div>
      <div id="element-id">
        {/* Nội dung cần convert sang PDF */}
      </div>
      <button onClick={handleDownload} disabled={generating}>
        {generating ? `Đang tạo... ${progress}%` : "Tải PDF"}
      </button>
    </div>
  );
}
```

## Troubleshooting

### PDF không hiển thị đúng styles
- Đảm bảo sử dụng inline styles hoặc styles được include trong HTML
- Kiểm tra console log để xem có lỗi CORS với external stylesheets

### Timeout trên Vercel
- Tăng `maxDuration` trong `vercel.json`
- Giảm kích thước HTML content
- Tối ưu hóa số lượng elements

### Memory issues
- Giảm viewport size
- Tối ưu hóa HTML structure
- Upgrade Vercel plan nếu cần
