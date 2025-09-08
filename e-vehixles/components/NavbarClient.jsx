// components/NavbarClient.jsx
"use client";

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
import { useEffect, useState } from "react";

export default function NavbarClient({ isAdmin = false, isAdminPage = false, links = [] }) {
  const [mounted, setMounted] = useState(false);

  // ensure we only render auth-dependent UI after client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-3">
        {isAdminPage ? (
          <Link href="/">
            <Button variant="outline" className="hidden md:inline-flex text-sm px-4 py-2">
              <ArrowLeft size={18} />
              Back to App
            </Button>
          </Link>
        ) : (
          <>
            {/* Desktop auth area: always output the same wrapper so server/client DOM locations match */}
            <div className="hidden md:flex items-center gap-2">
              {/* While not mounted, show nothing but keep the wrapper DIV */}
              {!mounted ? (
                // placeholder — keeps markup identical server & client until mounted
                <div aria-hidden className="w-full" />
              ) : (
                // after mount, render Clerk components
                <>
                  <SignedIn>
                    <Link href="/saved">
                      <Button
                        variant="default"
                        className="hidden md:inline-flex text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700"
                      >
                        My Saved
                      </Button>
                    </Link>
                  </SignedIn>

                  <SignedIn>
                    {isAdmin ? (
                      <Link href="/admin">
                        <Button variant="outline" className="hidden md:inline-flex text-sm px-4 py-2">
                          Admin Portal
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/booking">
                        <Button variant="outline" className="hidden md:inline-flex text-sm px-4 py-2">
                          My Booking
                        </Button>
                      </Link>
                    )}
                  </SignedIn>

                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button variant="default" className="text-sm px-4 py-2 bg-indigo-600">
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button variant="outline" className="text-sm px-4 py-2 border-gray-300">
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </SignedOut>

                  <SignedIn>
                    <UserButton
                      appearance={{ elements: { avatarBox: "w-10 h-10" } }}
                      afterSignOutUrl="/"
                    />
                  </SignedIn>
                </>
              )}
            </div>

            {/* Mobile Drawer trigger + content (we do same mounted guard inside drawer) */}
            <Drawer direction="right">
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <HiMenu className="w-6 h-6" />
                </Button>
              </DrawerTrigger>

              <DrawerContent className="h-full w-[85%] ml-auto rounded-l-xl">
                <div className="p-4">
                  <DrawerHeader>
                    <DrawerTitle>
                      <div className="flex items-center justify-between mb-6">
                        <Link href="/">
                          <img src="/logo2.png" alt="Emurta" className="h-12" />
                        </Link>
                        <DrawerClose asChild>
                          <Button variant="ghost" size="icon">
                            <X className="w-6 h-6 text-gray-600" />
                          </Button>
                        </DrawerClose>
                      </div>
                    </DrawerTitle>
                  </DrawerHeader>

                  {isAdminPage ? (
                    <Link href="/">
                      <Button variant="outline" className="w-full py-3 text-base">
                        Back to App
                      </Button>
                    </Link>
                  ) : (
                    <>
                      {links.map((link) => (
                        <Link href={link.href} key={link.href}>
                          <Button variant="ghost" className="w-full justify-start px-4 py-3 text-base">
                            {link.label}
                          </Button>
                        </Link>
                      ))}

                      {/* Drawer auth area — keep wrapper stable and defer children */}
                      <div className="mt-4">
                        {!mounted ? (
                          <div aria-hidden />
                        ) : (
                          <>
                            <SignedIn>
                              <Link href="/booking">
                                <Button
                                  variant="default"
                                  className="w-full py-3 mt-6 text-base bg-indigo-600 hover:bg-indigo-700"
                                >
                                  My Booking
                                </Button>
                              </Link>
                            </SignedIn>

                            <SignedIn>
                              {isAdmin ? (
                                <Link href="/admin">
                                  <Button variant="outline" className="w-full py-3 text-base">
                                    Admin Portal
                                  </Button>
                                </Link>
                              ) : (
                                <Link href="/saved">
                                  <Button variant="outline" className="w-full py-3 text-base">
                                    My Saved
                                  </Button>
                                </Link>
                              )}
                            </SignedIn>

                            <SignedOut>
                              <SignInButton mode="modal">
                                <Button variant="outline" className="w-full py-3 text-base">
                                  Sign In
                                </Button>
                              </SignInButton>
                              <SignUpButton mode="modal">
                                <Button className="w-full py-3 text-base bg-indigo-600 hover:bg-indigo-700">
                                  Sign Up
                                </Button>
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
    </>
  );
}
