// Script to update video-catalog.json with the correct Vimeo IDs from video-data-mapping.json
const fs = require('fs');
const path = require('path');

// Paths to the files
const mappingPath = path.join(__dirname, 'video-data-mapping.json');
const catalogPath = path.join(__dirname, '../data/video-catalog.json');

// Load the files
const videoMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
const videoCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Create a backup of the original catalog
const backupPath = catalogPath.replace('.json', '.backup.json');
fs.writeFileSync(backupPath, JSON.stringify(videoCatalog, null, 2));
console.log(`Created backup of original catalog at ${backupPath}`);

// Track updates
const updates = [];
const notFound = [];

// Process each video in the mapping
videoMapping.forEach(mappingVideo => {
  let found = false;
  
  // Check each category in the catalog
  Object.keys(videoCatalog).forEach(category => {
    // Find all matching videos by title (to handle duplicates)
    const catalogVideos = videoCatalog[category].filter(video => 
      video.title.toLowerCase() === mappingVideo.title.toLowerCase() &&
      // Only update if category matches or if the mapping explicitly specifies this category
      (mappingVideo.category === category || !mappingVideo.category)
    );
    
    if (catalogVideos.length > 0) {
      // Update all matching videos
      catalogVideos.forEach(catalogVideo => {
        const oldId = catalogVideo.id;
        catalogVideo.id = mappingVideo.id;
        
        updates.push({
          title: catalogVideo.title,
          category,
          oldId,
          newId: mappingVideo.id
        });
      });
      
      found = true;
    }
  });
  
  if (!found) {
    notFound.push(mappingVideo.title);
  }
});

// Save the updated catalog
fs.writeFileSync(catalogPath, JSON.stringify(videoCatalog, null, 2));
console.log(`Updated video catalog saved successfully!`);

// Print summary
console.log('\n=== UPDATE SUMMARY ===');
console.log(`Total videos in mapping: ${videoMapping.length}`);
console.log(`Videos updated: ${updates.length}`);
console.log(`Videos not found in catalog: ${notFound.length}`);

if (updates.length > 0) {
  console.log('\nUpdated videos:');
  updates.forEach(update => {
    console.log(`- ${update.category}: "${update.title}" (${update.oldId} -> ${update.newId})`);
  });
}

if (notFound.length > 0) {
  console.log('\nVideos from mapping not found in catalog:');
  notFound.forEach(title => {
    console.log(`- "${title}"`);
  });
}

// Check for videos in catalog that aren't in the mapping
const catalogVideosWithPlaceholderIds = [];
Object.keys(videoCatalog).forEach(category => {
  videoCatalog[category].forEach(video => {
    // Check if the ID is still a placeholder (e.g., "med-1", "yoga-1")
    if (/^(med|yoga|relax|mindful|mm)-\d+$/.test(video.id)) {
      // Check if there's a duplicate entry with the same title but with a Vimeo ID
      const hasDuplicateWithVimeoId = videoCatalog[category].some(otherVideo => 
        otherVideo.title === video.title && 
        !(/^(med|yoga|relax|mindful|mm)-\d+$/.test(otherVideo.id))
      );
      
      // Only report as placeholder if there's no duplicate with a Vimeo ID
      if (!hasDuplicateWithVimeoId) {
        catalogVideosWithPlaceholderIds.push({
          title: video.title,
          category,
          id: video.id
        });
      }
    }
  });
});

if (catalogVideosWithPlaceholderIds.length > 0) {
  console.log('\nVideos in catalog still with placeholder IDs:');
  catalogVideosWithPlaceholderIds.forEach(video => {
    console.log(`- ${video.category}: "${video.title}" (ID: ${video.id})`);
  });
}
