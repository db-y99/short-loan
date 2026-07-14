/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  transpilePackages: ["p-map"],
};

module.exports = nextConfig;
