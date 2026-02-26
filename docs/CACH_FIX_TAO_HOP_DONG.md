# 🔧 Các cách fix lỗi tạo hợp đồng

## 🎯 Vấn đề gốc

Service gọi API `/api/generate-pdf` qua HTTP → Middleware chặn vì không có authentication → Redirect về login → Lỗi

---

## ✅ Cách 1: Direct Function Call (ĐANG DÙNG - TỐT NHẤT)

### Ý tưởng
Thay vì gọi API qua HTTP, import và gọi trực tiếp function generate PDF.

### Implementation
```typescript
// lib/pdf-generator.ts
export async function generateContractPDF(data, type) {
  // Generate HTML
  const html = generateHTML(data, type);
  
  // Generate PDF với Puppeteer
  return await generatePDFFromHTML(html);
}

// services/contracts/contracts.service.ts
async function generateContractPDFDirect(data, type) {
  const { generateContractPDF } = await import("@/lib/pdf-generator");
  return await generateContractPDF(data, type);
}
```

### Ưu điểm
✅ Không cần bypass middleware
✅ Không cần thêm biến môi trường (INTERNAL_API_SECRET, NEXT_PUBLIC_APP_URL)
✅ Nhanh hơn (không qua HTTP)
✅ Đơn giản hơn
✅ Dễ debug hơn
✅ Không có vấn đề bảo mật

### Nhược điểm
❌ Code phức tạp hơn một chút (phải extract logic ra file riêng)
❌ Puppeteer chạy trong cùng process với Next.js (có thể ảnh hưởng memory)

### Khi deploy
Không cần làm gì đặc biệt! Chỉ cần:
- Supabase credentials
- Google Drive credentials

---

## ⚠️ Cách 2: Internal API Secret (ĐÃ IMPLEMENT TRƯỚC ĐÓ)

### Ý tưởng
Thêm secret key vào header để bypass middleware authentication.

### Implementation
```typescript
// middleware.ts
const isInternalApiCall = 
  pathname === "/api/generate-pdf" &&
  request.headers.get("x-internal-secret") === process.env.INTERNAL_API_SECRET;

if (!user && !isPublicRoute && !isInternalApiCall) {
  return redirect("/login");
}

// service
const response = await fetch("/api/generate-pdf", {
  headers: {
    "x-internal-secret": process.env.INTERNAL_API_SECRET
  }
});
```

### Ưu điểm
✅ Đơn giản, dễ hiểu
✅ Tách biệt logic (API route riêng)
✅ Có thể gọi từ bên ngoài nếu cần

### Nhược điểm
❌ Cần thêm biến môi trường (INTERNAL_API_SECRET, NEXT_PUBLIC_APP_URL)
❌ Phải cấu hình trên Vercel/production
❌ Chậm hơn (qua HTTP)
❌ Có thể bị lộ secret nếu không cẩn thận
❌ Phức tạp khi deploy

### Khi deploy
Phải thêm env vars:
- NEXT_PUBLIC_APP_URL
- INTERNAL_API_SECRET (tạo bằng script)
- Supabase credentials
- Google Drive credentials

---

## 🚫 Cách 3: Bypass toàn bộ API routes (KHÔNG NÊN)

### Ý tưởng
Cho phép tất cả API routes không cần authentication.

### Implementation
```typescript
// middleware.ts
const isPublicRoute = 
  pathname === "/login" || 
  pathname.startsWith("/auth") ||
  pathname.startsWith("/api/"); // Bypass tất cả API

if (!user && !isPublicRoute) {
  return redirect("/login");
}
```

### Ưu điểm
✅ Đơn giản nhất
✅ Không cần thêm biến môi trường

### Nhược điểm
❌ **RẤT NGUY HIỂM** - Tất cả API đều public
❌ Bất kỳ ai cũng có thể gọi API
❌ Không bảo mật
❌ **KHÔNG BAO GIỜ DÙNG TRONG PRODUCTION**

---

## 🔄 Cách 4: Server Actions (Next.js 14+)

### Ý tưởng
Dùng Server Actions thay vì API routes.

### Implementation
```typescript
// actions/generate-contracts.action.ts
"use server";

export async function generateContractsAction(loanId: string) {
  // Kiểm tra auth
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  // Generate PDF trực tiếp
  const { generateContractPDF } = await import("@/lib/pdf-generator");
  const pdf = await generateContractPDF(data, type);
  
  // Upload to Drive
  // ...
}
```

### Ưu điểm
✅ Không cần API routes
✅ Authentication tự động
✅ Type-safe
✅ Đơn giản

### Nhược điểm
❌ Đã có sẵn API routes rồi
❌ Phải refactor nhiều code
❌ Server Actions có giới hạn về size/timeout

---

## 🎨 Cách 5: Edge Runtime với Cloudflare Workers

### Ý tưởng
Deploy PDF generation lên Cloudflare Workers riêng.

### Implementation
```typescript
// Cloudflare Worker
export default {
  async fetch(request) {
    const { html } = await request.json();
    const pdf = await generatePDF(html);
    return new Response(pdf);
  }
}

// Service
const response = await fetch("https://pdf-worker.your-domain.workers.dev", {
  method: "POST",
  body: JSON.stringify({ html })
});
```

### Ưu điểm
✅ Tách biệt hoàn toàn
✅ Scale tốt
✅ Không ảnh hưởng main app

### Nhược điểm
❌ Phức tạp
❌ Cần setup thêm infrastructure
❌ Chi phí cao hơn
❌ Overkill cho use case này

---

## 📊 So sánh

| Tiêu chí | Cách 1: Direct Call | Cách 2: Secret | Cách 3: Bypass All | Cách 4: Server Actions | Cách 5: Workers |
|----------|---------------------|----------------|-------------------|----------------------|-----------------|
| **Đơn giản** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| **Bảo mật** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Deploy dễ** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ |
| **Maintainability** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ | ⭐⭐ |

---

## 🏆 Khuyến nghị

### Cho dự án này: **Cách 1 - Direct Function Call**

**Lý do:**
- Đơn giản nhất khi deploy (không cần env vars phức tạp)
- Bảo mật tốt (không bypass middleware)
- Performance tốt nhất
- Dễ maintain

### Khi nào dùng cách khác?

**Cách 2 (Internal Secret):** 
- Khi cần gọi API từ external services
- Khi muốn tách biệt PDF generation ra microservice

**Cách 4 (Server Actions):**
- Khi build app mới từ đầu
- Khi muốn type-safety tốt hơn

**Cách 5 (Workers):**
- Khi traffic rất cao
- Khi cần scale riêng PDF generation
- Khi có budget cho infrastructure

---

## 🚀 Migration từ Cách 2 sang Cách 1

Đã làm sẵn! Chỉ cần:

1. Pull code mới
2. Remove env vars không cần:
   - ~~NEXT_PUBLIC_APP_URL~~
   - ~~INTERNAL_API_SECRET~~
3. Deploy

Xong! Không cần config gì thêm.

---

## 📚 Files liên quan

### Cách 1 (Direct Call)
- `lib/pdf-generator.ts` - Core PDF generation logic
- `services/contracts/contracts.service.ts` - Gọi direct function

### Cách 2 (Internal Secret)
- `lib/supabase/middleware.ts` - Bypass logic
- `app/api/generate-pdf/route.ts` - API endpoint
- `scripts/generate-secret.js` - Generate secret key
