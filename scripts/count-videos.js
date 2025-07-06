const fs = require('fs');
const path = require('path');

// Read the video catalog
const catalogPath = path.join(__dirname, '..', 'data', 'video-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Count videos in each section
Object.keys(catalog).forEach(section => {
  console.log(`Total videos in ${section} section: ${catalog[section].length}`);
});

// Count total videos
const totalVideos = Object.values(catalog).reduce((sum, videos) => sum + videos.length, 0);
console.log(`\nTotal videos across all sections: ${totalVideos}`);
