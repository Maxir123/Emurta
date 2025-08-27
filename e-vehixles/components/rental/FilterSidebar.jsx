"use client";

import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FaChevronDown, FaFilter, FaTimes } from "react-icons/fa";

const VEHICLE_TYPES = [
  "ALL", "CAR", "TRUCK", "MOTORCYCLE", "BOAT", 
  "KEKE", "CONSTRUCTION", "OTHER",
];

const NIGERIAN_STATES = [
  "ALL", "ABIA", "ADAMAWA", "AKWA_IBOM", "ANAMBRA", "BAUCHI", 
  "BAYELSA", "BENUE", "BORNO", "CROSS_RIVER", "DELTA", "EBONYI", 
  "EDO", "EKITI", "ENUGU", "FCT", "GOMBE", "IMO", "JIGAWA", 
  "KADUNA", "KANO", "KATSINA", "KEBBI", "KOGI", "KWARA", "LAGOS", 
  "NASARAWA", "NIGER", "OGUN", "ONDO", "OSUN", "OYO", "PLATEAU", 
  "RIVERS", "SOKOTO", "TARABA", "YOBE", "ZAMFARA",
];

const FilterSection = ({ title, isOpen, onToggle, children }) => (
  <div className="border-b border-gray-200 dark:border-gray-700 py-3">
    <button
      className="w-full flex justify-between items-center py-2 text-left font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      onClick={onToggle}
    >
      <span className="text-sm font-semibold">{title}</span>
      <FaChevronDown
        className={`transform transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        } text-gray-500`}
        size={14}
      />
    </button>
    {isOpen && <div className="pt-2 pb-3">{children}</div>}
  </div>
);

export default function FilterSidebar({ filters = {}, onChange }) {
  const [openSections, setOpenSections] = useState({
    type: false,
    location: false,
    price: false,
    year: false
  });
  const [localFilters, setLocalFilters] = useState({
    q: "",
    mode: "sale",
    type: "ALL",
    location: "ALL",
    price: [0, 1_000_000],
    minYear: 1900,
    maxYear: new Date().getFullYear() + 1,
    featured: false,
    sort: "newest",
    ...filters
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ 
      ...prev, 
      [section]: !prev[section] 
    }));
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onChange?.(key, value);
  };

  const handleApply = () => onChange?.("apply", localFilters);
  const handleReset = () => {
    const resetFilters = {
      ...localFilters,
      type: "ALL",
      location: "ALL",
      price: [0, 1_000_000],
      minYear: 1900,
      maxYear: new Date().getFullYear() + 1,
      featured: false,
      sort: "newest",
    };
    setLocalFilters(resetFilters);
    onChange?.("reset", resetFilters);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl shadow-lg p-5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FaFilter size={16} className="text-blue-600" />
          
        </h2>
        <button 
          onClick={handleReset}
          className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 flex items-center gap-1"
        >
          <FaTimes size={12} />
          Clear all
        </button>
      </div>

      <div className="space-y-1">
        {/* Vehicle Type Filter - Now as a compact dropdown */}
        <div className="pb-3">
          <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
            Vehicle Type
          </label>
          <select
            value={localFilters.type}
            onChange={(e) => updateFilter("type", e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {VEHICLE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === "ALL" ? "All Vehicle Types" : type}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <FilterSection
          title="Location"
          isOpen={openSections.location}
          onToggle={() => toggleSection('location')}
        >
          <div className="max-h-48 overflow-auto space-y-2">
            {NIGERIAN_STATES.map((state) => (
              <div key={state} className="flex items-center space-x-2">
                <Checkbox
                  id={`loc-${state}`}
                  checked={localFilters.location === state}
                  onCheckedChange={() => updateFilter("location", state)}
                />
                <Label htmlFor={`loc-${state}`} className="text-sm">
                  {state === "ALL" ? "All States" : state.replace("_", " ")}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Price Filter */}
        <FilterSection
          title="Price Range (₦)"
          isOpen={openSections.price}
          onToggle={() => toggleSection('price')}
        >
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              ₦{localFilters.price[0].toLocaleString()} - ₦
              {localFilters.price[1].toLocaleString()}
            </div>
            <Slider
              value={localFilters.price}
              min={0}
              max={1_500_000}
              step={100000}
              onValueChange={(value) => updateFilter("price", value)}
              className="my-4"
            />
            <div className="flex gap-3">
              <Input
                type="number"
                value={localFilters.price[0]}
                onChange={(e) => updateFilter("price", [
                  Number(e.target.value) || 0,
                  localFilters.price[1]
                ])}
                className="dark:bg-gray-800 text-sm"
                placeholder="Min price"
              />
              <Input
                type="number"
                value={localFilters.price[1]}
                onChange={(e) => updateFilter("price", [
                  localFilters.price[0],
                  Number(e.target.value) || 0
                ])}
                className="dark:bg-gray-800 text-sm"
                placeholder="Max price"
              />
            </div>
          </div>
        </FilterSection>

        {/* Year Filter */}
        <FilterSection
          title="Manufacturing Year"
          isOpen={openSections.year}
          onToggle={() => toggleSection('year')}
        >
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              value={localFilters.minYear}
              onChange={(e) => updateFilter("minYear", Number(e.target.value) || 1900)}
              className="dark:bg-gray-800 text-sm"
              placeholder="Min year"
            />
            <Input
              type="number"
              value={localFilters.maxYear}
              onChange={(e) => updateFilter("maxYear", Number(e.target.value) || new Date().getFullYear() + 1)}
              className="dark:bg-gray-800 text-sm"
              placeholder="Max year"
            />
          </div>
        </FilterSection>

        {/* Featured Filter */}
        <div className="flex items-center space-x-2 py-3">
          <Checkbox
            id="featured"
            checked={localFilters.featured}
            onCheckedChange={(checked) => updateFilter("featured", checked)}
          />
          <Label htmlFor="featured" className="text-sm font-medium">
            Featured Listings Only
          </Label>
        </div>

        {/* Sort Filter */}
        <div className="space-y-2 pt-2">
          <Label className="text-sm font-semibold">Sort By</Label>
          <select
            value={localFilters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="year_desc">Year: Newest First</option>
          </select>
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md font-medium"
      >
        Apply Filters
      </button>
    </div>
  );
}