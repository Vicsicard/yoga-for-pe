import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Define public routes that don't require authentication
const publicPaths = [
  "/", 
  "/contact", 
  "/videos", 
  "/guest-speaking",
  "/sign-in",
  "/sign-up",
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/logout",
  "/favicon.ico",
  "/images/",
  "/thumbnails/",
  "/test",
  "/simple",
  "/test.html",
  "/api/webhook/",
  "/api/stripe/webhook"
];

// Check if a path is public
const isPublic = (path) => {
  return publicPaths.some(publicPath => path.startsWith(publicPath));
};

// Middleware to verify JWT token
export async function verifyToken(req) {
  try {
    // Get token from cookies
    const token = req.cookies.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Middleware to check subscription level
export async function checkSubscription(user, requiredPlan) {
  // If no user, only allow bronze/free content
  if (!user) {
    return requiredPlan === 'bronze';
  }
  
  // Get subscription details from user
  const { plan, status } = user.subscription;
  
  // Check if subscription is active
  const isActive = status === 'active' || status === 'trialing';
  
  if (!isActive) {
    return requiredPlan === 'bronze'; // Only allow bronze if not active
  }
  
  // Bronze is always accessible
  if (requiredPlan === 'bronze') {
    return true;
  }
  
  // Silver plan can access silver content
  if (plan === 'silver' && requiredPlan === 'silver') {
    return true;
  }
  
  // Gold plan can access both silver and gold content
  if (plan === 'gold' && (requiredPlan === 'silver' || requiredPlan === 'gold')) {
    return true;
  }
  
  return false;
}

// Main middleware function
export async function authMiddleware(req) {
  const path = req.nextUrl.pathname;
  
  // Allow public paths
  if (isPublic(path)) {
    return NextResponse.next();
  }
  
  // Verify token
  const user = await verifyToken(req);
  
  // If no token and not public path, redirect to sign-in
  if (!user) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(signInUrl);
  }
  
  // For content paths, check subscription level
  if (path.startsWith('/premium/')) {
    // Extract plan from path (e.g., /premium/silver/... or /premium/gold/...)
    const segments = path.split('/');
    const requiredPlan = segments[2] || 'bronze';
    
    const hasAccess = await checkSubscription(user, requiredPlan);
    
    if (!hasAccess) {
      // Redirect to upgrade page
      const upgradeUrl = new URL('/subscription/upgrade', req.url);
      upgradeUrl.searchParams.set('current', user.subscription.plan);
      upgradeUrl.searchParams.set('required', requiredPlan);
      return NextResponse.redirect(upgradeUrl);
    }
  }
  
  // Allow access
  return NextResponse.next();
}
