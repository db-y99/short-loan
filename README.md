# Next.js & HeroUI Template

This is a template for creating applications using Next.js 14 (app directory) and HeroUI (v2).

[Try it on CodeSandbox](https://githubbox.com/heroui-inc/heroui/next-app-template)

## Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started)
- [HeroUI v2](https://heroui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [next-themes](https://github.com/pacocoursey/next-themes)

## How to Use

### Use the template with create-next-app

To create a new project based on this template using `create-next-app`, run the following command:

```bash
npx create-next-app -e https://github.com/heroui-inc/next-app-template
```

### Install dependencies

You can use one of them `npm`, `yarn`, `pnpm`, `bun`, Example using `npm`:

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Setup pnpm (optional)

If you are using `pnpm`, you need to add the following code to your `.npmrc` file:

```bash
public-hoist-pattern[]=*@heroui/*
```

After modifying the `.npmrc` file, you need to run `pnpm install` again to ensure that the dependencies are installed correctly.

## License

Licensed under the [MIT license](https://github.com/heroui-inc/next-app-template/blob/main/LICENSE).


## 🚀 Deploy lên Production

### Quick Start

Xem: [QUICK_START_DEPLOY.md](./QUICK_START_DEPLOY.md)

### Chi tiết

- [docs/DEPLOY_PRODUCTION.md](./docs/DEPLOY_PRODUCTION.md) - Hướng dẫn chi tiết cho Vercel, Docker, VPS
- [docs/SOLUTION_SUMMARY.md](./docs/SOLUTION_SUMMARY.md) - Tóm tắt giải pháp

**TL;DR cho Vercel:**

1. Thêm 4 env vars trên Vercel Dashboard
2. Deploy: `git push origin main`

---

## 🔧 Setup cho tính năng tạo hợp đồng

### 1. Cấu hình biến môi trường

Copy file `.env.example` thành `.env` và điền các giá trị:

```bash
cp .env.example .env
```

**Các biến bắt buộc:**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Drive
GOOGLE_SERVICE_ACCOUNT_JSON=your-google-service-account-json
SHORT_LOAN_GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
```

### 2. Cài đặt Chrome (cho Puppeteer)

Puppeteer cần Chrome để tạo PDF. Đảm bảo Chrome đã được cài đặt trên máy.

**Windows:** Tải từ https://www.google.com/chrome/

**Hoặc cài Chromium tự động:**
```bash
pnpm add puppeteer
```

### 3. Restart server

Sau khi cấu hình xong, restart dev server:

```bash
pnpm dev
```

### 🐛 Debug lỗi tạo hợp đồng

Nếu gặp lỗi khi tạo hợp đồng, xem hướng dẫn chi tiết tại:

📄 [docs/DEBUG_TAO_HOP_DONG.md](./docs/DEBUG_TAO_HOP_DONG.md)

**Lỗi phổ biến:**
- Chrome chưa cài → Cài Google Chrome hoặc `pnpm add puppeteer`
- Thiếu env vars → Kiểm tra `.env` file
