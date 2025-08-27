"use client";

import { toggleSavedVehicle } from "@/action/vehicles-listing";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaCalendarCheck, FaHeart, FaInfoCircle, FaMapMarkerAlt } from "react-icons/fa";

export default function RentalCard({ vehicle }) {
  const router = useRouter();
  const [liked, setLiked] = useState(vehicle.saved);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLikeToggle = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const result = await toggleSavedVehicle(vehicle.id);
      if (result?.success) {
        setLiked(Boolean(result.saved));
      }
    } catch (error) {
      console.error("Failed to toggle saved rental:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Navigate to rental details / booking page
  const goToRental = () => {
    router.push(`/Car/${vehicle.id}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all h-full">
      <div className="relative">
        <img
          src={vehicle.image || vehicle.images?.[0]?.url || "/placeholder-car.jpg"}
          alt={vehicle.title}
          className="w-full h-48 object-cover"
        />

        <button
          onClick={handleLikeToggle}
          disabled={isProcessing}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-sm border ${
            liked ? "text-red-600" : "text-gray-400"
          } ${isProcessing ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
          aria-label={liked ? "Remove from saved" : "Save rental"}
        >
          <FaHeart />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg truncate">{vehicle.title}</h3>
        <p className="text-blue-600 font-bold mt-1">
          {formatCurrency(vehicle.dailyRate ?? vehicle.price)}/day
        </p>

        {vehicle.location && (
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <FaMapMarkerAlt className="mr-1 text-gray-400" />
            <span>{vehicle.location}</span>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={goToRental}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center font-medium transition-colors"
            aria-label="Rent this vehicle"
          >
            <FaCalendarCheck className="mr-2" /> Rent Now
          </button>
          <button
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
            title="More info"
            onClick={() => router.push(`/rentals/${vehicle.id}`)}
            aria-label="More rental info"
          >
            <FaInfoCircle />
          </button>
        </div>
      </div>
    </div>
  );
}
