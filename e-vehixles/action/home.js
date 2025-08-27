"use server";

import { db } from "@/lib/prisma";

/**
 * Helper: build public URL for a supabase storage path or return already-full URL
 * - `img.url` should be preferred if it's a full URL.
 * - If you store only a `path` (like `cars/uuid/img-1.jpg`) in DB, build it using NEXT_PUBLIC_SUPABASE_URL.
 */
function buildImageUrl(img) {
  if (!img) return null;
  // if the DB already contains a full URL:
  if (img.url && (img.url.startsWith("http://") || img.url.startsWith("https://"))) {
    return img.url;
  }
  // if you stored a `path` in url field (e.g. "cars/xxx.jpg") or used `path` property:
  const path = img.path ?? img.url;
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return path; // fallback to whatever is in DB if env missing
  return `${base}/storage/v1/object/public/car-images/${path}`;
}

function serializeVehicle(v) {
  return {
    id: v.id,
    title: v.title,
    make: v.make,
    model: v.model,
    year: v.year,
    price: v.price ? Number(v.price) : 0,
    description: v.description ?? null,
    mileage: v.mileage ?? null,
    color: v.color ?? null,
    status: v.status,
    featured: !!v.featured,
    createdAt: v.createdAt?.toISOString(),
    updatedAt: v.updatedAt?.toISOString(),
    images: (v.images || []).map((img) => ({ url: buildImageUrl(img), isPrimary: !!img.isPrimary })),
    // include any other fields you need (seatingCapacity, bodyType, etc.)
  };
}

export async function getFeaturedCars(limit = 8) {
  try {
    const vehicles = await db.vehicle.findMany({
      where: {
        featured: true,
        status: "AVAILABLE",
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
      },
    });

    return vehicles.map(serializeVehicle);
  } catch (err) {
    console.error("getFeaturedCars error:", err);
    throw new Error("Error fetching featured vehicles: " + (err?.message ?? String(err)));
  }
}
