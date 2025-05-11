import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [];
const publicRoutes = [
  "/",
  "/signup",
  "/signin",
  "/confirm-account",
  "forgot-password",
  "reset-password",
  "/verify-mfa",
];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path) || path.startsWith("/dashboard");
  const isPublicRoute = publicRoutes.includes(path);

  const accessToken = req.cookies.get("accessToken")?.value;

  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl));
  }

  if (isPublicRoute && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}