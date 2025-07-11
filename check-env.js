// Check environment variables and write to file
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

// Create a safe version of environment variables (hiding sensitive values)
const safeEnv = {};
Object.keys(process.env).forEach(key => {
  if (key.includes('MONGODB') || key.includes('STRIPE') || key.includes('JWT')) {
    // Show only first few characters of sensitive values
    const value = process.env[key];
    safeEnv[key] = value ? `${value.substring(0, 10)}...` : 'undefined';
  }
});

// Write to file
const output = `
Environment Variables Check
==========================
Time: ${new Date().toISOString()}

MongoDB:
- MONGODB_URI: ${safeEnv.MONGODB_URI || 'Not set'}

Stripe:
- STRIPE_SECRET_KEY: ${safeEnv.STRIPE_SECRET_KEY || 'Not set'}
- STRIPE_PUBLISHABLE_KEY: ${safeEnv.STRIPE_PUBLISHABLE_KEY || 'Not set'}
- STRIPE_SILVER_PRICE_ID: ${safeEnv.STRIPE_SILVER_PRICE_ID || 'Not set'}
- STRIPE_GOLD_PRICE_ID: ${safeEnv.STRIPE_GOLD_PRICE_ID || 'Not set'}
- STRIPE_WEBHOOK_SECRET: ${safeEnv.STRIPE_WEBHOOK_SECRET || 'Not set'}

JWT:
- JWT_SECRET: ${safeEnv.JWT_SECRET || 'Not set'}

Node Environment:
- NODE_ENV: ${process.env.NODE_ENV || 'Not set'}
`;

fs.writeFileSync('env-check-result.txt', output);
console.log('Environment variables check complete. Results written to env-check-result.txt');
