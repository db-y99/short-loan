# 📄 Hướng Dẫn Sử Dụng Tính Năng Hợp Đồng

## 🎯 Tổng Quan

Tính năng quản lý hợp đồng cho phép bạn tạo, xem và tải xuống 4 loại hợp đồng cho mỗi khoản vay, tất cả trong một modal duy nhất.

## 📋 4 Loại Hợp Đồng

1. **HĐ Cầm Cố Tài Sản** - Hợp đồng cầm cố tài sản chính
2. **HĐ Thuê Tài Sản** - Hợp đồng thuê tài sản (nếu khách giữ tài sản)
3. **XN Đã Nhận Đủ Tiền** - Xác nhận khách hàng đã nhận đủ tiền vay
4. **UQ Xử Lý Tài Sản** - Giấy ủy quyền xử lý tài sản khi quá hạn

## 🚀 Cách Sử Dụng

### Bước 1: Mở Chi Tiết Khoản Vay

1. Từ danh sách khoản vay, click vào một khoản vay
2. Modal "Chi tiết khoản vay" sẽ mở ra
3. Scroll xuống phần "Hợp đồng"

### Bước 2: Tạo Hợp Đồng (Lần Đầu)

Nếu chưa có hợp đồng, bạn sẽ thấy:

```
┌─────────────────────────────────────┐
│  📄 Hợp đồng      [Tạo hợp đồng]   │
├─────────────────────────────────────┤
│                                     │
│            📄                       │
│       Chưa có hợp đồng              │
│  Nhấn "Tạo hợp đồng" để tạo bộ HĐ  │
│                                     │
└─────────────────────────────────────┘
```

**Thao tác:**
1. Click nút "Tạo hợp đồng"
2. Đợi vài giây (nút sẽ hiển thị "Đang tạo...")
3. Thông báo "Tạo hợp đồng thành công!" xuất hiện
4. 4 hợp đồng được hiển thị ngay lập tức

### Bước 3: Xem Danh Sách Hợp Đồng

Sau khi tạo, bạn sẽ thấy:

```
┌─────────────────────────────────────┐
│  📄 Hợp đồng                        │
├─────────────────────────────────────┤
│ ✅ Tạo hợp đồng thành công!         │
│                                     │
│ 📄 HĐ Cầm Cố Tài Sản      👁️  ⬇️   │
│ 📄 HĐ Thuê Tài Sản        👁️  ⬇️   │
│ 📄 XN Đã Nhận Đủ Tiền     👁️  ⬇️   │
│ 📄 UQ Xử Lý Tài Sản       👁️  ⬇️   │
└─────────────────────────────────────┘
```

Mỗi hợp đồng có 2 nút:
- **👁️ (Eye)**: Xem nội dung hợp đồng
- **⬇️ (Download)**: Tải xuống file PDF

### Bước 4: Xem Nội Dung Hợp Đồng

**Thao tác:**
1. Click icon 👁️ (Eye) trên hợp đồng muốn xem
2. Modal preview sẽ mở ra
3. Xem nội dung hợp đồng
4. Click "Đóng" để quay lại

```
┌─────────────────────────────────────┐
│  HĐ Cầm Cố Tài Sản            ✕    │
├─────────────────────────────────────┤
│                                     │
│  Thông tin hợp đồng                 │
│  ┌───────────────────────────────┐ │
│  │ Mã HĐ: HD001                  │ │
│  │ Họ tên: Nguyễn Văn A          │ │
│  │ CCCD: 001234567890            │ │
│  │ Số tiền vay: 10.000.000 ₫     │ │
│  │ ...                           │ │
│  └───────────────────────────────┘ │
│                                     │
│  💡 Dữ liệu này sẽ được dùng để     │
│     tạo file PDF hợp đồng           │
│                                     │
├─────────────────────────────────────┤
│  [Đóng]        [⬇️ Tải xuống PDF]  │
└─────────────────────────────────────┘
```

### Bước 5: Tải Xuống Hợp Đồng

**Thao tác:**
1. Click icon ⬇️ (Download) trên hợp đồng
2. File PDF sẽ được tải xuống máy tính
3. Mở file để xem hoặc in

## 💡 Tips & Tricks

### Khi Nào Tạo Hợp Đồng?

- ✅ Sau khi tạo khoản vay mới
- ✅ Trước khi giải ngân
- ✅ Khi khách hàng yêu cầu

### Tạo Lại Hợp Đồng

Nếu cần tạo lại hợp đồng:
1. Xóa các hợp đồng cũ (tính năng đang phát triển)
2. Click "Tạo hợp đồng" lại

### In Hợp Đồng

1. Tải xuống file PDF
2. Mở file bằng PDF reader
3. Click Print hoặc Ctrl+P
4. Chọn máy in và in

## ⚠️ Lưu Ý

### Hợp Đồng Chỉ Tạo 1 Lần

- Mỗi khoản vay chỉ nên tạo hợp đồng 1 lần
- Nếu đã có hợp đồng, nút "Tạo hợp đồng" sẽ ẩn đi
- Muốn tạo lại phải xóa hợp đồng cũ trước

### Dữ Liệu Hợp Đồng

Hợp đồng được tạo tự động từ:
- Thông tin khách hàng
- Thông tin tài sản
- Thông tin khoản vay
- Lịch thanh toán

### Lưu Trữ

- Hợp đồng được lưu trên Google Drive
- Link hợp đồng được lưu trong database
- Có thể truy cập bất cứ lúc nào

## 🔧 Xử Lý Sự Cố

### Không Tạo Được Hợp Đồng

**Nguyên nhân:**
- Thiếu thông tin khách hàng
- Thiếu thông tin tài sản
- Lỗi kết nối database

**Giải pháp:**
1. Kiểm tra thông tin khoản vay đầy đủ
2. Thử lại sau vài giây
3. Liên hệ admin nếu vẫn lỗi

### Không Xem Được Hợp Đồng

**Nguyên nhân:**
- Lỗi kết nối API
- File bị xóa trên Drive

**Giải pháp:**
1. Refresh trang và thử lại
2. Kiểm tra kết nối internet
3. Tạo lại hợp đồng nếu cần

### Không Tải Được Hợp Đồng

**Nguyên nhân:**
- Lỗi Google Drive
- Không có quyền truy cập

**Giải pháp:**
1. Kiểm tra quyền truy cập Drive
2. Thử lại sau vài phút
3. Liên hệ admin

## 📞 Hỗ Trợ

Nếu gặp vấn đề, liên hệ:
- Email: support@example.com
- Phone: 0123456789
- Chat: Trong ứng dụng

## 🎉 Kết Luận

Tính năng hợp đồng giúp bạn:
- ✅ Tạo hợp đồng nhanh chóng
- ✅ Quản lý tập trung
- ✅ Truy cập mọi lúc mọi nơi
- ✅ In ấn dễ dàng

Chúc bạn sử dụng hiệu quả! 🚀
