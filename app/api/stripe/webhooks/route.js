import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import mongoose from 'mongoose';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// MongoDB connection with error handling
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
}

// Cache MongoDB connection
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    console.log('Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch(error => {
        console.error('MongoDB connection error:', error);
        console.error('Error name:', error.name);
        console.error('Error code:', error.code);
        console.error('MongoDB URI exists:', !!MONGODB_URI);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// User model schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subscription: {
    status: { type: String, default: 'inactive' },
    plan: { type: String, default: 'bronze' },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodEnd: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Get User model (with handling for model compilation errors)
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Stripe initialization

// Initialize Stripe only when needed to avoid build-time errors
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  // Check if Stripe is configured
  if (!stripe || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe not configured. Please add STRIPE_SECRET_KEY to environment variables.' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session) {
  const { customer, subscription, metadata } = session;
  const { userId, tier } = metadata;

  if (!userId || !tier) {
    console.error('Missing metadata in checkout session:', metadata);
    return;
  }

  try {
    // Get subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription);
    
    // Update user subscription
    await User.findByIdAndUpdate(userId, {
      'subscription.status': 'active',
      'subscription.plan': tier,
      'subscription.stripeCustomerId': customer,
      'subscription.stripeSubscriptionId': subscription,
      'subscription.currentPeriodEnd': new Date(stripeSubscription.current_period_end * 1000),
      'subscription.cancelAtPeriodEnd': false,
    });

    console.log(`Subscription activated for user ${userId} with plan ${tier}`);
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  const { customer, status, current_period_end, cancel_at_period_end } = subscription;

  try {
    // Find user by Stripe customer ID
    const user = await User.findOne({ 'subscription.stripeCustomerId': customer });
    if (!user) {
      console.error('User not found for customer:', customer);
      return;
    }

    // Update subscription status
    await User.findByIdAndUpdate(user._id, {
      'subscription.status': status,
      'subscription.currentPeriodEnd': new Date(current_period_end * 1000),
      'subscription.cancelAtPeriodEnd': cancel_at_period_end,
    });

    console.log(`Subscription updated for user ${user._id}: ${status}`);
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  const { customer } = subscription;

  try {
    // Find user by Stripe customer ID
    const user = await User.findOne({ 'subscription.stripeCustomerId': customer });
    if (!user) {
      console.error('User not found for customer:', customer);
      return;
    }

    // Downgrade to Bronze (free)
    await User.findByIdAndUpdate(user._id, {
      'subscription.status': 'inactive',
      'subscription.plan': 'bronze',
      'subscription.stripeSubscriptionId': null,
      'subscription.currentPeriodEnd': null,
      'subscription.cancelAtPeriodEnd': false,
    });

    console.log(`Subscription canceled for user ${user._id}, downgraded to Bronze`);
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  const { customer, subscription } = invoice;

  try {
    // Find user by Stripe customer ID
    const user = await User.findOne({ 'subscription.stripeCustomerId': customer });
    if (!user) {
      console.error('User not found for customer:', customer);
      return;
    }

    // Get subscription details
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription);
    
    // Update subscription status to active
    await User.findByIdAndUpdate(user._id, {
      'subscription.status': 'active',
      'subscription.currentPeriodEnd': new Date(stripeSubscription.current_period_end * 1000),
    });

    console.log(`Payment succeeded for user ${user._id}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(invoice) {
  const { customer } = invoice;

  try {
    // Find user by Stripe customer ID
    const user = await User.findOne({ 'subscription.stripeCustomerId': customer });
    if (!user) {
      console.error('User not found for customer:', customer);
      return;
    }

    // Update subscription status to past_due
    await User.findByIdAndUpdate(user._id, {
      'subscription.status': 'past_due',
    });

    console.log(`Payment failed for user ${user._id}, status set to past_due`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}
