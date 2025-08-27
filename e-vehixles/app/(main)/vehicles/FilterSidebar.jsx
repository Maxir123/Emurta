"use client";
import React, { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FaChevronDown } from "react-icons/fa";
import { getVehicleFilters } from "@/action/vehicles-listing";

/* ---------- Local enums / option sets (guaranteed fallback) ---------- */

const VehicleCondition = {
  NEW: { value: "NEW", label: "New" },
  USED: { value: "USED", label: "Used" },
  FOREIGN_USED: { value: "FOREIGN_USED", label: "Foreign Used" },
  LOCAL_USED: { value: "LOCAL_USED", label: "Local Used" },
};

const TransmissionType = {
  MANUAL: { value: "MANUAL", label: "Manual" },
  AUTOMATIC: { value: "AUTOMATIC", label: "Automatic" },
  SEMI_AUTOMATIC: { value: "SEMI_AUTOMATIC", label: "Semi-Automatic" },
};

const Colors = {
  BLACK: { value: "BLACK", label: "Black", color: "#000000" },
  WHITE: { value: "WHITE", label: "White", color: "#FFFFFF" },
  SILVER: { value: "SILVER", label: "Silver", color: "#C0C0C0" },
  RED: { value: "RED", label: "Red", color: "#FF0000" },
  BLUE: { value: "BLUE", label: "Blue", color: "#0000FF" },
  GREEN: { value: "GREEN", label: "Green", color: "#008000" },
  YELLOW: { value: "YELLOW", label: "Yellow", color: "#FFFF00" },
  ORANGE: { value: "ORANGE", label: "Orange", color: "#FFA500" },
  PURPLE: { value: "PURPLE", label: "Purple", color: "#800080" },
  BROWN: { value: "BROWN", label: "Brown", color: "#A52A2A" },
  GRAY: { value: "GRAY", label: "Gray", color: "#808080" },
};

const NigerianState = {
  ABIA: { value: "ABIA", label: "Abia" },
  ADAMAWA: { value: "ADAMAWA", label: "Adamawa" },
  AKWA_IBOM: { value: "AKWA_IBOM", label: "Akwa Ibom" },
  ANAMBRA: { value: "ANAMBRA", label: "Anambra" },
  BAUCHI: { value: "BAUCHI", label: "Bauchi" },
  BAYELSA: { value: "BAYELSA", label: "Bayelsa" },
  BENUE: { value: "BENUE", label: "Benue" },
  BORNO: { value: "BORNO", label: "Borno" },
  CROSS_RIVER: { value: "CROSS_RIVER", label: "Cross River" },
  DELTA: { value: "DELTA", label: "Delta" },
  EBONYI: { value: "EBONYI", label: "Ebonyi" },
  EDO: { value: "EDO", label: "Edo" },
  EKITI: { value: "EKITI", label: "Ekiti" },
  ENUGU: { value: "ENUGU", label: "Enugu" },
  FCT: { value: "FCT", label: "FCT" },
  GOMBE: { value: "GOMBE", label: "Gombe" },
  IMO: { value: "IMO", label: "Imo" },
  JIGAWA: { value: "JIGAWA", label: "Jigawa" },
  KADUNA: { value: "KADUNA", label: "Kaduna" },
  KANO: { value: "KANO", label: "Kano" },
  KATSINA: { value: "KATSINA", label: "Katsina" },
  KEBBI: { value: "KEBBI", label: "Kebbi" },
  KOGI: { value: "KOGI", label: "Kogi" },
  KWARA: { value: "KWARA", label: "Kwara" },
  LAGOS: { value: "LAGOS", label: "Lagos" },
  NASARAWA: { value: "NASARAWA", label: "Nasarawa" },
  NIGER: { value: "NIGER", label: "Niger" },
  OGUN: { value: "OGUN", label: "Ogun" },
  ONDO: { value: "ONDO", label: "Ondo" },
  OSUN: { value: "OSUN", label: "Osun" },
  OYO: { value: "OYO", label: "Oyo" },
  PLATEAU: { value: "PLATEAU", label: "Plateau" },
  RIVERS: { value: "RIVERS", label: "Rivers" },
  SOKOTO: { value: "SOKOTO", label: "Sokoto" },
  TARABA: { value: "TARABA", label: "Taraba" },
  YOBE: { value: "YOBE", label: "Yobe" },
  ZAMFARA: { value: "ZAMFARA", label: "Zamfara" },
};

