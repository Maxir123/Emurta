import { notFound } from "next/navigation";
import { getVehicleById } from "@/action/vehicles-listing";
import VehicleDetails from "./_components/car-details";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const result = await getVehicleById(id);

  if (!result.success) {
    return {
      title: "Car Not Found | Emurta",
      description: "The requested vehicles could not be found",
    };
  }

  const vehicle = result.data;

  return {
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model} | Emurta`,
    description: vehicle.description.substring(0, 160),
    openGraph: {
      images: vehicle.images?.[0] ? [vehicle.images[0]] : [],
    },
  };
}

export default async function vehicleDetailsPage({ params }) {
  // Fetch vehicle details
  const { id } = await params;
  const result = await getVehicleById(id);

  // If vehicle not found, show 404
  if (!result.success) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 mt-15">
      <VehicleDetails vehicle={result.data}                   // ✅ your car DB data
        inspectionInfo={result.data.inspectionInfo ?? {}} // ✅ inspection info if you include it
 />
    </div>
  );
}
