// Enhanced script to fix specific render conversion errors
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const exists = promisify(fs.exists);

// Specific fixes for files with exact issues from the build logs
// Using more robust patterns for better matching
const specificFixes = [
  // Fix mismatched JSX closing tags in Footer
  {
    file: 'components/Footer.js',
    search: /(<\/span><\/a>|<\/span>\s*<\/a>)/g,
    replace: '</a>',
    exact: false
  },
  // Fix missing h2 closing tag in Footer (from build log)
  {
    file: 'components/Footer.js',
    search: /(<h2[^>]*>[^<]*?)(?!<\/h2>)(<\/div>)/g,
    replace: '$1</h2>$2',
    exact: false
  },
  // Fix incorrect else syntax
  {
    file: 'components/Navbar.js',
    search: /else\s*:/g,
    replace: 'else',
    exact: false
  },
  // Fix PremiumModal missing parenthesis
  {
    file: 'components/PremiumModal.js',
    search: /function\s+logDebug\s*\(\s*message[^()]*\{/g,
    replace: 'function logDebug(message, data) {',
    exact: false
  },
  // Fix PremiumModal incorrect const: syntax (from build log)
  {
    file: 'components/PremiumModal.js',
    search: /const\s*:\s*{/g,
    replace: 'const {',
    exact: false
  },
  // Fix missing h2 closing tag
  {
    file: 'components/SubscriptionCTA.js', 
    search: /(<h2[^>]*>Unlock Premium Content)(?!<\/h2>)/g,
    replace: '$1</h2>',
    exact: false
  },
  // Fix VideoCard type annotation
  {
    file: 'components/VideoCard.js',
    search: /function\s+getCategoryFolder\s*\([^{)]*\)\s*:[^{]*/g,
    replace: 'function getCategoryFolder(video, videoSection) {',
    exact: false
  },
  // Fix export outside of module (from build log)
  {
    file: 'components/VideoCard.js',
    search: /export default function VideoCard/g,
    replace: 'function VideoCard',
    exact: false
  },
  {
    file: 'components/VideoCard.js',
    search: /}\s*$/,
    replace: '}\n\nexport default VideoCard;',
    exact: false
  },
  // Fix ternary operator in VideoSection (from build log)
  {
    file: 'components/VideoSection.js',
    search: /(title\.toLowerCase\(\)\.includes\('relaxation'\)\s*\?\s*'relaxation'\s*)\)/g,
    replace: '$1 : \'other\')',
    exact: false
  },
  // Fix Button.js export syntax (from build log)
  {
    file: 'components/ui/Button.js',
    search: /export\s*,\s*ref\)/g,
    replace: 'export default function Button({ children, href, className, variant, size, icon, onClick }, ref)',
    exact: false
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
        
        if (fix.exact) {
          // Exact string matching
          if (content.includes(fix.search)) {
            content = content.replace(new RegExp(fix.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.replace);
            await writeFile(filePath, content, 'utf8');
            console.log(`✅ Fixed issue in ${fix.file} using exact match`);
            fixCount++;
          } else {
            console.log(`⚠️ Could not find the exact issue pattern in ${fix.file}`);
          }
        } else {
          // Regex pattern matching
          const regex = fix.search instanceof RegExp ? fix.search : new RegExp(fix.search, 'g');
          const originalContent = content;
          content = content.replace(regex, fix.replace);
          
          if (content !== originalContent) {
            await writeFile(filePath, content, 'utf8');
            console.log(`✅ Fixed issue in ${fix.file} using regex match`);
            fixCount++;
          } else {
            console.log(`⚠️ Could not find the regex issue pattern in ${fix.file}`);
          }
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
    const entries = await promisify(fs.readdir)(dir, { withFileTypes: true });
    
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
      let originalContent = content;
      
      // General TypeScript syntax cleanup in JavaScript files
      // Remove type annotations
      content = content.replace(/:\s*([A-Za-z0-9_<>\[\]\|\{\}.,\s]+)(?=(\s*[=;,)]|\s*\|\s*undefined|\s*\|\s*null))/g, '');
      
      // Remove return type annotations
      content = content.replace(/\)\s*:\s*([A-Za-z0-9_<>\[\]\|\{\}.,\s]+)\s*{/g, ') {');
      
      // Remove optional parameter indicators
      content = content.replace(/(\w+)\?\s*:/g, '$1:');
      content = content.replace(/(\w+)\?(\s*[,)])/g, '$1$2');
      
      // Fix general broken parameter lists that are missing closing parens
      content = content.replace(/function\s+(\w+)\s*\(([^()]*[^)])\s*{/g, function(match, funcName, params) {
        // If there's no closing parenthesis, add one
        return `function ${funcName}(${params}) {`;
      });
      
      // Fix double opening braces that might be introduced by previous fixes
      content = content.replace(/\)\s*\{\s*\{/g, ') {');

      if (content !== originalContent) {
        await writeFile(file, content, 'utf8');
        console.log(`Applied general fixes to ${path.relative(rootDir, file)}`);
        fixCount++;
      }
    } catch (error) {
      console.error(`❌ Error fixing ${path.relative(rootDir, file)}:`, error);
    }
  }
  
  return fixCount;
}

async function main() {
  try {
    const specificFixCount = await applySpecificFixes();
    console.log(`Applied ${specificFixCount} specific fixes`);
    
    const generalFixCount = await findAndFixAllJsFiles();
    console.log(`Applied general fixes to ${generalFixCount} files`);
    
    console.log('All fixes completed!');
  } catch (error) {
    console.error('Error applying fixes:', error);
    process.exit(1);
  }
}

main();
