// Script to list all videos from Vimeo account
require('dotenv').config();
const Vimeo = require('vimeo').Vimeo;

// Initialize Vimeo client with credentials from .env file
const client = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

console.log('Fetching videos from Vimeo...');

// Make the API request
client.request({
  method: 'GET',
  path: '/me/videos',
  query: { 
    per_page: 100,  // Get up to 100 videos
    fields: 'uri,name,description,duration,privacy' 
  }
}, function(error, body, status_code, headers) {
  if (error) {
    console.error('Error fetching videos:', error);
    return;
  }
  
  console.log(`Found ${body.data.length} videos on Vimeo\n`);
  
  // Print video details in a format that's easy to copy
  console.log('=== VIDEO LIST ===');
  console.log('[');
  
  body.data.forEach((video, index) => {
    const id = video.uri.split('/')[2];
    const minutes = Math.floor(video.duration / 60);
    const seconds = Math.floor(video.duration % 60);
    const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    console.log(`  {`);
    console.log(`    "id": "${id}",`);
    console.log(`    "title": "${video.name}",`);
    console.log(`    "category": "",`);
    console.log(`    "tier": "",`);
    console.log(`    "description": "${video.description?.replace(/"/g, '\\"') || ''}",`);
    console.log(`    "duration": "${duration}"`);
    console.log(`  }${index < body.data.length - 1 ? ',' : ''}`);
  });
  
  console.log(']');
});
