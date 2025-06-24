#!/usr/bin/env node

/**
 * Batch Video Uploader for Yoga for PE
 * 
 * This script helps upload multiple videos to Vimeo OTT from a CSV file
 * with predefined metadata.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { parse } = require('csv-parse/sync');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Vimeo API client
const Vimeo = require('vimeo').Vimeo;

// Check if Vimeo credentials are set
if (!process.env.VIMEO_CLIENT_ID || !process.env.VIMEO_CLIENT_SECRET || !process.env.VIMEO_ACCESS_TOKEN) {
  console.error('Error: Vimeo API credentials not found in .env.local file');
  console.log('Please ensure you have the following variables set:');
  console.log('VIMEO_CLIENT_ID=your_client_id');
  console.log('VIMEO_CLIENT_SECRET=your_client_secret');
  console.log('VIMEO_ACCESS_TOKEN=your_access_token');
  process.exit(1);
}

// Initialize Vimeo client
const client = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

// Define subscription tiers
const SUBSCRIPTION_TIERS = {
  'bronze': { id: 0, name: 'Bronze', price: 0 },
  'silver': { id: 1, name: 'Silver', price: 7.99 },
  'gold': { id: 2, name: 'Gold', price: 9.99 }
};

// Define video categories
const VIDEO_CATEGORIES = {
  'meditation': 'meditation',
  'yoga-for-pe': 'yoga-for-pe',
  'relaxation': 'relaxation',
  'mindful-movement': 'mindful-movement',
  'free-videos': 'free-videos'
};

// Map categories to collection IDs from environment variables
const COLLECTION_IDS = {
  [VIDEO_CATEGORIES.meditation]: process.env.VIMEO_OTT_MEDITATION_COLLECTION,
  [VIDEO_CATEGORIES['yoga-for-pe']]: process.env.VIMEO_OTT_YOGA_FOR_PE_COLLECTION,
  [VIDEO_CATEGORIES.relaxation]: process.env.VIMEO_OTT_RELAXATION_COLLECTION
};

// Map tiers to product IDs from environment variables
const PRODUCT_IDS = {
  [SUBSCRIPTION_TIERS.bronze.id]: process.env.VIMEO_OTT_BRONZE_PRODUCT,
  [SUBSCRIPTION_TIERS.silver.id]: process.env.VIMEO_OTT_SILVER_PRODUCT,
  [SUBSCRIPTION_TIERS.gold.id]: process.env.VIMEO_OTT_GOLD_PRODUCT
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompt user for input
 * @param {string} question - Question to ask user
 * @returns {Promise<string>} - User's answer
 */
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Upload a video to Vimeo
 * @param {string} filePath - Path to video file
 * @param {Object} metadata - Video metadata
 * @returns {Promise<string>} - Vimeo video URI
 */
async function uploadVideo(filePath, metadata) {
  return new Promise((resolve, reject) => {
    console.log(`Uploading ${filePath}...`);
    
    client.upload(
      filePath,
      {
        name: metadata.title,
        description: metadata.description,
        privacy: { view: 'unlisted' } // Start as unlisted, we'll update permissions later
      },
      function (uri) {
        console.log('Upload completed successfully!');
        console.log('Vimeo URI:', uri);
        resolve(uri);
      },
      function (bytesUploaded, bytesTotal) {
        const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
        process.stdout.write(`Uploading: ${percentage}%\r`);
      },
      function (error) {
        console.error('Failed to upload video:', error);
        reject(error);
      }
    );
  });
}

/**
 * Update video metadata
 * @param {string} videoUri - Vimeo video URI
 * @param {Object} metadata - Video metadata
 * @returns {Promise<void>}
 */
async function updateVideoMetadata(videoUri, metadata) {
  return new Promise((resolve, reject) => {
    console.log('Updating video metadata...');
    
    const updateData = {
      name: metadata.title,
      description: metadata.description,
      privacy: { view: 'unlisted' },
      // Add custom fields for our app
      fields: {
        tier: metadata.tier.id.toString(),
        category: metadata.category,
        level: metadata.level
      }
    };
    
    client.request({
      method: 'PATCH',
      path: videoUri,
      query: updateData
    }, function (error, body, status_code, headers) {
      if (error) {
        console.error('Failed to update video metadata:', error);
        reject(error);
        return;
      }
      
      console.log('Video metadata updated successfully!');
      resolve();
    });
  });
}

/**
 * Set video access control based on subscription tier
 * @param {string} videoUri - Vimeo video URI
 * @param {Object} tier - Subscription tier
 * @returns {Promise<void>}
 */
async function setVideoAccess(videoUri, tier) {
  // For Bronze (free) tier, make the video public
  if (tier.id === SUBSCRIPTION_TIERS.bronze.id) {
    return new Promise((resolve, reject) => {
      client.request({
        method: 'PATCH',
        path: videoUri,
        query: {
          privacy: { view: 'anybody' }
        }
      }, function (error, body, status_code, headers) {
        if (error) {
          console.error('Failed to set video access:', error);
          reject(error);
          return;
        }
        
        console.log('Video set to public access successfully!');
        resolve();
      });
    });
  }
  
  // For paid tiers, use the OTT product IDs from environment variables
  const productId = PRODUCT_IDS[tier.id];
  if (!productId || productId.startsWith('your_')) {
    console.log(`No valid product ID found for ${tier.name} tier`);
    console.log('Please set the appropriate product ID in your .env.local file');
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    console.log(`Setting video access for ${tier.name} tier using product ID: ${productId}...`);
    
    // Use the Vimeo OTT API to associate the video with the product
    client.request({
      method: 'PUT',
      path: `/ott/products/${productId}/videos${videoUri}`,
    }, function (error, body, status_code, headers) {
      if (error) {
        console.error('Failed to set video access:', error);
        reject(error);
        return;
      }
      
      console.log(`Video access control set for ${tier.name} tier successfully!`);
      resolve();
    });
  });
}

