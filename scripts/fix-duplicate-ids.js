const fs = require('fs');
const path = require('path');

// Read the video catalog
const catalogPath = path.join(__dirname, '..', 'data', 'video-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Track IDs we've seen to identify duplicates
const seenIds = new Map();
let fixCount = 0;

// Fix duplicate IDs
Object.keys(catalog).forEach(section => {
  catalog[section].forEach(video => {
    const id = video.id;
    
    // If we've seen this ID before, generate a new unique ID
    if (seenIds.has(id)) {
      const count = seenIds.get(id);
      const newId = `${id}-${count}`;
      console.log(`Changing duplicate ID "${id}" to "${newId}" for "${video.title}" in "${section}"`);
      
      // Update the ID
      video.id = newId;
      seenIds.set(id, count + 1);
      fixCount++;
    } else {
      // First time seeing this ID
      seenIds.set(id, 1);
    }
  });
});

// Write the updated catalog back to the file
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');

console.log(`\nFixed ${fixCount} duplicate video IDs in the catalog.`);
console.log(`Updated catalog saved to ${catalogPath}`);
