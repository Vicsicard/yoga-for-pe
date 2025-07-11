// Simple script to test Stripe API directly
require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function testStripeConnection() {
  console.log('Testing Stripe API connection...');
  
  // Check environment variables
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const silverPriceId = process.env.STRIPE_SILVER_PRICE_ID;
  const goldPriceId = process.env.STRIPE_GOLD_PRICE_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  console.log('Environment variables check:');
  console.log('STRIPE_SECRET_KEY exists:', !!stripeSecretKey);
  console.log('STRIPE_SILVER_PRICE_ID exists:', !!silverPriceId);
  console.log('STRIPE_GOLD_PRICE_ID exists:', !!goldPriceId);
  console.log('NEXT_PUBLIC_BASE_URL exists:', !!baseUrl);
  
  if (!stripeSecretKey) {
    console.error('Error: STRIPE_SECRET_KEY is not defined in environment variables');
    return;
  }

  try {
    // Initialize Stripe
    console.log('Initializing Stripe with secret key...');
    const stripe = new Stripe(stripeSecretKey);
    
    // Test connection by retrieving account info
    console.log('Retrieving Stripe account info...');
    const account = await stripe.account.retrieve();
    console.log('✅ Stripe connection successful!');
    console.log('Account ID:', account.id);
    console.log('Account email:', account.email);
    console.log('Account country:', account.country);
    
    // Check if price IDs exist
    if (silverPriceId) {
      try {
        console.log('Retrieving Silver price info...');
        const silverPrice = await stripe.prices.retrieve(silverPriceId);
        console.log('✅ Silver price found:');
        console.log('  - ID:', silverPrice.id);
        console.log('  - Amount:', silverPrice.unit_amount / 100, silverPrice.currency);
        console.log('  - Product:', silverPrice.product);
      } catch (priceError) {
        console.error('❌ Error retrieving Silver price:', priceError.message);
      }
    }
    
    if (goldPriceId) {
      try {
        console.log('Retrieving Gold price info...');
        const goldPrice = await stripe.prices.retrieve(goldPriceId);
        console.log('✅ Gold price found:');
        console.log('  - ID:', goldPrice.id);
        console.log('  - Amount:', goldPrice.unit_amount / 100, goldPrice.currency);
        console.log('  - Product:', goldPrice.product);
      } catch (priceError) {
        console.error('❌ Error retrieving Gold price:', priceError.message);
      }
    }
    
    // Try creating a test checkout session
    console.log('\nAttempting to create a test checkout session...');
    if (!silverPriceId) {
      console.error('Cannot create checkout session: Silver price ID is missing');
      return;
    }
    
    if (!baseUrl) {
      console.log('Warning: NEXT_PUBLIC_BASE_URL is not set, using http://localhost:3000');
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: silverPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl || 'http://localhost:3000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl || 'http://localhost:3000'}/subscription/select?canceled=true`,
      metadata: {
        tier: 'silver',
      },
    });
    
    console.log('✅ Test checkout session created successfully!');
    console.log('Session ID:', session.id);
    console.log('Checkout URL:', session.url);
    
  } catch (error) {
    console.error('❌ Stripe API error:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error type:', error.type);
    if (error.code) console.error('Error code:', error.code);
  }
}

testStripeConnection();
