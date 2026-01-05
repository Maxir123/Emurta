"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import {
  Car,
  Fuel,
  Gauge,
  LocateFixed,
  Share2,
  Heart,
  MessageSquare,
  Currency,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function VehicleDetails({ vehicle = {}, inspectionInfo = {} }) {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const images =
    (vehicle.images?.map((i) => (typeof i === "string" ? i : i?.url)).filter(Boolean)) || [];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // initial wish state
  const initialWish = Boolean(
    vehicle.saved ?? vehicle.isSaved ?? vehicle.wishlisted ?? (vehicle.savedByUsers?.length > 0)
  );
  const [isWishlisted, setIsWishlisted] = useState(initialWish);

  // per-button processing state
  const [isProcessing, setIsProcessing] = useState(false);

  // hasInspection local state (robust detection)
  const detectHasInspection = (inspectionInfoParam, vehicleParam) => {
    // 1) explicit userInspection object (preferred)
    if (inspectionInfoParam && (inspectionInfoParam.userInspection || inspectionInfoParam.userInspectionId)) return true;

    // 2) sometimes the server returns inspection directly on vehicle (userInspection or inspections array)
    if (vehicleParam) {
      if (vehicleParam.userInspection) return true;
      // any non-cancelled inspection present — this is conservative; server ideally should indicate per-user booking
      if (Array.isArray(vehicleParam.inspections) && vehicleParam.inspections.some((i) => i && i.status && i.status !== "CANCELLED")) return true;
    }
    return false;
  };

  const [hasInspection, setHasInspection] = useState(detectHasInspection(inspectionInfo, vehicle));

  // keep sync if parent updates vehicle or inspectionInfo
  useEffect(() => {
    const newWish = Boolean(
      vehicle.saved ?? vehicle.isSaved ?? vehicle.wishlisted ?? (vehicle.savedByUsers?.length > 0)
    );
    setIsWishlisted(newWish);

    // re-evaluate inspection presence whenever props change
    setHasInspection(detectHasInspection(inspectionInfo, vehicle));
  }, [vehicle, inspectionInfo]);

  // handle save/un-save using server action
  const handleSaveVehicle = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to save vehicles");
      router.push("/sign-in");
      return;
    }

    if (isProcessing) return;

    const previous = isWishlisted;
    setIsWishlisted(!previous);
    setIsProcessing(true);

    try {
      const res = await toggleSavedVehicle(vehicle.id);
      if (!res || !res.success) {
        setIsWishlisted(previous);
        const errMsg = res?.error || "Failed to update saved state";
        toast.error(errMsg);
      } else {
        setIsWishlisted(Boolean(res.saved));
        toast.success(res.saved ? "Saved" : "Removed");
      }
    } catch (err) {
      console.error("toggleSavedVehicle error:", err);
      setIsWishlisted(previous);
      toast.error("Error saving vehicle");
    } finally {
      setIsProcessing(false);
    }
  };

  /* ---------------------- rest of your component unchanged ---------------------- */
  const displayMileage = vehicle.mileage ? vehicle.mileage.toLocaleString() : "N/A";
  const displayFuel = vehicle.fuelType ?? "N/A";
  const displayTransmission = vehicle.transmission ?? "N/A";
  const displaySeats = vehicle.seatingCapacity ?? vehicle.seats ?? null;
  const isUnavailable =
    vehicle.status === "SOLD" || vehicle.status === "MAINTENANCE" || vehicle.status === "RENTED";

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
          text: `Check out this ${vehicle.year ?? ""} ${vehicle.make ?? ""} ${vehicle.model ?? ""}!`,
          url: typeof window !== "undefined" ? window.location.href : "",
        })
        .catch(() => copyToClipboard());
    } else {
      copyToClipboard();
    }
  };

  const handleBookInspection = () => {
    // double-check guard
    if (hasInspection) {
      toast.error("You already have an inspection booked for this vehicle.");
      return;
    }

    if (!isSignedIn) {
      toast.error("Please sign in to book an inspection");
      router.push("/sign-in");
      return;
    }

    // disable immediately to avoid double-click navigation
    setHasInspection(true);
    router.push(`/Inspection/${vehicle.id}`);
  };

  // derive a safe inspection date string if present
  const getInspectionDateString = () => {
    const ui = inspectionInfo?.userInspection ?? inspectionInfo ?? vehicle?.userInspection;
    // also check vehicle.inspections for a date
    if (!ui) {
      const found = Array.isArray(vehicle?.inspections) ? vehicle.inspections.find(i => i && i.status && i.status !== "CANCELLED") : null;
      if (found && found.date) return safeFormatDate(found.date);
      return null;
    }
    if (ui.date) return safeFormatDate(ui.date);
    return null;
  };

  const safeFormatDate = (d) => {
    try {
      const dt = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
      if (isNaN(dt)) return null;
      return format(dt, "EEEE, MMMM d, yyyy");
    } catch {
      return null;
    }
  };

  const inspectionDateString = getInspectionDateString();

  // UI
  const dealership = inspectionInfo?.dealership ?? null;
  const workingHours = dealership?.WorkingHour ?? dealership?.workingHours ?? null;

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* left column (images + save/share) */}
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

          {images && images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer rounded-md h-20 w-24 flex-shrink-0 transition ${index === currentImageIndex ? "border-2 border-blue-600" : "opacity-70 hover:opacity-100"}`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image src={image} alt={`${vehicle.make ?? ""} ${vehicle.model ?? ""} - view ${index + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="flex mt-4 gap-4">
            <Button
              variant="outline"
              className={`flex items-center gap-2 flex-1 ${isWishlisted ? "text-red-500" : ""}`}
              onClick={handleSaveVehicle}
              disabled={isProcessing}
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

        {/* right column (details & CTA) */}
        <div className="w-full lg:w-5/12">
          <div className="flex items-center justify-between">
            <Badge className="mb-2">{vehicle.bodyType ?? "N/A"}</Badge>
          </div>

          <h1 className="text-4xl font-bold mb-1">{vehicle.year ?? ""} {vehicle.make ?? ""} {vehicle.model ?? ""}</h1>

          <div className="text-2xl font-bold text-blue-600">{formatCurrency(vehicle.price ?? 0)}</div>

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

          {/* EMI dialog omitted for brevity */}
          <Dialog>
            <DialogTrigger className="w-full text-start">
              <Card className="pt-5">
                <CardContent>
                  <div className="flex items-center gap-2 text-lg font-medium mb-2">
                    <Currency className="h-5 w-5 text-blue-600" />
                    <h3>EMI Calculator</h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    Estimated Monthly Payment: <span className="font-bold text-gray-900">{formatCurrency((vehicle.price ?? 0) / 60)}</span> for 60 months
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

          <Card className="my-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-lg font-medium mb-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h3>Have Questions?</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Our representatives are available to answer all your queries about this vehicle.</p>
              <a href="mailto:help@vehiql.in">
                <Button variant="outline" className="w-full">Request Info</Button>
              </a>
            </CardContent>
          </Card>

          {isUnavailable && (
            <Alert variant="destructive">
              <AlertTitle className="capitalize">This vehicle is {String(vehicle.status).toLowerCase()}</AlertTitle>
              <AlertDescription>Please check again later.</AlertDescription>
            </Alert>
          )}

          {!isUnavailable && (
            <Button
              className="w-full py-6 text-lg"
              onClick={handleBookInspection}
              disabled={Boolean(hasInspection) || isProcessing}
            >
              <Calendar className="mr-2 h-5 w-5" />
              {hasInspection && inspectionDateString ? `Inspection booked for ${inspectionDateString}` : (hasInspection ? "Inspection booked" : "Book Inspection")}
            </Button>
          )}
        </div>
      </div>


      {/* Description, Features, Specs & Dealership sections remain identical to your original code */}
      {/* ... (kept unchanged for brevity) ... */}

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
                <span className="h-2 w-2 bg-blue-600 rounded-full" />
                {displayTransmission} Transmission
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-600 rounded-full" />
                {displayFuel} Engine
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-600 rounded-full" />
                {vehicle.bodyType ?? "N/A"} Body Style
              </li>
              {displaySeats && (
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-blue-600 rounded-full" />
                  {displaySeats} Seats
                </li>
              )}
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-600 rounded-full" />
                {vehicle.color ?? "N/A"} Exterior
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* specifications */}
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

      {/* Dealership location */}
      <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Dealership Location</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div className="flex items-start gap-3">
              <LocateFixed className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium">{dealership?.name ?? "Vehiql Motors"}</h4>
                <p className="text-gray-600">{dealership?.address || "Not Available"}</p>
                <p className="text-gray-600 mt-1">Phone: {dealership?.phone || "Not Available"}</p>
                <p className="text-gray-600">Email: {dealership?.email || "Not Available"}</p>
              </div>
            </div>

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
                          <span className="text-gray-600">{day.dayOfWeek.charAt(0) + day.dayOfWeek.slice(1).toLowerCase()}</span>
                          <span>{day.isOpen ? `${day.openTime} - ${day.closeTime}` : "Closed"}</span>
                        </div>
                      ))
                  : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) => (
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
