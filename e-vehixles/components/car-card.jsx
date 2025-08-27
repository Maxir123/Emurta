"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CarCard({ car }) {
  return (
    <div className="border rounded-2xl shadow-sm overflow-hidden bg-white hover:shadow-lg transition flex flex-col">
      {/* Image */}
      <div className="relative w-full h-48">
        {car.images?.length > 0 ? (
          <Image
            src={car.images[0].url}
            alt={car.make + " " + car.model}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
            No Image
          </div>
        )}
        {/* Save/Wishlist icon */}
        <button className="absolute top-2 right-2 p-2 rounded-full bg-white shadow hover:bg-gray-100">
          <Heart
            className={`h-5 w-5 ${
              car.wishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>
      </div>

      {/* Car details */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-lg">
          {car.make} {car.model}
        </h3>
        <p className="text-sm text-gray-500">{car.year}</p>

        <div className="mt-auto flex justify-between items-center">
          <p className="text-lg font-bold text-green-600">
            ₦{car.price?.toLocaleString()}
          </p>
          <Button size="sm">View Details</Button>
        </div>
      </div>
    </div>
  );
}
