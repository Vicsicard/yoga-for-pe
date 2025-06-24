// Script to generate a Vimeo access token
require('dotenv').config({ path: '.env.local' });
const Vimeo = require('vimeo').Vimeo;
const fs = require('fs');
const path = require('path');

// Get client ID and secret from .env.local
const clientId = process.env.VIMEO_CLIENT_ID;
const clientSecret = process.env.VIMEO_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('Error: VIMEO_CLIENT_ID and/or VIMEO_CLIENT_SECRET not found in .env.local');
  process.exit(1);
}

// Initialize Vimeo client
const client = new Vimeo(clientId, clientSecret);

// Generate an access token with all scopes
console.log('Generating Vimeo access token...');
client.generateClientCredentials(['public', 'private', 'create', 'edit', 'delete', 'interact', 'upload'], (err, response) => {
  if (err) {
    console.error('Error generating access token:', err);
    process.exit(1);
  }

  const accessToken = response.access_token;
  console.log('Access token generated successfully!');
  
  // Update .env.local with the new token
  const envPath = path.join(__dirname, '..', '.env.local');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace the access token line
  envContent = envContent.replace(
    /VIMEO_ACCESS_TOKEN=.*/,
    `VIMEO_ACCESS_TOKEN=${accessToken}`
  );
  
  // Write the updated content back to .env.local
  fs.writeFileSync(envPath, envContent, 'utf8');
  
  console.log('Access token has been added to .env.local');
  console.log('You can now use the Vimeo API with your application.');
});
