const Stripe = require('stripe');
const { SubscriptionService } = require('./subscription-service');
const { SubscriptionStatus, SubscriptionTier } = require('./types');

class StripeSubscriptionService extends SubscriptionService {
  constructor() {
    super();
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async createCheckoutSession(userId, tier) {
    const priceId = this.getPriceIdForTier(tier);
    
    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
        metadata: {
          clerkUserId: userId,
        },
      });

      return { url: session.url };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  async handleCheckoutSuccess(sessionId, userId) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.subscription) {
        const subscription = await this.stripe.subscriptions.retrieve(session.subscription);
        const tier = this.getTierFromSubscription(subscription);
        
        const user = await this.getUserByClerkId(userId);
        if (user) {
          await this.updateUserStripeCustomerId(user.id, session.customer);
          await this.updateUserSubscription(user.id, {
            tier: tier,
            status: 'active',
            stripeSubscriptionId: subscription.id,
          });
        }
      }
    } catch (error) {
      console.error('Error handling checkout success:', error);
      throw error;
    }
  }

  async getSubscriptionInfo(userId) {
    try {
      const user = await this.getUserByClerkId(userId);
      if (!user || !user.stripeSubscriptionId) {
        return {
          tier: 'free',
          status: 'inactive',
        };
      }

      const subscription = await this.stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      return {
        tier: this.getTierFromSubscription(subscription),
        status: this.mapStripeStatus(subscription.status),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      };
    } catch (error) {
      console.error('Error getting subscription info:', error);
      return {
        tier: 'free',
        status: 'inactive',
      };
    }
  }

  async cancelSubscription(userId) {
    try {
      const user = await this.getUserByClerkId(userId);
      if (!user || !user.stripeSubscriptionId) {
        throw new Error('No active subscription found');
      }

      await this.stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      await this.updateUserSubscription(user.id, {
        status: 'canceling',
      });

      return { success: true };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async handleWebhook(body, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          if (session.metadata && session.metadata.clerkUserId) {
            await this.handleCheckoutSuccess(session.id, session.metadata.clerkUserId);
          }
          break;
        }
          
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          const user = await this.getUserByStripeCustomerId(subscription.customer);
          if (user) {
            await this.updateUserSubscription(user.id, {
              tier: this.getTierFromSubscription(subscription),
              status: this.mapStripeStatus(subscription.status),
            });
          }
          break;
        }
      }

      return { received: true };
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  getPriceIdForTier(tier) {
    const priceIds = {
      'bronze': process.env.STRIPE_BRONZE_PRICE_ID,
      'silver': process.env.STRIPE_SILVER_PRICE_ID,
      'gold': process.env.STRIPE_GOLD_PRICE_ID,
    };
    
    return priceIds[tier];
  }

  getTierFromSubscription(subscription) {
    if (!subscription.items || !subscription.items.data || subscription.items.data.length === 0) {
      return 'free';
    }

    const priceId = subscription.items.data[0].price.id;
    
    if (priceId === process.env.STRIPE_BRONZE_PRICE_ID) return 'bronze';
    if (priceId === process.env.STRIPE_SILVER_PRICE_ID) return 'silver';
    if (priceId === process.env.STRIPE_GOLD_PRICE_ID) return 'gold';
    
    return 'free';
  }

  mapStripeStatus(stripeStatus) {
    const statusMap = {
      'active': 'active',
      'canceled': 'canceled',
      'incomplete': 'pending',
      'incomplete_expired': 'expired',
      'past_due': 'past_due',
      'trialing': 'trialing',
      'unpaid': 'unpaid',
    };
    
    return statusMap[stripeStatus] || 'inactive';
  }

  // Helper methods - these should be replaced with actual database operations
  async getUserByClerkId(clerkId) {
    // TODO: Replace with actual database query
    return null;
  }

  async getUserByStripeCustomerId(stripeCustomerId) {
    // TODO: Replace with actual database query
    return null;
  }

  async updateUserStripeCustomerId(userId, stripeCustomerId) {
    // TODO: Replace with actual database update
    return true;
  }

  async updateUserSubscription(userId, subscriptionData) {
    // TODO: Replace with actual database update
    return true;
  }
}

module.exports = { StripeSubscriptionService };
