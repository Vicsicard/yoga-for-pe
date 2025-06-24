// Script to tag selected videos as featured and bronze (free) for the homepage
require('dotenv').config({ path: '.env.local' });
const Vimeo = require('vimeo').Vimeo;

// Initialize the Vimeo client
const client = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

// Define one video from each category to be tagged as bronze (free)
const featuredVideos = [
  {
    // Meditation category
    id: "457053392", // I Am Meditation 1
    category: "meditation",
    tier: "bronze",
    description: "A guided meditation to help you connect with your inner self and find peace."
  },
  {
    // Yoga for PE category
    id: "1095788590", // Ab Circle 1
    category: "yoga-for-pe",
    tier: "bronze",
    description: "A fun, full-circle core workout that targets every major ab muscle in one dynamic loop."
  },
  {
    // Relaxation category
    id: "452426275", // Zenevate Body Scan
    category: "relaxation",
    tier: "bronze",
    description: "A relaxing body scan meditation to help you unwind and connect with your body."
  }
];

// Function to update tags and description for a video
async function updateVideoTags(videoId, tags, description) {
  return new Promise((resolve, reject) => {
    client.request({
      method: 'PATCH',
      path: `/videos/${videoId}`,
      query: {
        fields: 'uri,name,description,tags'
      },
      body: {
        tags: tags,
        description: description || ''
      }
    }, (error, body, statusCode, headers) => {
      if (error) {
        console.error(`Error updating video ${videoId}:`, error);
        reject(error);
      } else {
        console.log(`Tags and description updated successfully for video ${videoId}`);
        resolve(body);
      }
    });
  });
}

// Function to get current tags for a video
async function getVideoTags(videoId) {
  return new Promise((resolve, reject) => {
    client.request({
      method: 'GET',
      path: `/videos/${videoId}`,
      query: {
        fields: 'uri,name,tags'
      }
    }, (error, body, statusCode, headers) => {
      if (error) {
        console.error(`Error fetching video ${videoId}:`, error);
        reject(error);
      } else {
        const tags = body.tags.map(tag => tag.name);
        console.log(`Current tags for video ${videoId}:`, tags);
        resolve(tags);
      }
    });
  });
}

// Main function to process videos
async function tagFeaturedVideos() {
  console.log('Starting to tag featured videos...');
  
  for (const video of featuredVideos) {
    try {
      console.log(`Processing video ID: ${video.id}`);
      
      // Get current tags
      const currentTags = await getVideoTags(video.id);
      
      // Prepare new tags, ensuring we don't duplicate
      const newTags = [...new Set([
        ...currentTags,
        video.category,
        video.tier,
        'featured' // Add featured tag
      ])];
      
      // Update the video with new tags and description
      await updateVideoTags(video.id, newTags, video.description);
      console.log(`Successfully updated video ${video.id} with tags: ${newTags.join(', ')}`);
      console.log(`Description set to: "${video.description}"`);
    } catch (error) {
      console.error(`Failed to process video ${video.id}:`, error);
    }
  }
  
  console.log('Finished tagging featured videos');
}

// Run the script
tagFeaturedVideos().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
