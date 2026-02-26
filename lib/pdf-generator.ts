/**
 * PDF Generator - Direct function call (không qua HTTP)
 * Dùng cho server-side code
 */

import { CONTRACT_TYPE } from "@/types/contract.types";
import type { TContractData } from "@/types/contract.types";
import {
  generateAssetPledgeHTML,
  generateAssetLeaseHTML,
  generateFullPaymentHTML,
  generateAssetDisposalHTML,
} from "@/lib/contract-html-generators";

/**
 * Generate PDF buffer từ contract data
 * Gọi trực tiếp, không qua HTTP API
 */
export async function generatePDFFromHTML(
  html: string,
): Promise<Buffer> {
  const isDev = process.env.NODE_ENV === "development";
  
  let puppeteer: any;
  let browser: any;
  
  try {
    if (isDev) {
      // Development: Use full puppeteer
      puppeteer = (await import("puppeteer")).default;
      
      const fs = require('fs');
      const possiblePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
      ];
      
      let chromePath = null;
      for (const path of possiblePaths) {
        if (path && fs.existsSync(path)) {
          chromePath = path;
          break;
        }
      }
      
      const launchOptions: any = {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      };
      
      if (chromePath) {
        launchOptions.executablePath = chromePath;
      }
      
      browser = await puppeteer.launch(launchOptions);
    } else {
      // Production: Use puppeteer-core with Chromium
      puppeteer = (await import("puppeteer-core")).default;
      const chromium = (await import("@sparticuz/chromium")).default;
      
      browser = await puppeteer.launch({
        args: [
          ...chromium.args,
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
        defaultViewport: {
          width: 1920,
          height: 1080,
        },
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    }
    
    const page = await browser.newPage();
    
    await page.setContent(html, {
      waitUntil: ["networkidle0", "domcontentloaded"],
      timeout: 30000,
    });
    
    // Wait for fonts
    try {
      await page.evaluateHandle("document.fonts.ready");
    } catch (fontError) {
      console.warn("Font loading warning:", fontError);
    }
    
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: false,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
    });
    
    await browser.close();
    
    return Buffer.from(pdf);
  } catch (error) {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }
    throw error;
  }
}

/**
 * Generate contract PDF từ contract data
 */
export async function generateContractPDF(
  contractData: TContractData,
  contractType: string,
): Promise<Buffer> {
  // Generate HTML
  let html: string;
  switch (contractType) {
    case CONTRACT_TYPE.ASSET_PLEDGE:
      html = generateAssetPledgeHTML(contractData as any);
      break;
    case CONTRACT_TYPE.ASSET_LEASE:
      html = generateAssetLeaseHTML(contractData as any);
      break;
    case CONTRACT_TYPE.FULL_PAYMENT:
      html = generateFullPaymentHTML(contractData as any);
      break;
    case CONTRACT_TYPE.ASSET_DISPOSAL:
      html = generateAssetDisposalHTML(contractData as any);
      break;
    default:
      throw new Error(`Unknown contract type: ${contractType}`);
  }
  
  // Generate PDF
  return await generatePDFFromHTML(html);
}
