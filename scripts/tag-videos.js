// Script to add category and subscription tier tags to Vimeo videos
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Get access token from .env.local
const accessToken = process.env.VIMEO_ACCESS_TOKEN;

if (!accessToken) {
  console.error('Error: VIMEO_ACCESS_TOKEN not found in .env.local');
  process.exit(1);
}

// Categories and tiers
const CATEGORIES = ['meditation', 'yoga-for-pe', 'relaxation'];
const TIERS = ['bronze', 'silver', 'gold'];

// Function to update video tags
async function updateVideoTags(videoId, category, tier, name) {
  console.log(`Updating tags for video: ${name} (ID: ${videoId})`);
  console.log(`  - Category: ${category}`);
  console.log(`  - Tier: ${tier}`);
  
  try {
    // First get current video data
    const getResponse = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
      headers: {
        'Authorization': `bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.vimeo.*+json;version=3.4'
      }
    });
    
    if (!getResponse.ok) {
      const text = await getResponse.text();
      throw new Error(`Failed to get video data: ${text}`);
    }
    
    const videoData = await getResponse.json();
    
    // Get existing tags and add new ones if they don't exist
    const existingTags = videoData.tags.map(tag => tag.name);
    const newTags = [];
    
    if (!existingTags.includes(category)) {
      newTags.push(category);
    }
    
    if (!existingTags.includes(tier)) {
      newTags.push(tier);
    }
    
    // If no new tags to add, skip update
    if (newTags.length === 0) {
      console.log('  - No new tags to add, skipping update');
      return;
    }
    
    // Combine existing and new tags
    const allTags = [...existingTags, ...newTags];
    
    // Update the video with new tags
    const updateResponse = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.vimeo.*+json;version=3.4'
      },
      body: JSON.stringify({
        tags: allTags
      })
    });
    
    if (!updateResponse.ok) {
      const text = await updateResponse.text();
      throw new Error(`Failed to update video: ${text}`);
    }
    
    console.log('  - Tags updated successfully');
    
  } catch (error) {
    console.error(`  - Error updating video ${videoId}:`, error.message);
  }
  
  // Add delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 1000));
}

// Main function to process a JSON file with video data
async function processVideoData(jsonFilePath) {
  try {
    // Read and parse the JSON file
    const rawData = fs.readFileSync(jsonFilePath);
    const videoData = JSON.parse(rawData);
    
    console.log(`Processing ${videoData.length} videos from ${jsonFilePath}`);
    
    // Process each video
    for (let i = 0; i < videoData.length; i++) {
      const video = videoData[i];
      
      // Validate required fields
      if (!video.id || !video.category || !video.tier || !video.title) {
        console.error(`Skipping video at index ${i}: Missing required fields`);
        continue;
      }
      
      // Validate category and tier
      if (!CATEGORIES.includes(video.category)) {
        console.error(`Invalid category for video ${video.title}: ${video.category}`);
        continue;
      }
      
      if (!TIERS.includes(video.tier)) {
        console.error(`Invalid tier for video ${video.title}: ${video.tier}`);
        continue;
      }
      
      // Update video tags
      await updateVideoTags(video.id, video.category, video.tier, video.title);
    }
    
    console.log('All videos processed successfully');
    
  } catch (error) {
    console.error('Error processing video data:', error.message);
  }
}

// Check if a file path was provided
if (process.argv.length < 3) {
  console.log('Usage: node tag-videos.js <path-to-video-data.json>');
  console.log('\nJSON file format example:');
  console.log(`[
  {
    "id": "123456789",
    "title": "Meditation Session 1",
    "category": "meditation",
    "tier": "bronze",
    "description": "A relaxing meditation session"
  },
  {
    "id": "987654321",
    "title": "Yoga Flow",
    "category": "yoga-for-pe",
    "tier": "silver",
    "description": "Energizing yoga flow for beginners"
  }
]`);
  process.exit(1);
}

// Get the file path from command line arguments
const jsonFilePath = process.argv[2];

// Check if the file exists
if (!fs.existsSync(jsonFilePath)) {
  console.error(`Error: File not found: ${jsonFilePath}`);
  process.exit(1);
}

// Process the video data
processVideoData(jsonFilePath);
