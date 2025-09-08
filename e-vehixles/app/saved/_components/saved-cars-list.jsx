"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CarCard } from "@/components/car-card";
import { Heart, Search, ArrowRight, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// server actions (already in your server code)
import { getSavedVehicles, toggleSavedVehicle } from "@/action/vehicles-listing";

export function SavedCarsList({ initialData }) {
  // initialData may be server-provided — we'll use it as a fast-first render but then
  // refresh from the server on mount to ensure canonical state.
  const [savedCars, setSavedCars] = useState(initialData?.data || []);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [inFlight, setInFlight] = useState({}); // map id -> boolean for per-item requests

  // helper: load saved vehicles from server action
  const loadSaved = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getSavedVehicles();
      if (res && res.success && Array.isArray(res.data)) {
        // server returns flattened vehicle objects (see your server action)
        setSavedCars(res.data.map((v) => ({ ...v })));
      } else {
        // unauthorized or no data -> empty list
        setSavedCars([]);
        if (res && !res.success && res.error) {
          // optionally notify only when it's an actual error (not unauthorized)
          console.warn("getSavedVehicles:", res.error);
        }
      }
    } catch (err) {
      console.error("Failed to load saved vehicles:", err);
      toast.error("Failed to load saved cars");
      setSavedCars([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // on mount, if no initialData or to refresh canonical state, fetch
  useEffect(() => {
    // If initialData provided, use it as a fast initial render then refresh.
    if (!initialData) {
      loadSaved();
    } else {
      // still refresh so client sees latest DB state (user might have toggled elsewhere)
      // small delay to allow immediate render from initialData
      setTimeout(() => loadSaved(), 300);
    }
  }, [initialData, loadSaved]);

  // Filter + sort (client-side)
  const filteredCars = savedCars
    .filter((car) =>
      [car.make, car.model, String(car.year)]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest") return (b.year || 0) - (a.year || 0);
      if (sortBy === "oldest") return (a.year || 0) - (b.year || 0);
      if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
      if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
      return 0;
    });

  // Unsave handler: call toggleSavedVehicle then remove from local list on success
  const handleUnsave = async (carId) => {
    if (!carId) return;
    // prevent double click
    if (inFlight[carId]) return;

    setInFlight((m) => ({ ...m, [carId]: true }));

    // optimistic removal? We'll wait for server to confirm to keep canonical state
    try {
      const res = await toggleSavedVehicle(carId);
      if (!res || !res.success) {
        toast.error(res?.error || "Failed to remove saved vehicle");
        return;
      }

      // res.saved === false means server removed it (good), update local state
      if (res.saved === false) {
        setSavedCars((list) => list.filter((c) => Number(c.id) !== Number(carId)));
        toast.success("Removed from saved cars");
      } else {
        // if server returns saved:true unexpectedly, refresh canonical list
        await loadSaved();
        toast.success(res.saved ? "Saved" : "Removed");
      }
    } catch (err) {
      console.error("toggleSavedVehicle error:", err);
      toast.error("Error updating saved state");
    } finally {
      setInFlight((m) => {
        const copy = { ...m };
        delete copy[carId];
        return copy;
      });
    }
  };

  // If CarCard exposes a prop like `onToggleSaved` you can pass handleUnsave so a heart inside CarCard will update this list.
  // We'll pass onToggleSaved for that purpose — if CarCard doesn't accept it, you can wire your own unsave UI here.

  // UI: empty saved list
  if (!isLoading && filteredCars.length === 0 && searchQuery === "") {
    return (
            <div className="container max-w-4xl py-8 mx-auto px-4 ">
        <Card className="border-0 shadow-none text-center">
          <CardContent className="pt-12 pb-8">
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-50 to-rose-50">
                <Heart className="h-10 w-10 text-rose-500" />
              </div>
            </div>
            <CardTitle className="text-xl font-semibold mb-2">
              No saved cars yet
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              You haven't saved any cars yet. Browse our premium collection and click
              the heart icon to save your favorites.
            </CardDescription>
            <Button asChild className="mt-6">
              <Link href="/Vehicle">
                <Search className="mr-2 h-4 w-4" />
                Browse Cars
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

    );
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Saved Cars</h1>
          <p className="text-gray-600">
            {filteredCars.length} {filteredCars.length === 1 ? "vehicle" : "vehicles"} saved for later
          </p>
        </div>

        {/* Search and filter bar */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100/50">
          <CardContent className="pt-1">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input placeholder="Search saved cars..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" asChild>
                  <Link href="/cars">
                    <Search className="mr-2 h-4 w-4" />
                    Find More
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No results for search */}
        {!isLoading && filteredCars.length === 0 && searchQuery !== "" && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md">
              <CardContent className="flex flex-col items-center py-12 text-center">
                <Search className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No matching cars found</h3>
                <p className="text-gray-600 mb-4">No saved cars match your search for "{searchQuery}". Try adjusting your search terms.</p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Saved cars grid */}
        {!isLoading && filteredCars.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map((car) => (
                // IMPORTANT: pass the actual car object returned by the server.
                // If CarCard accepts an onToggleSaved or onUnsave prop, we hook it up so unsaving updates this list.
                <CarCard
                  key={car.id}
                  car={{ ...car, wishlisted: true }} // saved list items are saved; use server-provided fields if present
                  className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  onToggleSaved={() => handleUnsave(car.id)} // only works if CarCard calls this prop on heart click
                />
              ))}
            </div>

            {filteredCars.length >= 6 && (
              <div className="flex justify-center mt-6">
                <Button variant="outline" asChild>
                  <Link href="/vehicles">
                    Browse More Cars
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
