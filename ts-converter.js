console.log('Script is starting execution...');

const fs = require('fs');
const path = require('path');

// Function to convert TypeScript to JavaScript by stripping types
function convertTsToJs(content, filePath) {
  // Remove TypeScript-specific syntax
  let jsContent = content
    // Remove type annotations
    .replace(/:\s*([A-Za-z0-9_<>\[\]\|\{\}.,\s]+)(?=(\s*[=;,)]|\s*\|\s*undefined|\s*\|\s*null))/g, '')
    // Remove interface declarations
    .replace(/\binterface\s+[^{]+\{[^}]*\}/gs, '')
    // Remove type declarations
    .replace(/\btype\s+[^=]+=\s*[^;]+;/g, '')
    // Remove generics in function calls
    .replace(/([A-Za-z0-9_]+)<([^>]+)>/g, '$1')
    // Clean up any remaining TypeScript artifacts
    .replace(/\breact\b\.?FC<[^>]+>/g, '')
    .replace(/\breact\b\.?FC/g, '')
    .replace(/\bReact\.FC<[^>]+>/g, '')
    .replace(/\bReact\.FC/g, '')
    .replace(/extends\s+[A-Za-z0-9_]+<[^>]+>/g, '')
    // Remove import type statements
    .replace(/import\s+type\s+[^;]+;/g, '')
    .replace(/import\s+\{\s*type\s+[^}]+\}\s+from\s+[^;]+;/g, '');

  // Fix all import statements - CRITICAL for auth routes
  jsContent = jsContent.replace(/import:\s*\{([^}]+)\}\s+from\s+(['"])([^'"]+)\2/g, 'import {$1} from $2$3$2');
  
  // Fix remaining imports
  jsContent = jsContent.replace(/import\s+\{([^}]+)\}\s+from/g, (match, imports) => {
    return `import {${imports.replace(/type\s+/g, '')}} from`;
  });

  // Fix specific syntax issues in the converted code
  jsContent = fixSyntaxIssues(jsContent, filePath);

  return jsContent;
}

