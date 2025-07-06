// Mock subscription service implementation
import { SubscriptionTier } from '../vimeo-browser';
import { SubscriptionService } from './subscription-service';
import { CheckoutSessionData, SubscriptionData, SubscriptionPlan, SubscriptionStatus, SubscriptionFeature } from './types';

// Mock database of user subscriptions
const mockSubscriptions: Record<string, SubscriptionData> = {};

// Mock subscription plans
const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'bronze',
    tier: SubscriptionTier.BRONZE,
    name: 'Bronze',
    description: 'Free access to select videos',
    price: 0,
    priceId: 'price_bronze_free',
    features: [
      { title: 'Access to free videos', included: true },
      { title: 'Basic meditation content', included: true },
      { title: 'Silver tier content', included: false },
      { title: 'Gold tier content', included: false },
    ]
  },
  {
    id: 'silver',
    tier: SubscriptionTier.SILVER,
    name: 'Silver',
    description: 'Access to most videos',
    price: 7.99,
    priceId: 'price_silver_monthly',
    features: [
      { title: 'Access to free videos', included: true },
      { title: 'Basic meditation content', included: true },
      { title: 'Silver tier content', included: true },
      { title: 'Gold tier content', included: false },
    ]
  },
  {
    id: 'gold',
    tier: SubscriptionTier.GOLD,
    name: 'Gold',
    description: 'Access to all videos',
    price: 9.99,
    priceId: 'price_gold_monthly',
    features: [
      { title: 'Access to free videos', included: true },
      { title: 'Basic meditation content', included: true },
      { title: 'Silver tier content', included: true },
      { title: 'Gold tier content', included: true },
    ]
  }
];

export class MockSubscriptionService implements SubscriptionService {
  async createCheckoutSession(userId: string, tier: SubscriptionTier): Promise<CheckoutSessionData> {
    console.log(`Creating mock checkout session for user ${userId} with tier ${tier}`);
    
    // Simulate checkout session creation
    const sessionId = `mock_session_${Date.now()}`;
    
    // In a real implementation, this would redirect to Stripe
    // For mock, we'll redirect to a local success page
    const url = `/api/mock-checkout/success?session_id=${sessionId}&tier=${tier}`;
    
    return {
      sessionId,
      url
    };
  }
  
  async getUserSubscription(userId: string): Promise<SubscriptionData | null> {
    console.log(`Getting subscription for user ${userId}`);
    return mockSubscriptions[userId] || null;
  }
  
  async hasAccessToTier(userId: string, requiredTier: SubscriptionTier): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    
    // If no subscription, only allow access to Bronze (free) tier
    if (!subscription) {
      return requiredTier === SubscriptionTier.BRONZE;
    }
    
    // Check if subscription is active
    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      return requiredTier === SubscriptionTier.BRONZE;
    }
    
    // Check if subscription tier is high enough
    return subscription.tier >= requiredTier;
  }
  
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    console.log(`Cancelling subscription ${subscriptionId}`);
    
    // Find the subscription by ID
    const userId = Object.keys(mockSubscriptions).find(
      uid => mockSubscriptions[uid].id === subscriptionId
    );
    
    if (!userId) {
      return false;
    }
    
    // Update subscription status
    mockSubscriptions[userId].cancelAtPeriodEnd = true;
    return true;
  }
  
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return mockSubscriptionPlans;
  }
  
  async createCustomerPortalSession(userId: string): Promise<string> {
    console.log(`Creating customer portal session for user ${userId}`);
    return `/account/subscription?user=${userId}`;
  }
  
  // Mock methods for testing
  
  // Create a mock subscription for testing
  createMockSubscription(userId: string, tier: SubscriptionTier): SubscriptionData {
    const subscription: SubscriptionData = {
      id: `mock_sub_${Date.now()}`,
      customerId: `mock_cus_${userId}`,
      status: SubscriptionStatus.ACTIVE,
      tier: tier,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      cancelAtPeriodEnd: false
    };
    
    mockSubscriptions[userId] = subscription;
    return subscription;
  }
}
