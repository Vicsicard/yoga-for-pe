// Script to update Vimeo video metadata with descriptions, categories, and subscription tiers
require('dotenv').config({ path: '.env.local' });
const Vimeo = require('vimeo').Vimeo;

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

// Sample video data - replace with your actual video data
// This would typically come from your spreadsheet
const videoData = [
  {
    vimeoId: '123456789', // Replace with actual Vimeo ID
    title: 'Meditation for Focus',
    description: 'A 10-minute meditation to help improve focus and concentration.',
    category: VIDEO_CATEGORIES.MEDITATION,
    tier: SUBSCRIPTION_TIERS.BRONZE,
    level: 'Beginner'
  },
  // Add more videos here
];

/**
 * Update a video's metadata on Vimeo
 * @param {string} vimeoId - The Vimeo video ID
 * @param {object} metadata - The metadata to update
 */
function updateVideoMetadata(vimeoId, metadata) {
  return new Promise((resolve, reject) => {
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
      client.request({
        method: 'PUT',
        path: `/videos/${vimeoId}/tags`,
        body: {
          tag: [metadata.category, metadata.tier, metadata.level]
        }
      }, (tagError, tagBody, tagStatusCode) => {
        if (tagError) {
          console.error(`Error adding tags to video ${vimeoId}:`, tagError);
          reject(tagError);
          return;
        }
        
        console.log(`Added tags to video ${vimeoId}: ${metadata.category}, ${metadata.tier}, ${metadata.level}`);
        resolve();
      });
    });
  });
}

/**
 * Main function to update all videos
 */
async function updateAllVideos() {
  console.log('Starting video metadata update...');
  
  for (const video of videoData) {
    try {
      console.log(`Updating video: ${video.title} (${video.vimeoId})`);
      await updateVideoMetadata(video.vimeoId, video);
      // Wait a bit between API calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to update video ${video.vimeoId}:`, error);
    }
  }
  
  console.log('Video metadata update complete!');
}

// Run the update process
updateAllVideos().catch(error => {
  console.error('Error in update process:', error);
});
