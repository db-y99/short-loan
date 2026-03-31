import { NextResponse } from "next/server";
import { getBranchesService, createBranchService } from "@/services/branches.service";

export async function GET() {
  try {
    const branches = await getBranchesService();
    return NextResponse.json({ success: true, data: branches });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ success: false, error: "Tên chi nhánh là bắt buộc" }, { status: 400 });
    }
    const branch = await createBranchService(body);
    return NextResponse.json({ success: true, data: branch });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
