import { auth } from "@/auth";
import {
  apiAuthPrefix,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  publicRoutes,
} from "./routes";
import { NextAuthRequest } from "next-auth/lib";
import { AppRouteHandlerFnContext } from "next-auth/lib/types";
import { neon } from "@neondatabase/serverless";

/**
 * Authentication middleware that handles route protection
 * - Allows public routes to be accessed without authentication
 * - Redirects to login for protected routes when not authenticated
 * - Redirects authenticated users away from auth routes
 * - Ensures dashboard routes are protected
 * - Verifies user validity directly with database
 */
export default auth(
  async (req: NextAuthRequest, ctx: AppRouteHandlerFnContext) => {
    const { nextUrl } = req;
    
    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);
    const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
    const isLogoutRoute = nextUrl.pathname === "/logout";

    // Skip middleware for API auth routes
    if (isApiAuthRoute) {
      return;
    }

    // Get auth token info
    const userEmail = req.auth?.user?.email;
    const isAuthenticated = !!req.auth;

    // Only validate the user in the database if they are authenticated
    // and trying to access a protected route
    let isValidUser = true;
    if (isAuthenticated && !isPublicRoute && !isAuthRoute && !isLogoutRoute) {
      try {
        const sql = neon(process.env.DATABASE_URL!);
        // Fixed query: Use "\"User\"" with double quotes to handle case sensitivity
        const validUser = await sql`SELECT * FROM "User" WHERE "email" = ${userEmail}`;
        isValidUser = validUser.length > 0;
        
        // If the user is authenticated but not valid in our database,
        // redirect them to logout
        if (!isValidUser) {
          return Response.redirect(new URL("/logout", nextUrl));
        }
      } catch (error) {
        console.error("Database validation error:", error);
        // If there's a database error, err on the side of caution
        // and don't block the user
        isValidUser = true;
      }
    }

    // Handle auth routes (sign-in, sign-up, etc.)
    if (isAuthRoute) {
      if (isAuthenticated) {
        return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
      }
      return;
    }

    // Handle protected routes
    if (!isAuthenticated && !isPublicRoute) {
      let redirectUrl = "/sign-in";

      // Save the original URL they tried to access
      if (isDashboardRoute) {
        redirectUrl += `?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`;
      }

      return Response.redirect(new URL(redirectUrl, nextUrl));
    }

    return;
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
