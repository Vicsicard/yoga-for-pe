// Auth Test Script
// This script tests the JWT authentication system by making direct API calls
// to the signin and session endpoints

require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3000';
// Fallback URL if the main one fails
const FALLBACK_URL = 'http://127.0.0.1:3000';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

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

// Helper function to try both URLs
async function tryFetch(path, options = {}) {
  try {
    // Try the main URL first
    const response = await fetch(`${BASE_URL}${path}`, options);
    return response;
  } catch (error) {
    log(`⚠️ Failed to connect to ${BASE_URL}${path}, trying fallback URL...`, 'yellow');
    try {
      // Try the fallback URL
      const response = await fetch(`${FALLBACK_URL}${path}`, options);
      return response;
    } catch (fallbackError) {
      throw new Error(`Failed to connect to both URLs: ${error.message} and ${fallbackError.message}`);
    }
  }
}

// Helper function to log JSON responses
function logResponse(title, data) {
  log(`\n=== ${title} ===`, 'cyan');
  console.log(JSON.stringify(data, null, 2));
}

// Test the environment variables
async function testEnvironment() {
  log('\n🔍 Testing Environment Variables...', 'blue');
  
  try {
    const response = await tryFetch('/api/debug/env');
    const data = await response.json();
    
    logResponse('Environment Variables', data);
    
    // Check critical variables
    const criticalVars = ['MONGODB_URI', 'JWT_SECRET'];
    let allCriticalVarsPresent = true;
    
    criticalVars.forEach(varName => {
      if (!data[varName]) {
        log(`❌ Critical variable missing: ${varName}`, 'red');
        allCriticalVarsPresent = false;
      } else {
        log(`✅ ${varName} is defined`, 'green');
      }
    });
    
    if (allCriticalVarsPresent) {
      log('✅ All critical environment variables are present', 'green');
    } else {
      log('❌ Some critical environment variables are missing', 'red');
    }
    
    return allCriticalVarsPresent;
  } catch (error) {
    log(`❌ Error testing environment: ${error.message}`, 'red');
    return false;
  }
}

// Test the database connection
async function testDatabase() {
  log('\n🔍 Testing Database Connection...', 'blue');
  
  try {
    const response = await tryFetch('/api/debug/db');
    const data = await response.json();
    
    logResponse('Database Connection', data);
    
    if (data.connected) {
      log(`✅ Database connected successfully to: ${data.host}/${data.name}`, 'green');
      return true;
    } else {
      log(`❌ Database connection failed: ${data.error || 'Unknown error'}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing database: ${error.message}`, 'red');
    return false;
  }
}

// Test the signin endpoint
async function testSignin() {
  log('\n🔍 Testing Signin Endpoint...', 'blue');
  
  try {
    const response = await tryFetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });
    
    const data = await response.json();
    logResponse('Signin Response', data);
    
    if (response.ok) {
      log(`✅ Signin successful for user: ${data.user?.email || 'Unknown'}`, 'green');
      return data.token;
    } else {
      log(`❌ Signin failed: ${data.error || 'Unknown error'}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Error testing signin: ${error.message}`, 'red');
    return null;
  }
}

// Test the session endpoint
async function testSession(token) {
  log('\n🔍 Testing Session Endpoint...', 'blue');
  
  if (!token) {
    log('❌ No token available to test session', 'red');
    return false;
  }
  
  try {
    const response = await tryFetch('/api/auth/session', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    logResponse('Session Response', data);
    
    if (response.ok && data.user) {
      log(`✅ Session verification successful for user: ${data.user.email || 'Unknown'}`, 'green');
      return true;
    } else {
      log(`❌ Session verification failed: ${data.error || 'Unknown error'}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing session: ${error.message}`, 'red');
    return false;
  }
}

// Test the auth debug endpoint
async function testAuthDebug(token) {
  log('\n🔍 Testing Auth Debug Endpoint...', 'blue');
  
  try {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await tryFetch('/api/debug/auth', { headers });
    const data = await response.json();
    
    logResponse('Auth Debug Response', data);
    
    // Check JWT configuration
    if (data.auth.jwtSecretExists) {
      log('✅ JWT Secret exists', 'green');
    } else {
      log('❌ JWT Secret is missing', 'red');
    }
    
    // Check token validation
    if (token) {
      if (data.auth.tokenValidation.valid) {
        log('✅ Token is valid', 'green');
      } else {
        log(`❌ Token validation failed: ${data.auth.tokenValidation.error}`, 'red');
      }
    } else {
      log('⚠️ No token provided for validation', 'yellow');
    }
    
    // Check user data
    if (data.user && !data.user.error) {
      log(`✅ User found in database: ${data.user.email}`, 'green');
    } else {
      log(`❌ User data issue: ${data.user ? data.user.error : 'No user data'}`, 'red');
    }
    
    return data;
  } catch (error) {
    log(`❌ Error testing auth debug: ${error.message}`, 'red');
    return null;
  }
}

// Run all tests
async function runTests() {
  log('🚀 Starting JWT Authentication System Tests', 'magenta');
  
  // Test environment variables
  const envOk = await testEnvironment();
  if (!envOk) {
    log('⚠️ Environment issues detected, but continuing tests...', 'yellow');
  }
  
  // Test database connection
  const dbOk = await testDatabase();
  if (!dbOk) {
    log('⚠️ Database connection issues detected, but continuing tests...', 'yellow');
  }
  
  // Test signin
  const token = await testSignin();
  
  // Test session verification if we have a token
  if (token) {
    await testSession(token);
    await testAuthDebug(token);
  } else {
    log('⚠️ Skipping session and auth debug tests due to signin failure', 'yellow');
    // Try auth debug without token
    await testAuthDebug(null);
  }
  
  log('\n🏁 All tests completed', 'magenta');
}

// Run the tests
runTests().catch(error => {
  log(`❌ Unhandled error: ${error.message}`, 'red');
  console.error(error);
});
