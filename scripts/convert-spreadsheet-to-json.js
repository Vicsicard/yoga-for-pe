// Script to convert spreadsheet data to JSON format for video organization
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to parse CSV data
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    const values = lines[i].split(',');
    const entry = {};
    
    headers.forEach((header, index) => {
      entry[header.toLowerCase()] = values[index] ? values[index].trim() : '';
    });
    
    result.push(entry);
  }
  
  return result;
}

// Function to map spreadsheet data to our video data format
function mapToVideoData(spreadsheetData) {
  return spreadsheetData.map(row => {
    // Map tier names to our tier values
    let tier = 'bronze'; // Default to bronze (free)
    if (row.tier && row.tier.toLowerCase().includes('silver')) {
      tier = 'silver';
    } else if (row.tier && row.tier.toLowerCase().includes('gold')) {
      tier = 'gold';
    }
    
    // Map category names to our category values
    let category = 'yoga-for-pe'; // Default
    if (row.category && row.category.toLowerCase().includes('meditation')) {
      category = 'meditation';
    } else if (row.category && row.category.toLowerCase().includes('relax')) {
      category = 'relaxation';
    }
    
    // Determine if this is a featured video
    const featured = row.featured && row.featured.toLowerCase() === 'yes';
    
    return {
      title: row.title || '',
      description: row.description || '',
      category: category,
      tier: tier,
      level: row.level || 'All Levels',
      featured: featured,
      vimeoId: row.vimeoId || '' // Include if available
    };
  });
}

// Main function
function convertSpreadsheetToJSON() {
  rl.question('Enter the path to your CSV file: ', (csvPath) => {
    fs.readFile(csvPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading CSV file:', err);
        rl.close();
        return;
      }
      
      // Parse CSV data
      const spreadsheetData = parseCSV(data);
      
      // Map to our video data format
      const videoData = mapToVideoData(spreadsheetData);
      
      // Write to JSON file
      const outputPath = path.join(__dirname, 'video-data.json');
      fs.writeFile(outputPath, JSON.stringify(videoData, null, 2), 'utf8', (writeErr) => {
        if (writeErr) {
          console.error('Error writing JSON file:', writeErr);
        } else {
          console.log(`Successfully converted spreadsheet data to JSON. Output saved to: ${outputPath}`);
        }
        
        rl.close();
      });
    });
  });
}

// Run the conversion
convertSpreadsheetToJSON();
