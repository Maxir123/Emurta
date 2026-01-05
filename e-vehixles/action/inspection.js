"use server";

import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma"; // ensure this exports `db = new PrismaClient()`
import { serializeCarData } from "@/lib/helpers";

/** Safe ISO helper that tolerates strings, Dates and null/undefined */
const safeIso = (v) => {
  if (v === undefined || v === null) return null;
  if (typeof v === "string") return v;
  if (v instanceof Date) return v.toISOString();
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

/** Ensure Clerk user exists in DB — create if missing */
async function ensureDbUser(clerkId) {
  if (!clerkId) return null;
  let user = await db.user.findUnique({ where: { clerkUserId: clerkId } });
  if (!user) {
    // Try to get Clerk profile for extra fields
    try {
      const clerk = await currentUser();
      const email = clerk?.emailAddresses?.[0]?.emailAddress ?? "";
      const fullName = `${clerk?.firstName ?? ""} ${clerk?.lastName ?? ""}`.trim();
      user = await db.user.create({
        data: {
          clerkUserId: clerkId,
          email,
          fullName,
        },
      });
      console.log("Created user in DB for clerkId:", clerkId, " -> userId:", user.id);
    } catch (err) {
      // fallback minimal create
      user = await db.user.create({
        data: {
          clerkUserId: clerkId,
          email: `${clerkId}@placeholder.local`,
        },
      });
      console.warn("Created fallback DB user for clerkId:", clerkId);
    }
  }
  return user;
}

/** parse "9:00 AM" -> { hours: 9, minutes: 0 } (24hr) */
function parseTimeString(str) {
  if (!str || typeof str !== "string") return { hours: 0, minutes: 0 };
  const m = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return { hours: 0, minutes: 0 };
  let h = Number(m[1]);
  const mn = Number(m[2]);
  const ampm = (m[3] || "").toUpperCase();
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return { hours: h, minutes: mn };
}

/**
 * Schedule an inspection
 * @param {{ vehicleId:number, date: string|Date, time?: string, notes?: string, preferredInspectorId?: number }} params
 */
export async function scheduleInspection({ vehicleId, date, time, notes, preferredInspectorId }) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("You must be logged in to schedule an inspection");

    const dbUser = await ensureDbUser(clerkUserId);
    if (!dbUser) throw new Error("Unable to create/find user in DB");

    const vehicle = await db.vehicle.findUnique({ where: { id: Number(vehicleId) } });
    if (!vehicle) throw new Error("Vehicle not found");

    // combine date + time into a single Date object
    const baseDate = date instanceof Date ? date : new Date(date);
    if (isNaN(baseDate.getTime())) throw new Error("Invalid date provided");

    const { hours, minutes } = parseTimeString(time);
    const inspectionDate = new Date(baseDate);
    inspectionDate.setHours(hours, minutes, 0, 0);

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
      inspectorId = admin?.id ?? dbUser.id;
    }

    const created = await db.inspection.create({
      data: {
        vehicleId: vehicle.id,
        userId: dbUser.id,       // IMPORTANT: customer who booked
        inspectorId,
        status: "SCHEDULED",
        date: inspectionDate,
        notes: notes ?? null,
      },
      include: {
        vehicle: true,
        user: { select: { id: true, fullName: true, email: true } },
        inspector: { select: { id: true, fullName: true, email: true } },
      },
    });

    // revalidate relevant pages (best-effort)
    // inspection.js - Update the revalidatePath calls
    try {
      revalidatePath(`/inspections/${created.id}`);
      revalidatePath(`/vehicles/${vehicle.id}`);  // This should revalidate the vehicle page
      revalidatePath(`/admin/inspections`);
      revalidatePath(`/inspections`);
      revalidatePath(`/vehicles/${vehicle.id}/inspection`); // Add this if needed
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

/**
 * Get inspections for a user (pass Clerk userId)
 * @param {string} clerkUserId
 */
export async function getUserInspections(clerkUserId) {
  try {
    if (!clerkUserId) return { success: false, error: "User ID is required" };

    const dbUser = await db.user.findUnique({ where: { clerkUserId } });
    if (!dbUser) return { success: false, error: "User not found" };

    const inspections = await db.inspection.findMany({
        where: { userId: dbUser.id },
        include: {
          vehicle: {
            include: {
              images: true, // 👈 bring in the related images
            },
          },
          user: { select: { id: true, fullName: true, email: true } },
          inspector: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { date: "desc" },
      });


    return { success: true, data: inspections };
  } catch (error) {
    console.error("Error fetching user inspections:", error);
    return { success: false, error: error?.message ?? "Failed to fetch inspections" };
  }
}

/**
 * Update inspection fields
 * @param {{inspectionId:number, status?:string, notes?:string, rating?:number, date?:string|Date, time?:string}} params
 */
export async function updateInspection({ inspectionId, status, notes, rating, date, time }) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Unauthorized" };

    const dbUser = await db.user.findUnique({ where: { clerkUserId } });
    if (!dbUser) return { success: false, error: "User not found" };

    const inspection = await db.inspection.findUnique({ where: { id: Number(inspectionId) }, include: { vehicle: true } });
    if (!inspection) return { success: false, error: "Inspection not found" };

    if (inspection.inspectorId !== dbUser.id && dbUser.role !== "ADMIN") {
      return { success: false, error: "Unauthorized to update this inspection" };
    }

    const data = {};
    if (status) data.status = status;
    if (notes !== undefined) data.notes = notes;
    if (rating !== undefined) data.rating = rating;
    if (date) {
      const baseDate = date instanceof Date ? date : new Date(date);
      if (isNaN(baseDate.getTime())) return { success: false, error: "Invalid date" };
      const { hours, minutes } = parseTimeString(time);
      const nd = new Date(baseDate);
      nd.setHours(hours, minutes, 0, 0);
      data.date = nd;
    }

    const updated = await db.inspection.update({
      where: { id: inspection.id },
      data,
      include: {
        vehicle: true,
        inspector: { select: { id: true, fullName: true, email: true } },
        user: { select: { id: true, fullName: true, email: true } },
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
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Unauthorized" };

    const dbUser = await db.user.findUnique({ where: { clerkUserId } });
    if (!dbUser) return { success: false, error: "User not found" };

    const inspection = await db.inspection.findUnique({ where: { id: Number(inspectionId) }, include: { vehicle: true } });
    if (!inspection) return { success: false, error: "Inspection not found" };

    const isVehicleOwner = inspection.vehicle.userId === dbUser.id;
    const isInspector = inspection.inspectorId === dbUser.id;
    if (!isInspector && !isVehicleOwner && dbUser.role !== "ADMIN") {
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
