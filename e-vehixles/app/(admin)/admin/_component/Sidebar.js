"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Car,
  Calendar,
  LogOut,
  Truck,
  Wrench,
  Settings,
  Menu,
  X,
  MoreHorizontal,
} from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Vehicles", icon: Car, href: "/admin/Vehiclex" },
  { label: "Rentals", icon: Truck, href: "/admin/rentals" },
  { label: "Inspections", icon: Calendar, href: "/admin/book-inspection" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const primaryTabs = routes.slice(0, 3);
  const moreTabs = routes.slice(3);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 h-full w-56 bg-white border-r shadow-sm z-40">
        <div className="p-4 border-b">
          <Link href="/admin">
            <h1 className="text-xl font-bold text-blue-700">Emurta Admin</h1>
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {routes.map((route) => (
            <Link key={route.href} href={route.href} className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === route.href
                  ? "bg-blue-100 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100"
              )}>
              <route.icon className="w-5 h-5" />
              <span>{route.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4">
          <SignOutButton>
            <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-500 transition">
              <LogOut className="w-5 h-5" /> Log out
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Mobile Bottom Tabs with More Drawer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex justify-around items-center h-16">
        {primaryTabs.map((route) => (
          <Link key={route.href} href={route.href} className={cn(
              "flex flex-col items-center justify-center text-slate-500 text-xs font-medium flex-1 py-1",
              pathname === route.href && "text-blue-700"
            )}>
            <route.icon className={cn("h-6 w-6 mb-1", pathname === route.href ? "text-blue-700" : "text-slate-500")} />
            {route.label}
          </Link>
        ))}
        {/* More Button */}
        <button onClick={() => setIsMoreOpen(true)} className="flex flex-col items-center justify-center text-slate-500 text-xs font-medium flex-1 py-1">
          <MoreHorizontal className="h-6 w-6 mb-1" />
          More
        </button>
      </div>

      {/* More Drawer */}
      <Drawer open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <DrawerTrigger asChild>
          {/* Invisible trigger, handled by button above */}
          <div />
        </DrawerTrigger>
        <DrawerContent className="fixed bottom-0 left-0 right-0 h-1/2 bg-white rounded-t-2xl shadow-lg">
          <DrawerClose asChild>
            <button aria-label="Close more menu" className="p-2 absolute top-4 right-4">
              <X className="w-6 h-6 text-slate-700" />
            </button>
          </DrawerClose>
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">More</h2>
          </div>
          <nav className="flex flex-col gap-1 p-4 overflow-auto">
            {moreTabs.map((route) => (
              <Link key={route.href} href={route.href} className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors",
                  pathname === route.href
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                )}>
                <route.icon className="w-5 h-5" />
                <span>{route.label}</span>
              </Link>
            ))}
            <div className="mt-auto pt-4">
              <SignOutButton>
                <button className="flex items-center gap-2 text-base text-slate-600 hover:text-red-500 transition">
                  <LogOut className="w-5 h-5" /> Log out
                </button>
              </SignOutButton>
            </div>
          </nav>
        </DrawerContent>
      </Drawer>
    </>
  );
};
