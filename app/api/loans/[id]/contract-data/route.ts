import type { TContractType } from "@/types/contract.types";

import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LOAN_STATUS } from "@/constants/loan";
import { requireActiveStaffUser } from "@/lib/auth/api-auth";
import {
  buildAssetPledgeContractData,
  buildAssetLeaseContractData,
  buildFullPaymentConfirmationData,
  buildAssetDisposalAuthorizationData,
} from "@/lib/contract-data";
import { CONTRACT_TYPE } from "@/types/contract.types";
import { getGeneratableContractTypesForLoan } from "@/constants/contracts";
import { getUnsignedContractTypesFromFiles } from "@/lib/contract-utils";

/**
 * GET /api/loans/[id]/contract-data
 * Lấy dữ liệu hợp đồng để hiển thị trong modal ký hoặc contract page.
 * Khách (QR) khi loan approved: dùng admin client (bypass RLS, không cần login).
 * Nhân viên xem loan chưa approved: cần staff auth.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: loanId } = await params;

    const { searchParams } = new URL(request.url);
    const contractType = searchParams.get("type");

    // Peek status bằng admin — anon không đọc được loans qua RLS
    const admin = createSupabaseAdminClient();
    const { data: loanStatusRow } = await admin
      .from("loans")
      .select("id, status")
      .eq("id", loanId)
      .maybeSingle();

    if (!loanStatusRow) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khoản vay" },
        { status: 404 },
      );
    }

    const isApprovedForSigning =
      loanStatusRow.status === LOAN_STATUS.APPROVED;

    if (!isApprovedForSigning) {
      const staff = await requireActiveStaffUser();

      if (!staff.ok) return staff.response;
    }

    // Khách QR (approved) → admin; staff path → session client vẫn OK vì đã auth
    const supabase = isApprovedForSigning
      ? admin
      : await createSupabaseServerClient();

    const { getLoanDetailsService } = await import(
      "@/services/loans/loans.service"
    );
    const loanDetails = await getLoanDetailsService(loanId, supabase);

    if (!loanDetails) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khoản vay" },
        { status: 404 },
      );
    }

    // Lấy các loại hợp đồng đã tạo (chưa ký) từ loan_files
    const { data: loanFiles } = await supabase
      .from("loan_files")
      .select("type, name")
      .eq("loan_id", loanId);

    const createdContractTypes = getUnsignedContractTypesFromFiles(
      loanFiles ?? [],
    ) as TContractType[];

    const createdSet = new Set(createdContractTypes);
    const applicableContractTypes = getGeneratableContractTypesForLoan(
      loanDetails.loanType,
    );
    const canSign = createdContractTypes.length > 0;

    // Build contract data using the same functions as contract generation
    const pledgeData = buildAssetPledgeContractData(loanDetails);
    const paymentData = buildFullPaymentConfirmationData(loanDetails);
    const disposalData = buildAssetDisposalAuthorizationData(loanDetails);
    const includeLeaseContract = createdSet.has(CONTRACT_TYPE.ASSET_LEASE);
    const leaseData = includeLeaseContract
      ? buildAssetLeaseContractData(loanDetails)
      : null;

    // Get signed date
    const signedDate = loanDetails.signedAt
      ? new Date(loanDetails.signedAt)
      : new Date();
    const ngay = signedDate.getDate();
    const thang = signedDate.getMonth() + 1;
    const nam = signedDate.getFullYear();
    const signedDateStr = `${String(ngay).padStart(2, "0")}/${String(thang).padStart(2, "0")}/${nam}`;

    // Return separate contract data objects with proper typing
    const contractData = {
      loanType: loanDetails.loanType,
      createdContractTypes,
      applicableContractTypes,
      canSign,
      // Asset Pledge Contract Data
      pledgeContract: createdSet.has(CONTRACT_TYPE.ASSET_PLEDGE)
        ? {
            ...pledgeData,
            NGAY: ngay,
            THANG: thang,
            NAM: nam,
            SIGNED_DATE: signedDateStr,
            DRAFT_SIGNATURE: null,
            OFFICIAL_SIGNATURE: null,
          }
        : null,

      // Asset Lease Contract Data
      leaseContract: leaseData
        ? {
            ...leaseData,
            NGAY: ngay,
            THANG: thang,
            NAM: nam,
            SIGNED_DATE: signedDateStr,
            DRAFT_SIGNATURE: null,
            OFFICIAL_SIGNATURE: null,
          }
        : null,

      // Payment Confirmation Data
      paymentConfirmation: createdSet.has(CONTRACT_TYPE.FULL_PAYMENT)
        ? {
            ...paymentData,
            NGAY: ngay,
            THANG: thang,
            NAM: nam,
            SIGNED_DATE: signedDateStr,
            DRAFT_SIGNATURE: null,
            OFFICIAL_SIGNATURE: null,
          }
        : null,

      // Asset Disposal Authorization Data
      disposalAuthorization: createdSet.has(CONTRACT_TYPE.ASSET_DISPOSAL)
        ? {
            ...disposalData,
            NGAY: ngay,
            THANG: thang,
            NAM: nam,
            SIGNED_DATE: signedDateStr,
            DRAFT_SIGNATURE: null,
            OFFICIAL_SIGNATURE: null,
          }
        : null,
    };

    // If specific contract type is requested (for contract page), return only that contract
    if (contractType) {
      let specificContract;

      switch (contractType) {
        case "asset_pledge_contract":
          specificContract = contractData.pledgeContract;
          break;
        case "asset_lease_contract":
          if (!contractData.leaseContract) {
            return NextResponse.json(
              {
                success: false,
                error: "Gói vay này không có hợp đồng thuê tài sản",
              },
              { status: 404 },
            );
          }
          specificContract = contractData.leaseContract;
          break;
        case "full_payment_confirmation":
          specificContract = contractData.paymentConfirmation;
          break;
        case "asset_disposal_authorization":
          specificContract = contractData.disposalAuthorization;
          break;
        default:
          return NextResponse.json(
            { success: false, error: "Invalid contract type" },
            { status: 400 },
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
      { status: 500 },
    );
  }
}
