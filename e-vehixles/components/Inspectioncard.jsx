"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format, parse, parseISO } from "date-fns";
import { Calendar, Car, Clock, User, Loader2, ArrowRight, MapPin, Info, X, Phone, Mail, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Helper function to format time (tries ISO then 'h:mm a')
const formatTime = (timeString) => {
  if (!timeString) return "TBD";
  try {
    // try ISO-ish first (e.g. "13:00" or "13:00:00" or full ISO)
    const isoCandidate = timeString.includes("T") ? timeString : `2022-01-01T${timeString}`;
    const parsedIso = parseISO(isoCandidate);
    return format(parsedIso, "h:mm a");
  } catch (err) {
    try {
      const parsed = parse(timeString, "h:mm a", new Date());
      return format(parsed, "h:mm a");
    } catch (err2) {
      return timeString;
    }
  }
};

// Helper function for status badge
const getStatusBadge = (status) => {
  switch (status) {
    case "SCHEDULED":
      return <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">Scheduled</Badge>;
    case "PENDING":
      return <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">Pending</Badge>;
    case "CONFIRMED":
      return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">Confirmed</Badge>;
    case "COMPLETED":
      return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">Completed</Badge>;
    case "CANCELLED":
      return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Cancelled</Badge>;
    case "NO_SHOW":
      return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">No Show</Badge>;
    default:
      return <Badge variant="outline">{status || "UNKNOWN"}</Badge>;
  }
};

// Status progress indicator
const StatusProgress = ({ status }) => {
  const statuses = ["SCHEDULED", "PENDING", "CONFIRMED", "COMPLETED"];
  const currentIndex = Math.max(0, statuses.indexOf(status));
  const pct = currentIndex === -1 ? 0 : ((currentIndex + 1) / statuses.length) * 100;

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        {statuses.map((s, i) => (
          <span key={s} className={cn(i <= currentIndex ? "text-blue-600 font-medium" : "text-gray-400")}>
            {s}
          </span>
        ))}
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
};

/**
 * InspectionCard (drop-in replacement)
 *
 * Props:
 * - inspection OR booking: the booking object (we normalize both)
 * - onCancel(id)
 * - showActions, isPast, isAdmin, isCancelling, renderStatusSelector
 */
export function InspectionCard({
  inspection,
  booking,
  onCancel,
  showActions = true,
  isPast = false,
  isAdmin = false,
  isCancelling = false,
  renderStatusSelector = () => null,
}) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // normalize data
  const data = inspection || booking || {};
  const vehicle = data.vehicle || data.car || {};
  const status = data.status;
  const notes = data.notes;
  const user = data.user;
  const id = data.id || data.bookingId || data.inspectionId;

  // Determine date & times with fallbacks
  const bookingDate = data.bookingDate || data.date || data.inspectionDate || null;
  const startTime = data.startTime || data.start_time || data.time || data.from || "";
  const endTime = data.endTime || data.end_time || data.to || "";

  // Cancel handler
  const handleCancel = async () => {
    if (!onCancel) return;
    await onCancel(id);
    setCancelDialogOpen(false);
  };

  // --- CHANGE: make SCHEDULED cancellable too ---
  const cancellableStatuses = ["SCHEDULED", "PENDING", "CONFIRMED"];
  const isCancellable = cancellableStatuses.includes(status);

  const vehicleHref = `/Car/${vehicle.id}`;

  return (
    <>
      <Card className={cn(
        "overflow-hidden border-0 shadow-sm transition-all hover:shadow-md",
        isPast && "opacity-80 hover:opacity-100",
        status === "CANCELLED" && "bg-gray-50",
        status === "COMPLETED" && "bg-green-50/30"
      )}>
        <div className="flex flex-col md:flex-row">
          {/* Vehicle Image */}
          <div className="md:w-2/5 lg:w-1/4 relative h-48 md:h-auto">
            {vehicle.images && vehicle.images.length > 0 ? (
              <div className="relative w-full h-full">
                <Image
                  src={vehicle.images[0]}
                  alt={`${vehicle.make || ""} ${vehicle.model || ""}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 md:hidden">
                  {getStatusBadge(status)}
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
                <Car className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm text-center">No image available</p>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-5">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="hidden md:block mb-3">
                  {getStatusBadge(status)}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {vehicle.year || data.year || ""} {vehicle.make || data.make || ""} {vehicle.model || data.model || ""}
                </h3>
                
                {!isPast && status !== "COMPLETED" && status !== "CANCELLED" && (
                  <StatusProgress status={status} />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 mr-3 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">
                        {bookingDate ? format(new Date(bookingDate), "EEE, MMM d, yyyy") : "To be determined"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-5 w-5 mr-3 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">
                        {startTime ? (
                          <>
                            {formatTime(startTime)}
                            {endTime && ` - ${formatTime(endTime)}`}
                          </>
                        ) : "To be determined"}
                      </p>
                    </div>
                  </div>
                  
                  {isAdmin && user && (
                    <div className="flex items-center text-gray-700">
                      <User className="h-5 w-5 mr-3 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-medium">{user.name || user.email}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-5 w-5 mr-3 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">To be determined</p>
                    </div>
                  </div>
                </div>

                {notes && (
                  <div 
                    className={cn(
                      "mt-4 transition-all duration-300",
                      showDetails ? "max-h-96" : "max-h-20 overflow-hidden"
                    )}
                  >
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <div className="flex items-start">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-800 mb-1">Customer Notes</p>
                          <p className="text-sm text-blue-700">{notes}</p>
                        </div>
                      </div>
                    </div>
                    {notes.length > 100 && (
                      <Button 
                        variant="link" 
                        className="text-xs p-0 h-auto mt-1 text-blue-600"
                        onClick={() => setShowDetails(!showDetails)}
                      >
                        {showDetails ? "Show less" : "Show more"}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Action menu for mobile */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={vehicleHref}>View Vehicle</Link>
                    </DropdownMenuItem>
                    {/* --- CHANGE: use isCancellable so SCHEDULED shows cancel option --- */}
                    {isCancellable && (
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setCancelDialogOpen(true)}
                      >
                        Cancel Inspection
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <Link href={vehicleHref} className="flex items-center justify-center">
                  View Vehicle Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              {/* --- CHANGE: show main cancel button when isCancellable --- */}
              {showActions && isCancellable && (
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Inspection"
                  )}
                </Button>
              )}

              {isAdmin && (
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {renderStatusSelector()}
          </div>
        </div>
      </Card>

      {/* Cancel Confirmation Dialog */}
      {onCancel && (
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-lg">
            <DialogHeader>
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <X className="h-5 w-5" />
                <DialogTitle>Cancel Inspection</DialogTitle>
              </div>
              <DialogDescription>
                Are you sure you want to cancel this inspection for the{" "}
                {vehicle.year} {vehicle.make} {vehicle.model}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Card className="bg-gray-50 border-0">
                <CardContent className="p-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Vehicle:</span>
                      <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Date:</span>
                      <span>{bookingDate ? format(new Date(bookingDate), "EEE, MMM d, yyyy") : "TBD"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Time:</span>
                      <span>{startTime ? formatTime(startTime) : "TBD"}{endTime ? ` - ${formatTime(endTime)}` : ""}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setCancelDialogOpen(false)} 
                disabled={isCancelling}
                className="flex-1"
              >
                Keep Reservation
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancel} 
                disabled={isCancelling}
                className="flex-1"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Inspection"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
