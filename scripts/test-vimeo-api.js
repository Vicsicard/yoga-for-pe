// Script to test the Vimeo API integration
require('dotenv').config({ path: '.env.local' });
const Vimeo = require('vimeo').Vimeo;

// Initialize the Vimeo client with credentials from .env.local
const client = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

// Function to test the Vimeo API connection
function testVimeoConnection() {
  console.log('Testing Vimeo API connection...');
  
  client.request({
    method: 'GET',
    path: '/me',
  }, (error, body, statusCode) => {
    if (error) {
      console.error('Error connecting to Vimeo API:', error);
      return;
    }
    
    console.log('Successfully connected to Vimeo API!');
    console.log('Account name:', body.name);
    console.log('Account URI:', body.uri);
  });
}

// Function to list the user's videos
function listVideos() {
  console.log('\nFetching your videos...');
  
  client.request({
    method: 'GET',
    path: '/me/videos',
    query: {
      per_page: 10
    }
  }, (error, body, statusCode) => {
    if (error) {
      console.error('Error fetching videos:', error);
      return;
    }
    
    console.log(`Found ${body.data.length} videos:`);
    body.data.forEach(video => {
      console.log(`- ${video.name} (ID: ${video.uri.split('/').pop()})`);
    });
  });
}

// Run the tests
testVimeoConnection();
setTimeout(listVideos, 1000); // Wait a second before listing videos
