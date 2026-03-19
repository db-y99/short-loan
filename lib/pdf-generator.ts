/**
 * PDF Generator - Gọi PDF microservice
 * Thay thế Puppeteer local bằng PDF service riêng
 */

import { CONTRACT_TYPE } from "@/types/contract.types";
import type { TContractData } from "@/types/contract.types";
import {
  generateAssetPledgeHTML,
  generateAssetLeaseHTML,
  generateFullPaymentHTML,
  generateAssetDisposalHTML,
} from "@/lib/contract-html-generators";

import { env } from "@/config/env";

const PDF_SERVICE_URL = env.PDF_SERVICE_URL || "http://localhost:3001";

/**
 * Generate PDF buffer từ HTML
 * Gọi PDF microservice thay vì dùng Puppeteer local
 */
export async function generatePDFFromHTML(html: string): Promise<Buffer> {
  try {
    console.log(`[PDF_CLIENT] Calling PDF service at ${PDF_SERVICE_URL}/generate`);
    console.log(`[PDF_CLIENT] HTML length: ${html.length} characters`);
    
    const response = await fetch(`${PDF_SERVICE_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ html }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(`PDF service error: ${error.error || response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`[PDF_CLIENT] PDF generated successfully, size: ${buffer.length} bytes`);
    return buffer;
  } catch (error) {
    console.error("[PDF_CLIENT] Error calling PDF service:", error);
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`
    );
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
