"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getFeaturedVehicles } from "@/action/vehicle";
import { FaChevronLeft, FaChevronRight, FaCheckCircle, FaStar, FaArrowRight, FaHeart, FaRegHeart } from "react-icons/fa";

export default function FeaturedVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const sectionRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const itemWidth = 300;
  const [likedVehicles, setLikedVehicles] = useState({});

    const handleLikeToggle = (vehicleId) => {
    setLikedVehicles((prevState) => ({
      ...prevState,
      [vehicleId]: !prevState[vehicleId],
    }));
  };

  const updateScrollControls = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const tolerance = 1;
    setCanScrollLeft(el.scrollLeft > tolerance);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - tolerance);
    
    const newIndex = Math.round(el.scrollLeft / (itemWidth + 24));
    setActiveIndex(newIndex);
  }, [itemWidth]);

  const scrollToIndex = useCallback((index) => {
    const el = scrollRef.current;
    if (!el) return;
    
    const scrollPosition = index * (itemWidth + 24);
    el.scrollTo({ left: scrollPosition, behavior: "smooth" });
  }, [itemWidth]);

  const scroll = useCallback((direction) => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = direction === "left" ? -itemWidth : itemWidth;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }, [itemWidth]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "ArrowLeft" && canScrollLeft) scroll("left");
    else if (e.key === "ArrowRight" && canScrollRight) scroll("right");
  }, [scroll, canScrollLeft, canScrollRight]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollControls();
    el.addEventListener("scroll", updateScrollControls);
    window.addEventListener("resize", updateScrollControls);
    el.addEventListener("keydown", handleKeyDown);
    
    return () => {
      el.removeEventListener("scroll", updateScrollControls);
      window.removeEventListener("resize", updateScrollControls);
      el.removeEventListener("keydown", handleKeyDown);
    };
  }, [updateScrollControls, handleKeyDown]);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoading(true);
        const res = await getFeaturedVehicles();
        if (res.success) {
          setVehicles(res.data);
        } else {
          console.error("Error:", res.error);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
        setTimeout(updateScrollControls, 100);
      }
    };

    loadVehicles();
  }, []);

  if (loading) {
    return (
      <section className="w-full px-4 py-16 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 bg-blue-50 rounded-full text-blue-600 text-sm">
              <FaStar className="text-yellow-400" />
              <span>Loading Vehicles</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Featured Vehicles
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
              Loading our premium selection...
            </p>
          </div>
          
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-2 px-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[85vw] xs:min-w-[70vw] sm:min-w-[300px] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                <div className="aspect-video bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!vehicles.length) {
    return (
      <section className="w-full px-4 py-16 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 bg-blue-50 rounded-full text-blue-600 text-sm">
            <FaStar className="text-yellow-400" />
            <span>No Vehicles Available</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Featured Vehicles
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg mb-8">
            Currently no featured vehicles available
          </p>
          <Button asChild>
            <Link href="/vehicles">
              Browse All Vehicles
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={sectionRef}
      className="w-full bg-gradient-to-b from-gray-50 to-white px-4 py-16 sm:px-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-12">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 bg-blue-50 rounded-full text-blue-600 text-sm">
              <FaStar className="text-yellow-400" />
              <span>Premium Selection</span>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start items-baseline gap-3">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Featured Vehicles
              </h2>
              <Link 
                href="/vehicles" 
                className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base flex items-center gap-1 transition-all hover:gap-1.5 group"
              >
                View all vehicles
                <FaArrowRight 
                  className="text-xs mt-0.5 transition-transform group-hover:translate-x-1" 
                />
              </Link>
            </div>
            
            <p className="text-gray-600 max-w-2xl mx-auto md:mx-0 mt-2 text-base sm:text-lg">
              Discover our curated collection of premium verified vehicles
            </p>
          </div>
        </div>

        <div className="relative group">
          <div className={`absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />

          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className={`hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-200 rounded-full p-3 shadow-lg hover:bg-gray-50 transition-all duration-300 transform ${
              !canScrollLeft ? "opacity-0 cursor-auto" : "opacity-100 hover:scale-105"
            }`}
          >
            <FaChevronLeft className="text-gray-700" size={18} />
          </button>

          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className={`hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-200 rounded-full p-3 shadow-lg hover:bg-gray-50 transition-all duration-300 transform ${
              !canScrollRight ? "opacity-0 cursor-auto" : "opacity-100 hover:scale-105"
            }`}
          >
            <FaChevronRight className="text-gray-700" size={18} />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 px-1"
            tabIndex="0"
          >
             {vehicles.map((vehicle, index) => (
      <div
        key={vehicle.id}
        className="min-w-[85vw] xs:min-w-[70vw] sm:min-w-[300px] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 snap-start flex-shrink-0 group/card"
      >
        <div className="relative">
          <div className="aspect-video overflow-hidden">
            <Image
              src={vehicle.images?.[0]?.url || "/placeholder-car.jpg"}
              alt={`${vehicle.make} ${vehicle.model}`}
              width={200}
              height={300}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
            />
          </div>
          
          {/* Add like button here */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLikeToggle(vehicle.id);
            }}
            className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none"
            aria-label={likedVehicles[vehicle.id] ? "Unlike vehicle" : "Like vehicle"}
          >
            {likedVehicles[vehicle.id] ? (
              <FaHeart className="text-red-500 text-lg hover:scale-110 transition-transform" />
            ) : (
              <FaRegHeart className="text-gray-700 text-lg hover:text-red-500 hover:scale-110 transition-all" />
            )}
          </button>

                  

                  {vehicle.verified && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow">
                      <FaCheckCircle size={10} />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-1">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <span className="text-blue-600 font-bold text-sm sm:text-base whitespace-nowrap">
                      ₦{vehicle.price?.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="text-gray-600 text-xs sm:text-sm mb-3 space-y-1">
                    <div className="flex gap-2">
                      <span>{vehicle.year}</span>
                      <span>•</span>
                      <span>{vehicle.mileage?.toLocaleString()} km</span>
                    </div>
                    <div className="flex gap-2">
                      <span>{vehicle.transmission}</span>
                      <span>•</span>
                      <span>{vehicle.fuelType}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="truncate">{vehicle.location}</span>
                      <span>•</span>
                      <span className={vehicle.condition === "Brand New" ? "text-green-600" : ""}>
                        {vehicle.condition}
                      </span>
                    </div>
                  </div>
                  
                  <Button asChild className="w-full">
                    <Link href={`/Car/${vehicle.id}`} className="py-2 text-white rounded-lg font-medium text-sm sm:text-base shadow-sm hover:shadow-md">
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-1.5">
              {vehicles.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToIndex(index)}
                  aria-label={`Go to item ${index + 1}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === activeIndex 
                      ? "bg-blue-600 w-4" 
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
                className={`p-2.5 bg-white border border-gray-200 rounded-full shadow hover:bg-gray-50 transition ${
                  !canScrollLeft ? "opacity-30 cursor-not-allowed" : ""
                }`}
              >
                <FaChevronLeft size={14} />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Scroll right"
                className={`p-2.5 bg-white border border-gray-200 rounded-full shadow hover:bg-gray-50 transition ${
                  !canScrollRight ? "opacity-30 cursor-not-allowed" : ""
                }`}
              >
                <FaChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom View More Button - Mobile Only */}
        <div className="mt-10 flex justify-center md:hidden">
          <Button asChild className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-5 shadow-sm hover:shadow-md transition-all">
            <Link href="/vehicles" className="flex items-center gap-2">
              View All Vehicles
              <FaArrowRight className="text-sm" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}