// Test all connections (MongoDB and Stripe)
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const Stripe = require('stripe');

// Check environment variables
console.log('=== ENVIRONMENT VARIABLES CHECK ===');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('STRIPE_SILVER_PRICE_ID exists:', !!process.env.STRIPE_SILVER_PRICE_ID);
console.log('STRIPE_GOLD_PRICE_ID exists:', !!process.env.STRIPE_GOLD_PRICE_ID);

async function testMongoDB() {
  console.log('\n=== TESTING MONGODB CONNECTION ===');
  
  if (!process.env.MONGODB_URI) {
    console.log('❌ MONGODB_URI is not defined');
    return false;
  }
  
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ MongoDB connection successful');
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections`);
    
    return true;
  } catch (error) {
    console.log('❌ MongoDB connection failed');
    console.log('Error:', error.message);
    return false;
  } finally {
    await client.close();
  }
}

async function testStripe() {
  console.log('\n=== TESTING STRIPE CONNECTION ===');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('❌ STRIPE_SECRET_KEY is not defined');
    return false;
  }
  
  try {
    console.log('Initializing Stripe...');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    console.log('Getting Stripe account info...');
    const account = await stripe.accounts.retrieve();
    console.log('✅ Stripe connection successful');
    console.log('Account:', account.id);
    
    // Test price IDs
    if (process.env.STRIPE_SILVER_PRICE_ID) {
      try {
        console.log('Checking Silver price ID...');
        const silverPrice = await stripe.prices.retrieve(process.env.STRIPE_SILVER_PRICE_ID);
        console.log('✅ Silver price ID valid:', silverPrice.id);
      } catch (error) {
        console.log('❌ Invalid Silver price ID');
        console.log('Error:', error.message);
      }
    }
    
    if (process.env.STRIPE_GOLD_PRICE_ID) {
      try {
        console.log('Checking Gold price ID...');
        const goldPrice = await stripe.prices.retrieve(process.env.STRIPE_GOLD_PRICE_ID);
        console.log('✅ Gold price ID valid:', goldPrice.id);
      } catch (error) {
        console.log('❌ Invalid Gold price ID');
        console.log('Error:', error.message);
      }
    }
    
    return true;
  } catch (error) {
    console.log('❌ Stripe connection failed');
    console.log('Error:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  const mongoResult = await testMongoDB();
  const stripeResult = await testStripe();
  
  console.log('\n=== TEST RESULTS ===');
  console.log('MongoDB:', mongoResult ? '✅ PASSED' : '❌ FAILED');
  console.log('Stripe:', stripeResult ? '✅ PASSED' : '❌ FAILED');
  
  if (!mongoResult || !stripeResult) {
    console.log('\n=== RECOMMENDATIONS ===');
    if (!mongoResult) {
      console.log('- Check MongoDB connection string in .env.local');
      console.log('- Verify MongoDB Atlas credentials');
      console.log('- Ensure IP address is whitelisted in MongoDB Atlas');
    }
    if (!stripeResult) {
      console.log('- Check Stripe API keys in .env.local');
      console.log('- Verify Stripe price IDs');
      console.log('- Ensure Stripe account is active');
    }
  }
}

runTests();
