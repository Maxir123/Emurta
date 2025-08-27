"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { AlertCircle, Calendar } from "lucide-react";
import {
  Car,
  Fuel,
  Gauge,
  LocateFixed,
  Share2,
  Heart,
  MessageSquare,
  Currency,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// server action you already have
import { formatCurrency } from "@/lib/helpers";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toggleSavedVehicle } from "@/action/vehicles-listing";
import EmiCalculator from "./emi-calculator";

/**
 * VehicleDetails component
 *
 * Props:
 * - vehicle: Vehicle object from your API (include owner & images ideally)
 * - inspectionInfo: {
 *     userInspection: { id, status, date } | null,
 *     dealership: { address, phone, email, WorkingHour | workingHours: [...] } | null
 *   }
 *
 * Notes:
 * - Expects toggleSavedVehicle(vehicleId) server action to exist and return:
 *   { success: boolean, saved: boolean, message?: string }
 * - Replace routes if your app uses different inspection routes.
 */
export default function VehicleDetails({ vehicle = {}, inspectionInfo = {} }) {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  // Normalize images (support array of urls or array of objects { url })
  const images =
    (vehicle.images?.map((i) => (typeof i === "string" ? i : i?.url)).filter(Boolean)) || [];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // initial wish state: prefer explicit property else infer from saved relations
  const initialWish = vehicle.isWishlisted ?? (vehicle.savedByUsers ? vehicle.savedByUsers.length > 0 : false);
  const [isWishlisted, setIsWishlisted] = useState(Boolean(initialWish));
  const [savingVehicle, setSavingVehicle] = useState(false);

  // Keep state in sync if parent passes new vehicle prop
  useEffect(() => {
    const newWish = vehicle.isWishlisted ?? (vehicle.savedByUsers ? vehicle.savedByUsers.length > 0 : false);
    setIsWishlisted(Boolean(newWish));
  }, [vehicle.isWishlisted, vehicle.savedByUsers]);

  // Toggle saved using your server action with optimistic UI
  const handleSaveVehicle = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to save vehicles");
      router.push("/sign-in");
      return;
    }

    if (savingVehicle) return;

    const prev = isWishlisted;
    setIsWishlisted(!prev);
    setSavingVehicle(true);

    try {
      const res = await toggleSavedVehicle(vehicle.id); // server action
      // expected shape: { success: boolean, saved: boolean, message?: string }
      if (!res || !res.success) {
        setIsWishlisted(prev);
        toast.error(res?.message || "Failed to update saved vehicles");
      } else {
        setIsWishlisted(Boolean(res.saved));
        if (res.message) toast.success(res.message);
      }
    } catch (err) {
      console.error("toggleSavedVehicle error:", err);
      setIsWishlisted(prev);
      toast.error("Failed to update favorites");
    } finally {
      setSavingVehicle(false);
    }
  };

  // Sharing helpers
  const copyToClipboard = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: `${vehicle.year ?? ""} ${vehicle.make ?? ""} ${vehicle.model ?? ""}`,
          text: `Check out this ${vehicle.year ?? ""} ${vehicle.make ?? ""} ${vehicle.model ?? ""} on Vehiql!`,
          url: typeof window !== "undefined" ? window.location.href : "",
        })
        .catch(() => copyToClipboard());
    } else {
      copyToClipboard();
    }
  };

  // Book inspection route (change if your app uses a different path)
  const handleBookInspection = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to book an inspection");
      router.push("/sign-in");
      return;
    }
    router.push(`/inspection/${vehicle.id}`);
  };

  // Normalize dealership & working hours shape (DealershipInfo uses WorkingHour)
  const dealership = inspectionInfo?.dealership ?? null;
  const workingHours = dealership?.WorkingHour ?? dealership?.workingHours ?? null;

  // Display helpers
  const displayMileage = vehicle.mileage ? vehicle.mileage.toLocaleString() : "N/A";
  const displayFuel = vehicle.fuelType ?? "N/A";
  const displayTransmission = vehicle.transmission ?? "N/A";
  const displaySeats = vehicle.seatingCapacity ?? vehicle.seats ?? null;
  const isUnavailable =
    vehicle.status === "SOLD" || vehicle.status === "MAINTENANCE" || vehicle.status === "RENTED";

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Image Gallery */}
        <div className="w-full lg:w-7/12">
          <div className="aspect-video rounded-lg overflow-hidden relative mb-4">
            {images && images.length > 0 ? (
              <Image
                src={images[currentImageIndex]}
                alt={`${vehicle.year ?? ""} ${vehicle.make ?? ""} ${vehicle.model ?? ""}`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Car className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images && images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer rounded-md h-20 w-24 flex-shrink-0 transition ${
                    index === currentImageIndex ? "border-2 border-blue-600" : "opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={image}
                    alt={`${vehicle.make ?? ""} ${vehicle.model ?? ""} - view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Secondary Actions */}
          <div className="flex mt-4 gap-4">
            <Button
              variant="outline"
              className={`flex items-center gap-2 flex-1 ${isWishlisted ? "text-red-500" : ""}`}
              onClick={handleSaveVehicle}
              disabled={savingVehicle}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500" : ""}`} />
              {isWishlisted ? "Saved" : "Save"}
            </Button>

            <Button variant="outline" className="flex items-center gap-2 flex-1" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
              Share
            </Button>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="w-full lg:w-5/12">
          <div className="flex items-center justify-between">
            <Badge className="mb-2">{vehicle.bodyType ?? "N/A"}</Badge>
          </div>

          <h1 className="text-4xl font-bold mb-1">
            {vehicle.year ?? ""} {vehicle.make ?? ""} {vehicle.model ?? ""}
          </h1>

          <div className="text-2xl font-bold text-blue-600">{formatCurrency(vehicle.price ?? 0)}</div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
            <div className="flex items-center gap-2">
              <Gauge className="text-gray-500 h-5 w-5" />
              <span>{displayMileage} miles</span>
            </div>
            <div className="flex items-center gap-2">
              <Fuel className="text-gray-500 h-5 w-5" />
              <span>{displayFuel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="text-gray-500 h-5 w-5" />
              <span>{displayTransmission}</span>
            </div>
          </div>

          {/* EMI Calculator dialog */}
          <Dialog>
            <DialogTrigger className="w-full text-start">
              <Card className="pt-5">
                <CardContent>
                  <div className="flex items-center gap-2 text-lg font-medium mb-2">
                    <Currency className="h-5 w-5 text-blue-600" />
                    <h3>EMI Calculator</h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    Estimated Monthly Payment:{" "}
                    <span className="font-bold text-gray-900">{formatCurrency((vehicle.price ?? 0) / 60)}</span> for 60 months
                  </div>
                  <div className="text-xs text-gray-500 mt-1">*Based on $0 down payment and 4.5% interest rate</div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Vehiql Car Loan Calculator</DialogTitle>
                <EmiCalculator price={vehicle.price ?? 0} />
              </DialogHeader>
            </DialogContent>
          </Dialog>

          {/* Request More Info */}
          <Card className="my-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-lg font-medium mb-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h3>Have Questions?</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Our representatives are available to answer all your queries about this vehicle.</p>
              <a href="mailto:help@vehiql.in">
                <Button variant="outline" className="w-full">
                  Request Info
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Status alert */}
          {isUnavailable && (
            <Alert variant="destructive">
              <AlertTitle className="capitalize">This vehicle is {String(vehicle.status).toLowerCase()}</AlertTitle>
              <AlertDescription>Please check again later.</AlertDescription>
            </Alert>
          )}

          {/* Book Inspection Button */}
          {!isUnavailable && (
            <Button
              className="w-full py-6 text-lg"
              onClick={handleBookInspection}
              disabled={Boolean(inspectionInfo?.userInspection)}
            >
              <Calendar className="mr-2 h-5 w-5" />
              {inspectionInfo?.userInspection
                ? `Inspection booked for ${format(new Date(inspectionInfo.userInspection.date), "EEEE, MMMM d, yyyy")}`
                : "Book Inspection"}
            </Button>
          )}
        </div>
      </div>

      {/* Details & Features Section */}
      <div className="mt-12 p-6 bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-6">Description</h3>
            <p className="whitespace-pre-line text-gray-700">{vehicle.description ?? "No description available."}</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-6">Features</h3>
            <ul className="grid grid-cols-1 gap-2">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                {displayTransmission} Transmission
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                {displayFuel} Engine
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                {vehicle.bodyType ?? "N/A"} Body Style
              </li>
              {displaySeats && (
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                  {displaySeats} Seats
                </li>
              )}
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                {vehicle.color ?? "N/A"} Exterior
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Specifications</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Make</span>
              <span className="font-medium">{vehicle.make ?? "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Model</span>
              <span className="font-medium">{vehicle.model ?? "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Year</span>
              <span className="font-medium">{vehicle.year ?? "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Body Type</span>
              <span className="font-medium">{vehicle.bodyType ?? "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Fuel Type</span>
              <span className="font-medium">{displayFuel}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Transmission</span>
              <span className="font-medium">{displayTransmission}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Mileage</span>
              <span className="font-medium">{displayMileage} miles</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Color</span>
              <span className="font-medium">{vehicle.color ?? "—"}</span>
            </div>
            {displaySeats && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Seats</span>
                <span className="font-medium">{displaySeats}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dealership Location Section */}
      <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Dealership Location</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            {/* Dealership Name and Address */}
            <div className="flex items-start gap-3">
              <LocateFixed className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium">{dealership?.name ?? "Vehiql Motors"}</h4>
                <p className="text-gray-600">{dealership?.address || "Not Available"}</p>
                <p className="text-gray-600 mt-1">Phone: {dealership?.phone || "Not Available"}</p>
                <p className="text-gray-600">Email: {dealership?.email || "Not Available"}</p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="md:w-1/2 lg:w-1/3">
              <h4 className="font-medium mb-2">Working Hours</h4>
              <div className="space-y-2">
                {workingHours && workingHours.length > 0
                  ? workingHours
                      .slice()
                      .sort((a, b) => {
                        const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
                        return days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek);
                      })
                      .map((day) => (
                        <div key={day.dayOfWeek} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {day.dayOfWeek.charAt(0) + day.dayOfWeek.slice(1).toLowerCase()}
                          </span>
                          <span>{day.isOpen ? `${day.openTime} - ${day.closeTime}` : "Closed"}</span>
                        </div>
                      ))
                  : // Default hours if none provided
                    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-gray-600">{day}</span>
                        <span>{index < 5 ? "9:00 - 18:00" : index === 5 ? "10:00 - 16:00" : "Closed"}</span>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
