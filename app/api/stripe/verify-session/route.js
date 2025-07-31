// Stripe session verification API route
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
// Remove auth import as it's not available
import connectDB from '../../../../lib/db/index';
import User from '../../../../lib/models/User';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

export async function GET(request) {
  try {
    // Get authentication token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    const userId = decoded.id;
    
    // Get session_id from query params
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }
    
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }
    
    // Retrieve the checkout session
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!checkoutSession) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 400 }
      );
    }
    
    // Verify that the session belongs to the current user
    const sessionUserId = checkoutSession.metadata?.userId;
    
    if (sessionUserId !== userId) {
      return NextResponse.json(
        { error: 'Session does not belong to current user' },
        { status: 403 }
      );
    }
    
    // Get subscription details if available
    let subscription = null;
    if (checkoutSession.subscription) {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        checkoutSession.subscription
      );
      
      subscription = {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
        tier: checkoutSession.metadata?.tier || 'silver',
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      };
    }
    
    // Get user from database to check if subscription is updated
    await connectDB();
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return success with subscription details
    return NextResponse.json({
      success: true,
      subscription: subscription || user.subscription,
      checkoutStatus: checkoutSession.status,
      paymentStatus: checkoutSession.payment_status,
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to verify session',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
