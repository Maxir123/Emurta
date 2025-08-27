import RentalVehiclesList from "./_components/RentalVehiclesList";

export const metadata = {
  title: "Rentals | Emurta Admin",
  description: "Manage rental vehicles in your marketplace",
};

export default function RentalPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cars Rental</h1>
      <RentalVehiclesList />
    </div>
  );
}
