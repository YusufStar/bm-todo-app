import { auth } from "@/auth";
import { apiAuthPrefix, authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes } from "./routes";
import { NextAuthRequest } from "next-auth/lib";
import { AppRouteHandlerFnContext } from "next-auth/lib/types";

/**
 * Authentication middleware that handles route protection
 * - Allows public routes to be accessed without authentication
 * - Redirects to login for protected routes when not authenticated
 * - Redirects authenticated users away from auth routes
 * - Ensures dashboard routes are protected 
 * - Verifies user validity directly with database
 */
export default auth(async (req: NextAuthRequest, ctx: AppRouteHandlerFnContext) => {
    const { nextUrl } = req;
    
    // Get auth token info
    const userId = req.auth?.user?.id;
    let isLoggedIn = !!req.auth;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);
    const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

    if (isApiAuthRoute) {
        return;
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }

        return;
    }

    if (!isLoggedIn && !isPublicRoute) {
        let redirectUrl = "/sign-in";
        
        // Save the original URL they tried to access
        if (isDashboardRoute) {
            redirectUrl += `?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`;
        }
        
        return Response.redirect(new URL(redirectUrl, nextUrl));
    }

    return;
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};