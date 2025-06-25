// Script to count the total number of videos in the Vimeo account
require('dotenv').config({ path: '.env.local' });

const accessToken = process.env.VIMEO_ACCESS_TOKEN;
const clientId = process.env.VIMEO_CLIENT_ID;
const clientSecret = process.env.VIMEO_CLIENT_SECRET;

if (!accessToken) {
  console.error('Error: VIMEO_ACCESS_TOKEN not found in environment variables');
  process.exit(1);
}

async function countVideos() {
  try {
    console.log('Fetching videos from Vimeo account...');
    
    // Initial request to get the first page of videos and total count
    const response = await fetch('https://api.vimeo.com/me/videos?per_page=1', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.vimeo.*+json;version=3.4'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error: ${response.status} ${response.statusText}`);
      console.error(errorText);
      process.exit(1);
    }

    const data = await response.json();
    
    console.log('==============================================');
    console.log(`Total videos in account: ${data.total}`);
    console.log('==============================================');
    
    // Get video categories if available
    const categories = {};
    
    // Fetch more videos to analyze categories (up to 100)
    const videosResponse = await fetch('https://api.vimeo.com/me/videos?per_page=100', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.vimeo.*+json;version=3.4'
      }
    });
    
    if (videosResponse.ok) {
      const videosData = await videosResponse.json();
      
      // Count videos by tag categories
      videosData.data.forEach(video => {
        if (video.tags) {
          video.tags.forEach(tag => {
            const tagName = tag.name.toLowerCase();
            if (tagName === 'meditation' || tagName === 'yoga-for-pe' || tagName === 'relaxation') {
              categories[tagName] = (categories[tagName] || 0) + 1;
            }
          });
        }
      });
      
      console.log('Videos by category (from tags, sample of first 100 videos):');
      console.log('- Meditation:', categories['meditation'] || 0);
      console.log('- Yoga for PE:', categories['yoga-for-pe'] || 0);
      console.log('- Relaxation:', categories['relaxation'] || 0);
      console.log('==============================================');
    }
    
  } catch (error) {
    console.error('Error fetching videos:', error);
    process.exit(1);
  }
}

countVideos();
