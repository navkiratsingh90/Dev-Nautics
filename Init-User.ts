'use client'
import { useSession } from 'next-auth/react'
import React, { useEffect } from 'react'
import UseGetMe from './hooks/UseGetMe'

const InitUser = () => {
	const {status} = useSession()
	
	UseGetMe(status == "authenticated")
	return null
}

export default InitUser

//// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "./auth";

// const PUBLIC_ROUTES = ["/"];

// const PARTNER_ONBOARDING_ROUTES = [
//   "/partner/onboarding",
// ];

// export async function proxy(req: NextRequest) {

//   const { pathname } = req.nextUrl;

//   // ignore static files
//   if (
//     pathname.startsWith("/_next") ||
//     pathname.startsWith("/favicon.ico") || 
		// /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(pathname)
//   ) {
//     return NextResponse.next();
//   }

//   // public apis
//   if (
//     PUBLIC_APIS.some((route) =>
//       pathname.startsWith(route)
//     )
//   ) {
//     return NextResponse.next();
//   }

//   // public routes
//   if (pathname.startsWith("/api/auth")) {
//     return NextResponse.next();
//   }

//   const session = await auth();

//   // not logged in
//   if (!session?.user) {
//     return NextResponse.redirect(
//       new URL("/", req.url)
//     );
//   }

//   // admin routes
//   if (pathname.startsWith("/admin")) {

//     if (session.user.role !== "admin") {

//       return NextResponse.redirect(
//         new URL("/", req.url)
//       );
//     }
//   }

//   // partner routes
//   if (pathname.startsWith("/partner")) {

//     // onboarding routes allowed
//     if (
//       PARTNER_ONBOARDING_ROUTES.includes(pathname)
//     ) {
//       return NextResponse.next();
//     }

//     if (session.user.role !== "partner") {

//       return NextResponse.redirect(
//         new URL("/", req.url)
//       );
//     }
//   }

//   // protected apis
//   if (pathname.startsWith("/api")) {

//     if (!session.user) {

//       return NextResponse.json(
//         {
//           msg: "Unauthorized",
//         },
//         {
//           status: 401,
//         }
//       );
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico).*)",
//   ],
// };