import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
  try {
    // Check if Stripe is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      return NextResponse.json({
        configured: false,
        message: 'Stripe secret key is not configured'
      });
    }
    
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
    
    // Try to make a simple API call to verify the key works
    try {
      // Get Stripe account details (a lightweight call)
      const account = await stripe.account.retrieve();
      
      // Check for price IDs
      const silverPriceId = process.env.STRIPE_PRICE_SILVER;
      const goldPriceId = process.env.STRIPE_PRICE_GOLD;
      
      let silverPrice = null;
      let goldPrice = null;
      
      if (silverPriceId) {
        try {
          silverPrice = await stripe.prices.retrieve(silverPriceId);
        } catch (err) {
          console.error('Error retrieving silver price:', err);
        }
      }
      
      if (goldPriceId) {
        try {
          goldPrice = await stripe.prices.retrieve(goldPriceId);
        } catch (err) {
          console.error('Error retrieving gold price:', err);
        }
      }
      
      return NextResponse.json({
        configured: true,
        accountId: account.id,
        accountName: account.business_profile?.name || 'Not set',
        silverPriceConfigured: !!silverPrice,
        goldPriceConfigured: !!goldPrice,
        webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET
      });
    } catch (err) {
      console.error('Error verifying Stripe configuration:', err);
      return NextResponse.json({
        configured: false,
        error: err.message,
        type: err.type
      });
    }
  } catch (error) {
    console.error('Error checking Stripe configuration:', error);
    return NextResponse.json(
      { 
        configured: false,
        error: error.message || 'Failed to check Stripe configuration'
      },
      { status: 500 }
    );
  }
}
