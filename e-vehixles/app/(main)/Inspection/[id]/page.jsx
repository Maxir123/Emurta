import { notFound } from "next/navigation";
import { InspectionForm } from "./_components/test-drive-form";
import { getVehicleById } from "@/action/vehicles-listing";

export async function generateMetadata({ params }) {
  const { id } = await params; // ✅
  const result = await getVehicleById(id);
  
  if (!result.success) {
    return {
      title: `Vehicle Not Found | Emurta`,
    };
  }
  
  const vehicle = result.data;
  
  return {
    title: `Book Inspection for ${vehicle.year} ${vehicle.make} ${vehicle.model} | Emurta`,
    description: `Schedule a professional inspection for your ${vehicle.year} ${vehicle.make} ${vehicle.model} in just a few clicks.`,
  };
}

export default async function TestDrivePage({ params }) {
  // Fetch car details
  const { id } = await params; // ✅
  const result = await getVehicleById(id);

  // If car not found, show 404
  if (!result.success) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Schedule Your <span className="text-blue-600">Vehicle Inspection</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Complete the form below to book a professional inspection for your vehicle. 
              Our experts will provide a thorough assessment.
            </p>
          </div>
          
          <InspectionForm vehicle={result.data} />
        </div>
      </div>
    </div>
  );
}