// API route to check if a user has access to a specific subscription tier
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { getSubscriptionServiceInstance } from '../../../../lib/subscription/subscription-service-factory';
import { SubscriptionTier } from '../../../../lib/vimeo-browser';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Skip auth during build/static generation
    if (!request.headers) {
      return NextResponse.json(
        { hasAccess: false, error: 'Static generation mode' },
        { status: 500 }
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
