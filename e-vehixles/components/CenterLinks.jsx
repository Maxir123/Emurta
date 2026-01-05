// components/CenterLinks.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function cn(...args) {
  return args.filter(Boolean).join(" ");
}

export default function CenterLinks({ links = [] }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const activeText = "text-blue-600";
  const activeWrapper = "ring-2 ring-blue-100 bg-blue-50 shadow-md shadow-blue-300 rounded-full";

  return (
    // make the center area only visible on large screens
    <div className="hidden lg:flex flex-1 justify-center">
      <div className="flex items-center gap-2">
        {links.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex items-center px-4 py-2 text-sm font-medium transition",
                active ? cn(activeText, activeWrapper) : "text-gray-800 hover:bg-gray-100 rounded-full"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
