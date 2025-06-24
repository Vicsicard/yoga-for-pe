// Script to check the size of a specific video
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

// Get access token from .env.local
const accessToken = process.env.VIMEO_ACCESS_TOKEN;

if (!accessToken) {
  console.error('Error: VIMEO_ACCESS_TOKEN not found in .env.local');
  process.exit(1);
}

// Video ID to check
const videoId = '452426275'; // Zenevate Body Scan 9mins

console.log(`Checking details for video ID: ${videoId}`);

// Fetch video details
fetch(`https://api.vimeo.com/videos/${videoId}`, {
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
  console.log('Video details:');
  console.log(`- Title: ${data.name}`);
  console.log(`- Duration: ${data.duration} seconds (${Math.floor(data.duration / 60)}:${String(data.duration % 60).padStart(2, '0')})`);
  
  // Check if size is available
  if (data.size) {
    const sizeInMB = data.size / 1024 / 1024;
    console.log(`- Size: ${sizeInMB.toFixed(2)} MB`);
    
    // Calculate total size for 36 videos
    const totalSizeInMB = sizeInMB * 36;
    const totalSizeInGB = totalSizeInMB / 1024;
    
    console.log(`\nEstimated storage for 36 similar videos:`);
    console.log(`- Total size: ${totalSizeInMB.toFixed(2)} MB (${totalSizeInGB.toFixed(2)} GB)`);
    
    // Vimeo plan recommendations
    console.log('\nVimeo Plan Recommendations:');
    if (totalSizeInGB <= 5) {
      console.log('- Basic Plan: 5GB total storage would be sufficient');
    } else if (totalSizeInGB <= 25) {
      console.log('- Plus Plan: 25GB total storage would be sufficient');
    } else if (totalSizeInGB <= 500) {
      console.log('- Pro Plan: 500GB total storage would be sufficient');
    } else {
      console.log('- Business or Premium Plan: You would need more than 500GB storage');
    }
  } else {
    console.log('- Size information not available');
  }
  
  // Check file formats
  if (data.files && data.files.length > 0) {
    console.log('\nAvailable file formats:');
    data.files.forEach(file => {
      console.log(`- Quality: ${file.quality}, Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    });
  }
})
.catch(error => {
  console.error('Error:', error.message);
});
