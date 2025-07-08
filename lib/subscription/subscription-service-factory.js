// Subscription service factory
import { SubscriptionService } from './subscription-service';
import { MockSubscriptionService } from './mock-subscription-service';
import { StripeSubscriptionService } from './stripe-subscription-service';

// Environment check for Stripe configuration
const isStripeConfigured = ()=> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  return !!stripeKey && stripeKey !== 'sk_test_placeholder';
};

// Factory function to get the appropriate subscription service
export const getSubscriptionService = ()=> {
  // Check if we're in test mode or if Stripe is not configured
  const useMock = process.env.USE_MOCK_SUBSCRIPTION === 'true' || !isStripeConfigured();
  
  if (useMock) {
    console.log('Using mock subscription service');
    return new MockSubscriptionService();
  } else {
    console.log('Using Stripe subscription service');
    return new StripeSubscriptionService();
  }
};

// Singleton instance
let subscriptionServiceInstance= null;

// Get or create subscription service instance
export const getSubscriptionServiceInstance = ()=> {
  if (!subscriptionServiceInstance) {
    subscriptionServiceInstance = getSubscriptionService();
  }
  return subscriptionServiceInstance;
};
