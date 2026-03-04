import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildAssetPledgeContractData,
  buildAssetLeaseContractData,
  buildFullPaymentConfirmationData,
  buildAssetDisposalAuthorizationData,
} from "@/lib/contract-data";

/**
 * GET /api/loans/[id]/contract-data
 * Lấy dữ liệu hợp đồng để hiển thị trong modal ký hoặc contract page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: loanId } = await params;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const contractType = searchParams.get('type');

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Use getLoanDetailsService to get full loan data with currentPeriod
    const { getLoanDetailsService } = await import("@/services/loans/loans.service");
    const loanDetails = await getLoanDetailsService(loanId);

    if (!loanDetails) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khoản vay" },
        { status: 404 }
      );
    }

    // Build contract data using the same functions as contract generation
    const pledgeData = buildAssetPledgeContractData(loanDetails);
    const leaseData = buildAssetLeaseContractData(loanDetails);
    const paymentData = buildFullPaymentConfirmationData(loanDetails);
    const disposalData = buildAssetDisposalAuthorizationData(loanDetails);

    // Get signed date
    const signedDate = loanDetails.signedAt ? new Date(loanDetails.signedAt) : new Date();
    const ngay = signedDate.getDate();
    const thang = signedDate.getMonth() + 1;
    const nam = signedDate.getFullYear();
    const signedDateStr = `${String(ngay).padStart(2, '0')}/${String(thang).padStart(2, '0')}/${nam}`;

    // Return separate contract data objects with proper typing
    const contractData = {
      // Asset Pledge Contract Data
      pledgeContract: {
        ...pledgeData,
        NGAY: ngay,
        THANG: thang,
        NAM: nam,
        SIGNED_DATE: signedDateStr,
        DRAFT_SIGNATURE: null,
        OFFICIAL_SIGNATURE: null,
      },
      
      // Asset Lease Contract Data  
      leaseContract: {
        ...leaseData,
        NGAY: ngay,
        THANG: thang,
        NAM: nam,
        SIGNED_DATE: signedDateStr,
        DRAFT_SIGNATURE: null,
        OFFICIAL_SIGNATURE: null,
      },
      
      // Payment Confirmation Data
      paymentConfirmation: {
        ...paymentData,
        NGAY: ngay,
        THANG: thang,
        NAM: nam,
        SIGNED_DATE: signedDateStr,
        DRAFT_SIGNATURE: null,
        OFFICIAL_SIGNATURE: null,
      },
      
      // Asset Disposal Authorization Data
      disposalAuthorization: {
        ...disposalData,
        NGAY: ngay,
        THANG: thang,
        NAM: nam,
        SIGNED_DATE: signedDateStr,
        DRAFT_SIGNATURE: null,
        OFFICIAL_SIGNATURE: null,
      },
    };

    console.log({contractData})

    // If specific contract type is requested (for contract page), return only that contract
    if (contractType) {
      let specificContract;
      switch (contractType) {
        case 'asset_pledge_contract':
          specificContract = contractData.pledgeContract;
          break;
        case 'asset_lease_contract':
          specificContract = contractData.leaseContract;
          break;
        case 'full_payment_confirmation':
          specificContract = contractData.paymentConfirmation;
          break;
        case 'asset_disposal_authorization':
          specificContract = contractData.disposalAuthorization;
          break;
        default:
          return NextResponse.json(
            { success: false, error: "Invalid contract type" },
            { status: 400 }
          );
      }
      
      return NextResponse.json({
        success: true,
        data: specificContract,
      });
    }

    // Return all contracts (for signing modal)
    return NextResponse.json({
      success: true,
      data: contractData,
    });
  } catch (error) {
    console.error("Error fetching contract data:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}
