import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import User from '../../../../lib/models/User';
import { connectDB } from '../../../../lib/db/connect';

// Add dynamic export to prevent static generation
export const dynamic = 'force-dynamic';

// Initialize Stripe only when needed to avoid build-time errors
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request) {
  try {
    // Check if Stripe is configured
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe not configured. Please add STRIPE_SECRET_KEY to environment variables.' },
        { status: 500 }
      );
    }

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    if (authHeader) {
      console.log('Auth header starts with Bearer:', authHeader.startsWith('Bearer '));
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authentication missing or invalid');
      return NextResponse.json(
        { error: 'Authentication required', message: 'Please sign in to continue' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await connectDB();
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
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

    // Create or retrieve Stripe customer
    let stripeCustomerId = user.subscription.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
        },
      });
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(user._id, {
        'subscription.stripeCustomerId': stripeCustomerId,
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
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
        userId: user._id.toString(),
        tier: tier,
      },
      // Enable coupon code entry field
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Environment variables check:');
    console.error('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.error('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.error('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    console.error('STRIPE_SILVER_PRICE_ID exists:', !!process.env.STRIPE_SILVER_PRICE_ID);
    console.error('STRIPE_GOLD_PRICE_ID exists:', !!process.env.STRIPE_GOLD_PRICE_ID);
    console.error('NEXT_PUBLIC_BASE_URL exists:', !!process.env.NEXT_PUBLIC_BASE_URL);
    
    // Log request information
    try {
      console.error('Request headers:', JSON.stringify(Object.fromEntries(request.headers.entries())));
    } catch (headerError) {
      console.error('Could not log request headers:', headerError.message);
    }
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Invalid authentication token', details: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    );
  }
}
