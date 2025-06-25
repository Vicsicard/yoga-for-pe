// Script to fetch all videos from Vimeo and generate a complete mapping file
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

// Paths to the files
const mappingPath = path.join(__dirname, 'video-data-mapping.json');
const catalogPath = path.join(__dirname, '../data/video-catalog.json');

// Load existing files
const existingMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
const videoCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Function to normalize text for comparison
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
  let bestMatch = null;
  let highestSimilarity = 0;
  
  catalogVideos.forEach(video => {
    const catalogTitle = normalizeText(video.title);
    
    // Calculate similarity (percentage of words that match)
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

// Function to get all videos from the catalog with placeholder IDs
function getVideosWithPlaceholderIds() {
  const result = [];
  
  Object.keys(videoCatalog).forEach(category => {
    videoCatalog[category].forEach(video => {
      if (/^(med|yoga|relax|mindful|mm)-\d+$/.test(video.id)) {
        result.push({
          title: video.title,
          category,
          tier: video.tier.toLowerCase(),
          description: video.description,
          id: video.id
        });
      }
    });
  });
  
  return result;
}

// Main function
async function generateCompleteMapping() {
  try {
    console.log('Fetching videos from Vimeo...');
    const vimeoVideos = await fetchVimeoVideos();
    console.log(`Found ${vimeoVideos.length} videos on Vimeo`);
    
    // Get videos with placeholder IDs
    const placeholderVideos = getVideosWithPlaceholderIds();
    console.log(`Found ${placeholderVideos.length} videos with placeholder IDs in catalog`);
    
    // Track matches and non-matches
    const newMatches = [];
    const nonMatches = [];
    
    // Find matches for placeholder videos
    placeholderVideos.forEach(catalogVideo => {
      // Skip videos that are already in the mapping
      const alreadyMapped = existingMapping.some(mappedVideo => 
        normalizeText(mappedVideo.title) === normalizeText(catalogVideo.title)
      );
      
      if (alreadyMapped) {
        console.log(`Skipping ${catalogVideo.title} - already in mapping`);
        return;
      }
      
      // Find matching Vimeo video
      const matchingVideo = vimeoVideos.find(vimeoVideo => 
        normalizeText(vimeoVideo.name) === normalizeText(catalogVideo.title)
      ) || findBestMatch(catalogVideo, vimeoVideos);
      
      if (matchingVideo) {
        const vimeoId = matchingVideo.uri.split('/')[2];
        console.log(`✅ Matched: "${catalogVideo.title}" -> Vimeo ID: ${vimeoId}`);
        
        newMatches.push({
          id: vimeoId,
          title: catalogVideo.title,
          category: catalogVideo.category,
          tier: catalogVideo.tier,
          description: catalogVideo.description
        });
      } else {
        console.log(`❌ No match found for: "${catalogVideo.title}"`);
        nonMatches.push(catalogVideo);
      }
    });
    
    // Combine existing mapping with new matches
    const completeMapping = [...existingMapping, ...newMatches];
    
    // Save the updated mapping
    fs.writeFileSync(mappingPath, JSON.stringify(completeMapping, null, 2));
    console.log(`\nUpdated mapping file saved with ${completeMapping.length} videos`);
    
    // Print summary
    console.log('\n=== SUMMARY ===');
    console.log(`Total videos in Vimeo: ${vimeoVideos.length}`);
    console.log(`Videos already mapped: ${existingMapping.length}`);
    console.log(`New matches found: ${newMatches.length}`);
    console.log(`Videos without matches: ${nonMatches.length}`);
    
    if (nonMatches.length > 0) {
      console.log('\nVideos without matches:');
      nonMatches.forEach(video => {
        console.log(`- ${video.category}: ${video.title} (ID: ${video.id})`);
      });
      
      console.log('\nVimeo videos that didn\'t match any catalog entry:');
      const allMatchedIds = [...existingMapping, ...newMatches].map(m => m.id);
      vimeoVideos.forEach(video => {
        const vimeoId = video.uri.split('/')[2];
        if (!allMatchedIds.includes(vimeoId)) {
          console.log(`- ${video.name} (ID: ${vimeoId})`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
generateCompleteMapping();
