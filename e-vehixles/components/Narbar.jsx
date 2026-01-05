// components/Navbar.jsx (server)
import Link from "next/link";
import NavbarClient from "./NavbarClient";
import CenterLinks from "./CenterLinks";
import { checkUser } from "@/lib/checkUser";
import Image from "next/image";

export default async function Navbar({ isAdminPage = false }) {
  const user = await checkUser();
  const isAdmin = user?.role === "ADMIN";

  const links = [
    { label: "Home", href: "/" },
    { label: "Vehicles", href: "/vehicles" },
    { label: "About us", href: "/about" },
    { label: "Support", href: "/support" },
    { label: "Rentals", href: "/rentals" },
  ];

  return (
    <nav className="fixed bg-white p-2 top-0 left-0 w-full z-50 transition-all duration-300 shadow-md">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: logo */}
          <div className="flex items-center gap-1">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/logo2.png"
                alt="Emurta"
                width={120}
                height={40}
                className="h-25 w-auto md:h-25 transition-all duration-300 cursor-pointer"
                priority
              />
            </Link>
            {isAdminPage && (
              <span className="text-xs font-extralight hidden sm:inline">Admin</span>
            )}
          </div>

          {/* Center: links (client) */}
          <CenterLinks links={links} />

          {/* Right: auth + drawer */}
          <NavbarClient isAdmin={isAdmin} isAdminPage={isAdminPage} links={links} />
        </div>
      </div>
    </nav>
  );
}
