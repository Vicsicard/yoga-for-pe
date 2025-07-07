export const runtime = 'nodejs';

// Stripe webhook handler
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { SubscriptionTier } from '../../../../lib/vimeo-browser';

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Map Stripe subscription status to our subscription tier
const mapStripeTier = (subscription: Stripe.Subscription): SubscriptionTier => {
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

export async function POST(request: NextRequest) {
  if (!stripe) {
    console.error('Stripe is not configured');
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }
  
  const body = await request.text();
  const signature = headers().get('stripe-signature') || '';
  
  let event: Stripe.Event;
  
  try {
    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret is not configured');
    }
    
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${error.message}` },
      { status: 400 }
    );
  }
  
  // Handle specific event types
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get customer and subscription details
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        
        // Get user ID from metadata
        const userId = session.metadata?.userId;
        if (!userId) {
          throw new Error('User ID not found in session metadata');
        }
        
        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const tier = mapStripeTier(subscription);
        
        // Update user subscription in database
        await updateUserSubscription(userId, {
          stripeCustomerId: customerId,
          subscriptionId: subscriptionId,
          subscriptionStatus: subscription.status,
          subscriptionTier: tier,
          subscriptionCurrentPeriodEnd: subscription.current_period_end,
          subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end
        });
        
        console.log(`Subscription created for user ${userId}: ${tier}`);
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Get user from customer ID
        const customerId = subscription.customer as string;
        const user = await getUserByStripeCustomerId(customerId);
        
        if (!user) {
          throw new Error(`User not found for customer ID: ${customerId}`);
        }
        
        const tier = mapStripeTier(subscription);
        
        // Update user subscription in database
        await updateUserSubscription(user.id, {
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          subscriptionTier: tier,
          subscriptionCurrentPeriodEnd: subscription.current_period_end,
          subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end
        });
        
        console.log(`Subscription updated for user ${user.id}: ${tier}`);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Get user from customer ID
        const customerId = subscription.customer as string;
        const user = await getUserByStripeCustomerId(customerId);
        
        if (!user) {
          throw new Error(`User not found for customer ID: ${customerId}`);
        }
        
        // Update user subscription in database
        await updateUserSubscription(user.id, {
          subscriptionStatus: 'canceled',
          subscriptionTier: SubscriptionTier.BRONZE,
          subscriptionCancelAtPeriodEnd: false
        });
        
        console.log(`Subscription canceled for user ${user.id}`);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Error handling webhook: ${error.message}`);
    return NextResponse.json(
      { error: `Webhook handler failed: ${error.message}` },
      { status: 500 }
    );
  }
}

// Helper functions for database operations
// These would be replaced with actual database calls in a real implementation

async function updateUserSubscription(userId: string, data: any): Promise<void> {
  // This would update the user's subscription data in your database
  console.log(`Updating subscription for user ${userId}:`, data);
  
  // In a real implementation, you would update your database here
  // For example:
  // await db.user.update({
  //   where: { id: userId },
  //   data: {
  //     stripeCustomerId: data.stripeCustomerId,
  //     subscriptionId: data.subscriptionId,
  //     subscriptionStatus: data.subscriptionStatus,
  //     subscriptionTier: data.subscriptionTier,
  //     subscriptionCurrentPeriodEnd: data.subscriptionCurrentPeriodEnd,
  //     subscriptionCancelAtPeriodEnd: data.subscriptionCancelAtPeriodEnd
  //   }
  // });
}

async function getUserByStripeCustomerId(customerId: string): Promise<any | null> {
  // This would query your database for a user with the given Stripe customer ID
  console.log(`Looking up user by Stripe customer ID: ${customerId}`);
  
  // In a real implementation, you would query your database here
  // For example:
  // return await db.user.findFirst({
  //   where: { stripeCustomerId: customerId }
  // });
  
  // For now, return a mock user
  return {
    id: 'mock_user_123',
    email: 'user@example.com',
    stripeCustomerId: customerId
  };
}
