// Stripe integration test script
require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

console.log('🔍 STRIPE INTEGRATION TEST');
console.log('=========================');

// Check environment variables
console.log('\n📋 Stripe Environment Variables:');
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('STRIPE_PUBLISHABLE_KEY exists:', !!process.env.STRIPE_PUBLISHABLE_KEY);
console.log('STRIPE_WEBHOOK_SECRET exists:', !!process.env.STRIPE_WEBHOOK_SECRET);
console.log('STRIPE_SILVER_PRICE_ID exists:', !!process.env.STRIPE_SILVER_PRICE_ID);
console.log('STRIPE_GOLD_PRICE_ID exists:', !!process.env.STRIPE_GOLD_PRICE_ID);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// User schema for testing
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
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

// Test Stripe integration
async function testStripeIntegration() {
  try {
    console.log('\n🔌 Testing Stripe API connection...');
    const prices = await stripe.prices.list({ limit: 5 });
    console.log(`✅ Stripe API connected successfully! Found ${prices.data.length} prices.`);
    
    // Check if our subscription price IDs exist
    console.log('\n💰 Verifying subscription price IDs...');
    
    if (process.env.STRIPE_SILVER_PRICE_ID) {
      try {
        const silverPrice = await stripe.prices.retrieve(process.env.STRIPE_SILVER_PRICE_ID);
        console.log('✅ Silver price verified:', {
          id: silverPrice.id,
          nickname: silverPrice.nickname,
          amount: silverPrice.unit_amount / 100,
          currency: silverPrice.currency,
          recurring: silverPrice.recurring ? silverPrice.recurring.interval : 'N/A'
        });
      } catch (error) {
        console.error('❌ Silver price verification failed:', error.message);
      }
    }
    
    if (process.env.STRIPE_GOLD_PRICE_ID) {
      try {
        const goldPrice = await stripe.prices.retrieve(process.env.STRIPE_GOLD_PRICE_ID);
        console.log('✅ Gold price verified:', {
          id: goldPrice.id,
          nickname: goldPrice.nickname,
          amount: goldPrice.unit_amount / 100,
          currency: goldPrice.currency,
          recurring: goldPrice.recurring ? goldPrice.recurring.interval : 'N/A'
        });
      } catch (error) {
        console.error('❌ Gold price verification failed:', error.message);
      }
    }
    
    // Test checkout session creation
    console.log('\n🛒 Testing checkout session creation...');
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: process.env.STRIPE_SILVER_PRICE_ID,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/subscription/cancel`,
        metadata: {
          userId: new mongoose.Types.ObjectId().toString(),
          plan: 'silver'
        }
      });
      
      console.log('✅ Checkout session created successfully:', {
        sessionId: session.id,
        url: session.url ? session.url.substring(0, 50) + '...' : 'N/A',
        paymentStatus: session.payment_status,
        mode: session.mode
      });
    } catch (error) {
      console.error('❌ Checkout session creation failed:', error.message);
    }
    
    console.log('\n🎉 Stripe integration test completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.error('\n🔴 STRIPE AUTHENTICATION ISSUE:');
      console.error('- Check that your Stripe secret key is correct');
      console.error('- Verify that your Stripe account is active');
    }
    
    if (error.type === 'StripeInvalidRequestError') {
      console.error('\n🔴 STRIPE INVALID REQUEST ISSUE:');
      console.error('- Check that your price IDs are correct');
      console.error('- Verify that your Stripe account has active products');
    }
  }
}

testStripeIntegration();
