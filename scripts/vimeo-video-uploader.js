#!/usr/bin/env node

/**
 * Vimeo Video Uploader for Yoga for PE
 * 
 * This script helps upload videos to Vimeo OTT and assign them to the correct
 * categories and pricing tiers.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec } = require('child_process');
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
  BRONZE: { id: 0, name: 'Bronze', price: 0 },
  SILVER: { id: 1, name: 'Silver', price: 7.99 },
  GOLD: { id: 2, name: 'Gold', price: 9.99 }
};

// Define video categories
const VIDEO_CATEGORIES = {
  MEDITATION: 'meditation',
  YOGA_FOR_PE: 'yoga-for-pe',
  RELAXATION: 'relaxation'
};

// Define difficulty levels
const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

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
 * Add video to OTT collection based on category
 * @param {string} videoUri - Vimeo video URI
 * @param {string} category - Video category
 * @returns {Promise<void>}
 */
async function addToCollection(videoUri, category) {
  // Use collection IDs from environment variables
  const collectionIds = {
    [VIDEO_CATEGORIES.MEDITATION]: process.env.VIMEO_OTT_MEDITATION_COLLECTION,
    [VIDEO_CATEGORIES.YOGA_FOR_PE]: process.env.VIMEO_OTT_YOGA_FOR_PE_COLLECTION,
    [VIDEO_CATEGORIES.RELAXATION]: process.env.VIMEO_OTT_RELAXATION_COLLECTION
  };
  
  const collectionId = collectionIds[category];
  if (!collectionId || collectionId.startsWith('your_')) {
    console.log('No valid collection ID found for category:', category);
    console.log('Please set the appropriate collection ID in your .env.local file');
    return;
  }
  
  return new Promise((resolve, reject) => {
    console.log(`Adding video to ${category} collection...`);
    
    // This is a placeholder - you'll need to use the specific OTT API endpoint
    // for adding videos to collections
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
 * Set video access control based on subscription tier
 * @param {string} videoUri - Vimeo video URI
 * @param {Object} tier - Subscription tier
 * @returns {Promise<void>}
 */
async function setVideoAccess(videoUri, tier) {
  // Use product IDs from environment variables
  const productIds = {
    [SUBSCRIPTION_TIERS.BRONZE.id]: process.env.VIMEO_OTT_BRONZE_PRODUCT, // Free tier
    [SUBSCRIPTION_TIERS.SILVER.id]: process.env.VIMEO_OTT_SILVER_PRODUCT, // $7.99 tier
    [SUBSCRIPTION_TIERS.GOLD.id]: process.env.VIMEO_OTT_GOLD_PRODUCT      // $9.99 tier
  };
  
  return new Promise((resolve, reject) => {
    console.log(`Setting video access for ${tier.name} tier...`);
    
    // For Bronze (free) tier, make the video public
    if (tier.id === SUBSCRIPTION_TIERS.BRONZE.id) {
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
      return;
    }
    
    // For paid tiers, set up access control
    // This is a placeholder - you'll need to use the specific OTT API endpoint
    // for setting up access control
    const productId = productIds[tier.id];
    client.request({
      method: 'PUT',
      path: `/ott/products/${productId}/videos${videoUri}`,
    }, function (error, body, status_code, headers) {
      if (error) {
        console.error('Failed to set video access:', error);
        reject(error);
        return;
      }
      
      console.log('Video access control set successfully!');
      resolve();
    });
  });
}

/**
 * Main function to upload a video and set its metadata
 */
async function main() {
  try {
    console.log('=== Yoga for PE - Vimeo Video Uploader ===\n');
    
    // Get video file path
    const filePath = await prompt('Enter the path to the video file: ');
    if (!fs.existsSync(filePath)) {
      console.error('Error: File does not exist');
      process.exit(1);
    }
    
    // Get video metadata
    const title = await prompt('Enter video title: ');
    const description = await prompt('Enter video description: ');
    
    // Get video category
    console.log('\nCategories:');
    console.log('1. Meditation');
    console.log('2. Yoga for PE');
    console.log('3. Relaxation');
    const categoryChoice = await prompt('Select category (1-3): ');
    
    let category;
    switch (categoryChoice) {
      case '1': category = VIDEO_CATEGORIES.MEDITATION; break;
      case '2': category = VIDEO_CATEGORIES.YOGA_FOR_PE; break;
      case '3': category = VIDEO_CATEGORIES.RELAXATION; break;
      default: 
        console.error('Invalid category choice');
        process.exit(1);
    }
    
    // Get difficulty level
    console.log('\nDifficulty Levels:');
    console.log('1. Beginner');
    console.log('2. Intermediate');
    console.log('3. Advanced');
    const levelChoice = await prompt('Select difficulty level (1-3): ');
    
    let level;
    switch (levelChoice) {
      case '1': level = DIFFICULTY_LEVELS[0]; break;
      case '2': level = DIFFICULTY_LEVELS[1]; break;
      case '3': level = DIFFICULTY_LEVELS[2]; break;
      default: 
        console.error('Invalid level choice');
        process.exit(1);
    }
    
    // Get subscription tier
    console.log('\nSubscription Tiers:');
    console.log('1. Bronze (Free)');
    console.log('2. Silver ($7.99/month)');
    console.log('3. Gold ($9.99/month)');
    const tierChoice = await prompt('Select subscription tier (1-3): ');
    
    let tier;
    switch (tierChoice) {
      case '1': tier = SUBSCRIPTION_TIERS.BRONZE; break;
      case '2': tier = SUBSCRIPTION_TIERS.SILVER; break;
      case '3': tier = SUBSCRIPTION_TIERS.GOLD; break;
      default: 
        console.error('Invalid tier choice');
        process.exit(1);
    }
    
    // Confirm details
    console.log('\n=== Video Details ===');
    console.log(`Title: ${title}`);
    console.log(`Description: ${description}`);
    console.log(`Category: ${category}`);
    console.log(`Difficulty Level: ${level}`);
    console.log(`Subscription Tier: ${tier.name} ($${tier.price}/month)`);
    
    const confirm = await prompt('\nProceed with upload? (y/n): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('Upload cancelled');
      process.exit(0);
    }
    
    // Upload video
    const videoUri = await uploadVideo(filePath, { title, description });
    
    // Update metadata
    await updateVideoMetadata(videoUri, { 
      title, 
      description, 
      category, 
      level, 
      tier 
    });
    
    // Add to collection
    await addToCollection(videoUri, category);
    
    // Set access control
    await setVideoAccess(videoUri, tier);
    
    console.log('\n=== Upload Complete ===');
    console.log(`Video "${title}" has been uploaded and configured successfully!`);
    console.log(`Vimeo URI: ${videoUri}`);
    
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    rl.close();
  }
}

// Run the main function
main();
