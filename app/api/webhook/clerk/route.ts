import { NextResponse } from 'next/server'
import { WebhookEvent } from '@clerk/nextjs/server'
 
export async function POST(req: Request) {
  // Get the webhook event data
  const evt = await req.json() as WebhookEvent
  
  // Handle the webhook event
  const eventType = evt.type
  
  if (eventType === 'user.created') {
    // A new user has been created
    // Here you could create a corresponding customer in Stripe
    console.log(`User created: ${evt.data.id}`)
    
    // Example: Create a Stripe customer (pseudo-code)
    // const stripeCustomer = await stripe.customers.create({
    //   email: evt.data.email_addresses[0].email_address,
    //   metadata: { clerkUserId: evt.data.id }
    // })
    
    // Example: Update user metadata with Stripe customer ID
    // await clerkClient.users.updateUser(evt.data.id, {
    //   publicMetadata: { stripeCustomerId: stripeCustomer.id }
    // })
  }
  
  if (eventType === 'user.deleted') {
    // A user has been deleted
    // Here you could handle cleanup in Stripe
    console.log(`User deleted: ${evt.data.id}`)
  }
  
  return NextResponse.json({ success: true })
}