const FuelType = {
  PETROL: { value: "PETROL", label: "Petrol" },
  DIESEL: { value: "DIESEL", label: "Diesel" },
  ELECTRIC: { value: "ELECTRIC", label: "Electric" },
  HYBRID: { value: "HYBRID", label: "Hybrid" },
  CNG: { value: "CNG", label: "CNG" },
};

/* ----------------- FilterSidebar Component ----------------- */

export default function FilterSidebar({
  priceRange,
  setPriceRange,
  yearRange,
  setYearRange,
  selectedType,
  setSelectedType,
  vehicleTypes,
  selectedFuel,
  setSelectedFuel,
  selectedCondition,
  setSelectedCondition,
  selectedState,
  setSelectedState,
  selectedTransmission,
  setSelectedTransmission,
  selectedColor,
  setSelectedColor,
  verifiedOnly,
  setVerifiedOnly,
  filterOptions, // optional: if parent already fetched these
}) {
  const [openSections, setOpenSections] = useState({
    type: true,
    price: true,
    year: true,
    condition: true,
    transmission: true,
    color: true,
    verified: true,
    location: true,
  });

  // Initialize filters using local enums as a safe fallback
  const [filters, setFilters] = useState({
    priceMin: filterOptions?.priceRange?.min ?? 0,
    priceMax: filterOptions?.priceRange?.max ?? 1000000000,
    yearMin: filterOptions?.yearRange?.min ?? 1990,
    yearMax: filterOptions?.yearRange?.max ?? new Date().getFullYear(),
    conditions: Object.values(VehicleCondition).map((c) => c.value),
    transmissions: Object.values(TransmissionType).map((t) => t.value),
    colors: Object.keys(Colors), // keys are the values (BLACK, WHITE, ...)
    states: Object.values(NigerianState).map((s) => s.value),
    fuelTypes: Object.values(FuelType).map((f) => f.value),
  });

  useEffect(() => {
    // If parent provided filterOptions (Marketplace already fetched), prefer those values.
    if (filterOptions && filterOptions.priceRange && filterOptions.yearRange) {
      setFilters((prev) => ({
        ...prev,
        priceMin: filterOptions.priceRange.min ?? prev.priceMin,
        priceMax: filterOptions.priceRange.max ?? prev.priceMax,
        yearMin: filterOptions.yearRange.min ?? prev.yearMin,
        yearMax: filterOptions.yearRange.max ?? prev.yearMax,
        // keep the enum lists from local fallbacks (they're stable and safe)
      }));

      // update ranges in parent too if they haven't been set
      if (Array.isArray(priceRange) && (priceRange[0] === 0 && priceRange[1] === 70000000)) {
        setPriceRange([filterOptions.priceRange.min, filterOptions.priceRange.max]);
      }
      if (Array.isArray(yearRange) && (yearRange[0] === 2010 && yearRange[1] === 2024)) {
        setYearRange([filterOptions.yearRange.min, filterOptions.yearRange.max]);
      }
      return;
    }

    // Otherwise fetch options ourselves (non-blocking). If the fetch fails, we'll keep local enum fallbacks.
    let mounted = true;
    (async () => {
      try {
        const res = await getVehicleFilters();
        if (!mounted) return;
        if (res?.success && res.data) {
          setFilters((prev) => ({
            ...prev,
            priceMin: res.data.priceRange?.min ?? prev.priceMin,
            priceMax: res.data.priceRange?.max ?? prev.priceMax,
            yearMin: res.data.yearRange?.min ?? prev.yearMin,
            yearMax: res.data.yearRange?.max ?? prev.yearMax,
            // Use DB-derived distinct values where sensible (but keep enum fallbacks for things like condition/colors)
            // res.data.fuelTypes and res.data.transmissions may contain enum values - prefer those if present
            fuelTypes: Array.isArray(res.data.fuelTypes) && res.data.fuelTypes.length > 0
              ? res.data.fuelTypes.map((f) => String(f))
              : prev.fuelTypes,
            transmissions: Array.isArray(res.data.transmissions) && res.data.transmissions.length > 0
              ? res.data.transmissions.map((t) => String(t))
              : prev.transmissions,
            bodyTypes: Array.isArray(res.data.bodyTypes) && res.data.bodyTypes.length > 0
              ? res.data.bodyTypes.map((b) => String(b))
              : prev.bodyTypes,
            makes: Array.isArray(res.data.makes) && res.data.makes.length > 0
              ? res.data.makes.map((m) => String(m))
              : prev.makes,
          }));
          // if parent didn't set price/year ranges earlier, set them now
          if (!filterOptions) {
            setPriceRange([res.data.priceRange.min, res.data.priceRange.max]);
            setYearRange([res.data.yearRange.min, res.data.yearRange.max]);
          }
        }
      } catch (e) {
        // ignore — we already have local enum fallbacks so UI will still render
        console.warn("Failed to fetch filter options (sidebar):", e?.message || e);
      }
    })();

    return () => { mounted = false; };
  }, [filterOptions]);

  function toggleSection(section) {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  const sectionContainer = "bg-white rounded-lg shadow-sm mb-4 overflow-hidden";
  const headerBase = "w-full flex justify-between items-center px-4 py-2 cursor-pointer";

  return (
    <div className="space-y-4">
      {/* VEHICLE TYPE */}
      <div className={sectionContainer}>
        <button
          onClick={() => toggleSection("type")}
          className={`${headerBase} bg-blue-50 hover:bg-blue-100 transition`}
        >
          <span className="text-base font-medium text-blue-700">Vehicle Type</span>
          <FaChevronDown
            className={`text-blue-700 transition-transform duration-300 ${openSections.type ? "rotate-180" : ""}`}
          />
        </button>
        {openSections.type && (
          <div className="p-4 space-y-2">
            {vehicleTypes.map((type) => (
              <div
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors hover:bg-blue-50 ${
                  selectedType === type.value ? "bg-blue-100 border border-blue-200" : ""
                }`}
              >
                {type.icon}
                <span className="ml-2 text-sm text-gray-700">{type.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FUEL TYPE */}
      <div className={sectionContainer}>
        <button
          onClick={() => toggleSection("fuel")}
          className={`${headerBase} bg-orange-50 hover:bg-orange-100 transition`}
        >
          <span className="text-base font-medium text-orange-700">Fuel Type</span>
          <FaChevronDown className={`text-orange-700 transition-transform duration-300 ${openSections.fuel ? "rotate-180" : ""}`} />
        </button>
        {openSections.fuel && (
          <div className="p-4 space-y-2">
            {filters.fuelTypes.map((fuel) => {
              const fuelInfo = FuelType[fuel] ?? { value: fuel, label: fuel };
              return (
                <div
                  key={fuel}
                  onClick={() => setSelectedFuel(fuel)}
                  className={`p-2 rounded-lg cursor-pointer hover:bg-orange-50 ${
                    selectedFuel === fuel ? "bg-orange-100 border border-orange-200" : ""
                  }`}
                >
                  <span className="text-sm text-gray-800">{fuelInfo.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PRICE RANGE */}
      <div className={sectionContainer}>
        <button
          onClick={() => toggleSection("price")}
          className={`${headerBase} bg-green-50 hover:bg-green-100 transition`}
        >
          <span className="text-base font-medium text-green-700">Price Range (₦)</span>
          <FaChevronDown className={`text-green-700 transition-transform duration-300 ${openSections.price ? "rotate-180" : ""}`} />
        </button>
        {openSections.price && (
          <div className="p-4">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              min={filters.priceMin}
              max={filters.priceMax}
              step={500000}
              className="mb-3"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>₦{priceRange[0].toLocaleString()}</span>
              <span>₦{priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* YEAR RANGE */}
      <div className={sectionContainer}>
        <button
          onClick={() => toggleSection("year")}
          className={`${headerBase} bg-purple-50 hover:bg-purple-100 transition`}
        >
          <span className="text-base font-medium text-purple-700">Year of Manufacture</span>
          <FaChevronDown className={`text-purple-700 transition-transform duration-300 ${openSections.year ? "rotate-180" : ""}`} />
        </button>
        {openSections.year && (
          <div className="p-4">
            <Slider
              value={yearRange}
              onValueChange={setYearRange}
              min={filters.yearMin}
              max={filters.yearMax}
              step={1}
              className="mb-3"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{yearRange[0]}</span>
              <span>{yearRange[1]}</span>
            </div>
          </div>
        )}
      </div>

      {/* CONDITION */}
      <div className={sectionContainer}>
        <button
          onClick={() => toggleSection("condition")}
          className={`${headerBase} bg-yellow-50 hover:bg-yellow-100 transition`}
        >
          <span className="text-base font-medium text-yellow-700">Condition</span>
          <FaChevronDown className={`text-yellow-700 transition-transform duration-300 ${openSections.condition ? "rotate-180" : ""}`} />
        </button>
        {openSections.condition && (
          <div className="p-4 space-y-2">
            {filters.conditions.map((cond) => {
              const conditionInfo = VehicleCondition[cond] ?? { value: cond, label: cond };
              return (
                <div
                  key={cond}
                  onClick={() => setSelectedCondition(cond)}
                  className={`p-2 rounded-lg cursor-pointer hover:bg-yellow-50 ${
                    selectedCondition === cond ? "bg-yellow-100 border border-yellow-200" : ""
                  }`}
                >
                  <span className="text-sm text-gray-800">{conditionInfo.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TRANSMISSION */}
      <div className={sectionContainer}>
        <button
          onClick={() => toggleSection("transmission")}
          className={`${headerBase} bg-pink-50 hover:bg-pink-100 transition`}
        >
          <span className="text-base font-medium text-pink-700">Transmission</span>
          <FaChevronDown className={`text-pink-700 transition-transform duration-300 ${openSections.transmission ? "rotate-180" : ""}`} />
        </button>
        {openSections.transmission && (
          <div className="p-4 space-y-2">
            {filters.transmissions.map((trans) => {
              const transmissionInfo = TransmissionType[trans] ?? { value: trans, label: trans };
              return (
                <div
                  key={trans}
                  onClick={() => setSelectedTransmission(trans)}
                  className={`p-2 rounded-lg cursor-pointer hover:bg-pink-50 ${
                    selectedTransmission === trans ? "bg-pink-100 border border-pink-200" : ""
                  }`}
                >
                  <span className="text-sm text-gray-800">{transmissionInfo.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* COLOR */}
      <div className={sectionContainer}>
        <button
          onClick={() => toggleSection("color")}
          className={`${headerBase} bg-indigo-50 hover:bg-indigo-100 transition`}
        >
          <span className="text-base font-medium text-indigo-700">Color</span>
          <FaChevronDown className={`text-indigo-700 transition-transform duration-300 ${openSections.color ? "rotate-180" : ""}`} />
        </button>
        {openSections.color && (
          <div className="p-4 grid grid-cols-2 gap-2">
            {filters.colors.map((clr) => {
              const colorInfo = Colors[clr] ?? { color: "#CCCCCC", label: clr };
              return (
                <div
                  key={clr}
                  onClick={() => setSelectedColor(clr)}
                  className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-indigo-50 ${
                    selectedColor === clr ? "ring-2 ring-indigo-500" : ""
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full mr-2 border border-gray-300"
                    style={{ backgroundColor: colorInfo.color }}
                  />
                  <span className="text-sm text-gray-800">{colorInfo.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* VERIFIED */}
      <div className={sectionContainer}>
        <button
          onClick={() => toggleSection("verified")}
          className={`${headerBase} bg-teal-50 hover:bg-teal-100 transition`}
        >
          <span className="text-base font-medium text-teal-700">Verified Sellers</span>
          <FaChevronDown className={`text-teal-700 transition-transform duration-300 ${openSections.verified ? "rotate-180" : ""}`} />
        </button>
        {openSections.verified && (
          <div className="p-4 flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={verifiedOnly}
              onCheckedChange={() => setVerifiedOnly(!verifiedOnly)}
            />
            <Label htmlFor="verified" className="text-sm text-gray-700">
              Verified Only
            </Label>
          </div>
        )}
      </div>

      {/* LOCATION */}
      <div className={sectionContainer}>
        <button
          onClick={() => toggleSection("location")}
          className={`${headerBase} bg-gray-50 hover:bg-gray-100 transition`}
        >
          <span className="text-base font-medium text-gray-700">Location</span>
          <FaChevronDown className={`text-gray-700 transition-transform duration-300 ${openSections.location ? "rotate-180" : ""}`} />
        </button>
        {openSections.location && (
          <div className="p-4">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {filters.states.map((st) => {
                  const stateInfo = NigerianState[st] ?? { value: st, label: st };
                  return (
                    <SelectItem key={st} value={st}>
                      {stateInfo.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
