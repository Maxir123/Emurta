"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
// Adjust this import if you have a different prisma client wrapper.
// Many projects use `lib/prisma` as a tiny wrapper that exports `db`.
// Your Prisma generator shows output="../lib/generated/prisma", so change if needed.
import { db } from "@/lib/generated/prisma"; // <- change to "@/lib/prisma" if that's what you use
import { serializeCarData } from "@/lib/helpers";

/** Safe ISO helper that tolerates strings, Dates and null/undefined */
const safeIso = (v) => {
  if (v === undefined || v === null) return null;
  if (typeof v === "string") return v;
  if (v instanceof Date) return v.toISOString();
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

/**
 * Schedule an inspection
 * @param {{vehicleId:number, date:string|Date, notes?:string, preferredInspectorId?:number}} params
 */
export async function scheduleInspection({ vehicleId, date, notes, preferredInspectorId }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("You must be logged in to schedule an inspection");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found in database");

    const vehicle = await db.vehicle.findUnique({ where: { id: Number(vehicleId) } });
    if (!vehicle) throw new Error("Vehicle not found");

    const inspectionDate = new Date(date);
    if (isNaN(inspectionDate.getTime())) throw new Error("Invalid date provided");

    // Prevent exact timestamp duplicates for same vehicle and SCHEDULED status
    const existing = await db.inspection.findFirst({
      where: {
        vehicleId: vehicle.id,
        date: inspectionDate,
        status: "SCHEDULED",
      },
    });
    if (existing) throw new Error("This exact time slot is already booked for inspection");

    // choose inspector: preferred -> any ADMIN -> fallback to requester
    let inspectorId = preferredInspectorId ?? null;
    if (!inspectorId) {
      const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
      inspectorId = admin?.id ?? user.id;
    }

    const created = await db.inspection.create({
      data: {
        vehicleId: vehicle.id,
        inspectorId,
        status: "SCHEDULED",
        date: inspectionDate,
        notes: notes ?? null,
      },
      include: {
        vehicle: true,
        inspector: { select: { id: true, fullName: true, email: true } },
      },
    });

    // revalidate relevant pages
    try {
      revalidatePath(`/inspections/${created.id}`);
      revalidatePath(`/vehicles/${vehicle.id}`);
      revalidatePath(`/admin/inspections`);
      revalidatePath(`/inspections`);
    } catch (rerr) {
      console.warn("revalidatePath failed:", rerr?.message ?? rerr);
    }

    return {
      success: true,
      data: {
        ...created,
        date: safeIso(created.date),
      },
    };
  } catch (error) {
    console.error("Error scheduling inspection:", error);
    return {
      success: false,
      error: error?.message ?? "Failed to schedule inspection",
      data: [],
    };
  }
}

/** Get inspections the current user can see (admin sees all) */
// action/inspection.js (or wherever your getUserInspections function is located)
export async function getUserInspections(userId) {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    // Your database query logic here
    const inspections = await db.inspection.findMany({
      where: { userId },
      include: {
        vehicle: true,
        user: true // Make sure this relation exists
      },
      orderBy: { date: 'desc' }
    });

    return { success: true, data: inspections };
  } catch (error) {
    console.error("Error fetching user inspections:", error);
    return { 
      success: false, 
      error: "Failed to fetch inspections",
      message: error.message 
    };
  }
}

/**
 * Update inspection fields (status, notes, rating, date)
 * @param {{inspectionId:number, status?:string, notes?:string, rating?:number, date?:string|Date}} params
 */
export async function updateInspection({ inspectionId, status, notes, rating, date }) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return { success: false, error: "User not found" };

    const inspection = await db.inspection.findUnique({ where: { id: Number(inspectionId) }, include: { vehicle: true } });
    if (!inspection) return { success: false, error: "Inspection not found" };

    if (inspection.inspectorId !== user.id && user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized to update this inspection" };
    }

    const data = {};
    if (status) data.status = status;
    if (notes !== undefined) data.notes = notes;
    if (rating !== undefined) data.rating = rating;
    if (date) {
      const nd = new Date(date);
      if (isNaN(nd.getTime())) return { success: false, error: "Invalid date" };
      data.date = nd;
    }

    const updated = await db.inspection.update({
      where: { id: inspection.id },
      data,
      include: {
        vehicle: true,
        inspector: { select: { id: true, fullName: true, email: true } },
      },
    });

    try {
      revalidatePath(`/inspections/${inspectionId}`);
      revalidatePath(`/vehicles/${updated.vehicleId}`);
      revalidatePath(`/admin/inspections`);
      revalidatePath(`/inspections`);
    } catch (rerr) {
      console.warn("revalidatePath failed after update:", rerr?.message ?? rerr);
    }

    return { success: true, data: { ...updated, date: safeIso(updated.date) } };
  } catch (error) {
    console.error("Error updating inspection:", error);
    return { success: false, error: error?.message ?? "Failed to update inspection" };
  }
}

/** Cancel an inspection */
export async function cancelInspection(inspectionId) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return { success: false, error: "User not found" };

    const inspection = await db.inspection.findUnique({ where: { id: Number(inspectionId) }, include: { vehicle: true } });
    if (!inspection) return { success: false, error: "Inspection not found" };

    const isVehicleOwner = inspection.vehicle.userId === user.id;
    const isInspector = inspection.inspectorId === user.id;
    if (!isInspector && !isVehicleOwner && user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized to cancel this inspection" };
    }

    if (inspection.status === "CANCELLED") return { success: false, error: "Inspection already cancelled" };
    if (inspection.status === "COMPLETED") return { success: false, error: "Cannot cancel a completed inspection" };

    await db.inspection.update({ where: { id: inspection.id }, data: { status: "CANCELLED" } });

    try {
      revalidatePath(`/inspections/${inspectionId}`);
      revalidatePath(`/vehicles/${inspection.vehicleId}`);
      revalidatePath(`/admin/inspections`);
      revalidatePath(`/inspections`);
    } catch (rerr) {
      console.warn("revalidatePath failed after cancel:", rerr?.message ?? rerr);
    }

    return { success: true, message: "Inspection cancelled successfully" };
  } catch (error) {
    console.error("Error cancelling inspection:", error);
    return { success: false, error: error?.message ?? "Failed to cancel inspection" };
  }
}
