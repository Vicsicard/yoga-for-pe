// Mock checkout success route
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionTier } from '../../../../lib/vimeo-browser';
import { MockSubscriptionService } from '../../../../lib/subscription/mock-subscription-service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');
  const tierParam = searchParams.get('tier');
  
  if (!sessionId || !tierParam) {
    return NextResponse.json(
      { error: 'Missing session_id or tier parameter' },
      { status: 400 }
    );
  }
  
  // Parse tier from string to enum
  let tier: SubscriptionTier;
  switch (tierParam) {
    case '1':
    case 'SILVER':
    case 'silver':
      tier = SubscriptionTier.SILVER;
      break;
    case '2':
    case 'GOLD':
    case 'gold':
      tier = SubscriptionTier.GOLD;
      break;
    default:
      tier = SubscriptionTier.BRONZE;
  }
  
  try {
    // In a real implementation, we would get the user ID from the session
    // For now, we'll use a mock user ID
    const userId = 'mock_user_123';
    
    // Create a mock subscription for the user
    const mockService = new MockSubscriptionService();
    const subscription = mockService.createMockSubscription(userId, tier);
    
    // Redirect to success page
    return NextResponse.redirect(new URL('/account/subscription?success=true', request.url));
  } catch (error) {
    console.error('Error processing mock checkout:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    );
  }
}
