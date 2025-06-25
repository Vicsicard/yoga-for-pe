// Script to list details of all videos in the Vimeo account
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const accessToken = process.env.VIMEO_ACCESS_TOKEN;
const clientId = process.env.VIMEO_CLIENT_ID;
const clientSecret = process.env.VIMEO_CLIENT_SECRET;

if (!accessToken) {
  console.error('Error: VIMEO_ACCESS_TOKEN not found in environment variables');
  process.exit(1);
}

async function fetchAllVideos() {
  try {
    console.log('Fetching videos from Vimeo account...');
    
    let allVideos = [];
    let currentPage = 1;
    let hasMorePages = true;
    const perPage = 100; // Maximum allowed by Vimeo API
    
    // Fetch all pages of videos
    while (hasMorePages) {
      console.log(`Fetching page ${currentPage}...`);
      
      const response = await fetch(`https://api.vimeo.com/me/videos?per_page=${perPage}&page=${currentPage}`, {
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
        break;
      }

      const data = await response.json();
      allVideos = allVideos.concat(data.data);
      
      // Check if there are more pages
      if (data.paging && data.paging.next) {
        currentPage++;
      } else {
        hasMorePages = false;
      }
    }
    
    console.log(`Retrieved ${allVideos.length} videos`);
    
    // Process and display video information
    const videoDetails = allVideos.map(video => {
      // Extract tags
      const tags = video.tags ? video.tags.map(tag => tag.name) : [];
      
      // Format duration
      const durationInSeconds = video.duration;
      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = durationInSeconds % 60;
      const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      return {
        id: video.uri.split('/').pop(),
        title: video.name,
        description: video.description,
        duration: formattedDuration,
        tags: tags,
        link: video.link,
        created_time: new Date(video.created_time).toLocaleDateString(),
        thumbnail: video.pictures?.base_link || 'No thumbnail',
        privacy: video.privacy.view,
        plays: video.stats?.plays || 0
      };
    });
    
    // Save to file
    const outputPath = './vimeo-videos-list.json';
    fs.writeFileSync(outputPath, JSON.stringify(videoDetails, null, 2));
    console.log(`Video details saved to ${outputPath}`);
    
    // Display summary in console
    console.log('\n=== VIMEO VIDEOS SUMMARY ===');
    console.log(`Total videos: ${videoDetails.length}`);
    
    // Display first 10 videos with basic info
    console.log('\n=== FIRST 10 VIDEOS ===');
    videoDetails.slice(0, 10).forEach((video, index) => {
      console.log(`${index + 1}. ${video.title} (${video.duration}) - ${video.description.substring(0, 50)}${video.description.length > 50 ? '...' : ''}`);
    });
    
    return videoDetails;
  } catch (error) {
    console.error('Error fetching videos:', error);
    process.exit(1);
  }
}

fetchAllVideos();
