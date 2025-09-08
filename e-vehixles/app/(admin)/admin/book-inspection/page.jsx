import InspectionsList from "./_components/inspectionform";

export const metadata = {
  title: "Inspections | Admin",
  description: "Manage inspection bookings",
};

export default function InspectionsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Inspection Management</h1>
      <InspectionsList/>
    </div>
  );
}
