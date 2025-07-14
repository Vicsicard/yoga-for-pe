import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import User from '../../../../lib/models/User';
import { connectDB } from '../../../../lib/db/connect';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    console.log('Payment verification request received');
    
    // Get the session ID from the request body first
    const { sessionId } = await request.json();
    if (!sessionId) {
      console.log('Missing session ID');
      return NextResponse.json({ message: 'Session ID required' }, { status: 400 });
    }

    console.log('Verifying Stripe session:', sessionId);

    // Retrieve the Stripe checkout session first to get customer info
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer']
    });
    
    if (!session) {
      console.log('Stripe session not found');
      return NextResponse.json({ message: 'Invalid session' }, { status: 400 });
    }

    console.log('Stripe session status:', session.payment_status);
    console.log('Session customer:', session.customer);
    console.log('Session metadata:', session.metadata);
    console.log('Session mode:', session.mode);
    console.log('Session subscription:', session.subscription);

    // Get user identification - either from JWT token or from Stripe session
    let userId = null;
    let userEmail = null;
    
    // Try to get user from JWT token first
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
        userEmail = decoded.email;
        console.log('JWT verified for user:', userId);
      } catch (jwtError) {
        console.log('JWT verification failed, will use session customer info:', jwtError.message);
      }
    }
    
    // If no valid JWT, try to get userId from session metadata or use customer email
    if (!userId) {
      // First try to get userId from session metadata
      if (session.metadata && session.metadata.userId) {
        userId = session.metadata.userId;
        console.log('Using userId from session metadata:', userId);
      }
      // If still no userId, use customer email
      else if (session.customer && session.customer.email) {
        userEmail = session.customer.email;
        console.log('Using customer email from Stripe session:', userEmail);
      }
    }
    
    if (!userId && !userEmail) {
      console.log('No user identification available');
      return NextResponse.json({ message: 'Unable to identify user' }, { status: 400 });
    }
    console.log('Session metadata:', session.metadata);

    // Verify the payment was successful
    if (session.payment_status !== 'paid') {
      console.log('Payment not completed');
      return NextResponse.json({ message: 'Payment not completed' }, { status: 400 });
    }

    // Connect to database
    console.log('Step 1: Connecting to database...');
    await connectDB();
    console.log('Step 1: Database connected successfully');

    // Find the user in our database
    console.log('Step 2: Finding user in database...');
    let user;
    if (userId) {
      console.log('Step 2a: Finding user by ID:', userId);
      user = await User.findById(userId);
    } else {
      console.log('Step 2b: Finding user by email:', userEmail);
      user = await User.findOne({ email: userEmail });
    }
    console.log('Step 2: User lookup completed');
    
    if (!user) {
      console.log('User not found in database for:', userId || userEmail);
      
      // If we searched by userId but didn't find user, try by email from Stripe session
      if (userId && session.customer && session.customer.email) {
        console.log('Step 3a: Trying to find user by Stripe customer email:', session.customer.email);
        user = await User.findOne({ email: session.customer.email });
        if (user) {
          console.log('Step 3a: Found existing user by email:', user.email);
        }
      }
      
      // If still no user found, create a new one
      if (!user) {
        console.log('Step 3b: Creating new user account from Stripe session...');
        
        // Create user from Stripe session data
        if (!session.customer || !session.customer.email) {
          console.log('Cannot create user: no customer email in Stripe session');
          return NextResponse.json({ message: 'Unable to identify or create user' }, { status: 400 });
        }
        
        const customerEmail = session.customer.email;
        const customerName = session.customer.name || customerEmail.split('@')[0];
        
        // Generate a temporary password (user will need to reset it)
        const tempPassword = Math.random().toString(36).slice(-12);
        
        try {
          user = new User({
            name: customerName,
            email: customerEmail,
            password: tempPassword, // Will be hashed by pre-save hook
            subscription: {
              plan: 'bronze', // Will be updated below
              status: 'active',
              stripeCustomerId: session.customer.id
            }
          });
          
          await user.save();
          console.log('Step 3b: New user created successfully:', user.email);
        } catch (createError) {
          console.error('Error creating user:', createError);
          
          // If it's a duplicate key error, try to find the existing user
          if (createError.code === 11000) {
            console.log('Step 3c: User already exists, finding existing user...');
            user = await User.findOne({ email: customerEmail });
            if (user) {
              console.log('Step 3c: Found existing user after duplicate error:', user.email);
            } else {
              return NextResponse.json({ 
                message: 'User exists but could not be retrieved', 
                error: createError.message 
              }, { status: 500 });
            }
          } else {
            return NextResponse.json({ 
              message: 'Failed to create user account', 
              error: createError.message 
            }, { status: 500 });
          }
        }
      }
    }

    console.log('User found:', user.email);
    console.log('Current user subscription:', user.subscription);

    // Get the subscription from Stripe if we have a customer ID
    let stripeSubscription = null;
    if (session.customer) {
      try {
        // Get the customer's subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: session.customer,
          status: 'active',
          limit: 1
        });

        if (subscriptions.data.length > 0) {
          stripeSubscription = subscriptions.data[0];
          console.log('Active Stripe subscription found:', stripeSubscription.id);
          console.log('Subscription status:', stripeSubscription.status);
          console.log('Current period end:', new Date(stripeSubscription.current_period_end * 1000));
        }
      } catch (stripeError) {
        console.log('Error fetching Stripe subscription:', stripeError.message);
      }
    }

    // Determine the subscription tier based on session metadata first (most reliable)
    // Then fall back to price ID if metadata is not available
    let tier = 'bronze';
    
    // First check session metadata for tier information (set during checkout creation)
    if (session.metadata && session.metadata.tier) {
      console.log('Using tier from session metadata:', session.metadata.tier);
      tier = session.metadata.tier.toLowerCase();
    }
    // If no tier in metadata, try to determine from line items
    else if (session.line_items) {
      const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
      if (lineItems.data.length > 0) {
        const priceId = lineItems.data[0].price.id;
        console.log('Price ID from session:', priceId);
        
        if (priceId === process.env.STRIPE_SILVER_PRICE_ID) {
          tier = 'silver';
        } else if (priceId === process.env.STRIPE_GOLD_PRICE_ID) {
          tier = 'gold';
        }
      }
    }
    
    // Final check - if we have a subscription object from Stripe, check its metadata too
    if (stripeSubscription && stripeSubscription.metadata && stripeSubscription.metadata.tier) {
      console.log('Using tier from subscription metadata:', stripeSubscription.metadata.tier);
      tier = stripeSubscription.metadata.tier.toLowerCase();
    }

    console.log('Determined subscription tier:', tier);

    // Update user's subscription in the database
    const subscriptionUpdate = {
      status: stripeSubscription ? stripeSubscription.status : 'active',
      plan: tier,
      stripeCustomerId: session.customer ? session.customer.id : null,
      stripeSubscriptionId: stripeSubscription ? stripeSubscription.id : null,
      currentPeriodStart: stripeSubscription ? new Date(stripeSubscription.current_period_start * 1000) : new Date(),
      currentPeriodEnd: stripeSubscription ? new Date(stripeSubscription.current_period_end * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now as fallback
      updatedAt: new Date()
    };

    console.log('Updating user subscription:', subscriptionUpdate);

    user.subscription = subscriptionUpdate;
    await user.save();

    console.log('User subscription updated successfully');

    // Generate a new JWT token with updated subscription information
    const newTokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      subscription: {
        status: subscriptionUpdate.status,
        plan: subscriptionUpdate.plan,
        currentPeriodEnd: subscriptionUpdate.currentPeriodEnd
      }
    };

    const newToken = jwt.sign(newTokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log('New JWT token generated with subscription info');

    return NextResponse.json({
      success: true,
      message: 'Subscription verified and updated',
      token: newToken,
      subscription: subscriptionUpdate
    });

  } catch (error) {
    console.error('=== PAYMENT VERIFICATION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Environment variables check:');
    console.error('- JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.error('- STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    console.error('- MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.error('- STRIPE_SILVER_PRICE_ID exists:', !!process.env.STRIPE_SILVER_PRICE_ID);
    console.error('- STRIPE_GOLD_PRICE_ID exists:', !!process.env.STRIPE_GOLD_PRICE_ID);
    console.error('=====================================');
    
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
