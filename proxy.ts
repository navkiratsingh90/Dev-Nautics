
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  const isLoggedIn = !!user;
  const userId = user?.id;
  const userRole = user?.role;

  // Authentication routes
  const isAuthRoute =
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    pathname.startsWith("/otp");

  // Admin routes
  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  // Public routes
  const isPublicRoute =
    pathname === "/" ||
    isAuthRoute;

  // 1. Protect admin routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL("/sign-in", req.url)
      );
    }

    if (userRole !== "admin") {
      return NextResponse.redirect(
        new URL(userId ? `/${userId}` : "/", req.url)
      );
    }

    return NextResponse.next();
  }

  // 2. Prevent logged-in users from accessing auth pages
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(
      new URL(userId ? `/${userId}` : "/", req.url)
    );
  }

  // 3. Protect all private routes
  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(
      new URL("/sign-in", req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
