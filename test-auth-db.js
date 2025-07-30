// Test script to verify database connection and authentication functionality
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

console.log('Starting authentication and database test...');

// Test MongoDB connection
async function testDatabaseConnection() {
  console.log('\n--- Testing MongoDB Connection ---');
  console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    
    // Check if User model is accessible
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      email: String,
      name: String,
      password: String,
      subscription: Object
    }));
    
    // Count users to verify database access
    const userCount = await User.countDocuments();
    console.log(`✅ Database access verified: ${userCount} users found`);
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
}

// Test JWT functionality
function testJwtFunctionality() {
  console.log('\n--- Testing JWT Functionality ---');
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  
  try {
    // Create a test token
    const testPayload = { userId: 'test-user-123', name: 'Test User' };
    const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('✅ JWT token created successfully');
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT token verified successfully');
    console.log('Decoded payload:', decoded);
    
    return true;
  } catch (error) {
    console.error('❌ JWT functionality error:', error.message);
    return false;
  }
}

// Test Stripe configuration
function testStripeConfiguration() {
  console.log('\n--- Testing Stripe Configuration ---');
  console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
  console.log('STRIPE_PUBLISHABLE_KEY exists:', !!process.env.STRIPE_PUBLISHABLE_KEY);
  console.log('STRIPE_WEBHOOK_SECRET exists:', !!process.env.STRIPE_WEBHOOK_SECRET);
  console.log('STRIPE_SILVER_PRICE_ID exists:', !!process.env.STRIPE_SILVER_PRICE_ID);
  console.log('STRIPE_GOLD_PRICE_ID exists:', !!process.env.STRIPE_GOLD_PRICE_ID);
  
  // Check if Stripe keys have valid format
  const hasValidSecretKey = process.env.STRIPE_SECRET_KEY?.startsWith('sk_');
  const hasValidPublishableKey = process.env.STRIPE_PUBLISHABLE_KEY?.startsWith('pk_');
  
  console.log('Secret key has valid format:', hasValidSecretKey ? '✅' : '❌');
  console.log('Publishable key has valid format:', hasValidPublishableKey ? '✅' : '❌');
  
  return hasValidSecretKey && hasValidPublishableKey;
}

// Run all tests
async function runTests() {
  console.log('=== Authentication and Database System Test ===');
  
  const dbConnected = await testDatabaseConnection();
  const jwtWorking = testJwtFunctionality();
  const stripeConfigured = testStripeConfiguration();
  
  console.log('\n=== Test Summary ===');
  console.log('Database Connection:', dbConnected ? '✅ PASSED' : '❌ FAILED');
  console.log('JWT Functionality:', jwtWorking ? '✅ PASSED' : '❌ FAILED');
  console.log('Stripe Configuration:', stripeConfigured ? '✅ PASSED' : '❌ FAILED');
  
  // Disconnect from MongoDB
  if (mongoose.connection.readyState) {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
  
  // Overall result
  if (dbConnected && jwtWorking && stripeConfigured) {
    console.log('\n✅ All tests PASSED. Authentication and database system is working correctly.');
  } else {
    console.log('\n❌ Some tests FAILED. Please check the issues above.');
  }
}

// Run the tests
runTests().catch(console.error);
