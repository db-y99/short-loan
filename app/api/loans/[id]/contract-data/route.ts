import { NextResponse } from "next/server";
import { getLoanDetailsService } from "@/services/loans/loans.service";
import {
  buildAssetPledgeContractData,
  buildAssetLeaseContractData,
  buildFullPaymentConfirmationData,
  buildAssetDisposalAuthorizationData,
} from "@/lib/contract-data";
import { CONTRACT_TYPE } from "@/types/contract.types";

export const runtime = "nodejs";

type TContractType = (typeof CONTRACT_TYPE)[keyof typeof CONTRACT_TYPE];

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") ?? CONTRACT_TYPE.ASSET_PLEDGE) as TContractType;

    const loan = await getLoanDetailsService(id);

    if (!loan) {
      return NextResponse.json(
        { error: "Không tìm thấy khoản vay" },
        { status: 404 },
      );
    }

    const folderId = loan.driveFolderId ?? "";

    let contractData: unknown;
    switch (type) {
      case CONTRACT_TYPE.ASSET_LEASE:
        contractData = buildAssetLeaseContractData(loan, folderId);
        break;
      case CONTRACT_TYPE.FULL_PAYMENT:
        contractData = buildFullPaymentConfirmationData(loan, folderId);
        break;
      case CONTRACT_TYPE.ASSET_DISPOSAL:
        contractData = buildAssetDisposalAuthorizationData(loan, folderId);
        break;
      case CONTRACT_TYPE.ASSET_PLEDGE:
      default:
        contractData = buildAssetPledgeContractData(loan, folderId);
        break;
    }

    return NextResponse.json(contractData);
  } catch (err) {
    console.error("[CONTRACT_DATA_ERROR]", err);
    return NextResponse.json(
      { error: "Lỗi khi tải dữ liệu hợp đồng" },
      { status: 500 },
    );
  }
}
