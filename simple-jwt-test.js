// Simple JWT Test Script
// This script tests the JWT token generation and verification directly
// without relying on database modules

require('dotenv').config({ path: '.env.local' });
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper function to log with colors
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test environment variables
function testEnvironment() {
  log('\n🔍 Testing Environment Variables...', 'blue');
  
  // Check JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    log('❌ JWT_SECRET is not defined in environment variables', 'red');
  } else {
    log(`✅ JWT_SECRET is defined (length: ${jwtSecret.length})`, 'green');
  }
  
  // Check MONGODB_URI
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    log('❌ MONGODB_URI is not defined in environment variables', 'red');
  } else {
    log(`✅ MONGODB_URI is defined (starts with: ${mongodbUri.substring(0, 20)}...)`, 'green');
  }
  
  // Check Stripe variables
  const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripePublishableKey) {
    log('❌ STRIPE_PUBLISHABLE_KEY is not defined in environment variables', 'red');
  } else {
    log(`✅ STRIPE_PUBLISHABLE_KEY is defined`, 'green');
  }
  
  if (!stripeSecretKey) {
    log('❌ STRIPE_SECRET_KEY is not defined in environment variables', 'red');
  } else {
    log(`✅ STRIPE_SECRET_KEY is defined`, 'green');
  }
  
  return !!jwtSecret;
}

// Test JWT token generation and verification
function testJWT() {
  log('\n🔍 Testing JWT Token Generation and Verification...', 'blue');
  
  try {
    // Check if JWT_SECRET is defined
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      log('❌ JWT_SECRET is not defined in environment variables', 'red');
      return false;
    }
    
    // Create a test payload
    const testPayload = {
      userId: '507f1f77bcf86cd799439011', // Example MongoDB ObjectId as string
      email: 'test@example.com',
      name: 'Test User',
      subscription: {
        plan: 'basic',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: 'sub_test123'
      }
    };
    
    // Generate a token
    const token = jwt.sign(testPayload, jwtSecret, { expiresIn: '7d' });
    log('✅ JWT token generated successfully', 'green');
    log(`Token: ${token}`, 'cyan');
    
    // Verify the token
    const decoded = jwt.verify(token, jwtSecret);
    log('✅ JWT token verified successfully', 'green');
    log('Decoded payload:', 'cyan');
    console.log(decoded);
    
    // Check if userId is a string
    if (typeof decoded.userId === 'string') {
      log('✅ userId is correctly stored as a string', 'green');
    } else {
      log(`❌ userId is not a string, it's a ${typeof decoded.userId}`, 'red');
    }
    
    // Check if all required fields are present
    const requiredFields = ['userId', 'email', 'subscription'];
    const missingFields = requiredFields.filter(field => !decoded[field]);
    
    if (missingFields.length === 0) {
      log('✅ All required fields are present in the token', 'green');
    } else {
      log(`❌ Missing fields in token: ${missingFields.join(', ')}`, 'red');
    }
    
    return true;
  } catch (error) {
    log(`❌ JWT test failed: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

// Test bcrypt password hashing and verification
function testBcrypt() {
  log('\n🔍 Testing Bcrypt Password Hashing and Verification...', 'blue');
  
  try {
    const testPassword = 'password123';
    
    // Hash the password
    log('Hashing password...', 'yellow');
    const salt = bcrypt.genSaltSync(12); // Using 12 salt rounds
    const hashedPassword = bcrypt.hashSync(testPassword, salt);
    
    log(`✅ Password hashed successfully: ${hashedPassword}`, 'green');
    
    // Verify the password
    log('Verifying password...', 'yellow');
    const isMatch = bcrypt.compareSync(testPassword, hashedPassword);
    
    if (isMatch) {
      log('✅ Password verification successful', 'green');
    } else {
      log('❌ Password verification failed', 'red');
    }
    
    // Test incorrect password
    log('Testing incorrect password...', 'yellow');
    const isWrongMatch = bcrypt.compareSync('wrongpassword', hashedPassword);
    
    if (!isWrongMatch) {
      log('✅ Incorrect password correctly rejected', 'green');
    } else {
      log('❌ Incorrect password was incorrectly accepted', 'red');
    }
    
    return true;
  } catch (error) {
    log(`❌ Bcrypt test failed: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

// Run all tests
function runTests() {
  log('🚀 Starting JWT Authentication System Core Tests', 'magenta');
  
  // Test environment variables
  const envOk = testEnvironment();
  
  // Test JWT
  const jwtOk = testJWT();
  
  // Test bcrypt
  const bcryptOk = testBcrypt();
  
  // Summary
  log('\n📋 Test Summary:', 'magenta');
  log(`Environment Variables: ${envOk ? '✅ PASS' : '❌ FAIL'}`, envOk ? 'green' : 'red');
  log(`JWT Token Generation/Verification: ${jwtOk ? '✅ PASS' : '❌ FAIL'}`, jwtOk ? 'green' : 'red');
  log(`Bcrypt Password Hashing/Verification: ${bcryptOk ? '✅ PASS' : '❌ FAIL'}`, bcryptOk ? 'green' : 'red');
  
  const allPassed = envOk && jwtOk && bcryptOk;
  log(`\nOverall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`, allPassed ? 'green' : 'red');
}

// Run the tests
try {
  runTests();
} catch (error) {
  log(`❌ Unhandled error: ${error.message}`, 'red');
  console.error(error);
}
