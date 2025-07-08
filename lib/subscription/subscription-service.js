// Subscription service interface
import { CheckoutSessionData, SubscriptionData, SubscriptionPlan } from './types';

// Basic subscription service interface
export class SubscriptionService {
  async createCheckoutSession(userId, tier) {
    throw new Error('Not implemented');
  }

  async getSubscription(userId) {
    throw new Error('Not implemented');
  }

  async cancelSubscription(userId) {
    throw new Error('Not implemented');
  }
} 
