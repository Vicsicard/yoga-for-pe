// Comprehensive diagnostic test for MongoDB and Stripe
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const Stripe = require('stripe');
const fs = require('fs');

// Create log file
const logFile = 'diagnostic-results.log';
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(logFile, logMessage);
};

// Clear previous log
if (fs.existsSync(logFile)) {
  fs.unlinkSync(logFile);
}

log('=== YOGA FOR PE DIAGNOSTIC TEST ===');
log(`Running diagnostics at ${new Date().toISOString()}`);

// Check environment variables
log('\n=== ENVIRONMENT VARIABLES ===');
log(`NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
log(`MONGODB_URI exists: ${!!process.env.MONGODB_URI}`);
log(`JWT_SECRET exists: ${!!process.env.JWT_SECRET}`);
log(`STRIPE_SECRET_KEY exists: ${!!process.env.STRIPE_SECRET_KEY}`);
log(`STRIPE_PUBLISHABLE_KEY exists: ${!!process.env.STRIPE_PUBLISHABLE_KEY}`);
log(`STRIPE_SILVER_PRICE_ID exists: ${!!process.env.STRIPE_SILVER_PRICE_ID}`);
log(`STRIPE_GOLD_PRICE_ID exists: ${!!process.env.STRIPE_GOLD_PRICE_ID}`);
log(`STRIPE_WEBHOOK_SECRET exists: ${!!process.env.STRIPE_WEBHOOK_SECRET}`);

// Test MongoDB connection
async function testMongoDB() {
  log('\n=== MONGODB CONNECTION TEST ===');
  
  if (!process.env.MONGODB_URI) {
    log('❌ ERROR: MONGODB_URI is not defined');
    return false;
  }
  
  // Parse MongoDB URI to get database name
  let dbName = 'yoga-for-pe';
  try {
    const uriParts = process.env.MONGODB_URI.split('/');
    if (uriParts.length > 3) {
      const dbPart = uriParts[3].split('?')[0];
      if (dbPart) dbName = dbPart;
    }
    log(`Detected database name: ${dbName}`);
  } catch (err) {
    log(`Could not parse database name from URI: ${err.message}`);
  }
  
  const client = new MongoClient(process.env.MONGODB_URI, {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000
  });
  
  try {
    log('Connecting to MongoDB...');
    await client.connect();
    log('✅ MongoDB connection successful');
    
    // Test database operations
    const db = client.db(dbName);
    log('Testing database operations...');
    
    // List collections
    const collections = await db.listCollections().toArray();
    log(`Found ${collections.length} collections:`);
    collections.forEach(c => log(`- ${c.name}`));
    
    // Check for users collection
    if (collections.some(c => c.name === 'users')) {
      const usersCount = await db.collection('users').countDocuments();
      log(`Found ${usersCount} users in the database`);
      
      // Sample a user (without sensitive data)
      if (usersCount > 0) {
        const sampleUser = await db.collection('users').findOne(
          {}, 
          { projection: { password: 0, email: 0 } }
        );
        if (sampleUser) {
          log('Sample user structure:');
          log(JSON.stringify({
            _id: sampleUser._id ? 'exists' : 'missing',
            name: sampleUser.name ? 'exists' : 'missing',
            subscription: sampleUser.subscription ? 'exists' : 'missing',
            stripeCustomerId: sampleUser.stripeCustomerId ? 'exists' : 'missing'
          }, null, 2));
        }
      }
    } else {
      log('⚠️ WARNING: users collection not found');
    }
    
    return true;
  } catch (error) {
    log(`❌ MongoDB connection failed: ${error.name}`);
    log(`Error message: ${error.message}`);
    if (error.code) log(`Error code: ${error.code}`);
    return false;
  } finally {
    await client.close();
    log('MongoDB connection closed');
  }
}

// Test Stripe connection and functionality
async function testStripe() {
  log('\n=== STRIPE CONNECTION TEST ===');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    log('❌ ERROR: STRIPE_SECRET_KEY is not defined');
    return false;
  }
  
  try {
    log('Initializing Stripe...');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Test basic account access
    log('Testing account access...');
    const account = await stripe.accounts.retrieve();
    log(`✅ Connected to Stripe account: ${account.id}`);
    
    // Test price IDs
    log('\nTesting price IDs...');
    
    // Silver price ID
    if (process.env.STRIPE_SILVER_PRICE_ID) {
      try {
        const silverPrice = await stripe.prices.retrieve(process.env.STRIPE_SILVER_PRICE_ID);
        log(`✅ Silver price ID valid: ${silverPrice.id}`);
        log(`   Product: ${silverPrice.product}`);
        log(`   Amount: ${silverPrice.unit_amount/100} ${silverPrice.currency}`);
        log(`   Recurring: ${silverPrice.recurring ? 'Yes' : 'No'}`);
      } catch (error) {
        log(`❌ Invalid Silver price ID: ${error.message}`);
      }
    } else {
      log('⚠️ WARNING: STRIPE_SILVER_PRICE_ID not defined');
    }
    
    // Gold price ID
    if (process.env.STRIPE_GOLD_PRICE_ID) {
      try {
        const goldPrice = await stripe.prices.retrieve(process.env.STRIPE_GOLD_PRICE_ID);
        log(`✅ Gold price ID valid: ${goldPrice.id}`);
        log(`   Product: ${goldPrice.product}`);
        log(`   Amount: ${goldPrice.unit_amount/100} ${goldPrice.currency}`);
        log(`   Recurring: ${goldPrice.recurring ? 'Yes' : 'No'}`);
      } catch (error) {
        log(`❌ Invalid Gold price ID: ${error.message}`);
      }
    } else {
      log('⚠️ WARNING: STRIPE_GOLD_PRICE_ID not defined');
    }
    
    // Test checkout session creation
    log('\nTesting checkout session creation...');
    if (process.env.STRIPE_SILVER_PRICE_ID) {
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
          success_url: `http://localhost:3000/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `http://localhost:3000/subscription/plans`,
        });
        
        log(`✅ Checkout session created successfully: ${session.id}`);
        log(`   URL: ${session.url}`);
      } catch (error) {
        log(`❌ Failed to create checkout session: ${error.message}`);
      }
    }
    
    return true;
  } catch (error) {
    log(`❌ Stripe connection failed: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runDiagnostics() {
  const mongoResult = await testMongoDB();
  const stripeResult = await testStripe();
  
  log('\n=== DIAGNOSTIC SUMMARY ===');
  log(`MongoDB: ${mongoResult ? '✅ PASSED' : '❌ FAILED'}`);
  log(`Stripe: ${stripeResult ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (!mongoResult || !stripeResult) {
    log('\n=== RECOMMENDATIONS ===');
    if (!mongoResult) {
      log('- Verify MongoDB connection string format');
      log('- Check MongoDB Atlas credentials');
      log('- Ensure IP address is whitelisted in MongoDB Atlas');
      log('- Verify network connectivity to MongoDB Atlas');
    }
    if (!stripeResult) {
      log('- Verify Stripe API keys');
      log('- Check Stripe price IDs');
      log('- Ensure Stripe account is active');
    }
  }
  
  log('\nDiagnostic test completed at ' + new Date().toISOString());
  log(`Full results saved to ${logFile}`);
}

// Run diagnostics
runDiagnostics().catch(err => {
  log(`\n❌ FATAL ERROR: ${err.message}`);
  log(err.stack);
});
