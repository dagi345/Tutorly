// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/tutor/:path*",
  "/admin/:path*",
  "/student/:path*",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return; // allow public routes

  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url));

  // fetch Convex role and redirect if necessary
  const convexUser = await fetch(
    `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/query?path=users:getUserByClerkId&args=${encodeURIComponent(
      JSON.stringify({ clerkId: userId })
    )}`,
    { headers: { Authorization: `Bearer ${process.env.CONVEX_ADMIN_KEY}` } }
  ).then((r) => r.json());

  const role = convexUser?.role ?? "student";
  const url = req.nextUrl.clone();
  console.log(url)


  
  if (url.pathname.startsWith("/admin") && role !== "admin")
    return NextResponse.redirect(new URL("/student/dashboard", req.url));
  if (url.pathname.startsWith("/tutor") && !["tutor", "admin"].includes(role))
    return NextResponse.redirect(new URL("/student/dashboard", req.url));
  if (url.pathname.startsWith("/student") && role === "tutor")
    return NextResponse.redirect(new URL("/tutor/dashboard", req.url));
  if (url.pathname.startsWith("/student") && role === "admin")
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};