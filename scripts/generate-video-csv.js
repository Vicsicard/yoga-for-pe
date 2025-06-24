#!/usr/bin/env node

/**
 * Generate Video CSV for Yoga for PE
 * 
 * This script scans video directories and generates a CSV file with video metadata
 * that can be used for batch uploading to Vimeo OTT.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

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
 * Get all video files in a directory and its subdirectories
 * @param {string} dir - Directory to scan
 * @param {Array<string>} extensions - File extensions to include
 * @returns {Array<string>} - Array of video file paths
 */
function getVideoFiles(dir, extensions = ['.mp4', '.mov', '.avi']) {
  let results = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        results = results.concat(getVideoFiles(filePath, extensions));
      } else {
        // Check if file has a video extension
        const ext = path.extname(file).toLowerCase();
        if (extensions.includes(ext)) {
          results.push(filePath);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
  
  return results;
}

/**
 * Generate a title from a filename
 * @param {string} filename - Filename without extension
 * @returns {string} - Generated title
 */
function generateTitle(filename) {
  // Replace underscores and hyphens with spaces
  let title = filename.replace(/[_-]/g, ' ');
  
  // Capitalize first letter of each word
  title = title.replace(/\b\w/g, c => c.toUpperCase());
  
  return title;
}

/**
 * Determine category based on directory path
 * @param {string} filePath - Full path to video file
 * @returns {string} - Video category
 */
function determineCategory(filePath) {
  const lowerPath = filePath.toLowerCase();
  
  if (lowerPath.includes('meditation')) {
    return 'meditation';
  } else if (lowerPath.includes('relaxation')) {
    return 'relaxation';
  } else {
    return 'yoga-for-pe'; // Default category
  }
}

/**
 * Determine subscription tier based on directory path
 * @param {string} filePath - Full path to video file
 * @returns {string} - Subscription tier
 */
function determineTier(filePath) {
  const lowerPath = filePath.toLowerCase();
  
  if (lowerPath.includes('free')) {
    return 'bronze';
  } else if (lowerPath.includes('gold') || lowerPath.includes('premium')) {
    return 'gold';
  } else {
    return 'silver'; // Default tier
  }
}

/**
 * Determine difficulty level based on directory path or filename
 * @param {string} filePath - Full path to video file
 * @returns {string} - Difficulty level
 */
function determineLevel(filePath) {
  const lowerPath = filePath.toLowerCase();
  
  if (lowerPath.includes('beginner') || lowerPath.includes('basic')) {
    return 'Beginner';
  } else if (lowerPath.includes('advanced')) {
    return 'Advanced';
  } else {
    return 'Intermediate'; // Default level
  }
}

/**
 * Generate CSV content from video files
 * @param {Array<string>} videoFiles - Array of video file paths
 * @returns {string} - CSV content
 */
function generateCsvContent(videoFiles) {
  let csvContent = 'filePath,title,description,category,level,tier\n';
  
  for (const filePath of videoFiles) {
    const filename = path.basename(filePath, path.extname(filePath));
    const title = generateTitle(filename);
    const category = determineCategory(filePath);
    const level = determineLevel(filePath);
    const tier = determineTier(filePath);
    
    // Generate a placeholder description
    const description = `${title} - ${level} level ${category} video`;
    
    // Escape quotes in fields
    const escapedFilePath = filePath.replace(/"/g, '""');
    const escapedTitle = title.replace(/"/g, '""');
    const escapedDescription = description.replace(/"/g, '""');
    
    // Add row to CSV
    csvContent += `"${escapedFilePath}","${escapedTitle}","${escapedDescription}","${category}","${level}","${tier}"\n`;
  }
  
  return csvContent;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('=== Yoga for PE - Video CSV Generator ===\n');
    
    // Get base directory for videos
    const baseDir = await prompt('Enter the base directory for videos (e.g., D:\\Videos Ready for Subscription 662025): ');
    
    if (!fs.existsSync(baseDir)) {
      console.error('Error: Directory does not exist');
      process.exit(1);
    }
    
    console.log(`\nScanning ${baseDir} for video files...`);
    const videoFiles = getVideoFiles(baseDir);
    
    if (videoFiles.length === 0) {
      console.error('Error: No video files found');
      process.exit(1);
    }
    
    console.log(`Found ${videoFiles.length} video files`);
    
    // Generate CSV content
    const csvContent = generateCsvContent(videoFiles);
    
    // Save CSV file
    const outputPath = path.join(process.cwd(), 'yoga-videos.csv');
    fs.writeFileSync(outputPath, csvContent);
    
    console.log(`\nCSV file generated at: ${outputPath}`);
    console.log('\nNext steps:');
    console.log('1. Open the CSV file in Excel or a text editor');
    console.log('2. Review and edit the metadata for each video');
    console.log('3. Save the CSV file');
    console.log('4. Run the batch-video-upload.js script to upload the videos to Vimeo OTT');
    
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    rl.close();
  }
}

// Run the main function
main();
