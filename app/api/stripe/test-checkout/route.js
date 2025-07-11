import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Add dynamic export to prevent static generation
export const dynamic = 'force-dynamic';

// Initialize Stripe only when needed to avoid build-time errors
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request) {
  try {
    // Log all environment variables for debugging
    console.log('Environment variables check:');
    console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('STRIPE_SILVER_PRICE_ID exists:', !!process.env.STRIPE_SILVER_PRICE_ID);
    console.log('STRIPE_GOLD_PRICE_ID exists:', !!process.env.STRIPE_GOLD_PRICE_ID);
    console.log('NEXT_PUBLIC_BASE_URL exists:', !!process.env.NEXT_PUBLIC_BASE_URL);
    
    // Check if Stripe is configured
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe not configured. Please add STRIPE_SECRET_KEY to environment variables.' },
        { status: 500 }
      );
    }

    const { tier } = await request.json();

    // Validate tier
    if (!['silver', 'gold'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Use existing Stripe price IDs from environment variables
    const priceIds = {
      silver: process.env.STRIPE_SILVER_PRICE_ID,
      gold: process.env.STRIPE_GOLD_PRICE_ID
    };

    const selectedPriceId = priceIds[tier];
    
    if (!selectedPriceId) {
      return NextResponse.json(
        { error: `Price ID not found for tier: ${tier}` },
        { status: 400 }
      );
    }

    // Create checkout session without requiring MongoDB or authentication
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/select?canceled=true`,
      metadata: {
        tier: tier,
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Test Stripe checkout error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    );
  }
}
