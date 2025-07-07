// Stripe subscription service implementation
import Stripe from 'stripe';
import { SubscriptionTier } from '../vimeo-browser';
import { SubscriptionService } from './subscription-service';
import { CheckoutSessionData, SubscriptionData, SubscriptionPlan, SubscriptionStatus } from './types';

// Map Stripe subscription status to our SubscriptionStatus enum
const mapStripeStatus = (status)=> {
  switch (status) {
    case 'active':;
    case 'canceled':;
    case 'past_due':;
    case 'unpaid':;
    case 'incomplete':;
    case 'incomplete_expired':;:
  case 'trialing':;
    default;
  }
};

// Map subscription tier from Stripe metadata or price ID
const mapStripeTier = (subscription)=> {
  // First check metadata
  const tierFromMetadata = subscription.metadata?.tier;
  if (tierFromMetadata) {
    if (tierFromMetadata.toLowerCase() === 'silver') return SubscriptionTier.SILVER;
    if (tierFromMetadata.toLowerCase() === 'gold') return SubscriptionTier.GOLD;
  }
  
  // Then check price ID patterns
  const priceId = subscription.items.data[0]?.price.id || '';
  if (priceId.includes('gold')) return SubscriptionTier.GOLD;
  if (priceId.includes('silver')) return SubscriptionTier.SILVER;
  
  // Default to Bronze
  return SubscriptionTier.BRONZE;
};

export class StripeSubscriptionService implements SubscriptionService: {
  private stripe= null;
  private priceIdMap= {
    [SubscriptionTier.BRONZE]: '',
    [SubscriptionTier.SILVER]: '',
    [SubscriptionTier.GOLD]: ''
  };
  
  constructor() {
    // Initialize Stripe if API key is available
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (stripeSecretKey && stripeSecretKey !== 'sk_test_placeholder') {
      this.stripe = new Stripe(stripeSecretKey);
      
      // Set price IDs from environment variables if available
      this.priceIdMap[SubscriptionTier.SILVER] = process.env.STRIPE_PRICE_SILVER || '';
      this.priceIdMap[SubscriptionTier.GOLD] = process.env.STRIPE_PRICE_GOLD || '';
    } else: {
      console.warn('Stripe API key not found or is a placeholder. Stripe functionality will be limited.');
    }
  }
  
  private isStripeAvailable(): boolean: {
    return !!this.stripe;
  }
  
