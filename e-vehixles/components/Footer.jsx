"use client";

import { useRouter, usePathname } from "next/navigation";

const sections = [
  {
    title: "Explore Vehicles",
    links: [
      { label: "High-demand Vehicles", href: "/vehicles/high-demand" },
      { label: "Repairable Vehicles", href: "/vehicles/repairable" },
      { label: "Automobiles From China", href: "/vehicles/china" },
      { label: "Well-maintained Vehicles", href: "/vehicles/well-maintained" },
      { label: "EVs", href: "/vehicles/evs" },
    ],
  },
  {
    title: "Earn with Emurta",
    links: [
      { label: "Sell Your Vehicle", href: "/sell" },
      { label: "Refer & Earn", href: "/refer" },
      { label: "Affiliate Program", href: "/affiliate" },
    ],
  },
  {
    title: "Get Help",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Support Center", href: "/support" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Inside Emurta",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Privacy Policy", href: "/policy/privacy" },
      { label: "Terms & Conditions", href: "/policy/terms" },
      { label: "Accessibility", href: "/policy/accessibility" },
    ],
  },
];

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide footer on admin routes
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-black text-white py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-wrap md:flex-row justify-between gap-8">

          <div className="flex-shrink-0">
            <img
              src="/Logo1.png"
              alt="Emurta Logo"
              className="h-30 w-auto cursor-pointer"
              onClick={() => router.push("/")}
            />
            <div className="mt-4 flex space-x-4">
              {/* Social Media Icons */}
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://cdn.simpleicons.org/facebook/ffffff"
                  alt="Facebook"
                  className="h-5 w-5"
                />
              </a>
              <a
                href="https://twitter.com"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://cdn.simpleicons.org/X/ffffff"
                  alt="Twitter"
                  className="h-5 w-5"
                />
              </a>

              <a
                href="https://instagram.com"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://cdn.simpleicons.org/instagram/ffffff"
                  alt="Instagram"
                  className="h-5 w-5"
                />
              </a>
              <a
                href="https://tiktok.com"
                aria-label="TikTok"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://cdn.simpleicons.org/tiktok/ffffff"
                  alt="TikTok"
                  className="h-5 w-5"
                />
              </a>
              <a
                href="https://youtube.com"
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://cdn.simpleicons.org/youtube/ffffff"
                  alt="YouTube"
                  className="h-5 w-5"
                />
              </a>
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title} className="flex-1 min-w-[150px]">
              <h4 className="font-semibold mb-3 border-b border-white/10 pb-1">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li
                    key={link.href}
                    onClick={() => router.push(link.href)}
                    className="text-sm hover:underline cursor-pointer"
                  >
                    {link.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex-1 min-w-[150px]">
            <h4 className="font-semibold mb-3 border-b border-white/10 pb-1">
              Language / Region
            </h4>
            <select
              className="bg-black border border-white/20 text-sm p-2 rounded"
              defaultValue="en"
            >
              <option value="en">English (Nigeria)</option>
              <option value="en-us">English (US)</option>
              <option value="fr">French</option>
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <h4 className="font-semibold mb-3 border-b border-white/10 pb-1">
              Contact Info
            </h4>
            <ul className="space-y-2 text-sm">
              <li>Email: support@emurta.com</li>
              <li>Phone: +234 903 955 7658</li>
              <li>Abuja, Nigeria</li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mx-auto mt-4 text-xs underline opacity-80 hover:opacity-100"
        >
          Back to Top
        </button>

        <div className="mt-8 text-center text-xs opacity-70">
          © {new Date().getFullYear()} Emurta Cars. All rights reserved.
        </div>
      </div>
    </footer>
  );
}