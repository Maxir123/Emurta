"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

/** Helper: safe number parsing */
function toNumberSafe(val, fallback = undefined) {
  if (val === undefined || val === null) return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

/** Normalize strings to Prisma enum style (safe) */
function normalizeEnum(value) {
  if (!value && value !== 0) return null;
  const s = String(value).trim();
  if (s.length === 0) return null;
  // replace non-alphanum with underscore and uppercase
  return s.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
}

/** Small non-prod diagnostic to show the DB host (masked) to help debugging env issues */
if (process.env.NODE_ENV !== "production") {
  try {
    const raw = process.env.DATABASE_URL || process.env.DIRECT_URL || "(none)";
    const host = raw.includes("@") ? raw.split("@")[1].split(":")[0] : raw;
    const masked = host ? host.replace(/(^[^.]*\.)?(.+)$/,"***.$2") : "(none)";
    console.log("[DB DIAG] DATABASE_URL present:", !!raw);
    console.log("[DB DIAG] DB host (masked):", masked);
  } catch (e) {
    console.warn("[DB DIAG] couldn't parse DATABASE_URL", e?.message || e);
  }
}

/** Retry helper with exponential backoff */
async function retryAsync(fn, attempts = 3, baseMs = 200) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const delay = baseMs * Math.pow(2, i);
      console.warn(`[retryAsync] attempt ${i + 1} failed: ${err?.message || err}. retrying in ${delay}ms`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw lastErr;
}

/**
 * Generic WHERE builder used by sale and rental endpoints.
 * mode: "sale" (default) | "rent" | "both"
 *
 * Notes:
 * - do not use mode on enum fields in Prisma queries
 * - use mode: "insensitive" only for string comparisons
 * - ignore "all" values (case-insensitive)
 */
function buildWhere(filters = {}, mode = "sale") {
  const {
    q,
    make,
    bodyType,
    fuelType,
    transmission,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    color,
    isVerified,
    type, // enum
    status,
    location, // enum
  } = filters;

  const where = {};

  // enforce by mode
  if (mode === "sale") {
    where.isForSale = true;
    where.isForRent = false;
  } else if (mode === "rent") {
    where.isForRent = true;
    where.isForSale = false;
  } // if "both", we don't set these flags

  // status default to AVAILABLE unless explicitly provided and not "all"
  if (status && String(status).trim().length > 0 && String(status).toLowerCase() !== "all") {
    where.status = String(status);
  } else {
    where.status = "AVAILABLE";
  }

  // free-text search across string fields
  if (q && String(q).trim().length > 0) {
    const s = String(q).trim();
    where.OR = [
      { make: { contains: s, mode: "insensitive" } },
      { model: { contains: s, mode: "insensitive" } },
      { title: { contains: s, mode: "insensitive" } },
      { description: { contains: s, mode: "insensitive" } },
    ];
  }

  // string equals (insensitive), ignoring "all"
  if (make && String(make).toLowerCase() !== "all") where.make = { equals: String(make), mode: "insensitive" };
  if (bodyType && String(bodyType).toLowerCase() !== "all") where.bodyType = { equals: String(bodyType), mode: "insensitive" };
  if (color && String(color).toLowerCase() !== "all") where.color = { equals: String(color), mode: "insensitive" };

  // enums - normalize safely (no mode)
  if (fuelType && String(fuelType).toLowerCase() !== "all") where.fuelType = { equals: normalizeEnum(fuelType) };
  if (transmission && String(transmission).toLowerCase() !== "all") where.transmission = { equals: normalizeEnum(transmission) };
  if (type && String(type).toLowerCase() !== "all") where.type = { equals: normalizeEnum(type) };
  if (location && String(location).toLowerCase() !== "all") where.location = { equals: normalizeEnum(location) };

  // boolean-ish
  if (isVerified !== undefined && isVerified !== null && String(isVerified).toLowerCase() !== "all") {
    where.isVerified = Boolean(isVerified);
  }

  // price bounds
  const minP = minPrice !== undefined ? toNumberSafe(minPrice, undefined) : undefined;
  const maxP = maxPrice !== undefined ? toNumberSafe(maxPrice, undefined) : undefined;
  if (minP !== undefined || maxP !== undefined) {
    where.price = {};
    if (minP !== undefined) where.price.gte = minP;
    if (maxP !== undefined) where.price.lte = maxP;
  }

  // year bounds
  const minY = minYear !== undefined ? toNumberSafe(minYear, undefined) : undefined;
  const maxY = maxYear !== undefined ? toNumberSafe(maxYear, undefined) : undefined;
  if (minY !== undefined || maxY !== undefined) {
    where.year = {};
    if (minY !== undefined) where.year.gte = minY;
    if (maxY !== undefined) where.year.lte = maxY;
  }

  return where;
}

/** Helper: serialize vehicle for listing / public API */
function serializeVehicle(v, isSaved = false) {
  const primaryImage = v.images && v.images.length ? v.images[0].url : v.imageUrl || null;

  return {
    id: v.id,
    title: v.title,
    type: v.type,
    make: v.make,
    model: v.model,
    year: v.year,
    price: v.price,
    mileage: v.mileage,
    color: v.color,
    fuelType: v.fuelType,
    transmission: v.transmission,
    isForSale: v.isForSale,
    isForRent: v.isForRent,
    isVerified: v.isVerified,
    status: v.status,
    featured: !!v.featured,
    bodyType: v.bodyType,
    image: primaryImage,
    saved: !!isSaved,
    createdAt: v.createdAt?.toISOString?.(),
    updatedAt: v.updatedAt?.toISOString?.(),
  };
}

/** Generic function to get distinct filter options for a given mode ("sale" or "rent"). */
async function getFiltersForMode(mode = "sale") {
  const baseWhere = {
    status: "AVAILABLE",
    ...(mode === "sale" ? { isForSale: true, isForRent: false } : {}),
    ...(mode === "rent" ? { isForRent: true, isForSale: false } : {}),
  };

  const [
    makes,
    bodyTypes,
    fuelTypes,
    transmissions,
    priceAgg,
    yearAgg,
  ] = await Promise.all([
    db.vehicle.findMany({ where: baseWhere, select: { make: true }, distinct: ["make"], orderBy: { make: "asc" } }),
    db.vehicle.findMany({ where: baseWhere, select: { bodyType: true }, distinct: ["bodyType"], orderBy: { bodyType: "asc" } }),
    db.vehicle.findMany({ where: baseWhere, select: { fuelType: true }, distinct: ["fuelType"], orderBy: { fuelType: "asc" } }),
    db.vehicle.findMany({ where: baseWhere, select: { transmission: true }, distinct: ["transmission"], orderBy: { transmission: "asc" } }),
    db.vehicle.aggregate({ where: baseWhere, _min: { price: true }, _max: { price: true } }),
    db.vehicle.aggregate({ where: baseWhere, _min: { year: true }, _max: { year: true } }),
  ]);

  return {
    makes: makes.map((m) => m.make).filter(Boolean),
    bodyTypes: bodyTypes.map((b) => b.bodyType).filter(Boolean),
    fuelTypes: fuelTypes.map((f) => f.fuelType).filter(Boolean),
    transmissions: transmissions.map((t) => t.transmission).filter(Boolean),
    priceRange: {
      min: priceAgg._min.price != null ? Number(priceAgg._min.price) : 0,
      max: priceAgg._max.price != null ? Number(priceAgg._max.price) : 100000000,
    },
    yearRange: {
      min: yearAgg._min.year != null ? Number(yearAgg._min.year) : 1990,
      max: yearAgg._max.year != null ? Number(yearAgg._max.year) : new Date().getFullYear(),
    },
  };
}

/** Public: vehicle filters for sale listing */
export async function getVehicleFilters() {
  try {
    const data = await retryAsync(() => getFiltersForMode("sale"), 3, 200);
    return { success: true, data };
  } catch (err) {
    console.error("getVehicleFilters error:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

/** Public: rental filters */
export async function getRentalFilters() {
  try {
    const data = await retryAsync(() => getFiltersForMode("rent"), 3, 200);
    return { success: true, data };
  } catch (err) {
    console.error("getRentalFilters error:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

/** Page-based vehicle listing (sale mode enforced) */
export async function getVehicles(filters = {}) {
  try {
    const { userId } = await auth();
    let dbUser = null;
    if (userId) {
      dbUser = await db.user.findUnique({ where: { clerkUserId: userId } });
    }

    const page = Math.max(Number(filters.page) || 1, 1);
    const limit = Math.min(Math.max(Number(filters.limit) || 12, 1), 100);
    const skip = (page - 1) * limit;

    // build where (enforces isForSale=true & isForRent=false)
    const where = buildWhere(filters, "sale");

    let orderBy = {};
    switch (String(filters.sortBy || "newest")) {
      case "priceAsc":
        orderBy = { price: "asc" };
        break;
      case "priceDesc":
        orderBy = { price: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // fetch page
    let vehicles = [];
    try {
      vehicles = await retryAsync(async () => {
        return await db.vehicle.findMany({
          where,
          take: limit,
          skip,
          orderBy,
          include: {
            images: {
              orderBy: { isPrimary: "desc" },
              take: 1,
              select: { url: true, isPrimary: true },
            },
          },
        });
      }, 3, 250);
    } catch (findErr) {
      console.error("getVehicles findMany error:", findErr);
      return { success: false, error: "Database error fetching vehicles: " + (findErr?.message || String(findErr)) };
    }

    // total count (best-effort)
    let total = 0;
    try {
      total = await retryAsync(async () => {
        return await db.vehicle.count({ where });
      }, 3, 250);
    } catch (countErr) {
      console.warn("getVehicles count failed, falling back to returned length:", countErr?.message || countErr);
      total = vehicles.length;
    }

    // highest price global (AVAILABLE, for sale)
    let highestPrice = 0;
    try {
      const highest = await retryAsync(async () => {
        return await db.vehicle.findFirst({
          where: { status: "AVAILABLE", isForSale: true, isForRent: false },
          orderBy: { price: "desc" },
          select: { price: true },
        });
      }, 2, 200);
      highestPrice = highest?.price ?? 0;
    } catch (hpErr) {
      console.warn("Failed to fetch highestPrice (non-fatal):", hpErr?.message || hpErr);
      highestPrice = vehicles.reduce((acc, v) => Math.max(acc, Number(v.price || 0)), 0);
    }

    // saved set for authenticated user (non-fatal)
    let savedSet = new Set();
    if (dbUser) {
      try {
        const saved = await retryAsync(async () => {
          return await db.savedVehicle.findMany({
            where: { userId: dbUser.id },
            select: { vehicleId: true },
          });
        }, 2, 200);
        savedSet = new Set(saved.map((s) => s.vehicleId));
      } catch (svErr) {
        console.warn("Failed to load saved vehicles (non-fatal):", svErr?.message || svErr);
      }
    }

    const data = vehicles.map((v) => serializeVehicle(v, savedSet.has(v.id)));

    return {
      success: true,
      data,
      highestPrice,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (err) {
    console.error("getVehicles error:", err);
    return { success: false, error: "Unexpected error: " + (err?.message || String(err)) };
  }
}

/** Cursor-based listing for infinite scroll (sale mode) */
export async function getVehiclesCursor({ cursor = null, limit = 12, sortBy = "newest", ...filters } = {}) {
  try {
    const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 100);
    const where = buildWhere(filters, "sale");

    let order = [];
    if (sortBy === "priceAsc") order = [{ price: "asc" }, { id: "asc" }];
    else if (sortBy === "priceDesc") order = [{ price: "desc" }, { id: "desc" }];
    else if (sortBy === "oldest") order = [{ createdAt: "asc" }, { id: "asc" }];
    else order = [{ createdAt: "desc" }, { id: "desc" }];

    const query = {
      where,
      take: safeLimit + 1,
      orderBy: order,
      include: {
        images: {
          orderBy: { isPrimary: "desc" },
          take: 1,
          select: { url: true, isPrimary: true },
        },
      },
    };

    if (cursor) {
      query.cursor = { id: cursor };
      query.skip = 1;
    }

    let results;
    try {
      results = await retryAsync(async () => {
        return await db.vehicle.findMany(query);
      }, 3, 250);
    } catch (err) {
      console.error("getVehiclesCursor findMany error:", err);
      return { success: false, error: "Error fetching vehicles (cursor): " + (err?.message || String(err)) };
    }

    let nextCursor = null;
    if (results.length > safeLimit) {
      const next = results[safeLimit];
      nextCursor = next.id;
      results.splice(safeLimit, 1);
    }

    const data = results.map((v) => serializeVehicle(v, false));

    return { success: true, data, nextCursor };
  } catch (err) {
    console.error("getVehiclesCursor error:", err);
    return { success: false, error: "Unexpected error (cursor): " + (err?.message || String(err)) };
  }
}

/** Get vehicle by id (detail) — owner contact only shown to authenticated requesters */
export async function getVehicleById(vehicleId) {
  try {
    const { userId } = await auth();
    let dbUser = null;
    if (userId) {
      dbUser = await db.user.findUnique({ where: { clerkUserId: userId } });
    }

    const vehicle = await retryAsync(async () => {
      return await db.vehicle.findUnique({
        where: { id: Number(vehicleId) },
        include: {
          images: { orderBy: { isPrimary: "desc" } },
          owner: { select: { id: true, fullName: true, email: true, phone: true } },
        },
      });
    }, 3, 200);

    if (!vehicle) return { success: false, error: "Vehicle not found" };

    // check saved state for authenticated user
    let saved = false;
    if (dbUser) {
      try {
        const sv = await retryAsync(async () => {
          return await db.savedVehicle.findUnique({
            where: { userId_vehicleId: { userId: dbUser.id, vehicleId: vehicle.id } },
          });
        }, 2, 200);
        saved = !!sv;
      } catch (svErr) {
        console.warn("Saved vehicle check failed (non-fatal):", svErr?.message || svErr);
      }
    }

    const base = {
      ...serializeVehicle(vehicle, saved),
      description: vehicle.description,
      seatingCapacity: vehicle.seatingCapacity,
      engineType: vehicle.engineType,
      Vehicle_Owner_Name: vehicle.Vehicle_Owner_Name,
      Vehicle_owner_Number: vehicle.Vehicle_owner_Number,
      Vehicle_owner_Email: vehicle.Vehicle_owner_Email,
      owner: vehicle.owner,
      images: vehicle.images.map((i) => ({ url: i.url, isPrimary: i.isPrimary })),
    };

    // safety: only include owner contact (email/phone) when requester is authenticated
    if (!dbUser) {
      // remove contact fields for unauthenticated callers
      delete base.Vehicle_owner_Email;
      delete base.Vehicle_owner_Number;
      if (base.owner) {
        delete base.owner.email;
        delete base.owner.phone;
      }
    }

    return { success: true, data: base };
  } catch (err) {
    console.error("getVehicleById error:", err);
    return { success: false, error: "Error fetching vehicle: " + (err?.message || String(err)) };
  }
}

/** Toggle saved vehicle (favorite) */
export async function toggleSavedVehicle(vehicleId) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return { success: false, error: "User not found" };

    const vId = Number(vehicleId);
    const vehicle = await db.vehicle.findUnique({ where: { id: vId } });
    if (!vehicle) return { success: false, error: "Vehicle not found" };

    const existing = await db.savedVehicle.findUnique({
      where: { userId_vehicleId: { userId: user.id, vehicleId: vId } },
    });

    if (existing) {
      await db.savedVehicle.delete({ where: { userId_vehicleId: { userId: user.id, vehicleId: vId } } });
      return { success: true, saved: false };
    } else {
      await db.savedVehicle.create({ data: { userId: user.id, vehicleId: vId } });
      return { success: true, saved: true };
    }
  } catch (err) {
    console.error("toggleSavedVehicle error:", err);
    return { success: false, error: "Error toggling saved vehicle: " + (err?.message || String(err)) };
  }
}

/** Get all saved vehicles for the authenticated user */
export async function getSavedVehicles() {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return { success: false, error: "User not found" };

    const saved = await db.savedVehicle.findMany({
      where: { userId: user.id },
      include: {
        vehicle: {
          include: {
            images: {
              orderBy: { isPrimary: "desc" },
              take: 1,
              select: { url: true, isPrimary: true }, // ✅ same as rentals/vehicles
            },
          },
        },
      },
      orderBy: { savedAt: "desc" },
    });

    // 👇 flatten so it looks exactly like vehicles/rentals
    const data = saved.map((s) => ({
      ...s.vehicle,
      wishlisted: true, // mark as saved
    }));

    return { success: true, data };
  } catch (err) {
    console.error("getSavedVehicles error:", err);
    return { success: false, error: err?.message || String(err) };
  }
}


/** Page-based rental listing (serialized, enforces rent-only available items) */
export async function getRentalVehicles() {
  try {
    const vehicles = await retryAsync(() => db.vehicle.findMany({
      where: {
        isForRent: true,
        isForSale: false,
        status: "AVAILABLE",
      },
      include: {
        images: {
          orderBy: { isPrimary: "desc" },
          take: 1,
          select: { url: true, isPrimary: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }), 3, 250);

    return vehicles.map((v) => serializeVehicle(v));
  } catch (error) {
    console.error("getRentalVehicles error:", error);
    return [];
  }
}
