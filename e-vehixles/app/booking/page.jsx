// app/booking/page.jsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReservationsList } from "./_components/reservations-list";
import { getUserInspections } from "@/action/inspection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Car, AlertCircle, CheckCircle } from "lucide-react";

export const metadata = {
  title: "My Inspections | Emurta",
  description: "Manage your vehicle inspection appointments",
};

function getStatusSummary(inspections) {
  const summary = { total: 0, upcoming: 0, completed: 0, cancelled: 0 };
  if (!Array.isArray(inspections)) return summary;
  inspections.forEach((ins) => {
    summary.total++;
    switch (ins.status) {
      case "SCHEDULED":
      case "PENDING":
      case "CONFIRMED":
        summary.upcoming++;
        break;
      case "COMPLETED":
        summary.completed++;
        break;
      case "CANCELLED":
        summary.cancelled++;
        break;
      default:
        break;
    }
  });
  return summary;
}

export default async function ReservationsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect=/inspections");

  const raw = await getUserInspections(userId);
  const inspections = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  console.log("Server inspections preview:", inspections.map(i => ({ id: i.id, status: i.status, vehicleId: i.vehicleId, hasVehicle: !!i.vehicle })));

  const statusSummary = getStatusSummary(inspections);
  const reservationsResult = { data: inspections };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/30 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your <span className="text-blue-600">Inspections</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your upcoming vehicle inspections and view past appointments
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {/* ... four cards similar to earlier, using statusSummary.total etc ... */}
          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Total Inspections</CardTitle></CardHeader>
            <CardContent><div className="flex items-center"><div className="bg-blue-100 p-2 rounded-full mr-3"><Car className="h-5 w-5 text-blue-600" /></div><span className="text-3xl font-bold text-gray-900">{statusSummary.total}</span></div></CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Upcoming</CardTitle></CardHeader>
            <CardContent><div className="flex items-center"><div className="bg-amber-100 p-2 rounded-full mr-3"><Clock className="h-5 w-5 text-amber-600" /></div><span className="text-3xl font-bold text-gray-900">{statusSummary.upcoming}</span></div></CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle></CardHeader>
            <CardContent><div className="flex items-center"><div className="bg-green-100 p-2 rounded-full mr-3"><CheckCircle className="h-5 w-5 text-green-600" /></div><span className="text-3xl font-bold text-gray-900">{statusSummary.completed}</span></div></CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Cancelled</CardTitle></CardHeader>
            <CardContent><div className="flex items-center"><div className="bg-red-100 p-2 rounded-full mr-3"><AlertCircle className="h-5 w-5 text-red-600" /></div><span className="text-3xl font-bold text-gray-900">{statusSummary.cancelled}</span></div></CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg overflow-hidden ">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center gap-2"><Calendar className="h-6 w-6" />Inspection Appointments</CardTitle>
            <CardDescription className="text-blue-100">All your scheduled vehicle inspections in one place</CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            {/* Debug: raw JSON (server-rendered) - remove after verifying */}
            

            <ReservationsList initialData={reservationsResult} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
