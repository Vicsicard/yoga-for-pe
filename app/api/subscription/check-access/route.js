// API route to check if a user has access to a specific subscription tier
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { getSubscriptionServiceInstance } from '../../../../lib/subscription/subscription-service-factory';
import { SubscriptionTier } from '../../../../lib/vimeo-browser';

// Module-level static generation guard
const isStaticExport =
  typeof process !== 'undefined' &&
  (process.env.NEXT_PHASE || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'production');

export const dynamic = 'force-dynamic';

export const GET = isStaticExport
  ? async function () {
      return NextResponse.json(
        { hasAccess: false, error: 'Static generation mode (module-level guard)' },
        { status: 200 }
      );
    }
  : async function (request) {
  try {
    // Skip auth during build/static generation
    if (
      typeof window !== 'undefined' ||
      !request ||
      !request.headers ||
      process.env.NODE_ENV === 'development' ||
      process.env.NEXT_PHASE // Vercel static export/build
    ) {
      // Return early during static generation or build time
      return NextResponse.json(
        { hasAccess: false, error: 'Static generation mode' },
        { status: 200 }
      );
    }
    
    // Get authenticated user session
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { hasAccess: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get video tier from query params
    const searchParams = request.nextUrl.searchParams;
    const videoTierParam = searchParams.get('videoTier');
    
    if (!videoTierParam) {
      return NextResponse.json(
        { hasAccess: false, error: 'Missing videoTier parameter' },
        { status: 400 }
      );
    }
    
    // Parse tier from string to enum
    let videoTier;
    try {
      videoTier = parseInt(videoTierParam, 10);
      
      // Validate the tier is a valid enum value
      if (![SubscriptionTier.BRONZE, SubscriptionTier.SILVER, SubscriptionTier.GOLD].includes(videoTier)) {
        throw new Error('Invalid tier value');
      }
    } catch (error) {
      return NextResponse.json(
        { hasAccess: false, error: 'Invalid videoTier parameter' },
        { status: 400 }
      );
    }
    
    // Get subscription service
    const subscriptionService = getSubscriptionServiceInstance();
    
    // Check if user has access to the requested tier
    const hasAccess = await subscriptionService.hasAccessToTier(userId, videoTier);
    
    return NextResponse.json({ hasAccess });
  } catch (error) {
    console.error('Error checking subscription access:', error);
    return NextResponse.json(
      { 
        hasAccess: false, 
        error: 'Failed to check subscription access',
        message: error.message
      },
      { status: 500 }
    );
  }
}

const staticHandler = async function () {
  return NextResponse.json(
    { hasAccess: false, error: 'Static generation mode (module-level guard)' },
    { status: 200 }
  );
}

export { dynamic, getHandler: isStaticExport ? staticHandler : getHandler };
