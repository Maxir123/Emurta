// app/api/admin/dashboard/route.js
import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/actions/admin-dashboard";

export async function GET(req) {
  try {
    const q = req.nextUrl.searchParams;
    // you could optionally pass filters/pagination from query params in future
    const res = await getDashboardData();
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 403 });
    }
    return NextResponse.json(res);
  } catch (err) {
    console.error("API /api/admin/dashboard GET error:", err);
    return NextResponse.json({ success: false, error: err.message ?? "Server error" }, { status: 500 });
  }
}
