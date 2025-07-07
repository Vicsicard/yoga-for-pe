const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

// Pattern to match incorrect import statements with a colon
const importColonPattern = /import\s*:\s*(\{[^}]*\})\s*from\s*['"](.*)['"]/g;

// Replacement pattern
const importReplacement = 'import $1 from "$2"';

async function processDirectory(directoryPath) {
  try {
    console.log(`Processing directory: ${directoryPath}`);
    const files = await readdir(directoryPath);
    
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const fileStat = await stat(filePath);
      
      if (fileStat.isDirectory()) {
        // Recursive call for subdirectories
        await processDirectory(filePath);
      } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        // Process JavaScript files
        await processFile(filePath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${directoryPath}:`, error);
  }
}

async function processFile(filePath) {
  try {
    console.log(`Processing file: ${filePath}`);
    const content = await readFile(filePath, 'utf8');
    
    // Check if file contains the pattern
    if (content.includes('import ')) {
      console.log(`Found incorrect imports in: ${filePath}`);
      
      // Fix the imports by removing colons
      const fixedContent = content.replace(/import\s*:\s*/g, 'import ');
      
      // Write the fixed content back to the file
      await writeFile(filePath, fixedContent, 'utf8');
      console.log(`Fixed imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

// Start processing from the root directory
const rootDir = path.resolve(__dirname);
console.log(`Starting to fix imports from root directory: ${rootDir}`);
processDirectory(rootDir)
  .then(() => console.log('Completed fixing imports'))
  .catch(error => console.error('Error fixing imports:', error));
