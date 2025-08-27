"use client";

import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { HiFilter } from "react-icons/hi";
import { X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import FilterSidebar from "@/components/rental/FilterSidebar";
import VehicleGrid from "@/components/rental/VehicleGrid";
import BookingModal from "@/components/rental/BookingModal";

export default function RentalsPage() {
  const [filters, setFilters] = useState({
    search: "",
    duration: "daily",
    type: "ALL",
    price: [0, 1500000],
    location: "ALL",
  });

  const [modalVehicle, setModalVehicle] = useState(null);

  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const openModal = (vehicle) => setModalVehicle(vehicle);
  const closeModal = () => setModalVehicle(null);

  const clearFilters = () => {
    setFilters({
      search: "",
      duration: "daily",
      type: "ALL",
      price: [0, 1500000],
      location: "ALL",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-24">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar (desktop) */}
          <div className="hidden lg:block w-full lg:w-72 flex-shrink-0">      
              <FilterSidebar filters={filters} onChange={updateFilter} />
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Search / Sort / Filter bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center gap-3 overflow-x-auto">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <FaSearch className="absolute top-3.5 left-3 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  placeholder="Search vehicles or locations..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Sort dropdown (desktop only) */}
              <div className="hidden sm:block">
                <Select
                  onValueChange={(val) => updateFilter("sort", val)}
                  value={filters.sort || ""}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low → High</SelectItem>
                    <SelectItem value="price-high">Price: High → Low</SelectItem>
                    <SelectItem value="year-new">Year: Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter drawer (mobile) */}
              <div className="sm:hidden shrink-0">
                <Drawer direction="bottom">
                  <DrawerTrigger asChild>
                    <Button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white">
                      <HiFilter className="text-sm" />
                      
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="h-[90vh] w-full rounded-t-2xl fixed bottom-0 left-0 shadow-xl z-50">
                    <div className="p-5 overflow-y-auto h-full">
                      <div className="flex justify-between items-center mb-5">
                        <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                        <DrawerTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <X className="text-gray-500" size={20} />
                          </Button>
                        </DrawerTrigger>
                      </div>
                      <FilterSidebar filters={filters} onChange={updateFilter} />
                      <div className="mt-6 flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={clearFilters}
                        >
                          Clear All
                        </Button>
                        <DrawerTrigger asChild>
                          <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                            Apply Filters
                          </Button>
                        </DrawerTrigger>
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>

            {/* Vehicle grid (search + filters applied) */}
            <VehicleGrid filters={filters} onBook={openModal} />
          </div>
        </div>
      </div>

      {/* Booking modal */}
      {modalVehicle && (
        <BookingModal vehicle={modalVehicle} onClose={closeModal} />
      )}
    </div>
  );
}
