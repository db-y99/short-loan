import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TMilestone } from "@/types/contract.types";
import { COMPANY_INFO } from "@/constants/company";
import { formatDateShortVN } from "@/lib/format";

// Helper functions
function formatVND(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n) + " VNĐ";
}

/**
 * Lấy mô tả lãi suất/phí theo gói vay - SAME AS contract-data.ts
 */
function getLoanInterestRateDescription(loanType: string): string {
  if (loanType.includes("trả góp") || loanType.includes("3 kỳ")) {
    return "Lãi suất 0,033%/ngày + Phí thuê tài sản";
  } else if (loanType.includes("Theo mốc")) {
    return "Phí theo mốc: 5% (7 ngày), 8% (18 ngày), 12% (30 ngày)";
  } else if (loanType.includes("Giữ TS")) {
    return "Phí theo mốc: 1,25% (7 ngày), 3,5% (18 ngày), 5% (30 ngày)";
  }
  return "0,99%/30 ngày";
}

/**
 * GET /api/loans/[id]/contract-data
 * Lấy dữ liệu hợp đồng để hiển thị trong modal ký
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: loanId } = await params;

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

    // Get signed date or current date
    const signedDate = loanDetails.signedAt ? new Date(loanDetails.signedAt) : new Date();
    const ngay = signedDate.getDate();
    const thang = signedDate.getMonth() + 1;
    const nam = signedDate.getFullYear();

    // Format signed date string
    const signedDateStr = `${String(ngay).padStart(2, '0')}/${String(thang).padStart(2, '0')}/${nam}`;

    // Get loan amount
    const loanAmount = loanDetails.loanAmount;

    // Get milestones from currentPeriod - SAME AS contract-data.ts
    const milestones: TMilestone[] = loanDetails.currentPeriod?.milestones.map((m, index) => ({
      moc: index + 1,
      ngay: m.days,
      tongTien: formatVND(m.totalRedemption),
    })) ?? [
      { moc: 1, ngay: 7, tongTien: formatVND(loanAmount) },
      { moc: 2, ngay: 18, tongTien: formatVND(loanAmount) },
      { moc: 3, ngay: 30, tongTien: formatVND(loanAmount) },
    ];

    console.log("Milestones from currentPeriod:", milestones);

    // Format asset details with IMEI/Serial - SAME AS contract-data.ts
    const assetType = loanDetails.asset.type;
    const assetName = loanDetails.asset.name;
    const imei = loanDetails.asset.imei || "";
    const serial = loanDetails.asset.serial || "";
    
    const imeiStr = imei ? ` (IMEI: ${imei}` : "";
    const serialStr = serial
      ? imeiStr
        ? ` - Serial: ${serial})`
        : ` (Serial: ${serial})`
      : imeiStr
        ? ")"
        : "";
    const chiTiet = `${assetName}${imeiStr}${serialStr}`.trim() || "—";

    // Format loan type
    const loanTypeStr = loanDetails.loanType;

    // Format contract data for all contract types - USE loanDetails
    const contractData = {
      // Asset Pledge Contract
      MA_HD: loanDetails.code,
      NGAY: ngay,
      THANG: thang,
      NAM: nam,
      BEN_A_TEN: COMPANY_INFO.NAME,
      BEN_A_DIA_CHI: COMPANY_INFO.ADDRESS,
      BEN_A_DAI_DIEN: `Bà ${COMPANY_INFO.REPRESENTATIVE.toUpperCase()}`,
      BEN_A_CHUC_VU: COMPANY_INFO.POSITION,
      BEN_A_MST: COMPANY_INFO.TAX_CODE,
      BEN_A_SDT: COMPANY_INFO.PHONE,
      HO_TEN: loanDetails.customer.fullName,
      CCCD: loanDetails.customer.cccd,
      NGAY_CAP: loanDetails.customer.cccdIssueDate,
      NOI_CAP: loanDetails.customer.cccdIssuePlace,
      DIA_CHI: loanDetails.customer.address,
      SDT: loanDetails.customer.phone,
      LOAI_TS: assetType,
      CHI_TIET: chiTiet,
      IMEI: imei || "—",
      SERIAL: serial || "—",
      TINH_TRANG: loanDetails.assetCondition || "Đang cầm cố",
      SO_TIEN_VAY: formatVND(loanAmount),
      LAI_SUAT: getLoanInterestRateDescription(loanTypeStr),
      MILESTONES: milestones,
      
      // Signatures - will be added when signing
      DRAFT_SIGNATURE: null,
      OFFICIAL_SIGNATURE: null,
      SIGNED_DATE: signedDateStr,
      
      // Asset Lease Contract specific
      MA_HD_CAM_CO: loanDetails.code,
      SO_HD_THUE: `${loanDetails.code}-T`,
      NGAY_BAT_DAU: formatDateShortVN(loanDetails.signedAt),
      
      // Full Payment Confirmation specific
      NGAY_HD: formatDateShortVN(loanDetails.signedAt),
      BEN_GIAO_TEN: COMPANY_INFO.NAME,
      BEN_GIAO_DIA_CHI: COMPANY_INFO.ADDRESS,
      BEN_GIAO_DAI_DIEN: COMPANY_INFO.REPRESENTATIVE,
      BEN_GIAO_CHUC_VU: COMPANY_INFO.POSITION,
      BEN_GIAO_MST: COMPANY_INFO.TAX_CODE,
      BEN_GIAO_SDT: COMPANY_INFO.PHONE,
      TAI_SAN: assetName || "",
      SO_TIEN: formatVND(loanAmount),
      NGAN_HANG: loanDetails.bank.name,
      SO_TAI_KHOAN: loanDetails.bank.accountNumber,
      TEN_TAI_KHOAN: loanDetails.bank.accountHolder,
      
      // Asset Disposal Authorization specific
      BEN_UU_QUYEN_TEN: COMPANY_INFO.NAME,
      BEN_UU_QUYEN_DIA_CHI: COMPANY_INFO.ADDRESS,
      BEN_UU_QUYEN_DAI_DIEN: COMPANY_INFO.REPRESENTATIVE,
      BEN_UU_QUYEN_MST: COMPANY_INFO.TAX_CODE,
      BEN_UU_QUYEN_SDT: COMPANY_INFO.PHONE,
      
      drive_folder_id: "",
    };

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
