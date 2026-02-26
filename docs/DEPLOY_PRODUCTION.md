# 🚀 Hướng dẫn Deploy Production

## 📋 Checklist trước khi deploy

- [ ] Đã test tính năng tạo hợp đồng ở local
- [ ] Đã có Google Service Account JSON
- [ ] Đã có Supabase project
- [ ] Đã tạo INTERNAL_API_SECRET

---

## 🌐 Deploy lên Vercel

### Bước 1: Chuẩn bị biến môi trường

Tạo secret key cho production:

```bash
node scripts/generate-secret.js
```

Lưu lại output để dùng ở bước sau.

### Bước 2: Cấu hình Environment Variables trên Vercel

#### Cách 1: Qua Vercel Dashboard (Khuyên dùng)

1. Vào project trên Vercel Dashboard
2. Settings → Environment Variables
3. Thêm các biến sau:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | Production, Preview, Development |
| `INTERNAL_API_SECRET` | `<secret-từ-script>` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJxxx...` | Production, Preview, Development |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | `{"type":"service_account",...}` | Production, Preview, Development |
| `SHORT_LOAN_GOOGLE_DRIVE_FOLDER_ID` | `1abc...xyz` | Production, Preview, Development |

**⚠️ Lưu ý:**
- `NEXT_PUBLIC_APP_URL`: Dùng domain thật của bạn (ví dụ: `https://loan.yourdomain.com`)
- `INTERNAL_API_SECRET`: Dùng secret key vừa tạo, KHÔNG dùng giá trị dev
- `GOOGLE_SERVICE_ACCOUNT_JSON`: Paste toàn bộ JSON (bao gồm dấu ngoặc nhọn)

#### Cách 2: Qua Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Set environment variables
vercel env add NEXT_PUBLIC_APP_URL
# Nhập: https://your-domain.vercel.app

vercel env add INTERNAL_API_SECRET
# Nhập: <secret-key>

vercel env add NEXT_PUBLIC_SUPABASE_URL
# Nhập: https://xxx.supabase.co

# ... tiếp tục với các biến khác
```

### Bước 3: Deploy

```bash
# Deploy lên production
vercel --prod

# Hoặc push code lên GitHub (nếu đã connect)
git push origin main
```

### Bước 4: Verify deployment

1. Vào `https://your-domain.vercel.app`
2. Login vào hệ thống
3. Thử tạo hợp đồng
4. Kiểm tra logs trên Vercel Dashboard nếu có lỗi

---

## 🐳 Deploy lên Docker/VPS

### Bước 1: Tạo file .env.production

```bash
# Copy từ .env.example
cp .env.example .env.production
```

Sửa file `.env.production`:

```env
# Production URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Internal API Secret (tạo mới cho production)
INTERNAL_API_SECRET=<production-secret-key>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Google Drive
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
SHORT_LOAN_GOOGLE_DRIVE_FOLDER_ID=1abc...xyz
```

### Bước 2: Build và deploy

```bash
# Build production
pnpm build

# Start production server
pnpm start

# Hoặc dùng PM2
pm2 start npm --name "short-loan" -- start
```

### Bước 3: Cấu hình Nginx (nếu dùng)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔒 Bảo mật Production

### 1. Tạo secret key riêng cho production

**KHÔNG dùng chung secret key giữa dev và production!**

```bash
# Tạo secret mới cho production
node scripts/generate-secret.js
```

### 2. Không commit file .env

Đảm bảo `.gitignore` có:

```gitignore
.env
.env.local
.env.production
.env.*.local
```

### 3. Rotate secret key định kỳ

Nên thay đổi `INTERNAL_API_SECRET` mỗi 3-6 tháng:

1. Tạo secret mới
2. Cập nhật trên Vercel/server
3. Redeploy application

### 4. Giới hạn CORS (nếu cần)

Thêm vào `next.config.js`:

```js
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://your-domain.com' },
      ],
    },
  ];
}
```

---

## 🐛 Debug Production Issues

### 1. Kiểm tra Environment Variables

Trên Vercel Dashboard:
- Settings → Environment Variables
- Verify tất cả biến đã được set đúng

### 2. Xem Logs

```bash
# Vercel CLI
vercel logs

# Hoặc trên Vercel Dashboard
# Project → Deployments → Click vào deployment → View Function Logs
```

### 3. Test API endpoints

```bash
# Test generate-pdf API
curl -X POST https://your-domain.vercel.app/api/generate-pdf \
  -H "Content-Type: application/json" \
  -H "x-internal-secret: YOUR_PRODUCTION_SECRET" \
  -d '{"html":"<h1>Test</h1>","fileName":"test.pdf"}'
```

### 4. Common Issues

#### ❌ Lỗi: "Failed to launch browser"

**Nguyên nhân:** Vercel không có Chrome/Chromium

**Giải pháp:** Đã cấu hình sẵn `@sparticuz/chromium` cho production trong `app/api/generate-pdf/route.ts`

Kiểm tra `package.json` có:
```json
{
  "dependencies": {
    "puppeteer-core": "^latest",
    "@sparticuz/chromium": "^latest"
  }
}
```

#### ❌ Lỗi: "INTERNAL_API_SECRET not set"

**Giải pháp:**
1. Vào Vercel Dashboard → Settings → Environment Variables
2. Thêm `INTERNAL_API_SECRET`
3. Redeploy

#### ❌ Lỗi: "Cannot connect to Supabase"

**Giải pháp:**
1. Kiểm tra `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Verify Supabase project đang active
3. Kiểm tra RLS policies

---

## 📊 Monitoring

### 1. Vercel Analytics

Enable trên Vercel Dashboard:
- Analytics → Enable

### 2. Error Tracking

Cân nhắc thêm Sentry:

```bash
pnpm add @sentry/nextjs
```

### 3. Performance Monitoring

Theo dõi:
- Function execution time (Vercel Dashboard)
- PDF generation time (server logs)
- Drive upload time (server logs)

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Tạo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run tests
        run: pnpm test
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## ✅ Post-Deployment Checklist

- [ ] Tất cả environment variables đã được set
- [ ] Application đã deploy thành công
- [ ] Có thể login vào hệ thống
- [ ] Tính năng tạo hợp đồng hoạt động
- [ ] PDF được tạo và upload lên Drive thành công
- [ ] Logs không có error nghiêm trọng
- [ ] Performance acceptable (< 30s để tạo 4 hợp đồng)

---

## 📞 Support

Nếu gặp vấn đề khi deploy:

1. Kiểm tra logs trên Vercel Dashboard
2. Xem [DEBUG_TAO_HOP_DONG.md](./DEBUG_TAO_HOP_DONG.md)
3. Verify environment variables
4. Test API endpoints với curl
5. Liên hệ team nếu vẫn lỗi
