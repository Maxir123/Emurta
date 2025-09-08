"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getFeaturedVehicles } from "@/action/vehicle";
import { toggleSavedVehicle, getSavedVehicles } from "@/action/vehicles-listing";
import {
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaArrowRight
} from "react-icons/fa";

export default function FeaturedVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const itemWidth = 320;

  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [likedVehicles, setLikedVehicles] = useState({});
  const [processingMap, setProcessingMap] = useState({});

  const updateScrollControls = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const tolerance = 1;
    setCanScrollLeft(el.scrollLeft > tolerance);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - tolerance);

    const newIndex = Math.round(el.scrollLeft / (itemWidth + 24));
    setActiveIndex(newIndex);
  }, [itemWidth]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -itemWidth : itemWidth;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const scrollToIndex = (index) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollPosition = index * (itemWidth + 24);
    el.scrollTo({ left: scrollPosition, behavior: "smooth" });
  };

  // fetch vehicles + initialize liked map
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoading(true);
        const res = await getFeaturedVehicles();
        if (res?.success) {
          setVehicles(res.data || []);
          const initialMap = {};
          (res.data || []).forEach((v) => {
            initialMap[v.id] = Boolean(v.saved);
          });
          setLikedVehicles(initialMap);

          if (isSignedIn) {
            const savedRes = await getSavedVehicles();
            if (savedRes?.success && Array.isArray(savedRes.data)) {
              const savedMap = {};
              savedRes.data.forEach((sv) => {
                savedMap[sv.id] = true;
              });
              setLikedVehicles((prev) => ({ ...prev, ...savedMap }));
            }
          }
        }
      } catch (err) {
        console.error("Error loading featured vehicles:", err);
      } finally {
        setLoading(false);
        setTimeout(updateScrollControls, 100);
      }
    };

    loadVehicles();
  }, [isSignedIn, updateScrollControls]);

  // save/unsave
  const handleLikeToggle = async (vehicle) => {
    if (!vehicle?.id) return;
    if (!isSignedIn) {
      toast.error("Please sign in to save vehicles");
      router.push("/sign-in");
      return;
    }

    const id = vehicle.id;
    if (processingMap[id]) return;

    const prev = likedVehicles[id] ?? false;

    // optimistic
    setLikedVehicles((s) => ({ ...s, [id]: !prev }));
    setProcessingMap((p) => ({ ...p, [id]: true }));

    try {
      const res = await toggleSavedVehicle(id);
      if (res?.success) {
        setLikedVehicles((s) => ({ ...s, [id]: Boolean(res.saved) }));
        toast.success(res.saved ? "Saved to favorites" : "Removed from favorites");
      } else {
        setLikedVehicles((s) => ({ ...s, [id]: prev })); // revert
        toast.error(res?.error || "Failed to update");
      }
    } catch (err) {
      console.error("toggleSavedVehicle error:", err);
      setLikedVehicles((s) => ({ ...s, [id]: prev }));
      toast.error("Error saving vehicle");
    } finally {
      setProcessingMap((p) => ({ ...p, [id]: false }));
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="w-full px-4 py-16 sm:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          
          <div className="relative">
            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="min-w-[300px] bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-5">
                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded mb-4 animate-pulse"></div>
                    <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!vehicles.length) {
    return (
      <section className="w-full px-4 py-20 text-center bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Vehicles</h2>
          <p className="text-gray-500 mb-8">No featured vehicles available at the moment.</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 px-6 py-3">
            <Link href="/vehicles">Browse All Vehicles</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-4 py-16 sm:px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Featured Vehicles</h2>
          <Link 
            href="/vehicles" 
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
          >
            View All <FaArrowRight className="text-sm" />
          </Link>
        </div>

        <div className="relative group">
          {/* Navigation buttons */}
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white border border-gray-200 rounded-full p-3 shadow-md hover:shadow-lg transition-all duration-200 ${
              !canScrollLeft ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <FaChevronLeft className="text-gray-700" />
          </button>

          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white border border-gray-200 rounded-full p-3 shadow-md hover:shadow-lg transition-all duration-200 ${
              !canScrollRight ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <FaChevronRight className="text-gray-700" />
          </button>

          {/* Carousel */}
          <div
            ref={scrollRef}
            onScroll={updateScrollControls}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          >
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="min-w-[300px] bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <div className="relative">
                  <Image
                  src={vehicle.images?.[0]?.url ?? vehicle.images?.[0] ?? vehicle.image ?? vehicle.imageUrl ?? "/placeholder-car.jpg"}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />

                  
                  {/* Like button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleLikeToggle(vehicle);
                    }}
                    disabled={processingMap[vehicle.id]}
                    className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all duration-200 ${
                      likedVehicles[vehicle.id] 
                        ? "bg-red-500 text-white hover:bg-red-600" 
                        : "bg-white text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <FaHeart className={likedVehicles[vehicle.id] ? "fill-current" : ""} />
                  </button>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <span className="text-gray-500 text-sm">{vehicle.year}</span>
                  </div>
                  
                  <p className="font-bold text-green-600 text-xl mb-4">
                    ₦{vehicle.price?.toLocaleString()}
                  </p>
                  
                  <Button 
                    asChild 
                    className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-3"
                  >
                    <Link href={`/Car/${vehicle.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {vehicles.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                index === activeIndex ? "bg-blue-600 w-6" : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}