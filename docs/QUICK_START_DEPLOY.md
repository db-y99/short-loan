# 🚀 Quick Start - Deploy Production

## 2 bước deploy lên Vercel

### 1️⃣ Thêm Environment Variables trên Vercel

Vào: https://vercel.com/dashboard → Project → Settings → Environment Variables

Thêm 4 biến sau:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
SHORT_LOAN_GOOGLE_DRIVE_FOLDER_ID=1abc...xyz
```

Chọn: **Production, Preview, Development** cho tất cả

### 2️⃣ Deploy

```bash
git push origin main
```

Hoặc:

```bash
vercel --prod
```

---

## ✅ Verify

1. Vào app: `https://your-app.vercel.app`
2. Login
3. Thử tạo hợp đồng
4. Kiểm tra 4 PDF được tạo

---

## ❌ Nếu lỗi

Xem logs: Vercel Dashboard → Deployments → View Function Logs

Tìm: `[GENERATE_CONTRACTS_ERROR]`

**Lỗi phổ biến:**
- Failed to generate PDF → Xem logs chi tiết, kiểm tra Chromium
- Cannot upload to Drive → Kiểm tra Service Account JSON và permissions
- Database error → Kiểm tra Supabase connection

---

## 📚 Docs đầy đủ

- [docs/SOLUTION_SUMMARY.md](./docs/SOLUTION_SUMMARY.md) - Tóm tắt giải pháp
- [docs/CACH_FIX_TAO_HOP_DONG.md](./docs/CACH_FIX_TAO_HOP_DONG.md) - So sánh các cách fix
- [docs/DEPLOY_PRODUCTION.md](./docs/DEPLOY_PRODUCTION.md) - Hướng dẫn đầy đủ
- [docs/DEBUG_TAO_HOP_DONG.md](./docs/DEBUG_TAO_HOP_DONG.md) - Debug guide
- [SECURITY_ANSWER.md](./SECURITY_ANSWER.md) - So sánh bảo mật

---

## 🛠️ Useful Commands

```bash
# Validate env trước khi deploy
npm run validate-env

# Deploy
vercel --prod

# Xem logs
vercel logs
```
