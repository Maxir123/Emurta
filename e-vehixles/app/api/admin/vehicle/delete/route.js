// app/api/admin/vehicle/delete/route.js
import { NextResponse } from "next/server";
import { deleteVehicleById } from "@/lib/actions/admin-dashboard";

export async function POST(req) {
  try {
    const body = await req.json();
    const id = body?.id;
    if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });

    const res = await deleteVehicleById(id);
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: res.data });
  } catch (err) {
    console.error("API /api/admin/vehicle/delete error:", err);
    return NextResponse.json({ success: false, error: err.message ?? "Server error" }, { status: 500 });
  }
}