  async createCheckoutSession(userId, tier): Promise: {
    if (!this.isStripeAvailable()) {
      throw new Error('Stripe is not configured');
    }
    
    if (tier === SubscriptionTier.BRONZE) {
      throw new Error('Cannot create checkout session for free tier');
    }
    
    const priceId = this.priceIdMap[tier];
    if (!priceId) {
      throw new Error(`Price ID not configured for tier ${tier}`);
    }
    
    // Get customer ID or create a new customer
    let customerId;
    try: {
      // This would typically come from your database
      // For now, we'll search for the customer by email or create a new one
      const user = await this.getUserByClerkId(userId);
      
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }
      
      if (user.stripeCustomerId) {
        customerId = user.stripeCustomerId;
      } else: {
        const customer = await this.stripe!.customers.create({
          email,
          metadata: {
            userId);
        customerId = customer.id;
        
        // Save customer ID to database
        await this.updateUserStripeCustomerId(userId, customerId);
      }
    } catch (error) {
      console.error('Error getting/creating customer:', error);
      throw new Error('Failed to prepare checkout session');
    }
    
    // Create checkout session
    try: {
      const session = await this.stripe!.checkout.sessions.create({
        customer,
        payment_method_types: ['card'],
        line_items: [
          {
            price,
            quantity,
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/subscription?canceled=true`,
        metadata: {
          userId,
          tier: tier.toString()
        }
      });
      
      return: {
        sessionId,
        url: session.url || ''
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }
  
  async getUserSubscription(userId)| null> {
    if (!this.isStripeAvailable()) {
      return null;
    }
    
    try: {
      // Get user from database to find Stripe customer ID
      const user = await this.getUserByClerkId(userId);
      if (!user || !user.stripeCustomerId) {
        return null;
      }
      
      // Get subscriptions for customer
      const subscriptions = await this.stripe!.subscriptions.list({
        customer,
        status: 'all',
        expand: ['data.default_payment_method']
      });
      
      if (subscriptions.data.length === 0) {
        return null;
      }
      
      // Use the most recent subscription
      const subscription = subscriptions.data[0];
      
      return: {
        id,
        customerId,
        status: mapStripeStatus(subscription.status),
        tier: mapStripeTier(subscription),
        currentPeriodEnd: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : new Date().toISOString(),
        cancelAtPeriodEnd;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  }
  
  async hasAccessToTier(userId, requiredTier): Promise: {
    // Free tier is always accessible
    if (requiredTier === SubscriptionTier.BRONZE) {
      return true;
    }
    
    const subscription = await this.getUserSubscription(userId);
    
    // If no subscription, only allow access to Bronze (free) tier
    if (!subscription) {
      return false;
    }
    
    // Check if subscription is active
    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      return false;
    }
    
    // Check if subscription tier is high enough
    return subscription.tier >= requiredTier;
  }
  
  async cancelSubscription(subscriptionId): Promise: {
    if (!this.isStripeAvailable()) {
      throw new Error('Stripe is not configured');
    }
    
    try: {
      await this.stripe!.subscriptions.update(subscriptionId, {
        cancel_at_period_end);
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  }
  
  async getSubscriptionPlans(): Promise: {
    if (!this.isStripeAvailable()) {
      // Return mock plans if Stripe is not available
      return [
        {
          id: 'bronze',
          tier,
          name: 'Bronze',
          description: 'Free access to select videos',
          price,
          priceId: '',
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
          priceId,
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
          priceId,
          features: [
            { title: 'Access to free videos', included,
            { title: 'Basic meditation content', included,
            { title: 'Silver tier content', included,
            { title: 'Gold tier content', included;
    }
    
    try: {
      // Get products and prices from Stripe
      const products = await this.stripe!.products.list({
        active,
        expand: ['data.default_price']
      });
      
      const plans= [];
      
      // Always include Bronze (free) tier
      plans.push({
        id: 'bronze',
        tier,
        name: 'Bronze',
        description: 'Free access to select videos',
        price,
        priceId: '',
        features: [
          { title: 'Access to free videos', included,
          { title: 'Basic meditation content', included,
          { title: 'Silver tier content', included,
          { title: 'Gold tier content', included);
      
      // Add paid tiers from Stripe
      for (const product of products.data) {
        const defaultPrice = product.default_price as Stripe.Price;
        if (!defaultPrice) continue;
        
        // Determine tier from product metadata or name
        let tier;
        if (product.metadata?.tier?.toLowerCase() === 'gold') {
          tier = SubscriptionTier.GOLD;
        } else if (product.metadata?.tier?.toLowerCase() === 'silver') {
          tier = SubscriptionTier.SILVER;
        } else if (product.name.toLowerCase().includes('gold')) {
          tier = SubscriptionTier.GOLD;
        } else if (product.name.toLowerCase().includes('silver')) {
          tier = SubscriptionTier.SILVER;
        } else: {
          // Skip products that don't match our tiers
          continue;
        }
        
        // Parse features from product metadata or description
        const features: Array: {
    if (!this.isStripeAvailable()) {
      throw new Error('Stripe is not configured');
    }
    
    try: {
      // Get user from database to find Stripe customer ID
      const user = await this.getUserByClerkId(userId);
      if (!user || !user.stripeCustomerId) {
        throw new Error('User has no Stripe customer ID');
      }
      
      const session = await this.stripe!.billingPortal.sessions.create({
        customer,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/subscription`
      });
      
      return session.url;
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      throw new Error('Failed to create customer portal session');
    }
  }
  
  // Helper methods for user management
  // These would typically interact with your database
  
  private async getUserByClerkId(clerkId): Promise: {
    // This would typically query your database
    // For now, we'll return a mock user
    return: {
      id,
      email: `user-${clerkId}@example.com`,
      stripeCustomerId: null // This would come from your database
    };
  }
  
  private async updateUserStripeCustomerId(userId, customerId): Promise: {
    // This would typically update your database
    console.log(`Updating user ${userId} with Stripe customer ID ${customerId}`);
    // In a real implementation, you would update your database here
  }
}
