"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPhone, FaInfoCircle, FaHeart } from "react-icons/fa";
import { toggleSavedVehicle } from "@/action/vehicles-listing";

export default function VehicleCard({ vehicle }) {
  const router = useRouter();
  const [liked, setLiked] = useState(Boolean(vehicle.saved));
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLikeToggle = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const result = await toggleSavedVehicle(vehicle.id);
      if (result && result.success) {
        setLiked(Boolean(result.saved));
      }
    } catch (error) {
      console.error("Failed to toggle saved vehicle:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const goToDetails = () => {
    router.push(`/Car/${vehicle.id}`);
  };

  // Format currency for Nigerian Naira
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      {/* MOBILE VERSION */}
      <div className="flex items-center justify-between border-b border-gray-200 px-2 py-2 sm:hidden">
        <div className="flex-shrink-0 w-24 h-20 rounded overflow-hidden">
          {vehicle.image ? (
            <img
              src={vehicle.image}
              alt={vehicle.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 px-2">
          <h3 className="font-semibold text-sm truncate">{vehicle.title}</h3>
          <p className="text-blue-600 font-bold text-sm mt-1">
            {formatCurrency(vehicle.price)}
          </p>
          <div className="flex flex-wrap gap-1 text-xs text-gray-500">
            <span>{vehicle.location}</span>
            <span>•</span>
            <span>{vehicle.fuelType}</span>
            <span>•</span>
            <span>{vehicle.mileage?.toLocaleString() || "N/A"} km</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={goToDetails}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs flex items-center"
          >
            View More
          </button>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100">
              <FaInfoCircle size={12} />
            </button>
            <button
              onClick={handleLikeToggle}
              disabled={isProcessing}
              className={`w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100 ${
                liked ? "text-red-600" : "text-gray-400"
              } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <FaHeart size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP VERSION */}
      <div className="hidden sm:block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all h-full">
        <div className="relative">
          {vehicle.image ? (
            <img
              src={vehicle.image}
              alt={vehicle.title}
              className="w-full h-48 object-cover rounded-t-xl"
            />
          ) : (
            <div className="bg-gray-200 border-2 border-dashed rounded-t-xl w-full h-48 flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}

          {vehicle.isVerified && (
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
              Verified
            </div>
          )}

          <button
            onClick={handleLikeToggle}
            disabled={isProcessing}
            className={`absolute top-2 right-2 p-2 rounded-full shadow-sm border ${
              liked ? "text-red-600" : "text-gray-400"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
          >
            <FaHeart />
          </button>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg truncate">{vehicle.title}</h3>
              <p className="text-blue-600 font-bold mt-1">{formatCurrency(vehicle.price)}</p>
            </div>
            <div className="bg-gray-100 px-2 py-1 rounded text-sm whitespace-nowrap">
              {vehicle.year}
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mt-3 text-sm text-gray-500">
            <span>{vehicle.location}</span>
            <span>•</span>
            <span>{vehicle.fuelType}</span>
            <span>•</span>
            <span>{vehicle.mileage?.toLocaleString() || "N/A"} km</span>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={goToDetails}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center"
            >
              View More
            </button>
            <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100">
              <FaInfoCircle />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
