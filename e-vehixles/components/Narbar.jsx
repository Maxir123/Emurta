import Link from "next/link";
import { ArrowLeft, Search, X } from "lucide-react";
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
import { checkUser } from "@/lib/checkUser";

export default async function Navbar({ isAdminPage = false }) {
  const user = await checkUser();
  const isAdmin =  user?.role === "ADMIN";



  const links = [
    { label: "Home", href: "/" },
    { label: "Vehicles", href: "/vehicles" },
    { label: "Customization", href: "/customization" },
    { label: "Support", href: "/support" },
    { label: "Rentals", href: "/rentals" },
  ];

  return (
   <nav className="fixed bg-white p-2 top-0 left-0 w-full z-50 transition-all duration-300 shadow-md ">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
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

          {/* Desktop nav */}
          {!isAdminPage && (
            <div className="hidden lg:flex lg:items-center lg:space-x-1">
              {links.map((link) => (
                <Link href={link.href} key={link.href}>
                  <Button variant="ghost" className="px-4 py-6 rounded-full text-sm font-medium">
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          )}

          {/* Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin only */}
            {isAdminPage ? (
              <Link href="/">
                <Button variant="outline" className="hidden md:inline-flex text-sm px-4 py-2">
                  <ArrowLeft size={18} />
                  Back to App
                </Button>
              </Link>
            ) : (
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

                {/* Auth buttons */}
                <div className="hidden md:flex items-center gap-2">
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
                      appearance={{
                        elements: { avatarBox: "w-10 h-10" },
                      }}
                      afterSignOutUrl="/"
                    />
                  </SignedIn>
                </div>
              </>
            )}

            {/* Drawer (mobile) */}
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
                  {/* Drawer Header */}
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

                  {/* Drawer Content */}
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
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </nav>
  );
}
