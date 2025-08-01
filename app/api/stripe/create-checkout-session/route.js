import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
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

export async function POST(request) {
  try {
    console.log('Starting checkout session creation...');
    
    // Check if Stripe is configured
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe not configured - missing STRIPE_SECRET_KEY');
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
      // Log first few characters of token for debugging (don't log full token)
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log('Token first 10 chars:', token.substring(0, 10) + '...');
      }
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authentication missing or invalid');
      return NextResponse.json(
        { error: 'Authentication required', message: 'Please sign in to continue' },
        { status: 401 }
      );
    }

    // Extract and verify token
    const token = authHeader.substring(7);
    console.log('Verifying JWT token...');
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('JWT verified successfully, userId:', decoded.userId);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return NextResponse.json(
        { error: 'Invalid authentication token', details: jwtError.message },
        { status: 401 }
      );
    }

    // Connect to database
    console.log('Connecting to MongoDB...');
    try {
      await connectDB();
      console.log('MongoDB connected successfully');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError.message);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError.message },
        { status: 500 }
      );
    }

    // Find user
    console.log('Finding user with ID:', decoded.userId);
    let user;
    try {
      user = await User.findById(decoded.userId);
      if (!user) {
        console.error('User not found with ID:', decoded.userId);
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      console.log('User found:', user.email);
    } catch (userError) {
      console.error('Error finding user:', userError.message);
      if (userError.name === 'CastError') {
        console.error('Invalid user ID format. ID was:', decoded.userId);
        return NextResponse.json(
          { error: 'Invalid user ID format', details: userError.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Error finding user', details: userError.message },
        { status: 500 }
      );
    }

    // Parse request body
    console.log('Parsing request body...');
    let tier;
    try {
      const body = await request.json();
      tier = body.tier;
      console.log('Requested subscription tier:', tier);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError.message);
      return NextResponse.json(
        { error: 'Invalid request body', details: parseError.message },
        { status: 400 }
      );
    }

    // Validate tier
    if (!['silver', 'gold'].includes(tier)) {
      console.error('Invalid subscription tier:', tier);
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
    console.log('Selected price ID exists:', !!selectedPriceId);
    
    if (!selectedPriceId) {
      console.error(`Price ID not found for tier: ${tier}`);
      console.error('STRIPE_SILVER_PRICE_ID exists:', !!process.env.STRIPE_SILVER_PRICE_ID);
      console.error('STRIPE_GOLD_PRICE_ID exists:', !!process.env.STRIPE_GOLD_PRICE_ID);
      return NextResponse.json(
        { error: `Price ID not found for tier: ${tier}` },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = user.subscription?.stripeCustomerId;
    console.log('Existing Stripe customer ID:', stripeCustomerId || 'none');
    
    if (!stripeCustomerId) {
      console.log('Creating new Stripe customer for user:', user.email);
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name || user.email,
          metadata: {
            userId: user._id.toString(),
          },
        });
        stripeCustomerId = customer.id;
        console.log('Created new Stripe customer:', stripeCustomerId);
        
        // Update user with Stripe customer ID
        await User.findByIdAndUpdate(user._id, {
          'subscription.stripeCustomerId': stripeCustomerId,
        });
        console.log('Updated user with new Stripe customer ID');
      } catch (customerError) {
        console.error('Error creating Stripe customer:', customerError.message);
        return NextResponse.json(
          { error: 'Failed to create Stripe customer', details: customerError.message },
          { status: 500 }
        );
      }
    }

    // Create checkout session
    console.log('Creating Stripe checkout session...');
    console.log('Base URL:', process.env.NEXT_PUBLIC_BASE_URL || 'not set');
    
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: selectedPriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.yogaforpe.com'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.yogaforpe.com'}/subscription/select?canceled=true`,
        metadata: {
          userId: user._id.toString(),
          tier: tier,
        },
        // Enable coupon code entry field
        allow_promotion_codes: true,
      });
      
      console.log('Checkout session created successfully:', session.id);
      return NextResponse.json({ url: session.url });
    } catch (sessionError) {
      console.error('Error creating checkout session:', sessionError.message);
      console.error('Error type:', sessionError.type);
      console.error('Error code:', sessionError.code);
      
      // Return more specific error based on Stripe error type
      if (sessionError.type === 'StripeCardError') {
        return NextResponse.json(
          { error: 'Payment card error', details: sessionError.message },
          { status: 400 }
        );
      } else if (sessionError.type === 'StripeInvalidRequestError') {
        return NextResponse.json(
          { error: 'Invalid request to payment processor', details: sessionError.message },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: 'Payment processing error', details: sessionError.message },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error('Stripe checkout error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Comprehensive environment variables check
    console.error('Environment variables check:');
    console.error('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.error('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
    console.error('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.error('MONGODB_URI starts with:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'N/A');
    console.error('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    console.error('STRIPE_SECRET_KEY starts with:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...' : 'N/A');
    console.error('STRIPE_SILVER_PRICE_ID exists:', !!process.env.STRIPE_SILVER_PRICE_ID);
    console.error('STRIPE_SILVER_PRICE_ID value:', process.env.STRIPE_SILVER_PRICE_ID || 'N/A');
    console.error('STRIPE_GOLD_PRICE_ID exists:', !!process.env.STRIPE_GOLD_PRICE_ID);
    console.error('STRIPE_GOLD_PRICE_ID value:', process.env.STRIPE_GOLD_PRICE_ID || 'N/A');
    console.error('NEXT_PUBLIC_BASE_URL exists:', !!process.env.NEXT_PUBLIC_BASE_URL);
    console.error('NEXT_PUBLIC_BASE_URL value:', process.env.NEXT_PUBLIC_BASE_URL || 'N/A');
    
    // Log request information
    try {
      const headers = Object.fromEntries(request.headers.entries());
      // Remove sensitive headers before logging
      if (headers.authorization) {
        headers.authorization = headers.authorization.substring(0, 15) + '...';
      }
      if (headers.cookie) {
        headers.cookie = headers.cookie.substring(0, 15) + '...';
      }
      console.error('Request headers:', JSON.stringify(headers));
    } catch (headerError) {
      console.error('Could not log request headers:', headerError.message);
    }
    
    // Handle specific error types
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Invalid or expired authentication token', details: error.message },
        { status: 401 }
      );
    }
    
    if (error.name === 'CastError' && error.path === '_id') {
      return NextResponse.json(
        { error: 'Invalid user ID format', details: error.message },
        { status: 400 }
      );
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }
    
    // Default error response
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    );
  }
}
