import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check for required environment variables
    const envStatus = {
      // Database
      MONGODB_URI: !!process.env.MONGODB_URI,
      
      // NextAuth
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      
      // Stripe
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      STRIPE_PRICE_SILVER: !!process.env.STRIPE_PRICE_SILVER,
      STRIPE_PRICE_GOLD: !!process.env.STRIPE_PRICE_GOLD,
      
      // App
      NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
    };
    
    return NextResponse.json(envStatus);
  } catch (error) {
    console.error('Error checking environment variables:', error);
    return NextResponse.json(
      { error: 'Failed to check environment variables' },
      { status: 500 }
    );
  }
}
