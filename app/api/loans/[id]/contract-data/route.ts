import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TMilestone } from "@/types/contract.types";

// Helper functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function getLoanPackageInterestRate(loanPackage: string): string {
  const rates: Record<string, string> = {
    "7_days": "10%/tháng (tương đương 0,33%/ngày)",
    "15_days": "10%/tháng (tương đương 0,33%/ngày)",
    "30_days": "10%/tháng (tương đương 0,33%/ngày)",
  };
  return rates[loanPackage] || "10%/tháng";
}

function calculateMilestones(loanPackage: string, loanAmount: number): TMilestone[] {
  const milestones: TMilestone[] = [];
  
  // Simplified milestone calculation - adjust based on your business logic
  if (loanPackage === "7_days") {
    milestones.push(
      { moc: 1, ngay: 7, tongTien: formatCurrency(loanAmount * 1.07) },
      { moc: 2, ngay: 14, tongTien: formatCurrency(loanAmount * 1.14) },
      { moc: 3, ngay: 30, tongTien: formatCurrency(loanAmount * 1.30) }
    );
  } else if (loanPackage === "15_days") {
    milestones.push(
      { moc: 1, ngay: 15, tongTien: formatCurrency(loanAmount * 1.15) },
      { moc: 2, ngay: 22, tongTien: formatCurrency(loanAmount * 1.22) },
      { moc: 3, ngay: 30, tongTien: formatCurrency(loanAmount * 1.30) }
    );
  } else {
    milestones.push(
      { moc: 1, ngay: 30, tongTien: formatCurrency(loanAmount * 1.30) },
      { moc: 2, ngay: 37, tongTien: formatCurrency(loanAmount * 1.37) },
      { moc: 3, ngay: 45, tongTien: formatCurrency(loanAmount * 1.45) }
    );
  }
  
  return milestones;
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

    // Fetch loan details with customer and references
    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select(`
        *,
        customer:customers(
          id,
          full_name,
          cccd,
          phone,
          address,
          cccd_issue_date,
          cccd_issue_place,
          job,
          income
        ),
        references:loan_references(
          id,
          full_name,
          phone,
          relationship
        )
      `)
      .eq("id", loanId)
      .single();

      console.log({loanError, loan})

    if (loanError || !loan) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khoản vay" },
        { status: 404 }
      );
    }

    // Parse asset_identity
    const assetIdentity = loan.asset_identity || {};

    // Get signed date or current date
    const signedDate = loan.signed_at ? new Date(loan.signed_at) : new Date();
    const ngay = signedDate.getDate();
    const thang = signedDate.getMonth() + 1;
    const nam = signedDate.getFullYear();

    // Format signed date string
    const signedDateStr = `${String(ngay).padStart(2, '0')}/${String(thang).padStart(2, '0')}/${nam}`;

    // Calculate milestones based on loan package
    const loanAmount = Number(loan.amount);
    const milestones = calculateMilestones(loan.loan_package, loanAmount);

    // Format asset details
    const assetDetail = `${loan.asset_name || ""}`;
    const assetType = loan.asset_type || "";

    // Format contract data for all contract types
    const contractData = {
      // Asset Pledge Contract
      MA_HD: loan.code,
      NGAY: ngay,
      THANG: thang,
      NAM: nam,
      BEN_A_TEN: "CÔNG TY TNHH DỊCH VỤ TÀI CHÍNH ABC",
      BEN_A_DIA_CHI: "99B Nguyễn Trãi, phường Ninh Kiều, thành phố Cần Thơ",
      BEN_A_DAI_DIEN: "Nguyễn Văn A",
      BEN_A_CHUC_VU: "Giám đốc",
      BEN_A_MST: "1234567890",
      BEN_A_SDT: "0123456789",
      HO_TEN: loan.customer?.full_name || "",
      CCCD: loan.customer?.cccd || "",
      NGAY_CAP: loan.customer?.cccd_issue_date || "",
      NOI_CAP: loan.customer?.cccd_issue_place || "",
      DIA_CHI: loan.customer?.address || "",
      SDT: loan.customer?.phone || "",
      LOAI_TS: assetType,
      CHI_TIET: assetDetail,
      IMEI: assetIdentity.imei || "",
      SERIAL: assetIdentity.serial || "",
      TINH_TRANG: "Còn mới, hoạt động tốt",
      SO_TIEN_VAY: formatCurrency(loanAmount),
      LAI_SUAT: getLoanPackageInterestRate(loan.loan_package),
      MILESTONES: milestones,
      
      // Signatures - convert file IDs to URLs
      DRAFT_SIGNATURE: loan.draft_signature_file_id 
        ? `/api/drive/image/${loan.draft_signature_file_id}` 
        : null,
      OFFICIAL_SIGNATURE: loan.official_signature_file_id 
        ? `/api/drive/image/${loan.official_signature_file_id}` 
        : null,
      SIGNED_DATE: signedDateStr,
      
      // Asset Lease Contract specific
      MA_HD_CAM_CO: loan.code,
      SO_HD_THUE: `${loan.code}-THUE`,
      NGAY_BAT_DAU: formatDate(signedDate),
      
      // Full Payment Confirmation specific
      NGAY_HD: formatDate(signedDate),
      BEN_GIAO_TEN: "CÔNG TY TNHH DỊCH VỤ TÀI CHÍNH ABC",
      BEN_GIAO_DIA_CHI: "99B Nguyễn Trãi, phường Ninh Kiều, thành phố Cần Thơ",
      BEN_GIAO_DAI_DIEN: "Nguyễn Văn A",
      BEN_GIAO_CHUC_VU: "Giám đốc",
      BEN_GIAO_MST: "1234567890",
      BEN_GIAO_SDT: "0123456789",
      TAI_SAN: `${assetType} - ${assetDetail}`,
      SO_TIEN: formatCurrency(loanAmount),
      NGAN_HANG: loan.bank_name || "",
      SO_TAI_KHOAN: loan.bank_account_number || "",
      TEN_TAI_KHOAN: loan.bank_account_holder || "",
      
      // Asset Disposal Authorization specific
      BEN_UU_QUYEN_TEN: "CÔNG TY TNHH DỊCH VỤ TÀI CHÍNH ABC",
      BEN_UU_QUYEN_DIA_CHI: "99B Nguyễn Trãi, phường Ninh Kiều, thành phố Cần Thơ",
      BEN_UU_QUYEN_DAI_DIEN: "Nguyễn Văn A",
      BEN_UU_QUYEN_MST: "1234567890",
      BEN_UU_QUYEN_SDT: "0123456789",
      
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
