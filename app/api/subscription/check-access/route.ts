// API route to check if a user has access to a specific subscription tier
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { getSubscriptionServiceInstance } from '../../../../lib/subscription/subscription-service-factory';
import { SubscriptionTier } from '../../../../lib/vimeo-browser';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { hasAccess: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
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
    let videoTier: SubscriptionTier;
    try {
      videoTier = parseInt(videoTierParam, 10) as SubscriptionTier;
      
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
  } catch (error: any) {
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
