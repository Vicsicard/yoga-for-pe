import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check for required environment variables
    const envStatus = {
      // Database
      MONGODB_URI: !!process.env.MONGODB_URI,
      
      // Authentication
      JWT_SECRET: !!process.env.JWT_SECRET,
      
      // Stripe
      STRIPE_PUBLISHABLE_KEY: !!process.env.STRIPE_PUBLISHABLE_KEY,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      STRIPE_SILVER_PRICE_ID: !!process.env.STRIPE_SILVER_PRICE_ID,
      STRIPE_GOLD_PRICE_ID: !!process.env.STRIPE_GOLD_PRICE_ID,
      
      // App
      NEXT_PUBLIC_BASE_URL: !!process.env.NEXT_PUBLIC_BASE_URL,
    };
    
    // Return the environment variable status
    return NextResponse.json(envStatus);
  } catch (error) {
    console.error('Error checking environment variables:', error);
    return NextResponse.json(
      { error: 'Failed to check environment variables' },
      { status: 500 }
    );
  }
}
