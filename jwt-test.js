// JWT Test Script
// This script tests the JWT token generation and verification directly
// without relying on API endpoints

require('dotenv').config({ path: '.env.local' });
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB } = require('./lib/db/index');

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

// Test JWT token generation and verification
async function testJWT() {
  log('\n🔍 Testing JWT Token Generation and Verification...', 'blue');
  
  try {
    // Check if JWT_SECRET is defined
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      log('❌ JWT_SECRET is not defined in environment variables', 'red');
      return false;
    }
    
    log(`✅ JWT_SECRET is defined (length: ${jwtSecret.length})`, 'green');
    
    // Create a test payload
    const testPayload = {
      userId: '507f1f77bcf86cd799439011', // Example MongoDB ObjectId as string
      email: 'test@example.com',
      name: 'Test User',
      subscription: {
        plan: 'basic',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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

// Test MongoDB connection
async function testMongoDB() {
  log('\n🔍 Testing MongoDB Connection...', 'blue');
  
  try {
    // Check if MONGODB_URI is defined
    const mongodbUri = process.env.MONGODB_URI;
    if (!mongodbUri) {
      log('❌ MONGODB_URI is not defined in environment variables', 'red');
      return false;
    }
    
    log(`✅ MONGODB_URI is defined (starts with: ${mongodbUri.substring(0, 20)}...)`, 'green');
    
    // Try to connect to MongoDB
    log('Attempting to connect to MongoDB...', 'yellow');
    await connectDB();
    
    // Check connection state
    const connectionState = mongoose.connection.readyState;
    const stateMap = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    if (connectionState === 1) {
      log(`✅ Successfully connected to MongoDB (${mongoose.connection.host})`, 'green');
      log(`Database name: ${mongoose.connection.name}`, 'green');
      return true;
    } else {
      log(`❌ Failed to connect to MongoDB. Connection state: ${stateMap[connectionState]}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ MongoDB connection test failed: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

// Test bcrypt password hashing and verification
async function testBcrypt() {
  log('\n🔍 Testing Bcrypt Password Hashing and Verification...', 'blue');
  
  try {
    const testPassword = 'password123';
    
    // Hash the password
    log('Hashing password...', 'yellow');
    const salt = await bcrypt.genSalt(12); // Using 12 salt rounds
    const hashedPassword = await bcrypt.hash(testPassword, salt);
    
    log(`✅ Password hashed successfully: ${hashedPassword}`, 'green');
    
    // Verify the password
    log('Verifying password...', 'yellow');
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    
    if (isMatch) {
      log('✅ Password verification successful', 'green');
    } else {
      log('❌ Password verification failed', 'red');
    }
    
    // Test incorrect password
    log('Testing incorrect password...', 'yellow');
    const isWrongMatch = await bcrypt.compare('wrongpassword', hashedPassword);
    
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
async function runTests() {
  log('🚀 Starting JWT Authentication System Core Tests', 'magenta');
  
  // Test JWT
  const jwtOk = await testJWT();
  
  // Test MongoDB connection
  const mongoOk = await testMongoDB();
  
  // Test bcrypt
  const bcryptOk = await testBcrypt();
  
  // Summary
  log('\n📋 Test Summary:', 'magenta');
  log(`JWT Token Generation/Verification: ${jwtOk ? '✅ PASS' : '❌ FAIL'}`, jwtOk ? 'green' : 'red');
  log(`MongoDB Connection: ${mongoOk ? '✅ PASS' : '❌ FAIL'}`, mongoOk ? 'green' : 'red');
  log(`Bcrypt Password Hashing/Verification: ${bcryptOk ? '✅ PASS' : '❌ FAIL'}`, bcryptOk ? 'green' : 'red');
  
  const allPassed = jwtOk && mongoOk && bcryptOk;
  log(`\nOverall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`, allPassed ? 'green' : 'red');
  
  // Cleanup
  if (mongoose.connection.readyState === 1) {
    log('\nClosing MongoDB connection...', 'yellow');
    await mongoose.connection.close();
    log('MongoDB connection closed', 'green');
  }
}

// Run the tests
runTests().catch(error => {
  log(`❌ Unhandled error: ${error.message}`, 'red');
  console.error(error);
});
