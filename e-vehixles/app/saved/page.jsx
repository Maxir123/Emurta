import { SavedCarsList } from "./_components/saved-cars-list";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSavedVehicles } from "@/action/vehicles-listing";

export const metadata = {
  title: "Saved Cars | Emurta",
  description: "View your saved cars and favorites",
};

export default async function SavedCarsPage() {
  // Check authentication on server
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect=/saved");
  }

  // Fetch saved cars on the server
  const savedCarsResult = await getSavedVehicles();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white mt-15">

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <SavedCarsList initialData={savedCarsResult} />
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-10 md:hidden">
        <a
          href="/cars"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 hover:shadow-xl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}