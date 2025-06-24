// Script to list all videos in your Vimeo account with pagination
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

// Get access token from .env.local
const accessToken = process.env.VIMEO_ACCESS_TOKEN;

if (!accessToken) {
  console.error('Error: VIMEO_ACCESS_TOKEN not found in .env.local');
  process.exit(1);
}

console.log('Fetching all videos from your Vimeo account...');

// Function to fetch videos with pagination
async function fetchAllVideos() {
  let nextPage = 'https://api.vimeo.com/me/videos?per_page=100'; // Get 100 videos per page
  let allVideos = [];
  
  while (nextPage) {
    console.log(`Fetching page: ${nextPage}`);
    
    const response = await fetch(nextPage, {
      headers: {
        'Authorization': `bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.vimeo.*+json;version=3.4'
      }
    });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API request failed: ${text}`);
    }
    
    const data = await response.json();
    allVideos = allVideos.concat(data.data);
    
    // Check if there's a next page
    nextPage = data.paging && data.paging.next ? data.paging.next : null;
  }
  
  return allVideos;
}

// Main function
async function main() {
  try {
    // First get user info
    const userResponse = await fetch('https://api.vimeo.com/me', {
      headers: {
        'Authorization': `bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.vimeo.*+json;version=3.4'
      }
    });
    
    if (!userResponse.ok) {
      const text = await userResponse.text();
      throw new Error(`API request failed: ${text}`);
    }
    
    const userData = await userResponse.json();
    console.log('Successfully connected to Vimeo API!');
    console.log('Account name:', userData.name);
    console.log('Account URI:', userData.uri);
    
    // Now fetch all videos
    const videos = await fetchAllVideos();
    
    console.log(`\nFound ${videos.length} videos in your account:`);
    videos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.name} (ID: ${video.uri.split('/').pop()})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
