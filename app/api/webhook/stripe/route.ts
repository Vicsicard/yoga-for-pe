import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'

// This would normally be imported from a real Stripe SDK
// import Stripe from 'stripe'
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const payload = await req.text()
  const signature = req.headers.get('stripe-signature') as string
  
  try {
    // Verify the webhook signature
    // In a real implementation, you would use:
    // const event = stripe.webhooks.constructEvent(
    //   payload,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET!
    // )
    
    // For now, we'll just parse the payload directly
    const event = JSON.parse(payload)
    
    // Handle subscription events
    if (event.type === 'customer.subscription.created' || 
        event.type === 'customer.subscription.updated') {
      // Get the subscription details
      const subscription = event.data.object
      
      // Get the customer ID from the subscription
      const customerId = subscription.customer
      
      // Find the user with this Stripe customer ID in their metadata
      // This assumes you've stored the Stripe customer ID in the user's public metadata
      const users = await clerkClient.users.getUserList({
        query: JSON.stringify({ 'publicMetadata.stripeCustomerId': customerId })
      })
      
      if (users.length > 0) {
        const user = users[0]
        
        // Update the user's metadata with subscription status
        await clerkClient.users.updateUser(user.id, {
          publicMetadata: {
            ...user.publicMetadata,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            stripeSubscriptionStatus: subscription.status,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
          }
        })
        
        console.log(`Updated subscription status for user ${user.id}`)
      }
    }
    
    if (event.type === 'customer.subscription.deleted') {
      // Handle subscription cancellation
      const subscription = event.data.object
      const customerId = subscription.customer
      
      const users = await clerkClient.users.getUserList({
        query: JSON.stringify({ 'publicMetadata.stripeCustomerId': customerId })
      })
      
      if (users.length > 0) {
        const user = users[0]
        
        // Update the user's metadata to reflect canceled subscription
        await clerkClient.users.updateUser(user.id, {
          publicMetadata: {
            ...user.publicMetadata,
            stripeSubscriptionStatus: 'canceled',
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
          }
        })
        
        console.log(`Marked subscription as canceled for user ${user.id}`)
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling Stripe webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}
