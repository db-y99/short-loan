/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  transpilePackages: ["p-map"],
  experimental: {
    optimizePackageImports: ["lucide-react", "@heroui/react"],
  },
};

module.exports = nextConfig;
