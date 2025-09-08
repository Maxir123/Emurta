// app/api/admin/vehicle/update-status/route.js
import { NextResponse } from "next/server";
import { updateVehicleStatus } from "@/lib/actions/admin-dashboard";

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, status } = body ?? {};
    if (!id || !status) return NextResponse.json({ success: false, error: "Missing id or status" }, { status: 400 });

    const res = await updateVehicleStatus({ id, status });
    if (!res.success) return NextResponse.json({ success: false, error: res.error }, { status: 403 });

    return NextResponse.json({ success: true, data: res.data });
  } catch (err) {
    console.error("API /api/admin/vehicle/update-status error:", err);
    return NextResponse.json({ success: false, error: err.message ?? "Server error" }, { status: 500 });
  }
}
