// Subscription types and interfaces
import { SubscriptionTier } from '../vimeo-browser';

// Subscription status types
export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  TRIALING = 'trialing'
}

// Subscription data interface
export interface SubscriptionData {
  id: string;
  customerId: string;
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  currentPeriodEnd: string; // ISO date string
  cancelAtPeriodEnd: boolean;
}

// Checkout session data
export interface CheckoutSessionData {
  sessionId: string;
  url: string;
}

// Price data for subscription tiers
export interface PriceData {
  id: string;
  tier: SubscriptionTier;
  amount: number; // in cents
  currency: string;
  interval: 'month' | 'year';
  name: string;
  description: string;
}

// Subscription feature (e.g., "Access to all videos", "Premium support")
export interface SubscriptionFeature {
  title: string;
  included: boolean;
}

// Subscription plan with features
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  tier: SubscriptionTier;
  priceId: string;
  features: SubscriptionFeature[];
}
