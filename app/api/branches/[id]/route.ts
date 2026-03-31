import { NextResponse } from "next/server";
import { updateBranchService, deleteBranchService } from "@/services/branches.service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Soft delete nếu có flag _delete
    if (body._delete) {
      await deleteBranchService(id);
      return NextResponse.json({ success: true });
    }

    const branch = await updateBranchService(id, body);
    return NextResponse.json({ success: true, data: branch });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
