import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LOAN_STATUS } from "@/constants/loan";
import { requireAdminForPendingLoan } from "@/lib/auth/api-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: loanId } = await params;

    const admin = await requireAdminForPendingLoan(loanId);

    if (!admin.ok) return admin.response;

    const body = await request.json();
    const assetType = String(body.assetType || "").trim();
    const assetName = String(body.assetName || "").trim();
    const imei = String(body.imei || "").trim();
    const serial = String(body.serial || "").trim();
    const chassisNumber = String(body.chassisNumber || "").trim();
    const engineNumber = String(body.engineNumber || "").trim();

    if (!assetType || !assetName) {
      return NextResponse.json(
        { success: false, error: "Loại tài sản và tên tài sản là bắt buộc" },
        { status: 400 },
      );
    }

    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select("id, status")
      .eq("id", loanId)
      .single();

    if (loanError || !loan) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khoản vay" },
        { status: 404 },
      );
    }

    if (loan.status !== LOAN_STATUS.PENDING) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Chỉ được sửa thông tin tài sản khi khoản vay ở trạng thái chờ duyệt",
        },
        { status: 400 },
      );
    }

    const assetIdentity = {
      ...(chassisNumber ? { chassis_number: chassisNumber } : {}),
      ...(engineNumber ? { engine_number: engineNumber } : {}),
      ...(imei ? { imei } : {}),
      ...(serial ? { serial } : {}),
    };

    const { error: updateError } = await supabase
      .from("loans")
      .update({
        asset_type: assetType,
        asset_name: assetName,
        asset_identity: assetIdentity,
      })
      .eq("id", loanId);

    if (updateError) {
      console.error("[UPDATE_ASSET_ERROR]", updateError);

      return NextResponse.json(
        { success: false, error: "Không thể cập nhật thông tin tài sản" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[PATCH_LOAN_ASSET_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
