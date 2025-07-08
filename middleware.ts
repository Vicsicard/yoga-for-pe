import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Define user type with subscription
interface UserWithSubscription {
  id: string;
  name?: string;
  email?: string;
  subscription?: {
    status?: string;
    plan?: string;
  };
}

export async function middleware(request: NextRequest) {
  // For now, we'll skip authentication checks in middleware to avoid Edge Runtime issues
  // Authentication will be handled in page components or API routes
  
  // Check if the user is authenticated (placeholder - will be implemented in components)
  const isAuthenticated = false; // This would come from cookies/headers in a real implementation
  
  if (!isAuthenticated && isProtectedRoute(request.nextUrl.pathname)) {
    // Redirect to sign-in page with a return URL
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  // Check if user has an active subscription for premium content
  if (isAuthenticated && isPremiumRoute(request.nextUrl.pathname)) {
    // For premium route checks, we'll handle this in the page components
    // This avoids database calls in middleware which can cause Edge Runtime issues
    // The actual subscription check will be done in the page component
  }
  
  return NextResponse.next();
}

// Helper function to check if a route requires authentication
function isProtectedRoute(pathname) {
  const protectedPaths = [
    '/premium',
    '/subscription',
    '/account',
    '/videos/premium'
  ];
  
  return protectedPaths.some(path => pathname.startsWith(path));
}

// Helper function to check if a route requires premium subscription
function isPremiumRoute(pathname) {
  const premiumPaths = [
    '/premium',
    '/videos/premium'
  ];
  
  return premiumPaths.some(path => pathname.startsWith(path));
}

// Specify which routes the middleware should run on
export const config = {
  matcher: [
    // Protected routes that require authentication
    '/premium/:path*',
    '/subscription/:path*',
    '/account/:path*',
    '/videos/premium/:path*'
  ],
};
