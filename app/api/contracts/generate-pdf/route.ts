import { NextRequest, NextResponse } from "next/server";
import { CONTRACT_TYPE } from "@/types/contract.types";
import type { TContractData } from "@/types/contract.types";
import {
  generateAssetPledgeHTML,
  generateAssetLeaseHTML,
  generateFullPaymentHTML,
  generateAssetDisposalHTML,
} from "@/lib/contract-html-generators";

export const runtime = "nodejs";

/**
 * Generate PDF từ contract data
 * Generate HTML directly then convert to PDF
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractData, contractType } = body as {
      contractData: TContractData;
      contractType: string;
    };

    if (!contractData || !contractType) {
      return NextResponse.json(
        { error: "contractData và contractType là bắt buộc" },
        { status: 400 },
      );
    }

    // Step 1: Generate HTML from contract data
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
        return NextResponse.json(
          { error: `Unknown contract type: ${contractType}` },
          { status: 400 },
        );
    }

    // Step 2: Generate PDF from HTML using Puppeteer
    const pdfResponse = await fetch(
      `${req.nextUrl.origin}/api/generate-pdf`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html,
          fileName: `contract-${contractType}.pdf`,
        }),
      },
    );

    if (!pdfResponse.ok) {
      const error = await pdfResponse.json();
      throw new Error(error.error || "Failed to generate PDF");
    }

    // Return PDF buffer
    const pdfBuffer = await pdfResponse.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contract-${contractType}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[GENERATE_CONTRACT_PDF_ERROR]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate PDF",
      },
      { status: 500 },
    );
  }
}
