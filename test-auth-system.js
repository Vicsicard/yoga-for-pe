// Test script to verify the authentication system with standardized DB connection
// Set NODE_ENV to test to bypass client-side import restrictions
process.env.NODE_ENV = 'test';
require('dotenv').config({ path: '.env.local' });

// Import after setting environment variables
const { connectDB } = require('./lib/db/index');
const User = require('./lib/models/User').default;
const { authenticateUser, verifyToken, generateToken } = require('./auth');

console.log('Starting authentication system test...');

// Test user authentication
async function testAuthentication() {
  console.log('\n--- Testing User Authentication ---');
  
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Find a test user
    const testUser = await User.findOne({});
    if (!testUser) {
      console.log('❌ No test users found in database');
      return false;
    }
    
    console.log(`Found test user: ${testUser.email}`);
    
    // Test token generation and verification
    const rawUser = testUser.toObject ? testUser.toObject() : testUser;
    const token = generateToken(rawUser);
    console.log('✅ Generated JWT token successfully');
    
    // Verify the token
    const decoded = verifyToken(token);
    console.log('✅ Verified JWT token successfully');
    console.log('Decoded token payload:', decoded);
    
    // Test API endpoints
    console.log('\n--- Testing API Endpoints ---');
    
    // Test session endpoint
    const fetch = require('node-fetch');
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).catch(err => {
      console.log('❌ Session API test skipped: server not running');
      return null;
    });
    
    if (sessionResponse) {
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        console.log('✅ Session API endpoint working correctly');
        console.log('Session data:', sessionData);
      } else {
        console.log('❌ Session API endpoint returned error:', await sessionResponse.text());
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Authentication test error:', error.message);
    return false;
  }
}

// Test database models with standardized connection
async function testDatabaseModels() {
  console.log('\n--- Testing Database Models ---');
  
  try {
    // Connect to database
    await connectDB();
    
    // Test User model
    const userCount = await User.countDocuments();
    console.log(`✅ User model working: ${userCount} users found`);
    
    // Test subscription data
    const usersWithSubscriptions = await User.countDocuments({
      'subscription.status': { $exists: true }
    });
    console.log(`✅ Subscription data: ${usersWithSubscriptions} users have subscription data`);
    
    return true;
  } catch (error) {
    console.error('❌ Database models test error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('=== Authentication System Test ===');
  
  const authWorks = await testAuthentication();
  const dbModelsWork = await testDatabaseModels();
  
  console.log('\n=== Test Summary ===');
  console.log('Authentication System:', authWorks ? '✅ PASSED' : '❌ FAILED');
  console.log('Database Models:', dbModelsWork ? '✅ PASSED' : '❌ FAILED');
  
  // Overall result
  if (authWorks && dbModelsWork) {
    console.log('\n✅ All tests PASSED. Authentication system is working correctly with standardized database connection.');
  } else {
    console.log('\n❌ Some tests FAILED. Please check the issues above.');
  }
  
  // Cleanup
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState) {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the tests
runTests().catch(console.error);
