// Stripe checkout session creation API route
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { getSubscriptionServiceInstance } from '../../../../lib/subscription/subscription-service-factory';
import { SubscriptionTier } from '../../../../lib/vimeo-browser';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
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
    let subscriptionTier: SubscriptionTier;
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
      sessionId: checkoutSession.sessionId,
      url: checkoutSession.url 
    });
  } catch (error: any) {
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
