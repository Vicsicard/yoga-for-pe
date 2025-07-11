// Simple test to call the Stripe endpoint and see the error
const https = require('https');

const postData = JSON.stringify({ tier: 'silver' });

const options = {
  hostname: 'yoga-for-pe-git-stripe-auth-video-vicsicards-projects.vercel.app',
  port: 443,
  path: '/api/stripe/create-checkout-session',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
