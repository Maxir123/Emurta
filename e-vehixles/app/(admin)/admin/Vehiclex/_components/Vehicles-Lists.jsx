"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Search,
  MoreHorizontal,
  Star,
  StarOff,
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
  getVehiclesForSale as getVehicles,
  deleteCar as deleteVehicle,
  updateCarStatus as updateVehicleStatus,
} from "@/action/vehicle";

import { formatCurrency } from "@/lib/helpers";
import Image from "next/image";

const VehiclesLists = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  const {
    loading: loadingVehicles,
    fn: fetchVehicles,
    data: vehiclesData,
    error: vehiclesError,
  } = useFetch(getVehicles);

  const {
    loading: deletingVehicle,
    fn: deleteVehicleFn,
    data: deleteResult,
    error: deleteError,
  } = useFetch(deleteVehicle);

  const {
    loading: updatingVehicle,
    fn: updateVehicleStatusFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updateVehicleStatus);

  useEffect(() => {
    fetchVehicles({ search });
  }, [search]);

  useEffect(() => {
    if (vehiclesError) toast.error("Failed to load vehicles");
    if (deleteError) toast.error("Failed to delete vehicle");
    if (updateError) toast.error("Failed to update vehicle");
  }, [vehiclesError, deleteError, updateError]);

  useEffect(() => {
    if (deleteResult?.success) {
      toast.success("Vehicle deleted successfully");
      fetchVehicles({ search });
    }
    if (updateResult?.success) {
      toast.success("Vehicle updated successfully");
      fetchVehicles({ search });
    }
  }, [deleteResult, updateResult, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVehicles({ search });
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    await deleteVehicleFn(vehicleToDelete.id);
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  const handleToggleFeatured = async (vehicle) => {
    await updateVehicleStatusFn(vehicle.id, { featured: !vehicle.featured });
  };

  const handleStatusUpdate = async (vehicle, newStatus) => {
    await updateVehicleStatusFn(vehicle.id, { status: newStatus });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case "UNAVAILABLE":
        return <Badge className="bg-amber-100 text-amber-800">Unavailable</Badge>;
      case "SOLD":
        return <Badge className="bg-blue-100 text-blue-800">Sold</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Actions and Search - Enhanced responsive layout */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
        <div className="flex gap-2 sm:gap-3">
          <Button 
            onClick={() => router.push("/admin/Vehiclex/create")}
            className="flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 mr-0 sm:mr-2" />
            <span className="hidden sm:inline">Add Vehicle</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => fetchVehicles({ search })}
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
              placeholder="Search vehicles..."
              className="pl-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Vehicles Table with responsive layouts */}
      <Card>
        <CardContent className="p-0">
          {loadingVehicles && !vehiclesData ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : vehiclesData?.success && vehiclesData.data.length > 0 ? (
            <>
              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3 p-3">
                {vehiclesData.data.map((vehicle) => (
                  <div key={vehicle.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        {vehicle.images && vehicle.images.length > 0 ? (
                          <Image
                            src={vehicle.images[0]}
                            alt={`${vehicle.make} ${vehicle.model}`}
                            height={64}
                            width={64}
                            className="w-full h-full object-cover"
                            priority
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <CarIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold truncate">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleFeatured(vehicle)}
                              disabled={updatingVehicle}
                              className="p-0 h-6 w-6"
                            >
                              {vehicle.featured ? (
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              ) : (
                                <StarOff className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => router.push(`/vehicles/${vehicle.id}`)}
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
                                  onClick={() => handleStatusUpdate(vehicle, "UNAVAILABLE")}
                                  disabled={vehicle.status === "UNAVAILABLE" || updatingVehicle}
                                >
                                  Set Unavailable
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(vehicle, "SOLD")}
                                  disabled={vehicle.status === "SOLD" || updatingVehicle}
                                >
                                  Mark as Sold
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setVehicleToDelete(vehicle);
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
                          {vehicle.year} • {formatCurrency(vehicle.price)}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusBadge(vehicle.status)}
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
                      <TableHead>Make & Model</TableHead>
                      <TableHead className="w-24">Year</TableHead>
                      <TableHead className="w-36">Price</TableHead>
                      <TableHead className="w-32">Status</TableHead>
                      <TableHead className="w-20">Featured</TableHead>
                      <TableHead className="text-right w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehiclesData.data.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div className="w-10 h-10 rounded-md overflow-hidden">
                            {vehicle.images && vehicle.images.length > 0 ? (
                              <Image
                                src={vehicle.images[0]}
                                alt={`${vehicle.make} ${vehicle.model}`}
                                height={40}
                                width={40}
                                className="w-full h-full object-cover"
                                priority
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <CarIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium min-w-[180px]">
                          <div className="line-clamp-1">{vehicle.make} {vehicle.model}</div>
                        </TableCell>
                        <TableCell>{vehicle.year}</TableCell>
                        <TableCell>{formatCurrency(vehicle.price)}</TableCell>
                        <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFeatured(vehicle)}
                            disabled={updatingVehicle}
                            className="p-0 h-9 w-9"
                          >
                            {vehicle.featured ? (
                              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                            ) : (
                              <StarOff className="h-5 w-5 text-gray-400" />
                            )}
                          </Button>
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
                                onClick={() => router.push(`/vehicles/${vehicle.id}`)}
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
                                onClick={() => handleStatusUpdate(vehicle, "UNAVAILABLE")}
                                disabled={vehicle.status === "UNAVAILABLE" || updatingVehicle}
                              >
                                Set Unavailable
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(vehicle, "SOLD")}
                                disabled={vehicle.status === "SOLD" || updatingVehicle}
                              >
                                Mark as Sold
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setVehicleToDelete(vehicle);
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
                No vehicles found
              </h3>
              <p className="text-gray-500 mb-4">
                {search
                  ? "No vehicles match your search criteria"
                  : "Your inventory is empty. Add vehicles to get started."}
              </p>
              <Button onClick={() => router.push("/admin/Vehiclex/create")}>Add Your First Vehicle</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {vehicleToDelete?.make} {vehicleToDelete?.model} ({vehicleToDelete?.year})?
              This action cannot be undone.
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

export default VehiclesLists;