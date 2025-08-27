// app/api/rentals/route.js
import { NextResponse } from "next/server";
import { getRentalVehicles } from "@/action/vehicle"; // server-side function

export async function GET() {
  try {
    // getRentalVehicles should be server-side; returns an array of serialized vehicles
    const vehicles = await getRentalVehicles();

    // Normalise response shape for the client
    // If your getRentalVehicles returns { success: true, data: [...] } adjust accordingly.
    if (Array.isArray(vehicles)) {
      return NextResponse.json({ success: true, data: vehicles });
    }

    // support older shape
    if (vehicles && vehicles.success && Array.isArray(vehicles.data)) {
      return NextResponse.json({ success: true, data: vehicles.data });
    }

    // fallback
    return NextResponse.json({ success: true, data: [] });
  } catch (err) {
    console.error("API /api/rentals error:", err);
    return NextResponse.json({ success: false, error: String(err?.message || err) }, { status: 500 });
  }
}
