"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  FaCar,
  FaTruck,
  FaMotorcycle,
  FaShuttleVan,
  FaBus,
  FaHardHat,
  FaSearch,
  FaQuestionCircle,
  FaShip,
} from "react-icons/fa";
import { HiFilter } from "react-icons/hi";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import FilterSidebar from "./FilterSidebar";
import VehicleCard from "./VehicleCard";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { getVehicles, getVehicleFilters } from "@/action/vehicles-listing";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Vehicle type options
const vehicleTypes = [
  { value: "all", label: "All Vehicles", icon: <FaCar className="mr-2" /> },
  { value: "CAR", label: "Cars", icon: <FaCar className="mr-2" /> },
  { value: "TRUCK", label: "Trucks", icon: <FaTruck className="mr-2" /> },
  { value: "MOTORCYCLE", label: "Motorcycles", icon: <FaMotorcycle className="mr-2" /> },
  { value: "BOAT", label: "Boats", icon: <FaShip className="mr-2" /> },
  { value: "KEKE", label: "Keke (Tricycle)", icon: <FaShuttleVan className="mr-2" /> }, // closest option
  { value: "CONSTRUCTION", label: "Construction", icon: <FaHardHat className="mr-2" /> },
  { value: "OTHER", label: "Other", icon: <FaQuestionCircle className="mr-2" /> },
];

