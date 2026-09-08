import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  const isLoggedIn = !!user;

  const isAuthRoute =
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    pathname.startsWith("/otp");

  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  // Only these routes are accessible without login
  const isPublicRoute =
    pathname === "/" ||
    isAuthRoute;

  // Admin protection
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL("/sign-in", req.url)
      );
    }

    if (user.role !== "admin") {
      return NextResponse.redirect(
        new URL(`/${user.id}`, req.url)
      );
    }

    return NextResponse.next();
  }

  // Logged-in user cannot access auth pages
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(
      new URL(`/${user.id}`, req.url)
    );
  }

  // Everything except public routes requires login
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