// Function to fix common syntax issues that occur during conversion
function fixSyntaxIssues(content, filePath) {
  // Fix various syntax issues
  let fixedContent = content;
  
  // Fix import statements with colons - this is the critical issue
  fixedContent = fixedContent.replace(/import:\s*\{/g, 'import {');
  fixedContent = fixedContent.replace(/import:\s*([A-Za-z0-9_]+)\s+from/g, 'import $1 from');
  
  // Fix try blocks with colons
  fixedContent = fixedContent.replace(/try:\s*\{/g, 'try {');
  
  // Fix catch blocks with colons
  fixedContent = fixedContent.replace(/catch\s*\([^)]*\):\s*\{/g, function(match) {
    return match.replace(':', '');
  });
  
  // Fix object property assignments missing colons
  fixedContent = fixedContent.replace(/(\w+)\s*\{(?!\s*:)/g, '$1: {');
  
  // Fix invalid switch case fallthrough
  fixedContent = fixedContent.replace(/case\s+([^:]+)\s*\n\s*case/g, 'case $1:\n  case');
  
  // Ensure all case statements end with colons
  fixedContent = fixedContent.replace(/case\s+(['"])([^'"]+)\1(?!:)/g, 'case $1$2$1:');
  
  // Fix class declarations with extends but no colon
  fixedContent = fixedContent.replace(/class\s+(\w+)\s+extends\s+(\w+)\s*\{/g, 'class $1 extends $2 {');

  // Special case for auth routes that have the import: { ... } syntax
  if (filePath && filePath.includes('/api/auth/')) {
    console.log(`Applying special fixes for auth route: ${filePath}`);
    fixedContent = fixedContent.replace(/import:\s*\{([^}]+)\}\s+from\s+(['"])([^'"]+)\2/g, 'import {$1} from $2$3$2');
    // Fix try-catch blocks in auth routes
    fixedContent = fixedContent.replace(/try:\s*\{/g, 'try {');
  }
  
  // Fix missing commas in object literals
  fixedContent = fixedContent.replace(/(\w+)\s*:\s*(['"\w\d]+)\s+(?=[\w]+\s*:)/g, '$1: $2, ');
  
  // Fix switch/case statements with no colons
  fixedContent = fixedContent.replace(/case\s+(['"](\w+)['"])(?!:)\s*[{\n]/g, 'case $1: ');

  return fixedContent;
}

// Global counter for successful conversions
let successfulConversions = 0;
let failedConversions = 0;

// Function to process a single file
function processFile(filePath) {
  const ext = path.extname(filePath);
  if (ext !== '.ts' && ext !== '.tsx') {
    // Don't log skipped files to reduce noise
    return;
  }

  // Generate the output JavaScript file path
  const outputPath = filePath.replace(/\.tsx?$/, '.js');

  console.log(`[CONVERTING] ${filePath}`);

  try {
    // Read the TypeScript file
    const tsContent = fs.readFileSync(filePath, 'utf8');

    // Convert to JavaScript
    let jsContent = convertTsToJs(tsContent, filePath);

    // Apply specific fixes for known problematic files
    if (filePath.includes('lib/hooks/useAuth')) {
      console.log('  [FIX] Applying special fix for lib/hooks/useAuth.js');
      jsContent = jsContent.replace(/const useAuth = \(\) => \{/g, 'const useAuth = () => {\n  const auth = {};');
    }

    if (filePath.includes('app/api/diagnostics/route')) {
      console.log('  [FIX] Applying special fix for app/api/diagnostics/route.js');
      jsContent = jsContent.replace(/headers\s*\{/g, 'headers: {');
    }

    if (filePath.includes('app/api/log/route')) {
      console.log('  [FIX] Applying special fix for app/api/log/route.js');
      jsContent = jsContent.replace(/message\s*body/g, 'message: body');
    }

    if (filePath.includes('app/api/mock-checkout/success/route') || 
        filePath.includes('app/api/stripe/create-checkout-session/route')) {
      console.log(`  [FIX] Fixing switch cases in ${path.basename(filePath)}`);
      jsContent = jsContent.replace(/case\s+(['"](\w+)['"])(?!:)/g, 'case $1:');
    }
    
    // Fix for api route exports
    if (filePath.includes('/api/')) {
      jsContent = jsContent.replace(/export\s+async\s+function\s+(\w+)\s*\(/g, 'export async function $1(');
      // Fix named exports that might be incorrect
      jsContent = jsContent.replace(/export\s*{\s*(\w+)\s+as\s+(\w+)\s*}/g, 'export { $1 as $2 }');
    }

    // Write the JavaScript file
    fs.writeFileSync(outputPath, jsContent, 'utf8');
    console.log(`  [SUCCESS] ${path.basename(filePath)}`);
    successfulConversions++;
  } catch (error) {
    console.error(`  [ERROR] Failed to convert ${filePath}: ${error.message}`);
    failedConversions++;
  }
}

// Function to walk through directories recursively
function processDirectory(dir) {
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      // Skip node_modules and .next directories
      if (file.isDirectory()) {
        if (file.name !== 'node_modules' && file.name !== '.next' && file.name !== '.git') {
          processDirectory(filePath);
        }
      } else if (file.isFile()) {
        processFile(filePath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error);
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const baseDir = args[0] || process.cwd();
  
  console.log(`===== TYPESCRIPT TO JAVASCRIPT CONVERTER =====`);
  console.log(`Converting TypeScript files in ${baseDir} to JavaScript...`);
  
  // Reset counters
  successfulConversions = 0;
  failedConversions = 0;
  
  // Count TS files before conversion
  let tsFileCount = 0;
  const countTsFiles = (dir) => {
    try {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory() && file.name !== 'node_modules' && file.name !== '.next' && file.name !== '.git') {
          countTsFiles(filePath);
        } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.tsx'))) {
          tsFileCount++;
        }
      }
    } catch (error) {
      console.error(`Error counting files in ${dir}:`, error);
    }
  };
  
  countTsFiles(baseDir);
  console.log(`Found ${tsFileCount} TypeScript files to convert`);
  
  // Process all directories
  processDirectory(baseDir);
  
  // Fix any known global issues after processing
  console.log(`\nApplying global fixes to common issues...`);
  fixKnownGlobalIssues(baseDir);
  
  console.log('\n===== CONVERSION SUMMARY =====');
  console.log(`Total TypeScript files found: ${tsFileCount}`);
  console.log(`Successfully converted: ${successfulConversions}`);
  console.log(`Failed conversions: ${failedConversions}`);
  console.log('===== CONVERSION COMPLETE =====');
}

// Fix known global issues after all files are processed
function fixKnownGlobalIssues(baseDir) {
  console.log('Applying global fixes for known issues...');
  
  const issues = [
    {
      file: path.join(baseDir, 'app/api/diagnostics/route.js'),
      pattern: /headers\s*\{\s*'User-Agent'\);/,
      replacement: "headers: {\n        'User-Agent': 'yoga-for-pe-app'\n      });"
    },
    {
      file: path.join(baseDir, 'app/api/log/route.js'),
      pattern: /json\(\{\s*success\s*\);/,
      replacement: 'json({ success: true });'
    },
    {
      file: path.join(baseDir, 'app/api/mock-checkout/success/route.js'),
      pattern: /case\s+'silver'\s*=\s*SubscriptionTier\.SILVER;/,
      replacement: "case 'silver': subscriptionTier = SubscriptionTier.SILVER; break;"
    },
    {
      file: path.join(baseDir, 'app/api/stripe/create-checkout-session/route.js'),
      pattern: /case\s+'1'\s*=\s*SubscriptionTier\.SILVER;/,
      replacement: "case '1': subscriptionTier = SubscriptionTier.SILVER; break;"
    },
    {
      file: path.join(baseDir, 'app/api/stripe/create-checkout-session/route.js'),
      pattern: /case\s+'2'\s*=\s*SubscriptionTier\.GOLD;/,
      replacement: "case '2': subscriptionTier = SubscriptionTier.GOLD; break;"
    }
  ];

  for (const issue of issues) {
    try {
      if (fs.existsSync(issue.file)) {
        console.log(`Fixing known issue in ${issue.file}`);
        let content = fs.readFileSync(issue.file, 'utf8');
        content = content.replace(issue.pattern, issue.replacement);
        fs.writeFileSync(issue.file, content);
      } else {
        console.log(`File not found: ${issue.file}`);
      }
    } catch (error) {
      console.error(`Error fixing ${issue.file}:`, error);
    }
  }
  
  console.log('Global fixes applied.');
}

// Run the script
main();
