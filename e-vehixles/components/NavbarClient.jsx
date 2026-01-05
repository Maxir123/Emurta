// components/NavbarClient.jsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { HiMenu } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";

function cn(...args) {
  return args.filter(Boolean).join(" ");
}

/**
 * Drawer behavior:
 * - When a link in the drawer is clicked we call router.push(href)
 * - We await either navigation completion OR a 5s timeout (whichever first)
 * - After that we close the drawer (setDrawerOpen(false))
 *
 * To force a pure 5s delay instead of waiting for navigation, change CLOSE_AFTER_MS or
 * replace `Promise.race` logic with a direct `await new Promise(r => setTimeout(r, 5000))`.
 */

const CLOSE_AFTER_MS = 5000; // fallback timeout (ms)

export default function NavbarClient({ isAdmin = false, isAdminPage = false, links = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  // If route changes externally (pop/back), ensure drawer closes
  useEffect(() => {
    if (drawerOpen) setDrawerOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isActive = (href) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const activeText = "text-blue-600";
  const activeWrapper = "ring-2 ring-blue-100 bg-blue-50 shadow-md shadow-blue-300 rounded-full";

  // click handler for drawer links: navigate then close drawer after nav or timeout
  const handleDrawerNav = useCallback(
    async (href) => {
      // open navigation (router.push returns a promise in app router)
      try {
        const navPromise = router.push(href);
        const timeoutPromise = new Promise((res) => setTimeout(res, CLOSE_AFTER_MS));
        // wait for whichever completes first: navigation or timeout
        await Promise.race([navPromise, timeoutPromise]);
      } catch (err) {
        // navigation failure will still fall through to closing the drawer
        console.warn("Navigation error:", err);
      } finally {
        setDrawerOpen(false);
      }
    },
    [router]
  );

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {isAdminPage ? (
        <Button asChild variant="outline" className="hidden md:inline-flex text-sm px-4 py-2">
          <Link href="/"><ArrowLeft size={18} /> Back to App</Link>
        </Button>
      ) : (
        <>
          {/* Right-side auth (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {!mounted ? (
              <div aria-hidden className="w-40" />
            ) : (
              <>
                <SignedIn>
                  <Button asChild variant="default" className="hidden md:inline-flex text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700">
                    <Link href="/saved">My Saved</Link>
                  </Button>
                </SignedIn>

                <SignedIn>
                  {isAdmin ? (
                    <Button asChild variant="outline" className="hidden md:inline-flex text-sm px-4 py-2">
                      <Link href="/admin">Admin Portal</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="hidden md:inline-flex text-sm px-4 py-2">
                      <Link href="/booking">My Booking</Link>
                    </Button>
                  )}
                </SignedIn>

                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="default" className="text-sm px-4 py-2 bg-indigo-600">Sign In</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button variant="outline" className="text-sm px-4 py-2 border-gray-300">Sign Up</Button>
                  </SignUpButton>
                </SignedOut>

                <SignedIn>
                  <UserButton appearance={{ elements: { avatarBox: "w-10 h-10" } }} afterSignOutUrl="/" />
                </SignedIn>
              </>
            )}
          </div>

          {/* Mobile Drawer (controlled) */}
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setDrawerOpen(true)}
              >
                <HiMenu className="w-6 h-6" />
              </Button>
            </DrawerTrigger>

            <DrawerContent className="h-full w-[85%] ml-auto rounded-l-xl">
              <div className="p-4">
                <DrawerHeader>
                  <DrawerTitle>
                    <div className="flex items-center justify-between mb-6">
                      <Link href="/"><img src="/logo2.png" alt="Emurta" className="h-12" /></Link>
                      <DrawerClose asChild>
                        <Button variant="ghost" size="icon">
                          <X className="w-6 h-6 text-gray-600" />
                        </Button>
                      </DrawerClose>
                    </div>
                  </DrawerTitle>
                </DrawerHeader>

                {isAdminPage ? (
                  <Button variant="outline" className="w-full py-3 text-base" onClick={() => { setDrawerOpen(false); router.push("/"); }}>
                    Back to App
                  </Button>
                ) : (
                  <>
                    {/* Drawer links use programmatic navigation so we can await navigation completion */}
                    <div className="space-y-1">
                      {links.map((link) => {
                        const active = isActive(link.href);
                        return (
                          <Button
                            key={link.href}
                            variant={active ? "default" : "ghost"}
                            className={cn(
                              "w-full justify-start px-4 py-3 text-base transition",
                              active ? cn(activeText, activeWrapper) : "text-gray-800 hover:bg-gray-50"
                            )}
                            onClick={() => handleDrawerNav(link.href)}
                          >
                            {link.label}
                          </Button>
                        );
                      })}
                    </div>

                    {/* Drawer auth area */}
                    <div className="mt-4">
                      {!mounted ? (
                        <div aria-hidden />
                      ) : (
                        <>
                          <SignedIn>
                            <Button
                              variant="default"
                              className="w-full py-3 mt-6 text-base bg-indigo-600 hover:bg-indigo-700"
                              onClick={() => handleDrawerNav("/booking")}
                            >
                              My Booking
                            </Button>
                          </SignedIn>

                          <SignedIn>
                            {isAdmin ? (
                              <Button
                                variant="outline"
                                className="w-full py-3 text-base"
                                onClick={() => handleDrawerNav("/admin")}
                              >
                                Admin Portal
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                className="w-full py-3 text-base"
                                onClick={() => handleDrawerNav("/saved")}
                              >
                                My Saved
                              </Button>
                            )}
                          </SignedIn>

                          <SignedOut>
                            <SignInButton mode="modal">
                              <Button variant="outline" className="w-full py-3 text-base">Sign In</Button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                              <Button className="w-full py-3 text-base bg-indigo-600 hover:bg-indigo-700">Sign Up</Button>
                            </SignUpButton>
                          </SignedOut>

                          <SignedIn>
                            <div className="flex justify-center py-2">
                              <UserButton afterSignOutUrl="/" />
                            </div>
                          </SignedIn>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </DrawerContent>
          </Drawer>
        </>
      )}
    </div>
  );
}
