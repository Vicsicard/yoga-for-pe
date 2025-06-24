// Script to check if all required environment variables are set
// Run this script to verify that all necessary environment variables are available

console.log('Checking environment variables for Yoga for PE Next.js app...');
console.log('=====================================================');

// List of required environment variables
const requiredVars = [
  'VIMEO_ACCESS_TOKEN',
  'VIMEO_CLIENT_ID',
  'VIMEO_CLIENT_SECRET'
];

// Check each required variable
let missingVars = [];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    missingVars.push(varName);
    console.log(`❌ ${varName}: Missing`);
  } else {
    // Only show first few characters of tokens for security
    const value = process.env[varName];
    const maskedValue = value.substring(0, 4) + '...' + value.substring(value.length - 4);
    console.log(`✅ ${varName}: ${maskedValue}`);
  }
}

// Summary
console.log('=====================================================');
if (missingVars.length === 0) {
  console.log('✅ All required environment variables are set!');
} else {
  console.log(`❌ Missing ${missingVars.length} required environment variables:`);
  console.log(missingVars.join(', '));
  console.log('\nPlease set these variables in your .env.local file for local development');
  console.log('and in your Vercel project settings for deployment.');
}
