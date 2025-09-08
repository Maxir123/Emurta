"use server";

import { serializeCarData } from "@/lib/helpers";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Basic admin check
 */
export async function getAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user || user.role !== "ADMIN") {
    return { authorized: false, reason: "not-admin" };
  }

  return { authorized: true, user };
}

/** Small helper: safe ISO conversion */
const safeIso = (v) => {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (v instanceof Date) return v.toISOString();
  try {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
};

/**
 * Get inspections for admin with optional filters and pagination
 *
 * @param {Object} params
 * @param {string} params.search - searches vehicle make/model/title and inspector name/email
 * @param {string} params.status - filter by status (SCHEDULED|COMPLETED|CANCELLED)
 * @param {number} params.page - 1-based page number
 * @param {number} params.limit - page size
 * @returns { success:true, data: { items: [], total, page, pages } } | { success:false, error }
 */
export async function getAdminInspection({ search = "", status = "", page = 1, limit = 50 } = {}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    const where = {};

    if (status && String(status).trim().length > 0) {
      where.status = status;
    }

    if (search && String(search).trim().length > 0) {
      const q = String(search).trim();
      where.OR = [
        { vehicle: { make: { contains: q, mode: "insensitive" } } },
        { vehicle: { model: { contains: q, mode: "insensitive" } } },
        { vehicle: { title: { contains: q, mode: "insensitive" } } },
        { inspector: { fullName: { contains: q, mode: "insensitive" } } },
        { inspector: { email: { contains: q, mode: "insensitive" } } },
      ];
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const skip = (pageNum - 1) * pageSize;

    // fetch total count and page items in parallel
    const [total, inspections] = await Promise.all([
      db.inspection.count({ where }),
      db.inspection.findMany({
        where,
        include: {
          vehicle: {
            include: { images: true },
          },
          inspector: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { date: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    const pages = Math.max(1, Math.ceil(total / pageSize));

    const items = inspections.map((ins) => ({
      id: ins.id,
      vehicleId: ins.vehicleId,
      vehicle: serializeCarData(ins.vehicle),
      inspector: ins.inspector ?? null,
      status: ins.status,
      date: safeIso(ins.date),
      notes: ins.notes ?? null,
      rating: ins.rating ?? null,
      createdAt: safeIso(ins.createdAt),
      updatedAt: safeIso(ins.updatedAt),
    }));

    return { success: true, data: { items, total, page: pageNum, pages } };
  } catch (error) {
    console.error("Error fetching admin inspections:", error);
    return { success: false, error: error?.message ?? "Failed to fetch inspections" };
  }
}

/**
 * Update inspection status (ADMIN or assigned inspector allowed)
 *
 * @param {Object} params
 * @param {number} params.inspectionId
 * @param {"SCHEDULED"|"COMPLETED"|"CANCELLED"} params.newStatus
 */
export async function updateInspectionStatus({ inspectionId, newStatus }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const ins = await db.inspection.findUnique({
      where: { id: Number(inspectionId) },
      include: { inspector: true, vehicle: true },
    });

    if (!ins) {
      return { success: false, error: "Inspection not found" };
    }

    // permission: admin or assigned inspector
    const isInspector = ins.inspectorId === user.id;
    const isAdmin = user.role === "ADMIN";
    if (!isAdmin && !isInspector) {
      return { success: false, error: "Unauthorized to update this inspection" };
    }

    const validStatuses = ["SCHEDULED", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(newStatus)) {
      return { success: false, error: "Invalid status" };
    }

    const updated = await db.inspection.update({
      where: { id: ins.id },
      data: { status: newStatus },
      include: {
        vehicle: { include: { images: true } },
        inspector: { select: { id: true, fullName: true, email: true } },
      },
    });

    // Revalidate relevant pages (adjust routes as needed)
    try {
      revalidatePath(`/admin/inspections`);
      revalidatePath(`/inspections`);
      revalidatePath(`/vehicles/${updated.vehicleId}`);
    } catch (e) {
      // don't throw for revalidate failures
      console.warn("revalidatePath failed:", e?.message || e);
    }

    return {
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
        date: safeIso(updated.date),
        vehicle: serializeCarData(updated.vehicle),
        inspector: updated.inspector ?? null,
        updatedAt: safeIso(updated.updatedAt),
      },
    };
  } catch (error) {
    console.error("Error updating inspection status:", error);
    return { success: false, error: error?.message ?? "Failed to update inspection" };
  }
}

/**
 * Admin dashboard aggregate data
 *
 * returns totals for vehicles and inspections and simple breakdowns
 */
export async function getDashboardData() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user || user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    // parallel queries for aggregates + recents
    const [vehicleRows, inspectionRows, recentInspections, recentVehicles] = await Promise.all([
      // minimal vehicle fields for aggregation
      db.vehicle.findMany({ select: { id: true, status: true, featured: true, isForSale: true, isForRent: true, price: true } }),
      db.inspection.findMany({ select: { id: true, status: true, vehicleId: true } }),
      // latest 10 inspections with vehicle
      db.inspection.findMany({
        include: {
          vehicle: { include: { images: true } },
          inspector: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      // latest 8 vehicles
      db.vehicle.findMany({
        include: { images: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    const totalVehicles = vehicleRows.length;
    const availableVehicles = vehicleRows.filter((v) => v.status === "AVAILABLE").length;
    const soldVehicles = vehicleRows.filter((v) => v.status === "SOLD").length;
    const rentedVehicles = vehicleRows.filter((v) => v.isForRent).length;
    const featuredVehicles = vehicleRows.filter((v) => v.featured === true).length;

    const totalInspections = inspectionRows.length;
    const scheduled = inspectionRows.filter((i) => i.status === "SCHEDULED").length;
    const completed = inspectionRows.filter((i) => i.status === "COMPLETED").length;
    const cancelled = inspectionRows.filter((i) => i.status === "CANCELLED").length;

    // Format recent inspections for frontend consumption
    const formattedRecent = recentInspections.map((ins) => ({
      id: ins.id,
      vehicle: serializeCarData(ins.vehicle),
      inspector: ins.inspector ?? null,
      // lowercase status for the frontend chip logic
      status: (ins.status || "").toLowerCase(),
      date: safeIso(ins.date),
      createdAt: safeIso(ins.createdAt),
    }));

    // Normalize recent vehicles to what the dashboard expects
    const formattedVehicles = recentVehicles.map((v) => ({
      id: v.id,
      title: v.title || `${v.make ?? ""} ${v.model ?? ""}`,
      make: v.make,
      model: v.model,
      year: v.year,
      price: v.price,
      status: (v.status || "").toUpperCase(),
      images: (v.images ?? []).map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean),
      createdAt: safeIso(v.createdAt),
    }));

    // compute a simple conversionRate: sold / totalVehicles * 100 (0 when total = 0)
    const conversionRate = totalVehicles ? +((soldVehicles / totalVehicles) * 100).toFixed(1) : 0;

    return {
      success: true,
      data: {
        vehicles: {
          total: totalVehicles,
          available: availableVehicles,
          sold: soldVehicles,
          rented: rentedVehicles,
          featured: featuredVehicles,
        },
        inspections: {
          total: totalInspections,
          pending: scheduled, // frontend expects 'pending'
          confirmed: 0, // you don't have a CONFIRMED enum — keep zero for now
          completed,
          cancelled,
          noShow: 0,
          conversionRate,
        },
        recentInspections: formattedRecent,
        recentVehicles: formattedVehicles,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return { success: false, error: error?.message ?? "Failed to fetch dashboard data" };
  }
}

/**
 * Delete vehicle by id (cascades related things manually)
 */
export async function deleteVehicleById(vehicleId) {
  try {
    // admin guard
    const adminCheck = await getAdmin();
    if (!adminCheck.authorized) {
      return { success: false, error: "Unauthorized" };
    }

    const id = Number(vehicleId);
    if (!id) return { success: false, error: "Invalid vehicle id" };

    const vehicle = await db.vehicle.findUnique({ where: { id }, include: { images: true } });
    if (!vehicle) return { success: false, error: "Vehicle not found" };

    // Use transaction to remove dependent rows first (images, inspections, rentals, savedVehicles)
    await db.$transaction([
      db.vehicleImage.deleteMany({ where: { vehicleId: id } }),
      db.inspection.deleteMany({ where: { vehicleId: id } }),
      db.rental.deleteMany({ where: { vehicleId: id } }),
      db.savedVehicle.deleteMany({ where: { vehicleId: id } }),
      // note: customOrders/selections are ignored per your request
      db.vehicle.delete({ where: { id } }),
    ]);

    // revalidate pages
    try {
      revalidatePath("/admin/dashboard");
      revalidatePath("/vehicles");
    } catch (e) {
      console.warn("revalidatePath failed:", e?.message ?? e);
    }

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return { success: false, error: error?.message ?? "Failed to delete vehicle" };
  }
}

/**
 * Update vehicle status
 */
export async function updateVehicleStatus({ id, status }) {
  try {
    const adminCheck = await getAdmin();
    if (!adminCheck.authorized) {
      return { success: false, error: "Unauthorized" };
    }

    const vehicleId = Number(id);
    if (!vehicleId) return { success: false, error: "Invalid vehicle id" };

    const allowed = ["AVAILABLE", "SOLD", "RENTED", "MAINTENANCE"];
    if (!allowed.includes(status)) {
      return { success: false, error: "Invalid status" };
    }

    const updated = await db.vehicle.update({
      where: { id: vehicleId },
      data: { status },
      include: { images: true },
    });

    try {
      revalidatePath("/admin/dashboard");
      revalidatePath(`/vehicles/${vehicleId}`);
    } catch (e) {
      console.warn("revalidatePath failed:", e?.message ?? e);
    }

    return {
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
        vehicle: serializeCarData(updated),
      },
    };
  } catch (error) {
    console.error("Error updating vehicle status:", error);
    return { success: false, error: error?.message ?? "Failed to update vehicle status" };
  }
}