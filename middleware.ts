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

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
