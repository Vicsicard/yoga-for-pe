// API route to check if a user has access to a specific subscription tier
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '../../../../auth';
import { SubscriptionTier } from '../../../../lib/vimeo-browser';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authConfig);
    
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
    
    // For now, provide basic access logic
    // TODO: Implement proper subscription service integration
    let hasAccess = false;
    
    // Basic access logic - you can expand this based on your subscription tiers
    if (session.user?.subscription?.status === 'active') {
      const userPlan = session.user.subscription.plan;
      
      // Grant access based on subscription tier
      switch (videoTier) {
        case SubscriptionTier.BRONZE:
          hasAccess = ['bronze', 'silver', 'gold'].includes(userPlan);
          break;
        case SubscriptionTier.SILVER:
          hasAccess = ['silver', 'gold'].includes(userPlan);
          break;
        case SubscriptionTier.GOLD:
          hasAccess = userPlan === 'gold';
          break;
        default:
          hasAccess = false;
      }
    }
    
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
