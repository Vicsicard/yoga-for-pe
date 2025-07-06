// Subscription service interface
import { SubscriptionTier } from '../vimeo-browser';
import { CheckoutSessionData, SubscriptionData, SubscriptionPlan } from './types';

export interface SubscriptionService {
  // Create a checkout session for a subscription
  createCheckoutSession(userId: string, tier: SubscriptionTier): Promise<CheckoutSessionData>;
  
  // Get a user's subscription data
  getUserSubscription(userId: string): Promise<SubscriptionData | null>;
  
  // Check if a user has access to a specific tier
  hasAccessToTier(userId: string, requiredTier: SubscriptionTier): Promise<boolean>;
  
  // Cancel a subscription
  cancelSubscription(subscriptionId: string): Promise<boolean>;
  
  // Get available subscription plans
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  
  // Create a customer portal session for managing subscriptions
  createCustomerPortalSession(userId: string): Promise<string>;
}
