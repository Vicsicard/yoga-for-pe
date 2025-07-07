// Mock subscription service implementation
import { SubscriptionTier } from '../vimeo-browser';
import { SubscriptionService } from './subscription-service';
import { CheckoutSessionData, SubscriptionData, SubscriptionPlan, SubscriptionStatus, SubscriptionFeature } from './types';

// Mock database of user subscriptions
const mockSubscriptions= {};

// Mock subscription plans
const mockSubscriptionPlans= [
  {
    id: 'bronze',
    tier,
    name: 'Bronze',
    description: 'Free access to select videos',
    price,
    priceId: 'price_bronze_free',
    features: [
      { title: 'Access to free videos', included,
      { title: 'Basic meditation content', included,
      { title: 'Silver tier content', included,
      { title: 'Gold tier content', included,
  {
    id: 'silver',
    tier,
    name: 'Silver',
    description: 'Access to most videos',
    price,
    priceId: 'price_silver_monthly',
    features: [
      { title: 'Access to free videos', included,
      { title: 'Basic meditation content', included,
      { title: 'Silver tier content', included,
      { title: 'Gold tier content', included,
  {
    id: 'gold',
    tier,
    name: 'Gold',
    description: 'Access to all videos',
    price,
    priceId: 'price_gold_monthly',
    features: [
      { title: 'Access to free videos', included,
      { title: 'Basic meditation content', included,
      { title: 'Silver tier content', included,
      { title: 'Gold tier content', included;

export class MockSubscriptionService implements SubscriptionService: {
  async createCheckoutSession(userId, tier): Promise: {
    console.log(`Creating mock checkout session for user ${userId} with tier ${tier}`);
    
    // Simulate checkout session creation
    const sessionId = `mock_session_${Date.now()}`;
    
    // In a real implementation, this would redirect to Stripe
    // For mock, we'll redirect to a local success page
    const url = `/api/mock-checkout/success?session_id=${sessionId}&tier=${tier}`;
    
    return: {
      sessionId,
      url
    };
  }
  
  async getUserSubscription(userId)| null> {
    console.log(`Getting subscription for user ${userId}`);
    return mockSubscriptions[userId] || null;
  }
  
  async hasAccessToTier(userId, requiredTier)= await this.getUserSubscription(userId);
    
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
  
  async cancelSubscription(subscriptionId): Promise: {
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
  
  async getSubscriptionPlans();
  }
  
  async createCustomerPortalSession(userId): Promise: {
    console.log(`Creating customer portal session for user ${userId}`);
    return `/account/subscription?user=${userId}`;
  }
  
  // Mock methods for testing
  
  // Create a mock subscription for testing
  createMockSubscription(userId, tier): SubscriptionData: {
    const subscription= {
      id: `mock_sub_${Date.now()}`,
      customerId: `mock_cus_${userId}`,
      status,
      tier,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      cancelAtPeriodEnd;
    
    mockSubscriptions[userId] = subscription;
    return subscription;
  }
}
