// Script to fix incorrect import statements in converted JS files
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all JS files in the project
console.log('Starting import statement fix script...');
const jsFiles = glob.sync('**/*.js', {
  ignore: ['node_modules/**', '.next/**', 'fix-render-imports.js']
});

console.log(`Found ${jsFiles.length} JavaScript files to check`);

let fixCount = 0;
jsFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check if file contains the problematic pattern
    if (content.includes('import:')) {
      console.log(`Fixing imports in: ${file}`);
      
      // Fix the imports by removing colons
      const fixedContent = content.replace(/import\s*:\s*/g, 'import ');
      
      // Write the fixed content back to the file
      fs.writeFileSync(file, fixedContent, 'utf8');
      fixCount++;
    }
  } catch (error) {
    console.error(`Error processing file ${file}:`, error);
  }
});

console.log(`Fixed import statements in ${fixCount} files`);
console.log('Import fix script completed successfully');