export default function VehicleMarketplace() {
  // State declarations
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedFuel, setSelectedFuel] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 70000000]);
  const [yearRange, setYearRange] = useState([2010, 2024]);
  const [selectedTransmission, setSelectedTransmission] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    priceRange: { min: 0, max: 70000000 },
    yearRange: { min: 2010, max: new Date().getFullYear() },
  });
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch min/max values on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const result = await getVehicleFilters();
        if (result.success) {
          setFilterOptions({
            priceRange: {
              min: result.data.priceRange.min,
              max: result.data.priceRange.max,
            },
            yearRange: {
              min: result.data.yearRange.min,
              max: result.data.yearRange.max,
            },
          });
          setPriceRange([result.data.priceRange.min, result.data.priceRange.max]);
          setYearRange([result.data.yearRange.min, result.data.yearRange.max]);
        }
      } catch (err) {
        console.error("Failed to load filter options:", err);
      }
    };

    fetchFilterOptions();
  }, []);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Fetch vehicles from the database
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare filters for server request
      const filters = {
        q: debouncedSearchTerm,
        type: selectedType !== "all" ? selectedType : undefined,
        fuelType: selectedFuel !== "all" ? selectedFuel : undefined,
        condition: selectedCondition !== "all" ? selectedCondition : undefined,
        location: selectedState !== "all" ? selectedState : undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        minYear: yearRange[0],
        maxYear: yearRange[1],
        transmission: selectedTransmission !== "all" ? selectedTransmission : undefined,
        color: selectedColor !== "all" ? selectedColor : undefined,
        isVerified: verifiedOnly || undefined,
        sortBy,
        page, // Add page parameter
        limit: 12, // Set a page limit
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

      const result = await getVehicles(filters);
      if (result.success) {
        setVehicles((prev) => 
  page === 1 ? result.data : [...prev, ...result.data]
);

        setTotalVehicles(result.pagination?.total || result.data.length);
        setTotalPages(result.pagination?.totalPages || 1);
      } else {
        setError(result.error || "Failed to load vehicles");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearchTerm,
    selectedType,
    selectedFuel,
    selectedCondition,
    selectedState,
    priceRange,
    yearRange,
    selectedTransmission,
    selectedColor,
    verifiedOnly,
    sortBy,
    page, // Add page to dependencies
  ]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearchTerm,
    selectedType,
    selectedFuel,
    selectedCondition,
    selectedState,
    priceRange,
    yearRange,
    selectedTransmission,
    selectedColor,
    verifiedOnly,
    sortBy,
  ]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedType("all");
    setSelectedFuel("all");
    setSelectedCondition("all");
    setSelectedState("all");
    setPriceRange([filterOptions.priceRange.min, filterOptions.priceRange.max]);
    setYearRange([filterOptions.yearRange.min, filterOptions.yearRange.max]);
    setSelectedTransmission("all");
    setSelectedColor("all");
    setVerifiedOnly(false);
    setSortBy("newest");
    setPage(1); // Reset to first page
  }, [filterOptions]);

  // Format number with commas for display
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            if (page > 1) setPage(page - 1);
          }}
          className={page === 1 ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );

    // Page numbers
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setPage(1);
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setPage(i);
            }}
            isActive={i === page}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setPage(totalPages);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            if (page < totalPages) setPage(page + 1);
          }}
          className={page === totalPages ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );

    return items;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-25">
      {/* Aligned container with navbar */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">Filters</h2>
                <Button 
                  variant="ghost"
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                  onClick={clearAllFilters}
                >
                  Clear All
                </Button>
              </div>
              <FilterSidebar
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                yearRange={yearRange}
                setYearRange={setYearRange}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                vehicleTypes={vehicleTypes}
                selectedFuel={selectedFuel}
                setSelectedFuel={setSelectedFuel}
                selectedCondition={selectedCondition}
                setSelectedCondition={setSelectedCondition}
                selectedState={selectedState}
                setSelectedState={setSelectedState}
                selectedTransmission={selectedTransmission}
                setSelectedTransmission={setSelectedTransmission}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                verifiedOnly={verifiedOnly}
                setVerifiedOnly={setVerifiedOnly}
                filterOptions={filterOptions}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center gap-3 overflow-x-auto">
              <div className="relative flex-1">
                <FaSearch className="absolute top-3.5 left-3 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search vehicles or locations..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3">
                <div className="hidden sm:block">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="priceAsc">Price Low to High</SelectItem>
                      <SelectItem value="priceDesc">Price High to Low</SelectItem>
                      <SelectItem value="yearDesc">Year Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Mobile Filter Button */}
                <Drawer direction="bottom">
                  <DrawerTrigger asChild>
                  <Button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 lg:hidden">
                    <HiFilter className="text-sm" />
                    <span className="hidden md:inline">Filters</span>
                  </Button>
                  </DrawerTrigger>
                  <DrawerContent className="h-full w-[100%] ml-auto rounded-l-xl">
                    <div className="p-5 overflow-y-auto">
                      <div className="flex justify-between items-center mb-5">
                        <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                        <DrawerTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <X className="text-gray-500" size={20} />
                          </Button>
                        </DrawerTrigger>
                      </div>
                      <FilterSidebar
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        yearRange={yearRange}
                        setYearRange={setYearRange}
                        selectedType={selectedType}
                        setSelectedType={setSelectedType}
                        vehicleTypes={vehicleTypes}
                        selectedFuel={selectedFuel}
                        setSelectedFuel={setSelectedFuel}
                        selectedCondition={selectedCondition}
                        setSelectedCondition={setSelectedCondition}
                        selectedState={selectedState}
                        setSelectedState={setSelectedState}
                        selectedTransmission={selectedTransmission}
                        setSelectedTransmission={setSelectedTransmission}
                        selectedColor={selectedColor}
                        setSelectedColor={setSelectedColor}
                        verifiedOnly={verifiedOnly}
                        setVerifiedOnly={setVerifiedOnly}
                        filterOptions={filterOptions}
                      />
                      <div className="mt-6 flex gap-3">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={clearAllFilters}
                        >
                          Clear All
                        </Button>
                        <DrawerTrigger asChild>
                          <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                            Apply Filters
                          </Button>
                        </DrawerTrigger>
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>

            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                {loading ? (
                  <Skeleton className="h-6 w-40" />
                ) : (
                  <p className="text-gray-600">
                    <span className="font-semibold">{formatNumber(totalVehicles)}</span>{" "}
                    {totalVehicles === 1 ? "vehicle" : "vehicles"} found
                    {searchTerm && (
                      <span className="text-sm text-gray-500 mt-1 block">
                        Searching for: "{searchTerm}"
                      </span>
                    )}
                  </p>
                )}
              </div>
              
              <div className="sm:hidden w-full sm:w-auto">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="priceAsc">Price Low to High</SelectItem>
                    <SelectItem value="priceDesc">Price High to Low</SelectItem>
                    <SelectItem value="yearDesc">Year Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Page indicator */}
              {totalPages > 1 && !loading && (
                <div className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <p className="font-medium">Error loading vehicles</p>
                <p className="text-sm">{error}</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={fetchVehicles}
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Vehicle Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <Skeleton className="w-full h-48 rounded-t-xl" />
                    <div className="p-4">
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-10" />
                      </div>
                      <Skeleton className="h-5 w-1/2 mt-2" />
                      <div className="flex mt-4 gap-2">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 w-10" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {vehicles.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {vehicles.map((v) => (
                        <VehicleCard key={v.id} vehicle={v} />
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-8 flex justify-center">
                        <Pagination>
                          <PaginationContent>
                            {getPaginationItems()}
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                    <div className="mx-auto mb-5">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
                        <FaCar className="text-gray-400 text-xl" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No vehicles found
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Try adjusting your filters or search terms
                    </p>
                    <Button
                      variant="outline"
                      className="mt-5 px-5 py-2 text-gray-700"
                      onClick={clearAllFilters}
                    >
                      Reset Filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}