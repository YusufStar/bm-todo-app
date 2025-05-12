import { NextRequest, NextResponse } from "next/server";

const publicRoutes = [
  "/signup",
  "/signin",
  "/confirm-account",
  "/forgot-password",
  "/reset-password",
  "/verify-mfa",
];

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|static|.*\\..*$).*)',
  ],
};

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = path.startsWith("/dashboard");
  const isPublicRoute = publicRoutes.includes(path);

  const accessToken = req.cookies.get("accessToken")?.value;
  
  // Eğer korumalı bir route ise ve erişim tokeni yoksa giriş sayfasına yönlendir
  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl));
  }

  // Eğer public route ise ve erişim tokeni varsa dashboard'a yönlendir
  // Ancak bu bir signin sayfası ise ve kullanıcı signin yapmaya çalışıyorsa, 
  // yönlendirmeyi engelleyip işlemi devam ettirmeliyiz
  if (isPublicRoute && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // Diğer tüm durumlar için normal akışa devam et
  return NextResponse.next();
}