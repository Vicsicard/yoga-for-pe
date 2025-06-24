// Script to organize videos from spreadsheet data into Vimeo with proper metadata
require('dotenv').config({ path: '.env.local' });
const Vimeo = require('vimeo').Vimeo;
const fs = require('fs');
const path = require('path');

// Initialize the Vimeo client with credentials from .env.local
const client = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

// Define subscription tiers
const SUBSCRIPTION_TIERS = {
  BRONZE: 'bronze', // Free tier
  SILVER: 'silver', // $7.99/month
  GOLD: 'gold'      // $9.99/month
};

// Define video categories
const VIDEO_CATEGORIES = {
  MEDITATION: 'meditation',
  YOGA_FOR_PE: 'yoga-for-pe',
  RELAXATION: 'relaxation'
};

// Function to load video data from a JSON file
// This JSON file should be created from your spreadsheet data
function loadVideoData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading video data:', error);
    return [];
  }
}

/**
 * Update a video's metadata on Vimeo
 * @param {string} vimeoId - The Vimeo video ID
 * @param {object} metadata - The metadata to update
 */
function updateVideoMetadata(vimeoId, metadata) {
  return new Promise((resolve, reject) => {
    // First update name and description
    client.request({
      method: 'PATCH',
      path: `/videos/${vimeoId}`,
      body: {
        name: metadata.title,
        description: metadata.description
      }
    }, (error, body, statusCode) => {
      if (error) {
        console.error(`Error updating video ${vimeoId}:`, error);
        reject(error);
        return;
      }
      
      console.log(`Updated video ${vimeoId} with title and description`);
      
      // Now add tags for category and tier
      const tags = [metadata.category, metadata.tier];
      if (metadata.level) tags.push(metadata.level);
      if (metadata.featured) tags.push('featured');
      
      client.request({
        method: 'PUT',
        path: `/videos/${vimeoId}/tags`,
        body: {
          tag: tags
        }
      }, (tagError, tagBody, tagStatusCode) => {
        if (tagError) {
          console.error(`Error adding tags to video ${vimeoId}:`, tagError);
          reject(tagError);
          return;
        }
        
        console.log(`Added tags to video ${vimeoId}: ${tags.join(', ')}`);
        resolve();
      });
    });
  });
}

/**
 * Get all videos from your Vimeo account
 * This helps match titles to video IDs
 */
function getAllVimeoVideos() {
  return new Promise((resolve, reject) => {
    client.request({
      method: 'GET',
      path: '/me/videos',
      query: {
        per_page: 100 // Adjust as needed
      }
    }, (error, body, statusCode) => {
      if (error) {
        console.error('Error fetching videos:', error);
        reject(error);
        return;
      }
      
      resolve(body.data);
    });
  });
}

/**
 * Find a Vimeo video ID by matching the title
 * @param {Array} vimeoVideos - List of videos from Vimeo API
 * @param {string} title - Title to match
 */
function findVimeoIdByTitle(vimeoVideos, title) {
  const video = vimeoVideos.find(v => 
    v.name.toLowerCase() === title.toLowerCase() ||
    v.name.toLowerCase().includes(title.toLowerCase())
  );
  
  return video ? video.uri.split('/').pop() : null;
}

/**
 * Main function to update all videos
 */
async function organizeVideos() {
  console.log('Starting video organization process...');
  
  // Path to your JSON file with video data from spreadsheet
  const videoDataPath = path.join(__dirname, 'video-data.json');
  
  // Load video data
  const videoData = loadVideoData(videoDataPath);
  if (!videoData.length) {
    console.log('No video data found. Please create a video-data.json file with your spreadsheet data.');
    return;
  }
  
  // Get all videos from Vimeo to match titles with IDs
  console.log('Fetching videos from Vimeo...');
  const vimeoVideos = await getAllVimeoVideos();
  console.log(`Found ${vimeoVideos.length} videos in your Vimeo account.`);
  
  // Process each video
  for (const video of videoData) {
    try {
      // Find the Vimeo ID for this video by title
      const vimeoId = video.vimeoId || findVimeoIdByTitle(vimeoVideos, video.title);
      
      if (!vimeoId) {
        console.log(`Could not find Vimeo ID for video: ${video.title}. Skipping.`);
        continue;
      }
      
      console.log(`Updating video: ${video.title} (${vimeoId})`);
      await updateVideoMetadata(vimeoId, {
        title: video.title,
        description: video.description,
        category: video.category,
        tier: video.tier,
        level: video.level,
        featured: video.featured
      });
      
      // Wait a bit between API calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to update video ${video.title}:`, error);
    }
  }
  
  console.log('Video organization complete!');
}

// Run the organization process
organizeVideos().catch(error => {
  console.error('Error in organization process:', error);
});
