export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Stripe checkout session creation API route
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { getSubscriptionServiceInstance } from '../../../../lib/subscription/subscription-service-factory';
import { SubscriptionTier } from '../../../../lib/vimeo-browser';

export async function POST(request) {
  try {
    // Get authenticated user session
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Parse request body
    const body = await request.json();
    const { tier } = body;
    
    if (!tier) {
      return NextResponse.json(
        { error: 'Missing tier parameter' },
        { status: 400 }
      );
    }
    
    // Convert tier string to enum
    let subscriptionTier;
    switch (tier.toUpperCase()) {
      case 'SILVER':
      case '1':
        subscriptionTier = SubscriptionTier.SILVER;
        break;
      case 'GOLD':
      case '2':
        subscriptionTier = SubscriptionTier.GOLD;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid tier parameter' },
          { status: 400 }
        );
    }
    
    // Get subscription service
    const subscriptionService = getSubscriptionServiceInstance();
    
    // Create checkout session
    const checkoutSession = await subscriptionService.createCheckoutSession(
      userId,
      subscriptionTier
    );
    
    // Return checkout URL
    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        message: error.message
      },
      { status: 500 }
    );
  }
}
