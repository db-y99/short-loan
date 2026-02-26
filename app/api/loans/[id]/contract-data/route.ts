import { NextRequest, NextResponse } from "next/server";
import { getLoanDetailsService } from "@/services/loans/loans.service";
import {
  buildAssetPledgeContractData,
  buildAssetLeaseContractData,
  buildFullPaymentConfirmationData,
  buildAssetDisposalAuthorizationData,
} from "@/lib/contract-data";
import { CONTRACT_TYPE } from "@/types/contract.types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: loanId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const contractType = searchParams.get("type");

    if (!contractType) {
      return NextResponse.json(
        { error: "Contract type is required" },
        { status: 400 },
      );
    }

    // Lấy loan details
    const loan = await getLoanDetailsService(loanId);

    if (!loan) {
      return NextResponse.json(
        { error: "Loan not found" },
        { status: 404 },
      );
    }

    const folderId = loan.driveFolderId ?? "";

    // Build contract data based on type
    let contractData;
    switch (contractType) {
      case CONTRACT_TYPE.ASSET_PLEDGE:
        contractData = buildAssetPledgeContractData(loan, folderId);
        break;
      case CONTRACT_TYPE.ASSET_LEASE:
        contractData = buildAssetLeaseContractData(loan, folderId);
        break;
      case CONTRACT_TYPE.FULL_PAYMENT:
        contractData = buildFullPaymentConfirmationData(loan, folderId);
        break;
      case CONTRACT_TYPE.ASSET_DISPOSAL:
        contractData = buildAssetDisposalAuthorizationData(loan, folderId);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid contract type" },
          { status: 400 },
        );
    }

    return NextResponse.json(contractData);
  } catch (error) {
    console.error("[CONTRACT_DATA_API_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch contract data" },
      { status: 500 },
    );
  }
}
