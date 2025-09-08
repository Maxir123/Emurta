"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { cancelInspection } from "@/action/inspection";
import { InspectionCard } from "@/components/Inspectioncard";

export function ReservationsList({ initialData }) {
  const {
    loading: cancelling,
    fn: cancelBookingFn,
    error: cancelError,
  } = useFetch(cancelInspection);

  // normalize incoming data
  const bookings = Array.isArray(initialData?.data) ? initialData.data : [];

  // statuses considered "upcoming" in your server: include SCHEDULED
  const UPCOMING = new Set(["SCHEDULED", "PENDING", "CONFIRMED"]);
  const PAST = new Set(["COMPLETED", "CANCELLED", "NO_SHOW"]);

  const upcomingBookings = bookings.filter((b) => UPCOMING.has(b?.status));
  const pastBookings = bookings.filter((b) => PAST.has(b?.status));

  useEffect(() => {
    // debugging info in client console
    console.log("ReservationsList client debug", {
      initialData,
      bookingsLength: bookings.length,
      upcomingLength: upcomingBookings.length,
      pastLength: pastBookings.length,
      firstBooking: bookings[0] ?? null,
    });
  }, [initialData]);

  const handleCancelBooking = async (bookingId) => {
    await cancelBookingFn(bookingId);
  };

  if (bookings.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-gray-50">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Calendar className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Reservations Found</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          You don't have any inspection booking yet. Browse our vehicles and
          book an inspection to get started.
        </p>
        <Button variant="default" asChild>
          <Link href="/vehicles">Browse vehicles</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Bookings */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upcoming inspection</h2>
        {upcomingBookings.length === 0 ? (
          <p className="text-gray-500 italic">No upcoming inspection.</p>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((ins) => (
              <InspectionCard
                key={ins.id}
                inspection={ins}
                onCancel={handleCancelBooking}
                isCancelling={cancelling}
                showActions
                cancelError={cancelError}
                viewMode="list"
              />
            ))}
          </div>
        )}
      </div>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Past Inspections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastBookings.map((ins) => (
              <InspectionCard
                key={ins.id}
                inspection={ins}
                showActions={false}
                isPast
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
