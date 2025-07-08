// Subscription types and interfaces
import { SubscriptionTier } from '../vimeo-browser';

// Subscription status types
export const SubscriptionStatus = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  UNPAID: 'unpaid',
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
  TRIALING: 'trialing',
  UNKNOWN: 'unknown'
};

// Subscription data structure
export const createSubscriptionData = (userId, status, tier, customerId) => ({
  userId,
  status,
  tier,
  customerId,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Checkout session data
export const createCheckoutSessionData = (userId, tier, successUrl, cancelUrl) => ({
  userId,
  tier,
  successUrl,
  cancelUrl
});

// Price data for subscription tiers
export const SubscriptionPrices = {
  BRONZE: 0,
  SILVER: 799, // $7.99
  GOLD: 999   // $9.99
};

// Subscription feature (e.g., "Access to all videos", "Premium support")
export const createSubscriptionFeature = (name, description, included = true) => ({
  name,
  description,
  included
});

// Subscription plan with features
export const createSubscriptionPlan = (tier, price, features) => ({
  tier,
  price,
  features
}); 