/**
 * Add video to OTT collection based on category
 * @param {string} videoUri - Vimeo video URI
 * @param {string} category - Video category
 * @returns {Promise<void>}
 */
async function addToCollection(videoUri, category) {
  const collectionId = COLLECTION_IDS[category];
  if (!collectionId || collectionId.startsWith('your_')) {
    console.log('No valid collection ID found for category:', category);
    console.log('Please set the appropriate collection ID in your .env.local file');
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    console.log(`Adding video to ${category} collection...`);
    
    // Use the Vimeo OTT API to add the video to the collection
    client.request({
      method: 'PUT',
      path: `/ott/collections/${collectionId}/videos${videoUri}`,
    }, function (error, body, status_code, headers) {
      if (error) {
        console.error('Failed to add video to collection:', error);
        reject(error);
        return;
      }
      
      console.log('Video added to collection successfully!');
      resolve();
    });
  });
}

/**
 * Process a single video from the batch
 * @param {Object} videoData - Video data from CSV
 * @returns {Promise<void>}
 */
async function processVideo(videoData) {
  try {
    console.log(`\n=== Processing: ${videoData.title} ===`);
    
    // Check if file exists
    if (!fs.existsSync(videoData.filePath)) {
      console.error(`Error: File does not exist: ${videoData.filePath}`);
      return;
    }
    
    // Get tier object
    const tier = SUBSCRIPTION_TIERS[videoData.tier.toLowerCase()];
    if (!tier) {
      console.error(`Error: Invalid tier: ${videoData.tier}`);
      return;
    }
    
    // Validate category
    if (!VIDEO_CATEGORIES[videoData.category]) {
      console.error(`Error: Invalid category: ${videoData.category}`);
      return;
    }
    
    // Upload video
    const videoUri = await uploadVideo(videoData.filePath, videoData);
    
    // Update metadata
    await updateVideoMetadata(videoUri, { 
      title: videoData.title, 
      description: videoData.description, 
      category: videoData.category, 
      level: videoData.level, 
      tier 
    });
    
    // Add to collection based on category
    await addToCollection(videoUri, videoData.category);
    
    // Set access control
    await setVideoAccess(videoUri, tier);
    
    console.log(`Video "${videoData.title}" processed successfully!`);
    return videoUri;
  } catch (error) {
    console.error(`Error processing video "${videoData.title}":`, error);
    return null;
  }
}

/**
 * Create a sample CSV template
 */
function createSampleCsv() {
  const sampleContent = `filePath,title,description,category,level,tier
C:/path/to/video1.mp4,Introduction to Breathing,Learn basic breathing techniques for yoga practice,meditation,Beginner,bronze
C:/path/to/video2.mp4,Sun Salutation Series,Complete guide to sun salutations for PE classes,yoga-for-pe,Intermediate,silver
C:/path/to/video3.mp4,Advanced Relaxation Techniques,Deep relaxation methods for athletic recovery,relaxation,Advanced,gold`;

  const filePath = path.join(__dirname, 'sample-videos.csv');
  fs.writeFileSync(filePath, sampleContent);
  console.log(`Sample CSV template created at: ${filePath}`);
}

/**
 * Main function to process batch uploads
 */
async function main() {
  try {
    console.log('=== Yoga for PE - Batch Video Uploader ===\n');
    
    // Check if user wants a sample CSV
    const createSample = await prompt('Create a sample CSV template? (y/n): ');
    if (createSample.toLowerCase() === 'y') {
      createSampleCsv();
    }
    
    // Get CSV file path
    const csvPath = await prompt('Enter path to CSV file with video data: ');
    if (!fs.existsSync(csvPath)) {
      console.error('Error: CSV file does not exist');
      process.exit(1);
    }
    
    // Parse CSV file
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`Found ${records.length} videos to process`);
    
    // Confirm upload
    const confirm = await prompt(`Proceed with uploading ${records.length} videos? (y/n): `);
    if (confirm.toLowerCase() !== 'y') {
      console.log('Batch upload cancelled');
      process.exit(0);
    }
    
    // Process each video
    const results = [];
    for (let i = 0; i < records.length; i++) {
      console.log(`\nProcessing video ${i + 1} of ${records.length}`);
      const videoUri = await processVideo(records[i]);
      results.push({
        title: records[i].title,
        success: !!videoUri,
        uri: videoUri
      });
    }
    
    // Print summary
    console.log('\n=== Batch Upload Summary ===');
    const successful = results.filter(r => r.success).length;
    console.log(`Successfully uploaded: ${successful}/${results.length} videos`);
    
    results.forEach(result => {
      if (result.success) {
        console.log(`✓ ${result.title} - ${result.uri}`);
      } else {
        console.log(`✗ ${result.title} - Failed`);
      }
    });
    
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    rl.close();
  }
}

// Run the main function
main();
