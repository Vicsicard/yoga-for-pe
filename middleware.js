import { NextResponse } from 'next/server';
import { auth } from './auth';
import { NextRequest } from 'next/server';

// Define user 
  
  // Check if the user is authenticated
  if (!session && isProtectedRoute(request.nextUrl.pathname)) {
    // Redirect to sign-in page with a return URL
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  // Check if user has an active subscription for premium content
  if (session && isPremiumRoute(request.nextUrl.pathname)) {
    const user = session.user as UserWithSubscription;
    const subscription = user?.subscription;
    
    // If not on bronze plan and subscription is not active, redirect to subscription page
    if (subscription?.plan !== 'bronze' && subscription?.status !== 'active') {
      return NextResponse.redirect(new URL('/subscription/plans', request.url));
    }
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
