"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { serializeCarData } from "@/lib/helpers";

// ------------------ createVehicleWithRental (public API) ------------------
export async function createVehicleWithRental({ carData, images = [], rental = {} }) {
  try {
    // Use existing addCar to handle auth, uploads and vehicle create
    const addResult = await addCar({ carData, images });

    if (!addResult || !addResult.success) {
      throw new Error(addResult?.error || "Failed to create vehicle");
    }

    const vehicle = addResult.data;

    // Decide whether to create rental
    const shouldCreateRental = !!carData.isForRent || !!rental.startDate || !!rental.totalPrice;

    if (!shouldCreateRental) {
      return { success: true, data: vehicle };
    }

    // Prefer rental object values; fallback to carData
    const sDateRaw = rental.startDate ?? carData.startDate;
    const eDateRaw = rental.endDate ?? carData.endDate;
    const tPriceRaw = rental.totalPrice ?? carData.totalPrice;
    const rStatusRaw = rental.rentalStatus ?? carData.rentalStatus ?? "RESERVED";
    const rStatus = normalizeEnum(rStatusRaw) ?? "RESERVED";

    // Validate required rental fields
    if (!sDateRaw || !eDateRaw || (tPriceRaw === undefined || tPriceRaw === null || tPriceRaw === "")) {
      // Cleanup vehicle + uploaded files (best-effort)
      await _cleanupVehicleAndFiles(vehicle.id);
      throw new Error("Missing rental fields: startDate, endDate and totalPrice are required for rentals");
    }

    const sDate = new Date(sDateRaw);
    const eDate = new Date(eDateRaw);
    if (isNaN(sDate.getTime()) || isNaN(eDate.getTime()) || sDate > eDate) {
      await _cleanupVehicleAndFiles(vehicle.id);
      throw new Error("Invalid rental dates (startDate must be <= endDate and valid dates)");
    }

    const totalPrice = parseFloat(tPriceRaw);
    if (isNaN(totalPrice)) {
      await _cleanupVehicleAndFiles(vehicle.id);
      throw new Error("Invalid totalPrice for rental");
    }

    // Create rental
    await db.rental.create({
      data: {
        vehicleId: vehicle.id,
        userId: vehicle.userId, // addCar sets this
        startDate: sDate,
        endDate: eDate,
        totalPrice,
        status: rStatus,
      },
    });

    return { success: true, data: vehicle };
  } catch (err) {
    console.error("createVehicleWithRental error:", err);
    return { success: false, error: err?.message ?? String(err) };
  }
}

// ------------------ helper cleanup: removes vehicle db rows and supabase files ------------------
async function _cleanupVehicleAndFiles(vehicleId) {
  try {
    // fetch images
    const imgs = await db.vehicleImage.findMany({ where: { vehicleId } });

    // delete image rows, then vehicle row
    await db.vehicleImage.deleteMany({ where: { vehicleId } });
    await db.vehicle.delete({ where: { id: vehicleId } });

    // remove from supabase (best effort)
    try {
      const cookieStore = cookies();
      const supabase = createClient(cookieStore);

      const filePaths = imgs
        .map((i) => {
          try {
            const url = new URL(i.url);
            const pathMatch = url.pathname.match(/\/car-images\/(.*)/);
            return pathMatch ? pathMatch[1] : null;
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      if (filePaths.length > 0) {
        await supabase.storage.from("car-images").remove(filePaths);
      }
    } catch (e) {
      console.error("Supabase cleanup failed:", e);
    }

    // revalidate listing page
    try {
      revalidatePath("/admin/Vehiclex");
    } catch (e) {
      // ignore revalidate errors
    }
  } catch (e) {
    console.error("_cleanupVehicleAndFiles failed:", e);
  }
}

// ------------------ fileToBase64 (used by AI) ------------------
async function fileToBase64(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}

// ------------------ processCarImageWithAI ------------------
export async function processCarImageWithAI(file) {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("Gemini API key is not configured");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const base64Image = await fileToBase64(file);

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.type,
      },
    };

    const prompt = `
      Analyze this Vehicle image and extract the following information:
      1. Make (manufacturer)
      2. Model
      3. Year (approximately)
      4. Color
      5. Body type (SUV, Sedan, Hatchback, etc.)
      6. Mileage
      7. Fuel type (your best guess)
      8. Transmission type (your best guess)
      9. Price (your best guess)
      9. Short Description as to be added to a car listing

      Format your response as a clean JSON object with these fields:
      {
        "make": "",
        "model": "",
        "year": 0000,
        "color": "",
        "price": "",
        "mileage": "",
        "bodyType": "",
        "fuelType": "",
        "transmission": "",
        "description": "",
        "confidence": 0.0
      }

      For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
      Only respond with the JSON object, nothing else.
    `;

    const result = await model.generateContent([imagePart, prompt]);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const carDetails = JSON.parse(cleanedText);

      const requiredFields = [
        "make",
        "model",
        "year",
        "color",
        "bodyType",
        "price",
        "mileage",
        "fuelType",
        "transmission",
        "description",
        "confidence",
      ];

      const missingFields = requiredFields.filter((f) => !(f in carDetails));
      if (missingFields.length > 0) {
        throw new Error(`AI response missing required fields: ${missingFields.join(", ")}`);
      }

      return { success: true, data: carDetails };
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw response:", text);
      return { success: false, error: "Failed to parse AI response" };
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Gemini API error:" + (error.message || String(error)));
  }
}

