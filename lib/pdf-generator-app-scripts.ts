/**
 * PDF Generator - Google Apps Script
 * Sử dụng Google Apps Script để generate PDF từ HTML
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

const GAS_PDF_SERVICE_URL = env.PDF_SERVICE_URL;

/**
 * Generate PDF buffer từ HTML sử dụng Google Apps Script
 */
export async function generatePDFFromHTML(html: string): Promise<Buffer> {
  try {
    if (!GAS_PDF_SERVICE_URL) {
      throw new Error("PDF_SERVICE_URL environment variable is not set");
    }
    
    console.log(`[PDF_GAS] Calling Google Apps Script at ${GAS_PDF_SERVICE_URL}`);
    console.log(`[PDF_GAS] HTML length: ${html.length} characters`);
    
    const response = await fetch(GAS_PDF_SERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ html }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(`Google Apps Script error: ${error.error || response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(`Google Apps Script error: ${result.error}`);
    }
    
    if (!result.data) {
      throw new Error("No PDF data received from Google Apps Script");
    }
    
    // Decode base64 PDF data
    const buffer = Buffer.from(result.data, 'base64');
    
    console.log(`[PDF_GAS] PDF generated successfully, size: ${buffer.length} bytes`);
    return buffer;
  } catch (error) {
    console.error("[PDF_GAS] Error calling Google Apps Script:", error);
    throw new Error(
      `Failed to generate PDF with Google Apps Script: ${error instanceof Error ? error.message : "Unknown error"}`
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
  
  // Generate PDF using Google Apps Script
  return await generatePDFFromHTML(html);
}

/**
 * Health check Google Apps Script service
 */
export async function checkGASPDFServiceHealth(): Promise<boolean> {
  try {
    if (!GAS_PDF_SERVICE_URL) {
      console.error("[PDF_GAS] PDF_SERVICE_URL environment variable is not set");
      return false;
    }
    
    const response = await fetch(GAS_PDF_SERVICE_URL, {
      method: "GET",
    });
    
    if (!response.ok) {
      return false;
    }
    
    const result = await response.json();
    return result.status === "ok";
  } catch (error) {
    console.error("[PDF_GAS] Health check failed:", error);
    return false;
  }
}