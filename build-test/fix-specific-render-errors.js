// Script to fix specific render conversion errors
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const exists = promisify(fs.exists);

// Specific fixes for files with exact issues from the build logs
const specificFixes = [
  {
    file: 'components/Footer.js',
    search: '</span></a>',
    replace: '</a>'
  },
  {
    file: 'components/Navbar.js',
    search: 'else:',
    replace: 'else'
  },
  {
    file: 'components/PremiumModal.js',
    search: 'function logDebug(message, data  ) {',
    replace: 'function logDebug(message, data) {'
  },
  {
    file: 'components/SubscriptionCTA.js', 
    // Making sure h2 tag is properly closed
    search: '<h2 className="text-3xl font-bold mb-4">Unlock Premium Content',
    replace: '<h2 className="text-3xl font-bold mb-4">Unlock Premium Content</h2>'
  },
  {
    file: 'components/VideoCard.js',
    search: 'videoSection : string:',
    replace: 'videoSection) {'
  }
];

async function applySpecificFixes() {
  const rootDir = process.cwd();
  let fixCount = 0;
  
  for (const fix of specificFixes) {
    const filePath = path.join(rootDir, fix.file);
    
    try {
      if (await exists(filePath)) {
        console.log(`Checking ${fix.file} for issues...`);
        let content = await readFile(filePath, 'utf8');
        
        if (content.includes(fix.search)) {
          content = content.replace(new RegExp(fix.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.replace);
          await writeFile(filePath, content, 'utf8');
          console.log(`✅ Fixed issue in ${fix.file}`);
          fixCount++;
        } else {
          console.log(`⚠️ Could not find the issue pattern in ${fix.file}`);
        }
      } else {
        console.log(`⚠️ File not found: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error fixing ${fix.file}:`, error);
    }
  }
  
  return fixCount;
}

// Apply more general fixes to all JS files
async function findAndFixAllJsFiles() {
  const rootDir = process.cwd();
  const jsFiles = [];
  
  // Find all JS files
  async function findJsFiles(dir) {
    const entries = await promisify(fs.readdir)(dir, { withFileTypes);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and .next
        if (entry.name !== 'node_modules' && entry.name !== '.next') {
          await findJsFiles(fullPath);
        }
      } else if (entry.name.endsWith('.js')) {
        jsFiles.push(fullPath);
      }
    }
  }
  
  await findJsFiles(rootDir);
  console.log(`Found ${jsFiles.length} JavaScript files for general fixes`);
  
  let fixCount = 0;
  
  for (const file of jsFiles) {
    try {
      let content = await readFile(file, 'utf8');
      const originalContent = content;
      
      // Fix common conversion issues
      content = content
        // Fix missing JSX closing tags
        .replace(/<([a-zA-Z]+)[^>]*>([^<]*)<\/span>/g, '<$1>$2</$1>')
        
        // Fix malformed parameter definitions
        .replace(/\(\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\s*:\s*{/g, '($1) {')
        
        // Fix syntax errors in if-else statements
        .replace(/}\s*else\s*:/g, '} else {');
      
      if (content !== originalContent) {
        await writeFile(file, content, 'utf8');
        console.log(`Applied general fixes to ${path.relative(rootDir, file)}`);
        fixCount++;
      }
    } catch (error) {
      console.error(`Error applying general fixes to ${file}:`, error);
    }
  }
  
  return fixCount;
}

async function main() {
  try {
    // First apply the specific fixes
    const specificFixCount = await applySpecificFixes();
    console.log(`Applied ${specificFixCount} specific fixes`);
    
    // Then apply general fixes to all JS files
    const generalFixCount = await findAndFixAllJsFiles();
    console.log(`Applied general fixes to ${generalFixCount} files`);
    
    console.log('All fixes completed!');
  } catch (error) {
    console.error('Error running fix script:', error);
  }
}

main();
