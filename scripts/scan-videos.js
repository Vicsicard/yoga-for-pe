#!/usr/bin/env node

/**
 * Scan Videos for Yoga for PE
 * 
 * This script scans video directories and lists all videos found
 * to help with organizing them for upload to Vimeo OTT.
 */

const fs = require('fs');
const path = require('path');

// Base directory for videos
const baseDir = "D:\\Videos Ready for Subscription 662025";

// Define video extensions
const videoExtensions = ['.mp4', '.mov', '.avi'];

// Define categories based on folder names
const categoryFolders = {
  'Free Videos': { category: 'yoga-for-pe', tier: 'bronze', level: 'Beginner' },
  'Meditations': { category: 'meditation', tier: 'silver', level: 'Intermediate' },
  'Mindful Movement': { category: 'yoga-for-pe', tier: 'silver', level: 'Intermediate' },
  'Relaxations': { category: 'relaxation', tier: 'silver', level: 'Intermediate' },
  'Yoga for PE': { category: 'yoga-for-pe', tier: 'gold', level: 'Advanced' }
};

/**
 * Get all video files in a directory
 * @param {string} dir - Directory to scan
 * @returns {Array<string>} - Array of video file paths
 */
function getVideoFiles(dir) {
  let results = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        results = results.concat(getVideoFiles(filePath));
      } else {
        // Check if file has a video extension
        const ext = path.extname(file).toLowerCase();
        if (videoExtensions.includes(ext)) {
          results.push(filePath);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
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
 * Main function
 */
function main() {
  try {
    console.log('=== Yoga for PE - Video Scanner ===\n');
    
    // Check if base directory exists
    if (!fs.existsSync(baseDir)) {
      console.error(`Error: Base directory does not exist: ${baseDir}`);
      return;
    }
    
    // Get subdirectories (categories)
    const categories = fs.readdirSync(baseDir)
      .filter(item => {
        const itemPath = path.join(baseDir, item);
        return fs.statSync(itemPath).isDirectory();
      });
    
    console.log(`Found ${categories.length} category folders:\n`);
    categories.forEach(category => console.log(`- ${category}`));
    
    // Scan each category folder
    let totalVideos = 0;
    const videosByCategory = {};
    
    for (const category of categories) {
      const categoryPath = path.join(baseDir, category);
      const videos = getVideoFiles(categoryPath);
      
      videosByCategory[category] = videos;
      totalVideos += videos.length;
      
      console.log(`\n${category}: ${videos.length} videos`);
      videos.forEach((video, index) => {
        if (index < 3) { // Show only first 3 videos per category
          const filename = path.basename(video);
          console.log(`  - ${filename}`);
        } else if (index === 3) {
          console.log(`  - ... and ${videos.length - 3} more`);
        }
      });
    }
    
    console.log(`\nTotal videos found: ${totalVideos}`);
    
    // Generate CSV content
    let csvContent = 'filePath,title,description,category,level,tier\n';
    
    for (const category in videosByCategory) {
      const videos = videosByCategory[category];
      const metadata = categoryFolders[category] || { 
        category: 'yoga-for-pe', 
        tier: 'silver', 
        level: 'Intermediate' 
      };
      
      for (const filePath of videos) {
        const filename = path.basename(filePath, path.extname(filePath));
        const title = generateTitle(filename);
        
        // Generate a placeholder description
        const description = `${title} - ${metadata.level} level ${metadata.category} video`;
        
        // Escape quotes in fields
        const escapedFilePath = filePath.replace(/"/g, '""');
        const escapedTitle = title.replace(/"/g, '""');
        const escapedDescription = description.replace(/"/g, '""');
        
        // Add row to CSV
        csvContent += `"${escapedFilePath}","${escapedTitle}","${escapedDescription}","${metadata.category}","${metadata.level}","${metadata.tier}"\n`;
      }
    }
    
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
    console.error('An error occurred:', error.message);
  }
}

// Run the main function
main();
