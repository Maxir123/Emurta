"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Car,
  Calendar,
  TrendingUp,
  Info,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react";

export default function Dashboard({ initialData = null }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState(initialData?.data ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(initialData && !initialData.success ? initialData.error : null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (initialData) return;

    let mounted = true;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/dashboard", {
          method: "GET",
          headers: { "content-type": "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        const json = await res.json();
        if (!mounted) return;
        if (!json || !json.success) {
          setError(json?.error || "Failed to load dashboard data");
          setData(null);
        } else {
          setData(json.data);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
        setError(err.message ?? String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [initialData]);

  async function handleRefresh() {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dashboard?refresh=1", { method: "GET" });
      if (!res.ok) throw new Error(`Failed to refresh: ${res.status}`);
      const json = await res.json();
      if (!json || !json.success) throw new Error(json?.error || "No data returned");
      setData(json.data);
    } catch (err) {
      console.error(err);
      setError(err.message ?? String(err));
    } finally {
      setRefreshing(false);
    }
  }

  async function deleteVehicle(vehicleId) {
    if (!confirm("Delete this vehicle? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/vehicle/delete`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: vehicleId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete");
      handleRefresh();
      alert("Vehicle deleted");
    } catch (err) {
      console.error(err);
      alert(err.message ?? "Delete failed");
    }
  }

  async function toggleSold(vehicleId, currentlySold) {
    try {
      const res = await fetch(`/api/admin/vehicle/update-status`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: vehicleId, status: currentlySold ? "AVAILABLE" : "SOLD" }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update");
      handleRefresh();
    } catch (err) {
      console.error(err);
      alert(err.message ?? "Update failed");
    }
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-50 border-red-200">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <AlertTitle className="text-red-800 font-semibold">Error</AlertTitle>
            <AlertDescription className="text-red-700 mt-1">{error}</AlertDescription>
          </div>
        </div>
      </Alert>
    );
  }

  if (loading || !data) {
    return (
      <div className="space-y-6 p-4 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 h-36">
              <div className="h-5 w-2/3 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // safe access helpers
  const vehicles = data.vehicles ?? { total: 0, available: 0, sold: 0 };
  const inspections = data.inspections ?? { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, noShow: 0, conversionRate: 0 };

  const pct = (num, denom) => (denom ? ((num / denom) * 100).toFixed(1) : "0.0");

  return (
    <div className="space-y-6 p-4 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium flex items-center hover:bg-gray-50 transition-colors shadow-sm"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white border border-gray-300 p-1 rounded-lg mb-6 shadow-sm">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:border data-[state=active]:border-amber-200 rounded-md px-4 py-2 text-sm font-medium transition-all"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="test-drives" 
            className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:border data-[state=active]:border-amber-200 rounded-md px-4 py-2 text-sm font-medium transition-all"
          >
            Test Drives
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Total Vehicles</CardTitle>
                <div className="h-9 w-9 rounded-full bg-amber-50 flex items-center justify-center">
                  <Car className="h-5 w-5 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{vehicles.total}</div>
                <p className="text-xs text-gray-500 mt-1">{vehicles.available} available, {vehicles.sold} sold</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Test Drives</CardTitle>
                <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{inspections.total}</div>
                <p className="text-xs text-gray-500 mt-1">{inspections.pending} pending, {inspections.confirmed} confirmed</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Conversion Rate</CardTitle>
                <div className="h-9 w-9 rounded-full bg-green-50 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{inspections.conversionRate}%</div>
                <p className="text-xs text-gray-500 mt-1">From test drives to sales</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Vehicles Sold</CardTitle>
                <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{vehicles.sold}</div>
                <p className="text-xs text-gray-500 mt-1">{pct(vehicles.sold, vehicles.total)}% of inventory</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-bold text-gray-900">Inventory Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Available Vehicles</span>
                      <span className="font-medium">{vehicles.available} / {vehicles.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-amber-600 h-2.5 rounded-full" 
                        style={{ width: `${pct(vehicles.available, vehicles.total)}%` }} 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Sold Vehicles</span>
                      <span className="font-medium">{vehicles.sold} / {vehicles.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-emerald-600 h-2.5 rounded-full" 
                        style={{ width: `${pct(vehicles.sold, vehicles.total)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-bold text-gray-900">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <span className="text-3xl font-bold text-amber-700">{vehicles.sold}</span>
                    <p className="text-sm text-amber-600 mt-1">Vehicles Sold</p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-3xl font-bold text-blue-700">{inspections.pending + inspections.confirmed}</span>
                    <p className="text-sm text-blue-600 mt-1">Upcoming Test Drives</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test-drives" className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Total Bookings</CardTitle>
                <Calendar className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{inspections.total}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Pending</CardTitle>
                <Clock className="h-5 w-5 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{inspections.pending}</div>
                <p className="text-xs text-gray-500 mt-1">{pct(inspections.pending, inspections.total)}% of bookings</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Confirmed</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{inspections.confirmed}</div>
                <p className="text-xs text-gray-500 mt-1">{pct(inspections.confirmed, inspections.total)}% of bookings</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Completed</CardTitle>
                <CheckCircle className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{inspections.completed}</div>
                <p className="text-xs text-gray-500 mt-1">{pct(inspections.completed, inspections.total)}% of bookings</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Cancelled</CardTitle>
                <XCircle className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{inspections.cancelled}</div>
                <p className="text-xs text-gray-500 mt-1">{pct(inspections.cancelled, inspections.total)}% of bookings</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-bold text-gray-900">Test Drive Metrics</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Conversion Rate</h3>
                    <div className="text-2xl font-bold text-blue-900">{inspections.conversionRate}%</div>
                    <p className="text-xs text-blue-700 mt-1">Test drives to purchases</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <h3 className="text-sm font-medium text-green-800 mb-2">Completion Rate</h3>
                    <div className="text-2xl font-bold text-green-900">{pct(inspections.completed, inspections.total)}%</div>
                    <p className="text-xs text-green-700 mt-1">Test drives completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-bold text-gray-900">Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {["pending", "confirmed", "completed", "cancelled", "noShow"].map((key) => {
                    const label = key === "noShow" ? "No Show" : key.charAt(0).toUpperCase() + key.slice(1);
                    const value = inspections[key] ?? 0;
                    const percentage = pct(value, inspections.total);
                    
                    const colorClasses = {
                      pending: "bg-amber-500",
                      confirmed: "bg-blue-500",
                      completed: "bg-green-500",
                      cancelled: "bg-red-500",
                      noShow: "bg-gray-500"
                    };
                    
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">{label}</span>
                          <span className="font-medium text-gray-900">{value} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${colorClasses[key]}`} 
                            style={{ width: `${percentage}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-gray-900">Recent Vehicles</CardTitle>
            <button className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="pt-6">
            {(data.recentVehicles && data.recentVehicles.length > 0) ? (
              <div className="space-y-4">
                {data.recentVehicles.map((v) => (
                  <div key={v.id} className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">{v.title || `${v.make} ${v.model}`}</div>
                      <div className="text-sm text-gray-500 mt-1">{v.year} • ₦{v.price?.toLocaleString?.() ?? v.price}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        className="text-xs px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => toggleSold(v.id, v.status === 'SOLD')}
                      >
                        {v.status === 'SOLD' ? 'Mark Available' : 'Mark Sold'}
                      </button>
                      <button 
                        className="text-xs px-3 py-1.5 border border-red-300 rounded-md text-red-700 hover:bg-red-50 transition-colors"
                        onClick={() => deleteVehicle(v.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent vehicles data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-gray-900">Upcoming Test Drives</CardTitle>
            <button className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="pt-6">
            {(data.recentInspections && data.recentInspections.length > 0) ? (
              <div className="space-y-4">
                {data.recentInspections.map((ins) => (
                  <div key={ins.id} className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">{ins.vehicle?.title ?? ins.vehicle?.make + ' ' + ins.vehicle?.model}</div>
                      <div className="text-sm text-gray-500 mt-1">{new Date(ins.date).toLocaleString()}</div>
                    </div>
                    <div className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                      ins.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      ins.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      ins.status === 'completed' ? 'bg-green-100 text-green-800' :
                      ins.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ins.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming test drives data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}