// ------------------ normalizeEnum ------------------
function normalizeEnum(value) {
  if (!value || typeof value !== "string") return null;
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
}

// ------------------ addCar (uploads images & creates vehicle) ------------------
export async function addCar({ carData, images }) {
  try {
    // auth
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    // upload images to supabase
    const carUuid = uuidv4();
    const folderPath = `cars/${carUuid}`;
    const supabase = createClient(await cookies());
    const imageUrls = [];

    for (let i = 0; i < images.length; i++) {
      const dataUrl = images[i];
      if (!dataUrl || !dataUrl.startsWith("data:image/")) continue;

      const [meta, payload] = dataUrl.split(",");
      const mimeMatch = meta.match(/data:image\/([a-zA-Z0-9]+);/);
      const ext = mimeMatch ? mimeMatch[1] : "jpeg";
      const buffer = Buffer.from(payload, "base64");

      const filePath = `${folderPath}/img-${Date.now()}-${i}.${ext}`;
      const { error } = await supabase.storage.from("car-images").upload(filePath, buffer, {
        contentType: `image/${ext}`,
      });

      if (error) {
        console.error("Error uploading image:", error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      imageUrls.push(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/car-images/${filePath}`);
    }

    if (imageUrls.length === 0) {
      throw new Error("No valid images were uploaded");
    }

    // build payload
    const payload = {
      title: carData.title || `${carData.make} ${carData.model}`,
      make: carData.make,
      model: carData.model,
      year: carData.year,
      price: isNaN(parseFloat(carData.price)) ? null : parseFloat(carData.price),
      description: carData.description || null,
      mileage: isNaN(parseInt(carData.mileage)) ? null : parseInt(carData.mileage),
      color: carData.color || null,

      // owner fields (safe fallback to match client keys)
      Vehicle_Owner_Name: carData.Vehicle_Owner_Name ?? carData.Vehicle_owner_Name ?? null,
      Vehicle_owner_Number: carData.Vehicle_owner_Number ?? carData.vehicle_owner_Number ?? null,
      Vehicle_owner_Email: carData.Vehicle_owner_Email ?? carData.vehicle_owner_Email ?? null,

      engineType: normalizeEnum(carData.engineType),
      fuelType: normalizeEnum(carData.fuelType),
      transmission: normalizeEnum(carData.transmission),

      condition: carData.condition ? normalizeEnum(carData.condition) : null,
      location: carData.location ? normalizeEnum(carData.location) : null,

      bodyType: carData.bodyType || null,
      type: normalizeEnum(carData.type),
      status: carData.status ? normalizeEnum(carData.status) : "AVAILABLE",
      featured: !!carData.featured,
      isForRent: !!carData.isForRent,
      isForSale: carData.isForRent ? false : (carData.isForSale !== undefined ? !!carData.isForSale : true),
      isVerified: !!carData.isVerified,
      seatingCapacity: carData.seatingCapacity ? parseInt(carData.seatingCapacity) : null,
      userId: user.id,
      images: { create: imageUrls.map((url, idx) => ({ url, isPrimary: idx === 0 })) },
    };

    const car = await db.vehicle.create({ data: payload });
    revalidatePath("/admin/Vehiclex");

    return { success: true, data: car };
  } catch (error) {
    console.error("Error adding car:", error);
    return { success: false, error: error.message || String(error) };
  }
}

// ------------------ remaining helpers / read functions ------------------
export async function getCars(search = "") {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    let where = {};
    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { color: { contains: search, mode: "insensitive" } },
      ];
    }

    const cars = await db.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { images: true },
    });

    const serializedCars = cars.map(serializeCarData);
    return { success: true, data: serializedCars };
  } catch (error) {
    console.error("Error fetching cars:", error);
    return { success: false, error: error.message };
  }
}

// deleteCar, updateCarStatus, getRentalVehicles, getVehiclesForSale, getFeaturedVehicles
// you can keep the rest of your existing exports unchanged — I include full implementations below

export async function deleteCar(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    // First, fetch the car to get its images
    const car = await db.vehicle.findUnique({
      where: { id },
      select: { images: true },
    });

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    // ✅ Step 1: Delete image records from database first
    await db.vehicleImage.deleteMany({
      where: { vehicleId: id },
    });

    // ✅ Step 2: Delete the car from the database
    await db.vehicle.delete({
      where: { id },
    });

    // ✅ Step 3: Delete the images from Supabase storage
    try {
      const cookieStore = cookies();
      const supabase = createClient(cookieStore);

      // Extract file paths from image URLs
      const filePaths = car.images
        .map((imageUrl) => {
          const url = new URL(imageUrl);
          const pathMatch = url.pathname.match(/\/car-images\/(.*)/);
          return pathMatch ? pathMatch[1] : null;
        })
        .filter(Boolean);

      if (filePaths.length > 0) {
        const { error } = await supabase.storage
          .from("car-images")
          .remove(filePaths);

        if (error) {
          console.error("Error deleting images from storage:", error);
        }
      }
    } catch (storageError) {
      console.error("Error with storage operations:", storageError);
    }

    revalidatePath("/admin/Vehiclex");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting car:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function updateCarStatus(id, { status, featured }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const updateData = {};

    if (status !== undefined) {
      updateData.status = status;
    }

    if (featured !== undefined) {
      updateData.featured = featured;
    }

    // Update the car
    await db.vehicle.update({
      where: { id },
      data: updateData,
    });

    // Revalidate the cars list page
    revalidatePath("/admin/Vehiclex");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating car status:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ── rental / listing queries ──

export async function getRentalVehicles({ search = "" } = {}) {
  try {
    const where = {
      isForRent: true,
      isForSale: false, // prevents rent items from appearing in sale lists
      ...(search
        ? {
            OR: [
              { make: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } },
              { color: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const vehicles = await db.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
        rentals: {
          include: { user: true },
        },
      },
    });

    return { success: true, data: vehicles.map(serializeCarData) };
  } catch (err) {
    console.error("Error fetching rental vehicles:", err);
    return { success: false, error: err.message };
  }
}

export async function getVehiclesForSale({ search = "" } = {}) {
  try {
    const where = {
      isForSale: true,
      ...(search
        ? {
            OR: [
              { make: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } },
              { color: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const vehicles = await db.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { images: true },
    });

    return { success: true, data: vehicles.map(serializeCarData) };
  } catch (err) {
    console.error("Error fetching sale vehicles:", err);
    return { success: false, error: err.message };
  }
}

export async function getFeaturedVehicles() {
  try {
    const vehicles = await db.vehicle.findMany({
      where: { 
        featured: true,
        isForSale: true,   // ✅ only for sale
        isForRent: false,  // ✅ not rentals
      },
      orderBy: { createdAt: "desc" },
      include: { images: true },
    });

    return { success: true, data: vehicles.map(serializeCarData) };
  } catch (err) {
    console.error("Error fetching featured vehicles:", err);
    return { success: false, error: err.message };
  }
}
