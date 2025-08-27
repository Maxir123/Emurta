// middleware.js
import { NextResponse } from "next/server";
import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/saved-cars(.*)",
  "/my-booking(.*)",
]);

export default clerkMiddleware({
  async afterAuth(auth, req) {
    const { userId, redirectToSignIn } = auth;

    // If this is one of our protected paths and there's no user → redirect
    if (isProtectedRoute(req.nextUrl.pathname) && !userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // Otherwise let the request continue
    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    // Apply to all non-static, non-_next, non-favicon routes
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
