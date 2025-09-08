"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search, Loader2, CalendarRange, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import useFetch from "@/hooks/use-fetch";

// Actions — adjust paths if needed
import { getAdminInspection, updateInspectionStatus } from "@/action/admin";
import { cancelInspection } from "@/action/inspection";

/** NOTE: sentinel "ALL" used instead of empty string. Radix requires non-empty SelectItem values. */
const STATUS_ALL = "ALL";
const STATUS_OPTIONS = [
  { value: STATUS_ALL, label: "All Statuses" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function InspectionRow({ ins, onCancel, onStatusChange, isCancelling, isUpdating }) {
  const label = ins.vehicle?.title ?? `${ins.vehicle?.make ?? ""} ${ins.vehicle?.model ?? ""}`.trim();
  const dateStr = ins.date ? new Date(ins.date).toLocaleString() : "TBD";

  return (
    <div className="relative p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="font-medium text-gray-900 truncate">{label}</div>
        <div className="text-sm text-gray-500 mt-1">{dateStr}</div>
        <div className="text-xs text-gray-500 mt-1">Inspector: {ins.inspector?.fullName ?? "N/A"}</div>
      </div>

      <div className="flex items-center gap-3">
        <div className={`text-xs px-2.5 py-1 rounded-full capitalize ${
          ins.status === "SCHEDULED" ? "bg-amber-100 text-amber-800" :
          ins.status === "COMPLETED" ? "bg-green-100 text-green-800" :
          ins.status === "CANCELLED" ? "bg-red-100 text-red-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {String(ins.status).toLowerCase()}
        </div>

        <div style={{ minWidth: 160 }}>
          <Select
            value={ins.status ?? "SCHEDULED"}
            onValueChange={(val) => onStatusChange(ins.id, val)}
            disabled={isUpdating}
          >
            <SelectTrigger className="h-8 w-full">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <button
          className="text-xs px-3 py-1.5 border border-red-300 rounded-md text-red-700 hover:bg-red-50 transition-colors"
          onClick={() => onCancel(ins.id)}
          disabled={isCancelling}
        >
          {isCancelling ? "Cancelling..." : "Cancel"}
        </button>
      </div>
    </div>
  );
}

export default function InspectionsList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(STATUS_ALL); // default to ALL sentinel

  // Fetch list
  const {
    loading: fetching,
    fn: fetchInspections,
    data: inspectionsData,
    error: inspectionsError,
  } = useFetch(getAdminInspection);

  // Update status
  const {
    loading: updatingStatus,
    fn: updateStatusFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updateInspectionStatus);

  // Cancel
  const {
    loading: cancelling,
    fn: cancelFn,
    data: cancelResult,
    error: cancelError,
  } = useFetch(cancelInspection);

  // helper to translate sentinel to server value
  const mapFilterToServer = (val) => (val === STATUS_ALL ? "" : val);

  // initial fetch + whenever filters change
  useEffect(() => {
    fetchInspections({ search, status: mapFilterToServer(statusFilter), page: 1, limit: 50 });
  }, [search, statusFilter]);

  // Show errors
  useEffect(() => {
    if (inspectionsError) toast.error("Failed to load inspections");
    if (updateError) toast.error("Failed to update inspection status");
    if (cancelError) toast.error("Failed to cancel inspection");
  }, [inspectionsError, updateError, cancelError]);

  // On successful update/cancel -> refetch and show toast
  useEffect(() => {
    if (updateResult?.success) {
      toast.success("Inspection status updated");
      fetchInspections({ search, status: mapFilterToServer(statusFilter), page: 1, limit: 50 });
    }
    if (cancelResult?.success) {
      toast.success("Inspection cancelled");
      fetchInspections({ search, status: mapFilterToServer(statusFilter), page: 1, limit: 50 });
    }
  }, [updateResult, cancelResult]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInspections({ search, status: mapFilterToServer(statusFilter), page: 1, limit: 50 });
  };

  const handleUpdateStatus = async (inspectionId, newStatus) => {
    if (!inspectionId || !newStatus) return;
    await updateStatusFn({ inspectionId, newStatus });
  };

  const handleCancel = async (inspectionId) => {
    if (!inspectionId) return;
    if (!confirm("Cancel this inspection?")) return;
    await cancelFn(inspectionId);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Select value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-48">
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <form onSubmit={handleSearchSubmit} className="flex w-full">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search by vehicle, inspector or notes..."
                className="pl-9 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" className="ml-2">Search</Button>
          </form>
        </div>
      </div>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5" />
            Inspections
          </CardTitle>
          <CardDescription>Manage inspection bookings and update their status</CardDescription>
        </CardHeader>

        <CardContent>
          {fetching && !inspectionsData ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : inspectionsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to load inspections. Please try again.</AlertDescription>
            </Alert>
          ) : !(inspectionsData?.data?.items?.length > 0) ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <CalendarRange className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No inspections found</h3>
              <p className="text-gray-500 mb-4">
                {statusFilter || search ? "No inspections match your filters" : "There are no inspection bookings yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {inspectionsData.data.items.map((ins) => (
                <InspectionRow
                  key={ins.id}
                  ins={ins}
                  onCancel={handleCancel}
                  onStatusChange={handleUpdateStatus}
                  isCancelling={cancelling}
                  isUpdating={updatingStatus}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
