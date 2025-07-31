// Simple Node.js script to test the authentication API endpoints
const axios = require('axios');
require('dotenv').config();

// Configure axios to provide more detailed error information
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('Request failed with status:', error.response?.status);
    console.error('Response headers:', JSON.stringify(error.response?.headers, null, 2));
    console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
    return Promise.reject(error);
  }
);

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

async function testAuth() {
  console.log('🔍 Testing JWT Authentication System');
  console.log('===================================');
  
  let token = null;
  
  // Step 1: Test signin endpoint
  try {
    console.log('\n📝 STEP 1: Testing signin endpoint');
    console.log(`Attempting to sign in with email: ${TEST_USER.email}`);
    
    const signinResponse = await axios.post(`${BASE_URL}/api/auth/signin`, TEST_USER);
    
    console.log('✅ Signin successful!');
    console.log('Status:', signinResponse.status);
    console.log('User:', JSON.stringify(signinResponse.data.user, null, 2));
    
    // Store token for next test
    token = signinResponse.data.token;
    console.log('Token received (first 20 chars):', token.substring(0, 20) + '...');
    console.log('Token length:', token.length);
  } catch (error) {
    console.error('❌ Signin failed:', error.response?.status || error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
    process.exit(1);
  }
  
  // Step 2: Test session endpoint with the token
  if (token) {
    try {
      console.log('\n📝 STEP 2: Testing session endpoint');
      console.log('Verifying token with session endpoint');
      
      const sessionResponse = await axios.get(`${BASE_URL}/api/auth/session`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Session verification successful!');
      console.log('Status:', sessionResponse.status);
      console.log('User:', JSON.stringify(sessionResponse.data.user, null, 2));
    } catch (error) {
      console.error('❌ Session verification failed:', error.response?.status || error.message);
      if (error.response?.data) {
        console.error('Error details:', error.response.data);
      }
    }
  }
  
  console.log('\n🎉 Authentication test completed!');
}

// Run the test
testAuth().catch(error => {
  console.error('Test failed with error:', error);
});
