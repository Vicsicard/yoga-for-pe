#!/usr/bin/env node

/**
 * Manual Upload Helper for Yoga for PE
 * 
 * This script helps organize video metadata for manual uploads to Vimeo OTT.
 * It generates a formatted list of titles and descriptions that can be easily
 * copied and pasted during the manual upload process.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { parse } = require('csv-parse/sync');

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
 * Scan directory for video files
 * @param {string} dir - Directory to scan
 * @returns {Promise<Array>} - Array of video files with metadata
 */
async function scanDirectory(dir) {
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(dir)) {
        reject(new Error(`Directory does not exist: ${dir}`));
        return;
      }

      const results = [];
      const items = fs.readdirSync(dir);

      // Process each item in the directory
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          // This is a category folder
          const categoryName = item;
          const categoryPath = fullPath;
          const categoryItems = fs.readdirSync(categoryPath);

          // Process each video in the category
          categoryItems.forEach(videoItem => {
            const videoPath = path.join(categoryPath, videoItem);
            const videoStats = fs.statSync(videoPath);

            if (!videoStats.isDirectory() && isVideoFile(videoItem)) {
              // Extract metadata from filename
              const { title, level } = extractMetadata(videoItem, categoryName);

              results.push({
                filePath: videoPath,
                title: title,
                description: `${title} - Part of the ${categoryName} series`,
                category: convertToSlug(categoryName),
                level: level || 'Beginner',
                tier: getTierFromCategory(categoryName)
              });
            }
          });
        } else if (isVideoFile(item)) {
          // This is a video file directly in the main directory
          const { title, level } = extractMetadata(item, 'General');

          results.push({
            filePath: fullPath,
            title: title,
            description: `${title} - General video`,
            category: 'general',
            level: level || 'Beginner',
            tier: 'bronze'
          });
        }
      });

      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Check if a file is a video
 * @param {string} filename - File name
 * @returns {boolean} - True if file is a video
 */
function isVideoFile(filename) {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.mkv', '.webm'];
  const ext = path.extname(filename).toLowerCase();
  return videoExtensions.includes(ext);
}

/**
 * Extract metadata from filename
 * @param {string} filename - File name
 * @param {string} category - Category name
 * @returns {Object} - Metadata object
 */
function extractMetadata(filename, category) {
  // Remove extension
  const nameWithoutExt = path.basename(filename, path.extname(filename));
  
  // Replace underscores and hyphens with spaces
  let title = nameWithoutExt.replace(/[_-]/g, ' ');
  
  // Capitalize first letter of each word
  title = title.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Try to extract level from filename
  let level = 'Beginner';
  if (filename.toLowerCase().includes('intermediate')) {
    level = 'Intermediate';
  } else if (filename.toLowerCase().includes('advanced')) {
    level = 'Advanced';
  }
  
  return { title, level };
}

/**
 * Convert category name to slug
 * @param {string} category - Category name
 * @returns {string} - Category slug
 */
function convertToSlug(category) {
  return category.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Get subscription tier from category
 * @param {string} category - Category name
 * @returns {string} - Subscription tier
 */
function getTierFromCategory(category) {
  const lowerCategory = category.toLowerCase();
  
  if (lowerCategory.includes('free')) {
    return 'bronze';
  } else if (lowerCategory.includes('yoga for pe')) {
    return 'gold';
  } else {
    return 'silver';
  }
}

/**
 * Format video metadata for display
 * @param {Array} videos - Array of video objects
 */
function formatMetadata(videos) {
  console.log('\n=== Video Metadata for Manual Upload ===\n');
  
  // Group videos by category
  const categories = {};
  videos.forEach(video => {
    if (!categories[video.category]) {
      categories[video.category] = [];
    }
    categories[video.category].push(video);
  });
  
  // Display videos by category
  Object.keys(categories).forEach(category => {
    console.log(`\n== ${category.toUpperCase()} ==`);
    
    categories[category].forEach((video, index) => {
      console.log(`\n[Video ${index + 1}]`);
      console.log(`File: ${video.filePath}`);
      console.log(`Title: ${video.title}`);
      console.log(`Description: ${video.description}`);
      console.log(`Level: ${video.level}`);
      console.log(`Tier: ${video.tier}`);
      console.log('---');
    });
  });
}

/**
 * Import metadata from CSV file
 * @param {string} csvPath - Path to CSV file
 * @returns {Array} - Array of video objects
 */
function importFromCsv(csvPath) {
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  return parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  });
}

/**
 * Export metadata to text file for easy copy-paste
 * @param {Array} videos - Array of video objects
 */
function exportToCopyPasteFormat(videos) {
  const outputPath = path.join(__dirname, 'video-metadata-for-upload.txt');
  let content = '# YOGA FOR PE - VIDEO METADATA FOR MANUAL UPLOAD\n\n';
  
  // Group videos by category
  const categories = {};
  videos.forEach(video => {
    if (!categories[video.category]) {
      categories[video.category] = [];
    }
    categories[video.category].push(video);
  });
  
  // Format videos by category
  Object.keys(categories).forEach(category => {
    content += `\n## ${category.toUpperCase()}\n\n`;
    
    categories[category].forEach((video, index) => {
      content += `### Video ${index + 1}\n`;
      content += `File: ${video.filePath}\n\n`;
      content += `Title:\n${video.title}\n\n`;
      content += `Description:\n${video.description}\n\n`;
      content += `Level: ${video.level}\n`;
      content += `Tier: ${video.tier}\n`;
      content += `---\n\n`;
    });
  });
  
  fs.writeFileSync(outputPath, content);
  console.log(`\nMetadata exported to: ${outputPath}`);
  console.log('You can open this file and copy-paste the titles and descriptions during manual upload.');
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('=== Yoga for PE - Manual Upload Helper ===\n');
    
    // Ask user if they want to scan a directory or import from CSV
    const source = await prompt('Do you want to (1) scan a video directory or (2) import from CSV? (1/2): ');
    
    let videos = [];
    
    if (source === '1') {
      // Get directory path
      const dirPath = await prompt('Enter the path to your videos directory: ');
      videos = await scanDirectory(dirPath);
      console.log(`Found ${videos.length} videos`);
    } else if (source === '2') {
      // Get CSV path
      const csvPath = await prompt('Enter the path to your CSV file: ');
      videos = importFromCsv(csvPath);
      console.log(`Imported ${videos.length} videos from CSV`);
    } else {
      console.error('Invalid option');
      process.exit(1);
    }
    
    // Format and display metadata
    formatMetadata(videos);
    
    // Export to copy-paste format
    const exportOption = await prompt('\nDo you want to export metadata to a text file for easy copy-paste? (y/n): ');
    if (exportOption.toLowerCase() === 'y') {
      exportToCopyPasteFormat(videos);
    }
    
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    rl.close();
  }
}

// Run the main function
main();
