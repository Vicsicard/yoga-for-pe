// Script to test direct access to Vimeo videos
require('dotenv').config({ path: '.env.local' });

const accessToken = process.env.VIMEO_ACCESS_TOKEN;
const clientId = process.env.VIMEO_CLIENT_ID;
const clientSecret = process.env.VIMEO_CLIENT_SECRET;

if (!accessToken) {
  console.error('Error: VIMEO_ACCESS_TOKEN not found in environment variables');
  process.exit(1);
}

// Test videos from video-data-mapping.json
const testVideoIds = [
  '1095788590', // Ab Circle 1 (bronze/free)
  '452426275',  // Body Scan with Flowers (silver)
  '1095789404'  // Ab Circle 2 (gold)
];

async function checkVideo(videoId) {
  try {
    console.log(`Checking video ${videoId}...`);
    
    const response = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.vimeo.*+json;version=3.4'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error for video ${videoId}: ${response.status} ${response.statusText}`);
      console.error(errorText);
      return false;
    }

    const data = await response.json();
    
    console.log(`✅ Video ${videoId} - "${data.name}" is accessible`);
    console.log(`  - Privacy: ${data.privacy.view}`);
    console.log(`  - Duration: ${formatDuration(data.duration)}`);
    console.log(`  - Embed allowed: ${data.privacy.embed === 'public' ? 'Yes' : 'No'}`);
    
    // Check if the video has a valid embed link
    if (data.embed && data.embed.html) {
      console.log(`  - Embed HTML available: Yes`);
      // Extract the iframe src URL
      const srcMatch = data.embed.html.match(/src="([^"]+)"/);
      if (srcMatch && srcMatch[1]) {
        console.log(`  - Embed URL: ${srcMatch[1]}`);
      }
    } else {
      console.log(`  - Embed HTML available: No`);
    }
    
    console.log('');
    return true;
  } catch (error) {
    console.error(`Error checking video ${videoId}:`, error);
    return false;
  }
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

async function main() {
  console.log('=== Vimeo Video Access Test ===\n');
  console.log(`Using access token: ${accessToken.substring(0, 4)}...${accessToken.substring(accessToken.length - 4)}`);
  console.log('');
  
  let successCount = 0;
  
  for (const videoId of testVideoIds) {
    const success = await checkVideo(videoId);
    if (success) successCount++;
  }
  
  console.log('=== Test Summary ===');
  console.log(`${successCount}/${testVideoIds.length} videos are accessible`);
}

main();
