"use client";
import React, { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FaSearch, FaFilter, FaTimes, FaCar, FaMoneyBill } from "react-icons/fa";

export default function SearchBar({ filters = {}, onChange = () => {} }) {
  const q = filters.q ?? "";
  const type = filters.type ?? "";
  const minPrice = filters.minPrice === undefined || filters.minPrice === null ? "" : String(filters.minPrice);
  const maxPrice = filters.maxPrice === undefined || filters.maxPrice === null ? "" : String(filters.maxPrice);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleText = useCallback((val) => onChange("q", val === "" ? undefined : val), [onChange]);
  const handleType = useCallback((val) => onChange("type", val === "" ? undefined : val), [onChange]);
  const handleMin = useCallback(
    (val) => {
      if (val === "") return onChange("minPrice", undefined);
      const n = Number(val);
      return onChange("minPrice", Number.isFinite(n) ? n : undefined);
    },
    [onChange]
  );
  const handleMax = useCallback(
    (val) => {
      if (val === "") return onChange("maxPrice", undefined);
      const n = Number(val);
      return onChange("maxPrice", Number.isFinite(n) ? n : undefined);
    },
    [onChange]
  );

  const clearFilters = useCallback(() => {
    onChange("q", undefined);
    onChange("type", undefined);
    onChange("minPrice", undefined);
    onChange("maxPrice", undefined);
  }, [onChange]);

  const hasActiveFilters = q || type || minPrice || maxPrice;

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
      {/* Main search row */}
      <div className="flex items-center gap-2 w-full">
        {/* Search Input - Always visible */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search vehicles or locations..."
            value={q}
            onChange={(e) => handleText(e.target.value)}
            className="pl-10 pr-10"
          />
          {q && (
            <button
              onClick={() => handleText("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Filter Toggle Button - Icon only on mobile */}
        <Button
          variant={isExpanded ? "default" : "outline"}
          size="icon"
          className="flex sm:hidden"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Hide filters" : "Show filters"}
        >
          <FaFilter />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
          )}
        </Button>

        {/* Full More Filters button for desktop */}
        <Button variant="default" className="hidden sm:flex items-center gap-2">
          <FaFilter />
          More Filters
        </Button>
      </div>

      {/* Expandable filters section */}
      <div className={`mt-4 grid grid-cols-1 gap-3 ${isExpanded ? "block" : "hidden"} sm:grid sm:grid-cols-12 sm:mt-3`}>
        {/* Vehicle Type Filter */}
        <div className="sm:col-span-5">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
            <FaCar className="text-gray-500 flex-shrink-0" />
            <Select value={type} onValueChange={(val) => handleType(val)}>
              <SelectTrigger className="w-full border-0 bg-transparent p-0 h-auto focus:ring-0">
                <SelectValue placeholder="All Vehicle Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="SUV">SUV</SelectItem>
                <SelectItem value="SEDAN">Sedan</SelectItem>
                <SelectItem value="TRUCK">Truck</SelectItem>
                <SelectItem value="COUPE">Coupe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="sm:col-span-5">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
            <FaMoneyBill className="text-gray-500 flex-shrink-0" />
            <div className="flex items-center gap-2 w-full">
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => handleMin(e.target.value)}
                className="border-0 bg-transparent p-0 h-7 w-20"
                min="0"
              />
              <span className="text-gray-500">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => handleMax(e.target.value)}
                className="border-0 bg-transparent p-0 h-7 w-20"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Clear filters button */}
        <div className="sm:col-span-2">
          <Button
            variant="outline"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="w-full h-10"
          >
            <span className="sm:hidden">Clear</span>
            <span className="hidden sm:inline">Clear Filters</span>
          </Button>
        </div>
      </div>
    </div>
  );
}