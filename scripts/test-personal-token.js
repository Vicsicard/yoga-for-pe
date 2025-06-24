// Script to test a personal access token with the Vimeo API
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

// Get access token from .env.local
const accessToken = process.env.VIMEO_ACCESS_TOKEN;

if (!accessToken) {
  console.error('Error: VIMEO_ACCESS_TOKEN not found in .env.local');
  process.exit(1);
}

console.log('Testing Vimeo API with personal access token...');

// Make a simple request to get user info
fetch('https://api.vimeo.com/me', {
  headers: {
    'Authorization': `bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.vimeo.*+json;version=3.4'
  }
})
.then(response => {
  if (!response.ok) {
    return response.text().then(text => {
      throw new Error(`API request failed: ${text}`);
    });
  }
  return response.json();
})
.then(data => {
  console.log('Successfully connected to Vimeo API!');
  console.log('Account name:', data.name);
  console.log('Account URI:', data.uri);
  
  // Now fetch videos
  return fetch('https://api.vimeo.com/me/videos?per_page=5', {
    headers: {
      'Authorization': `bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.vimeo.*+json;version=3.4'
    }
  });
})
.then(response => {
  if (!response.ok) {
    return response.text().then(text => {
      throw new Error(`API request failed: ${text}`);
    });
  }
  return response.json();
})
.then(data => {
  console.log('\nFound videos:', data.total);
  if (data.data && data.data.length > 0) {
    console.log('Videos:');
    data.data.forEach(video => {
      console.log(`- ${video.name} (ID: ${video.uri.split('/').pop()})`);
    });
  } else {
    console.log('No videos found in your account.');
  }
})
.catch(error => {
  console.error('Error:', error.message);
});
