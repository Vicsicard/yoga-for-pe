import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files, and public pages
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/' ||
    pathname === '/sign-in' ||
    pathname === '/sign-up' ||
    pathname === '/signup' ||
    pathname.startsWith('/test-')
  ) {
    return NextResponse.next();
  }

  // Check JWT token for protected routes
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  let isAuthenticated = false;
  let user = null;
  
  if (token) {
    try {
      // Use JWT_SECRET from environment or fallback
      const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_for_yoga_pe_app_development_2024';
      console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
      
      // Verify the token
      const decoded = jwt.verify(token, secret);
      
      // Validate userId in token
      if (!decoded.userId) {
        console.error('Token missing userId field');
        throw new Error('Invalid token format: missing userId');
      }
      
      // Ensure userId is a string
      if (typeof decoded.userId !== 'string') {
        console.log('Converting userId to string:', decoded.userId);
        decoded.userId = String(decoded.userId);
      }
      
      isAuthenticated = true;
      user = decoded;
      console.log('User authenticated successfully, userId:', decoded.userId);
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      console.error('Token first 10 chars:', token ? token.substring(0, 10) + '...' : 'null');
    }
  } else {
    console.log('No auth token found in request');
  }
  
  // Check if the user is authenticated for protected routes
  if (!isAuthenticated && isProtectedRoute(pathname)) {
    // Redirect to sign-in page with a return URL
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
}

// Helper function to check if a route requires authentication
function isProtectedRoute(pathname) {
  const protectedPaths = [
    '/premium',
    '/account',
    '/videos/premium',
    '/dashboard'
  ];
  
  // Allow access to subscription selection page for authenticated users
  // This page should be accessible after signup
  if (pathname === '/subscription/select') {
    return false; // Don't require additional auth - handled by client-side auth context
  }
  
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
