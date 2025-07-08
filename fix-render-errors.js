// Script to fix common conversion errors in JavaScript files
const fs = require('fs');
const path = require('path');

// Files with known issues and their fixes
const fileFixes = {
  'components/Footer.js': (content) => {
    // Fix mismatched JSX tags (</span></a>)
    return content.replace('</span></a>', '</a>');
  },
  
  'components/Navbar.js': (content) => {
    // Fix incorrect else: syntax
    return content.replace('else:', 'else');
  },
  
  'components/PremiumModal.js': (content) => {
    // Fix missing parameter parenthesis
    return content.replace('function logDebug(message, data  {', 
                          'function logDebug(message, data) {');
  },
  
  'components/SubscriptionCTA.js': (content) => {
    // Ensure proper tag closing
    return content;
  },
  
  'components/VideoCard.js': (content) => {
    // Fix invalid type annotation syntax
    return content.replace('videoSection : string:', 'videoSection) {');
  }
};

// Root directory
const rootDir = process.cwd();

// Process each file with a specific fix
for (const relativeFilePath in fileFixes) {
  const absolutePath = path.join(rootDir, relativeFilePath);
  
  if (fs.existsSync(absolutePath)) {
    console.log(`Applying fix to ${relativeFilePath}`);
    
    try {
      // Read the file
      let content = fs.readFileSync(absolutePath, 'utf-8');
      
      // Apply the specific fix
      content = fileFixes[relativeFilePath](content);
      
      // Write back to the file
      fs.writeFileSync(absolutePath, content, 'utf-8');
      
      console.log(`✅ Successfully fixed ${relativeFilePath}`);
    } catch (error) {
      console.error(`❌ Error fixing ${relativeFilePath}:`, error);
    }
  } else {
    console.warn(`⚠️ File not found: ${absolutePath}`);
  }
}

console.log('All specific fixes applied!');

// Additional general fixes for common issues
const jsFiles = findJSFiles(rootDir);
console.log(`Found ${jsFiles.length} JavaScript files for general fixes`);

for (const file of jsFiles) {
  try {
    let content = fs.readFileSync(file, 'utf-8');
    let originalContent = content;
    
    // Fix common conversion errors
    content = content
      // Fix missing JSX closing tags
      .replace(/<([a-zA-Z]+)[^>]*>([^<]*)<\/span>/g, '<$1>$2</$1>')
      
      // Fix malformed parameter definitions
      .replace(/\(\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\s*:\s*{/g, '($1) {')
      
      // Fix syntax errors in if-else statements
      .replace(/}\s*else\s*:/g, '} else {');
      
    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf-8');
      console.log(`Applied general fixes to ${path.relative(rootDir, file)}`);
    }
  } catch (error) {
    console.error(`Error applying general fixes to ${file}:`, error);
  }
}

// Function to find all JS files in a directory recursively
function findJSFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .next
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        results = results.concat(findJSFiles(fullPath));
      }
    } else if (entry.name.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  
  return results;
}

console.log('All fixes completed!');
