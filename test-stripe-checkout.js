// Direct test of Stripe checkout session creation
require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

// Log environment variables
console.log('=== ENVIRONMENT VARIABLES ===');
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('STRIPE_SILVER_PRICE_ID exists:', !!process.env.STRIPE_SILVER_PRICE_ID);
console.log('STRIPE_GOLD_PRICE_ID exists:', !!process.env.STRIPE_GOLD_PRICE_ID);
console.log('NEXT_PUBLIC_BASE_URL exists:', !!process.env.NEXT_PUBLIC_BASE_URL);

// Initialize Stripe
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log('Stripe initialized');
} else {
  console.log('ERROR: STRIPE_SECRET_KEY not found');
  process.exit(1);
}

async function createCheckoutSession() {
  console.log('\n=== CREATING TEST CHECKOUT SESSION ===');
  
  try {
    // Use Silver price ID for testing
    const priceId = process.env.STRIPE_SILVER_PRICE_ID;
    
    if (!priceId) {
      console.log('ERROR: STRIPE_SILVER_PRICE_ID not found');
      return;
    }
    
    console.log('Using price ID:', priceId);
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `http://localhost:3000/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/subscription/plans`,
    });
    
    console.log('✅ Checkout session created successfully!');
    console.log('Session ID:', session.id);
    console.log('Checkout URL:', session.url);
    
    return session;
  } catch (error) {
    console.log('❌ Failed to create checkout session');
    console.log('Error type:', error.type);
    console.log('Error message:', error.message);
    
    if (error.type === 'StripeInvalidRequestError') {
      console.log('\nThis is likely due to an invalid price ID or configuration issue.');
      console.log('Check that your Stripe price IDs are correct and that your account is properly set up.');
    }
  }
}

// Run the test
createCheckoutSession()
  .then(() => {
    console.log('\n=== TEST COMPLETED ===');
  })
  .catch(error => {
    console.log('\n=== UNEXPECTED ERROR ===');
    console.log(error);
  });
