import { db } from "@/lib/prisma";

// Create rental
export async function createRental(data) {
  return db.rental.create({
    data: {
      vehicleId: data.vehicleId,
      userId: data.userId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      totalPrice: parseFloat(data.totalPrice),
    },
  });
}

// Get all rentals
export async function getRentals() {
  return db.rental.findMany({
    include: { vehicle: true, user: true },
  });
}

// Get rental vehicles only
export async function getRentalVehicles() {
  return db.vehicle.findMany({
    where: { isForRent: true },
    include: { rentals: true },
  });
}
