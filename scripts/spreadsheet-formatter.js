#!/usr/bin/env node

/**
 * Spreadsheet Formatter for Yoga for PE
 * 
 * This script helps format spreadsheet data for manual uploads to Vimeo OTT.
 * It takes pasted spreadsheet content and formats titles and descriptions
 * for easy copy-paste during manual uploads.
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
 * Parse pasted spreadsheet content
 * @param {string} content - Spreadsheet content
 * @returns {Array} - Array of video objects
 */
function parseSpreadsheetContent(content) {
  // Split content into lines
  const lines = content.trim().split('\n');
  
  // Check if we have a header row
  const hasHeader = lines[0].toLowerCase().includes('title') || 
                    lines[0].toLowerCase().includes('description');
  
  // Start from index 1 if we have a header
  const startIndex = hasHeader ? 1 : 0;
  
  // Parse each line
  const videos = [];
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split line by tabs or multiple spaces
    const parts = line.split(/\t|\s{2,}/);
    
    // Try to identify columns based on content
    let title = '';
    let description = '';
    let category = '';
    let level = 'Beginner';
    let tier = 'silver';
    
    // Assume first column is title, second is description
    if (parts.length >= 1) title = parts[0].trim();
    if (parts.length >= 2) description = parts[1].trim();
    
    // Try to determine category from title or description
    if (title.toLowerCase().includes('meditation') || description.toLowerCase().includes('meditation')) {
      category = 'meditation';
    } else if (title.toLowerCase().includes('yoga') || description.toLowerCase().includes('yoga for pe')) {
      category = 'yoga-for-pe';
      tier = 'gold';
    } else if (title.toLowerCase().includes('relaxation') || description.toLowerCase().includes('relaxation')) {
      category = 'relaxation';
    } else if (title.toLowerCase().includes('mindful movement') || description.toLowerCase().includes('mindful movement')) {
      category = 'mindful-movement';
    } else if (title.toLowerCase().includes('free') || description.toLowerCase().includes('free')) {
      category = 'free-videos';
      tier = 'bronze';
    }
    
    // Try to determine level from title or description
    if (title.toLowerCase().includes('intermediate') || description.toLowerCase().includes('intermediate')) {
      level = 'Intermediate';
    } else if (title.toLowerCase().includes('advanced') || description.toLowerCase().includes('advanced')) {
      level = 'Advanced';
    }
    
    videos.push({
      title,
      description,
      category,
      level,
      tier
    });
  }
  
  return videos;
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
      console.log(`Title: ${video.title}`);
      console.log(`Description: ${video.description}`);
      console.log(`Level: ${video.level}`);
      console.log(`Tier: ${video.tier}`);
      console.log('---');
    });
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
    if (!video.category) {
      video.category = 'uncategorized';
    }
    if (!categories[video.category]) {
      categories[video.category] = [];
    }
    categories[video.category].push(video);
  });
  
  // Format videos by category
  Object.keys(categories).forEach(category => {
    content += `\n## ${category.toUpperCase()}\n\n`;
    
    categories[category].forEach((video, index) => {
      content += `### Video ${index + 1}\n\n`;
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
    console.log('=== Yoga for PE - Spreadsheet Formatter ===\n');
    console.log('This tool helps format your spreadsheet data for manual Vimeo uploads.\n');
    console.log('Instructions:');
    console.log('1. Copy data from your Google Spreadsheet');
    console.log('2. Paste it below when prompted');
    console.log('3. The tool will format it for easy copy-paste during manual uploads\n');
    
    // Get spreadsheet content
    console.log('Paste your spreadsheet content below (press Enter, then Ctrl+D or Ctrl+Z when done):');
    
    let content = '';
    const inputChunks = [];
    
    // Read multi-line input
    process.stdin.on('data', (chunk) => {
      inputChunks.push(chunk);
    });
    
    // Process input when done
    process.stdin.on('end', () => {
      content = inputChunks.join('');
      
      // Parse spreadsheet content
      const videos = parseSpreadsheetContent(content);
      console.log(`\nProcessed ${videos.length} videos`);
      
      // Format and display metadata
      formatMetadata(videos);
      
      // Export to copy-paste format
      exportToCopyPasteFormat(videos);
      
      process.exit(0);
    });
    
  } catch (error) {
    console.error('An error occurred:', error);
    rl.close();
  }
}

// Run the main function
main();
