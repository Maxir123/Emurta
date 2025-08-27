"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CarCard } from "@/components/car-card";
import { Heart, Search, ArrowRight, Car, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SavedCarsList({ initialData }) {
  const [savedCars, setSavedCars] = useState(initialData?.data || []);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  
  // Simulate loading state
  useEffect(() => {
    if (initialData?.data) {
      const timer = setTimeout(() => {
        setSavedCars(initialData.data);
        setIsLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [initialData]);

  // Filter and sort cars based on user input
  const filteredCars = savedCars
    .filter(car => 
      car.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.year?.toString().includes(searchQuery)
    )
    .sort((a, b) => {
      if (sortBy === "newest") return b.year - a.year;
      if (sortBy === "oldest") return a.year - b.year;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "price-low") return a.price - b.price;
      return 0;
    });

  // No saved cars
  if (!isLoading && filteredCars.length === 0 && searchQuery === "") {
    return (
      <div className="container max-w-4xl py-8">
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
              You haven't saved any cars yet. Browse our premium collection and click the heart icon to save your favorites.
            </CardDescription>
            <Button asChild className="mt-6">
              <Link href="/cars">
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
            {filteredCars.length} {filteredCars.length === 1 ? 'vehicle' : 'vehicles'} saved for later
          </p>
        </div>

        {/* Search and filter bar */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100/50">
          <CardContent className="pt-1">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search saved cars..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
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
        <p className="text-gray-600 mb-4">
          No saved cars match your search for "{searchQuery}". Try adjusting your search terms.
        </p>
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
                <CarCard 
                  key={car.id} 
                  car={{ ...car, wishlisted: true }} 
                  className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
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