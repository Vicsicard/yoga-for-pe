const fs = require('fs');
const path = require('path');

// Read the video catalog
const catalogPath = path.join(__dirname, '..', 'data', 'video-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Function to find duplicate IDs
function findDuplicateIds() {
  const allVideos = [];
  const idMap = new Map();
  const duplicates = new Map();
  
  // Collect all videos from all sections
  Object.keys(catalog).forEach(section => {
    catalog[section].forEach(video => {
      allVideos.push({
        id: video.id,
        title: video.title,
        section: section
      });
      
      // Track occurrences of each ID
      if (!idMap.has(video.id)) {
        idMap.set(video.id, []);
      }
      idMap.get(video.id).push({
        title: video.title,
        section: section
      });
    });
  });
  
  // Find duplicates
  idMap.forEach((occurrences, id) => {
    if (occurrences.length > 1) {
      duplicates.set(id, occurrences);
    }
  });
  
  return duplicates;
}

// Find and display duplicates
const duplicates = findDuplicateIds();
console.log('Found', duplicates.size, 'duplicate video IDs:');

duplicates.forEach((occurrences, id) => {
  console.log(`\nID: "${id}" appears ${occurrences.length} times:`);
  occurrences.forEach((video, index) => {
    console.log(`  ${index + 1}. "${video.title}" in section "${video.section}"`);
  });
});

// Suggest fixes
console.log('\n\nSuggested fixes:');
duplicates.forEach((occurrences, id) => {
  console.log(`\nFor ID "${id}":`);
  occurrences.forEach((video, index) => {
    if (index === 0) {
      console.log(`  - Keep original ID "${id}" for "${video.title}" in "${video.section}"`);
    } else {
      // Generate a new unique ID by appending a suffix to the original ID
      const newId = `${id}-${index}`;
      console.log(`  - Change ID to "${newId}" for "${video.title}" in "${video.section}"`);
    }
  });
});
