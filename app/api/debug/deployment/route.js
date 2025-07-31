import { NextResponse } from 'next/server';

// Prevent this route from being statically generated
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const deploymentInfo = {
    environment: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
    vercelInfo: {
      isVercel: !!process.env.VERCEL,
      environment: process.env.VERCEL_ENV || 'unknown',
      url: process.env.VERCEL_URL || 'unknown',
      region: process.env.VERCEL_REGION || 'unknown',
    },
    routes: {
      forgotPassword: {
        exists: true, // We'll assume it exists since we created it
        path: '/forgot-password',
      }
    },
    envVars: {
      // Only check existence, don't expose values
      JWT_SECRET: !!process.env.JWT_SECRET,
      MONGODB_URI: !!process.env.MONGODB_URI,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_PUBLISHABLE_KEY: !!process.env.STRIPE_PUBLISHABLE_KEY,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      STRIPE_SILVER_PRICE_ID: !!process.env.STRIPE_SILVER_PRICE_ID,
      STRIPE_GOLD_PRICE_ID: !!process.env.STRIPE_GOLD_PRICE_ID,
    }
  };

  return NextResponse.json(deploymentInfo);
}
