"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  Loader2,
  Car as CarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import useFetch from "@/hooks/use-fetch";
import { 
  getRentalVehicles, 
  deleteCar, 
  updateCarStatus 
} from "@/action/vehicle";
import { formatCurrency } from "@/lib/helpers";

const RentalVehiclesList = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // Fetch rental vehicles
  const {
    loading: loadingRentals,
    fn: fetchRentals,
    data: rentalsData,
    error: rentalsError,
  } = useFetch(getRentalVehicles);

  // Delete vehicle
  const {
    loading: deletingVehicle,
    fn: deleteVehicleFn,
    data: deleteResult,
    error: deleteError,
  } = useFetch(deleteCar);

  // Update vehicle status
  const {
    loading: updatingVehicle,
    fn: updateVehicleStatusFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updateCarStatus);

  useEffect(() => {
    fetchRentals({ search });
  }, [search]);

  // Toast notifications
  useEffect(() => {
    if (rentalsError) toast.error("Failed to load rentals: " + rentalsError);
    if (deleteError) toast.error("Failed to delete vehicle: " + deleteError);
    if (updateError) toast.error("Failed to update vehicle: " + updateError);
  }, [rentalsError, deleteError, updateError]);

  // Handle successful operations
  useEffect(() => {
    if (deleteResult?.success) {
      toast.success("Vehicle deleted successfully");
      fetchRentals({ search });
    }
    if (updateResult?.success) {
      toast.success("Vehicle updated successfully");
      fetchRentals({ search });
    }
  }, [deleteResult, updateResult, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRentals({ search });
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    await deleteVehicleFn(vehicleToDelete.id);
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  const handleStatusUpdate = async (vehicle, newStatus) => {
    await updateVehicleStatusFn(vehicle.id, { status: newStatus });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case "RENTED":
        return <Badge className="bg-blue-100 text-blue-800">Rented</Badge>;
      case "MAINTENANCE":
        return <Badge className="bg-amber-100 text-amber-800">Maintenance</Badge>;
      case "SOLD":
        return <Badge className="bg-purple-100 text-purple-800">Sold</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Search */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
        <div className="flex gap-2 sm:gap-3">
          <Button 
            onClick={() => router.push("/admin/rentals/create")}
            className="flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 mr-0 sm:mr-2" />
            <span className="hidden sm:inline">Add Rental Vehicle</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => fetchRentals({ search })}
            className="sm:hidden"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search rentals..."
              className="pl-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Rentals Table */}
      <Card>
        <CardContent className="p-0">
          {loadingRentals && !rentalsData ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="sr-only">Loading rentals...</span>
            </div>
          ) : rentalsData?.success && rentalsData.data.length > 0 ? (
            <>
              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3 p-3">
                {rentalsData.data.map((vehicle) => (
                  <div key={vehicle.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
                        {vehicle.images?.[0]?.url ? (
                          <img 
                            src={vehicle.images[0].url} 
                            alt={vehicle.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <CarIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold truncate">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          <div className="flex gap-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => router.push(`/admin/rentals/${vehicle.id}`)}
                                >
                                  <Eye className="mr-2 h-4 w-4" /> View
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Status</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(vehicle, "AVAILABLE")}
                                  disabled={vehicle.status === "AVAILABLE" || updatingVehicle}
                                >
                                  Set Available
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(vehicle, "RENTED")}
                                  disabled={vehicle.status === "RENTED" || updatingVehicle}
                                >
                                  Mark as Rented
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(vehicle, "MAINTENANCE")}
                                  disabled={vehicle.status === "MAINTENANCE" || updatingVehicle}
                                >
                                  Set to Maintenance
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setVehicleToDelete({ 
                                      id: vehicle.id, 
                                      title: `${vehicle.make} ${vehicle.model}` 
                                    });
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mt-1">
                          {vehicle.year} • {formatCurrency(vehicle.price)}/day
                        </div>
                        
                        <div className="mt-2 flex flex-wrap gap-2">
                          <div className="flex items-center">
                            {getStatusBadge(vehicle.status)}
                          </div>
                          {vehicle.location && (
                            <Badge variant="secondary">
                              {vehicle.location.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14"></TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead className="w-24">Year</TableHead>
                      <TableHead className="w-36">Price/Day</TableHead>
                      <TableHead className="w-32">Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rentalsData.data.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-200 flex items-center justify-center">
                            {vehicle.images?.[0]?.url ? (
                              <img 
                                src={vehicle.images[0].url} 
                                alt={vehicle.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <CarIcon className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium min-w-[180px]">
                          <div className="line-clamp-1">
                            {vehicle.make} {vehicle.model}
                          </div>
                        </TableCell>
                        <TableCell>{vehicle.year}</TableCell>
                        <TableCell>{formatCurrency(vehicle.price)}/day</TableCell>
                        <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                        <TableCell>
                          {vehicle.location ? 
                            vehicle.location.replace(/_/g, ' ') : 
                            'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => router.push(`/admin/rentals/${vehicle.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Status</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(vehicle, "AVAILABLE")}
                                disabled={vehicle.status === "AVAILABLE" || updatingVehicle}
                              >
                                Set Available
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(vehicle, "RENTED")}
                                disabled={vehicle.status === "RENTED" || updatingVehicle}
                              >
                                Mark as Rented
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(vehicle, "MAINTENANCE")}
                                disabled={vehicle.status === "MAINTENANCE" || updatingVehicle}
                              >
                                Set to Maintenance
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setVehicleToDelete({ 
                                    id: vehicle.id, 
                                    title: `${vehicle.make} ${vehicle.model}` 
                                  });
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <CarIcon className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No rental vehicles found
              </h3>
              <p className="text-gray-500 mb-4">
                {search
                  ? "No rentals match your search criteria"
                  : "Your rental inventory is empty. Add vehicles to get started."}
              </p>
              <Button onClick={() => router.push("/admin/rentals/create")}>
                Add Your First Rental
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {vehicleToDelete?.title}?
              This action cannot be undone and will permanently remove the vehicle and all its data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingVehicle}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteVehicle}
              disabled={deletingVehicle}
            >
              {deletingVehicle ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Vehicle"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RentalVehiclesList;