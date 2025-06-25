// Script to fetch all videos from Vimeo and match them with our video catalog
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Vimeo = require('vimeo').Vimeo;

// Initialize Vimeo client
const client = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

// Path to video catalog
const catalogPath = path.join(__dirname, '../data/video-catalog.json');

// Load existing video catalog
const videoCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Function to fetch all videos from Vimeo
async function fetchVimeoVideos() {
  return new Promise((resolve, reject) => {
    client.request({
      method: 'GET',
      path: '/me/videos',
      query: { per_page: 100 } // Adjust if you have more than 100 videos
    }, (error, body, status_code, headers) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(body.data);
    });
  });
}

// Function to normalize text for comparison (lowercase, remove punctuation, etc.)
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

// Function to find the best match for a video title
function findBestMatch(vimeoVideo, catalogVideos) {
  const vimeoTitle = normalizeText(vimeoVideo.name);
  
  // First try exact match
  const exactMatch = catalogVideos.find(video => 
    normalizeText(video.title) === vimeoTitle
  );
  
  if (exactMatch) return exactMatch;
  
  // If no exact match, try to find the closest match
  // This is a simple implementation - you might want to use a more sophisticated
  // string similarity algorithm for better results
  let bestMatch = null;
  let highestSimilarity = 0;
  
  catalogVideos.forEach(video => {
    const catalogTitle = normalizeText(video.title);
    
    // Calculate similarity (very basic - percentage of words that match)
    const vimeoWords = vimeoTitle.split(' ');
    const catalogWords = catalogTitle.split(' ');
    
    let matchingWords = 0;
    vimeoWords.forEach(word => {
      if (catalogWords.includes(word)) matchingWords++;
    });
    
    const similarity = matchingWords / Math.max(vimeoWords.length, catalogWords.length);
    
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = video;
    }
  });
  
  // Only return if similarity is above threshold
  return highestSimilarity > 0.5 ? bestMatch : null;
}

// Main function
async function matchVideos() {
  try {
    console.log('Fetching videos from Vimeo...');
    const vimeoVideos = await fetchVimeoVideos();
    console.log(`Found ${vimeoVideos.length} videos on Vimeo`);
    
    // Create a backup of the original catalog
    const backupPath = catalogPath.replace('.json', '.backup.json');
    fs.writeFileSync(backupPath, JSON.stringify(videoCatalog, null, 2));
    console.log(`Created backup of original catalog at ${backupPath}`);
    
    // Track matches and non-matches
    const matches = [];
    const nonMatches = [];
    
    // Process each category in the catalog
    Object.keys(videoCatalog).forEach(category => {
      console.log(`\nProcessing category: ${category}`);
      
      videoCatalog[category].forEach(catalogVideo => {
        // Skip videos that already have a valid Vimeo ID (not a placeholder)
        if (!/^(med|yoga|relax|mindful)-\d+$/.test(catalogVideo.id)) {
          console.log(`Skipping ${catalogVideo.title} - already has Vimeo ID: ${catalogVideo.id}`);
          return;
        }
        
        // Find matching Vimeo video
        const matchingVideo = vimeoVideos.find(vimeoVideo => {
          return normalizeText(vimeoVideo.name) === normalizeText(catalogVideo.title);
        }) || findBestMatch(catalogVideo, vimeoVideos);
        
        if (matchingVideo) {
          const vimeoId = matchingVideo.uri.split('/')[2];
          console.log(`✅ Matched: "${catalogVideo.title}" -> Vimeo ID: ${vimeoId}`);
          
          // Update the catalog video with the Vimeo ID
          const oldId = catalogVideo.id;
          catalogVideo.id = vimeoId;
          
          matches.push({
            category,
            title: catalogVideo.title,
            oldId,
            newId: vimeoId
          });
        } else {
          console.log(`❌ No match found for: "${catalogVideo.title}"`);
          nonMatches.push({
            category,
            title: catalogVideo.title,
            id: catalogVideo.id
          });
        }
      });
    });
    
    // Save the updated catalog
    fs.writeFileSync(catalogPath, JSON.stringify(videoCatalog, null, 2));
    console.log('\nUpdated video catalog saved successfully!');
    
    // Print summary
    console.log('\n=== SUMMARY ===');
    console.log(`Total videos in Vimeo: ${vimeoVideos.length}`);
    console.log(`Total matches found: ${matches.length}`);
    console.log(`Videos without matches: ${nonMatches.length}`);
    
    if (nonMatches.length > 0) {
      console.log('\nVideos without matches:');
      nonMatches.forEach(video => {
        console.log(`- ${video.category}: ${video.title} (ID: ${video.id})`);
      });
      
      console.log('\nVimeo videos that didn\'t match any catalog entry:');
      const matchedVimeoIds = matches.map(m => m.newId);
      vimeoVideos.forEach(video => {
        const vimeoId = video.uri.split('/')[2];
        if (!matchedVimeoIds.includes(vimeoId)) {
          console.log(`- ${video.name} (ID: ${vimeoId})`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
matchVideos();
