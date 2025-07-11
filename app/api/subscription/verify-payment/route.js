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
    
    // If no valid JWT, use customer email from Stripe session
    if (!userId && session.customer && session.customer.email) {
      userEmail = session.customer.email;
      console.log('Using customer email from Stripe session:', userEmail);
    }
    
    if (!userEmail) {
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
    await connectDB();

    // Find the user in our database
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ email: userEmail });
    }
    
    if (!user) {
      console.log('User not found in database for:', userId || userEmail);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
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

    // Determine the subscription tier based on the price ID
    let tier = 'bronze';
    if (session.line_items) {
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

    console.log('Determined subscription tier:', tier);

    // Update user's subscription in the database
    const subscriptionUpdate = {
      status: stripeSubscription ? stripeSubscription.status : 'active',
      plan: tier,
      stripeCustomerId: session.customer,
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
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
