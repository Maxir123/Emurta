// components/Navbar.jsx
import Link from "next/link";
import NavbarClient from "./NavbarClient";
import { checkUser } from "@/lib/checkUser";

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

  // Render static parts server-side and delegate interactive parts to client component
  return (
    <nav className="fixed bg-white p-2 top-0 left-0 w-full z-50 transition-all duration-300 shadow-md">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo (server-safe) */}
          <div className="flex items-center gap-1">
            <Link href="/">
              <img
                src="/logo2.png"
                alt="Emurta"
                className="h-25 md:h-30 lg:h-30 transition-all duration-300 cursor-pointer"
              />
            </Link>
            {isAdminPage && <span className="text-xs font-extralight">Admin</span>}
          </div>

          {/* Desktop nav links (static) */}
          {!isAdminPage && (
            <div className="hidden lg:flex lg:items-center lg:space-x-1">
              {links.map((link) => (
                <Link href={link.href} key={link.href}>
                  <button className="px-4 py-6 rounded-full text-sm font-medium hover:bg-gray-100">
                    {link.label}
                  </button>
                </Link>
              ))}
            </div>
          )}

          {/* Interactive utilities moved to client component */}
          <NavbarClient isAdmin={isAdmin} isAdminPage={isAdminPage} links={links} />
        </div>
      </div>
    </nav>
  );
}
