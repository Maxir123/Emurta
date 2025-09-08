// app/admin/dashboard/page.tsx
import Dashboard from "./_component/dashboard";
import { getDashboardData } from "@/action/admin";

// ensure this page runs per-request so Clerk auth() works correctly
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let initialData;
  try {
    // getDashboardData already returns { success: boolean, data?: {...}, error?: string }
    initialData = await getDashboardData();
  } catch (err) {
    initialData = { success: false, error: (err && err.message) ? err.message : String(err) };
  }

  return <Dashboard initialData={initialData} />;
}
