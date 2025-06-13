import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/", 
    "/contact", 
    "/videos", 
    "/about", 
    "/api/(.*)",
    "/favicon.ico",
    "/images/(.*)",
    "/vimeo-standalone",
    "/vimeo-demo"
  ],
  // Routes that can always be accessed, and have no authentication information
  ignoredRoutes: ["/api/webhook/(.*)"]
});

// Stop Middleware running on static files and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
