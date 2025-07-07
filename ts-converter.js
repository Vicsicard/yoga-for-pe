const fs = require('fs');
const path = require('path');

function convertTsToJs(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      // Skip node_modules and .next directories
      if (file.name !== 'node_modules' && file.name !== '.next') {
        convertTsToJs(filePath);
      }
    } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
      // Rename .ts to .js files
      const newName = file.name.replace(/\.tsx?$/, '.js');
      const newPath = path.join(dir, newName);
      
      console.log(`Converting ${filePath} to ${newPath}`);
      
      try {
        // Read the file content
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Step 1: Remove TypeScript specific syntax
        // Remove type imports
        content = content.replace(/import\s+type\s+.*?;\s*$/mg, '');
        content = content.replace(/import\s+{\s*type\s+.*?}\s+from\s+.*?;\s*$/mg, '');
        
        // Remove interfaces - multi-line approach
        content = content.replace(/^\s*interface\s+[\w\d_$]+\s*{[\s\S]*?}\s*$/mg, '');
        
        // Remove type definitions - multi-line approach
        content = content.replace(/^\s*type\s+[\w\d_$]+\s*=[\s\S]*?;\s*$/mg, '');
        
        // Remove export type
        content = content.replace(/^export\s+type\s+.*?;\s*$/mg, '');
        
        // Remove generic type parameters
        content = content.replace(/<[^>]+>/g, '');
        
        // Step 2: Replace React component declarations
        content = content.replace(/:\s*React\.FC(\<.*?\>)?\s*=\s*/g, '= ');
        content = content.replace(/:\s*NextPage(\<.*?\>)?\s*=\s*/g, '= ');
        
        // Step 3: Replace type annotations carefully
        // This regex matches type annotations that don't break the code when removed
        content = content.replace(/:\s*[A-Za-z0-9\[\]\{\}\|\&\<\>\,\s\?\!\"\'\(\)]+(?=(\s*[=;,)]|\s*\{|\s*=>|\s*\n))/g, '');
        
        // Step 4: Handle TSX JSX syntax
        // Replace empty props
        content = content.replace(/\(\{\s*\}\:\s*[^)]+\)/g, '({})');
        
        // Fix the code
        content = fixCommonSyntaxIssues(content);
        
        // Write the converted JS file
        fs.writeFileSync(newPath, content);
        
        // Delete the original TS file
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error(`Error converting ${filePath}: ${error.message}`);
      }
    } else if (file.name.endsWith('.jsx') || file.name.endsWith('.js')) {
      // Also process existing JS files to fix potential TypeScript remnants
      try {
        const filePath = path.join(dir, file.name);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Apply fixes to existing JS files as well
        content = fixCommonSyntaxIssues(content);
        
        fs.writeFileSync(filePath, content);
      } catch (error) {
        console.error(`Error processing JS file ${filePath}: ${error.message}`);
      }
    }
  }
}

function fixCommonSyntaxIssues(content) {
  // Fix: headers{ -> headers: {
  content = content.replace(/(\w+)\s*\{(?!\s*:)/g, '$1: {');
  
  // Fix: incomplete JSON objects like { success) -> { success: true }
  content = content.replace(/\{\s*(\w+)\s*\)/g, '{ $1: true }');
  
  // Fix: case statements with assignment
  content = content.replace(/case\s+(['"][^'"]+['"])\s*=\s*([\w\d_$.]+);/g, 'case $1: subscriptionTier = $2; break;');
  
  // Remove remaining interface declarations
  content = content.replace(/^\s*interface\s+[\w\d_$]+\s*\{[\s\S]*?\n\}/gm, '');
  
  // Remove any remaining type annotations
  content = content.replace(/:\s*[A-Za-z0-9]+(\[\])?(\s*\|\s*[A-Za-z0-9]+(\[\])?)*\s*(?=[=;,)])/g, '');
  
  return content;
}

// Fix known specific issues
function fixKnownIssues() {
  const issues = [
    // Fix useAuth.js interface issue
    {
      file: 'lib/hooks/useAuth.js',
      pattern: /\/\/\s*Define\s+types[\s\S]*?interface\s+User\s*\{[\s\S]*?\}/,
      replacement: '// Define types - removed TypeScript interface'
    },
    // Fix diagnostics route.js headers issue
    {
      file: 'app/api/diagnostics/route.js',
      pattern: /headers\s*\{\s*'User-Agent'\);/,
      replacement: "headers: {\n        'User-Agent': 'yoga-for-pe-app'\n      });"
    },
    // Fix log route.js json issue
    {
      file: 'app/api/log/route.js',
      pattern: /json\(\{\s*success\s*\);/,
      replacement: 'json({ success: true });'
    },
    // Fix mock-checkout success route.js switch case
    {
      file: 'app/api/mock-checkout/success/route.js',
      pattern: /case\s+'silver'\s*=\s*SubscriptionTier\.SILVER;/,
      replacement: "case 'silver': subscriptionTier = SubscriptionTier.SILVER; break;"
    },
    // Fix stripe create-checkout-session route.js switch case
    {
      file: 'app/api/stripe/create-checkout-session/route.js',
      pattern: /case\s+'1'\s*=\s*SubscriptionTier\.SILVER;/,
      replacement: "case '1': subscriptionTier = SubscriptionTier.SILVER; break;"
    },
    {
      file: 'app/api/stripe/create-checkout-session/route.js',
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
      console.error(`Error fixing ${issue.file}: ${error.message}`);
    }
  }
}

// Run the conversion
convertTsToJs(process.cwd());
// Fix known issues
fixKnownIssues();
console.log('Completed TypeScript to JavaScript conversion');
