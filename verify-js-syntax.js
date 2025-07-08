// Script to verify JavaScript syntax in pre-fixed files
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directory to scan
const prefixedDir = path.join(__dirname, 'pre-fixed-js');

// Function to recursively find all .js files
function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findJSFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// Check JavaScript syntax
function verifySyntax(filePath) {
  try {
    // For Next.js files, we can't use node --check directly
    // Instead, try to require the file with babel-register
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Basic syntax check - look for unmatched brackets, parentheses, etc.
    let brackets = 0, parentheses = 0, braces = 0;
    
    for (let i = 0; i < content.length; i++) {
      switch (content[i]) {
        case '[': brackets++; break;
        case ']': brackets--; break;
        case '(': parentheses++; break;
        case ')': parentheses--; break;
        case '{': braces++; break;
        case '}': braces--; break;
      }
      
      // Check for negative counts which indicate a closing without opening
      if (brackets < 0 || parentheses < 0 || braces < 0) {
        throw new Error(`Unmatched bracket/parenthesis/brace at position ${i}`);
      }
    }
    
    // Check for unclosed brackets/parentheses/braces
    if (brackets !== 0 || parentheses !== 0 || braces !== 0) {
      throw new Error(`Unclosed brackets: ${brackets}, parentheses: ${parentheses}, braces: ${braces}`);
    }
    
    checkSyntaxErrors(filePath);
    
    console.log(`✅ ${path.relative(__dirname, filePath)} - Syntax OK`);
    return true;
  } catch (error) {
    console.error(`❌ ${path.relative(__dirname, filePath)} - Syntax Error: ${error.message}`);
    return false;
  }
}

function checkSyntaxErrors(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Clean up content to avoid false positives
  const cleanedContent = content
    .replace(/\/\/.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/`[^`]*`/g, '"`"') // Replace template literals
    .replace(/"[^"]*"/g, '""') // Replace double-quoted strings
    .replace(/\'[^\']*\'/g, "''"); // Replace single-quoted strings
  
  // Define error patterns
  const errorPatterns = [
    // Avoid false positives by using more specific patterns
    { 
      pattern: /:[^,}\]\)\n]*\?/g, 
      description: 'Invalid ternary expression',
      exclude: /className\s*:|key\s*:|id\s*:|type\s*:|src\s*:|alt\s*:|href\s*:|role\s*:/g
    },
    { 
      pattern: /;\s*else/g, 
      description: 'Semicolon before else',
      exclude: /}\s*else/g // Don't flag normal else blocks
    },
    { 
      pattern: /;\s*catch/g, 
      description: 'Semicolon before catch'
    },
    { 
      pattern: /;\s*finally/g, 
      description: 'Semicolon before finally'
    },
    { 
      pattern: /\}\{/g, 
      description: 'Missing semicolon between blocks',
      exclude: /}\s*else\s*{|return\s*{/g
    },
  ];
  
  let hasError = false;
  
  // Check each pattern against the cleaned content
  for (const { pattern, description, exclude } of errorPatterns) {
    let matches = [];
    let match;
    
    // Find all matches
    while ((match = pattern.exec(cleanedContent)) !== null) {
      // Skip if it matches the exclude pattern
      if (exclude && exclude.test(match[0])) {
        continue;
      }
      matches.push(match[0]);
    }
    
    if (matches.length > 0) {
      console.error(`❌ ${path.relative(__dirname, filePath)} - Syntax Error: ${description}`);
      hasError = true;
    }
  }
  
  if (!hasError) {
    console.log(`✅ ${path.relative(__dirname, filePath)} - Syntax OK`);
    return true;
  }
  
  return !hasError;
}

// Check JSX syntax (basic detection of unmatched tags)
function verifyJSX(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Remove comments and strings to avoid false positives
  const cleanContent = content
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/\/\/[^\n]*/g, '') // Remove single-line comments
    .replace(/`[^`]*`/g, '``') // Remove template literals
    .replace(/"[^"]*"/g, '""') // Remove double-quoted strings
    .replace(/\'[^\']*\'/g, "''"); // Remove single-quoted strings

  // Improved JSX tag pattern that handles components with dots (e.g., Layout.Header)
  const tagPattern = /<(\/?)([a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)(?:\s+[^>]*)?>/g;
  
  // Initialize stacks for different tag types
  const openingTags = [];
  let hasError = false;
  let match;
  
  // Known self-closing HTML tags
  const selfClosingTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);
  
  while ((match = tagPattern.exec(cleanContent)) !== null) {
    const isClosing = match[1] === '/';
    const tagName = match[2];
    const fullTag = match[0];
    
    // Check if it's a self-closing tag (either HTML self-closing or ends with />)
    const isSelfClosing = 
      selfClosingTags.has(tagName.toLowerCase()) || 
      fullTag.endsWith('/>') || 
      fullTag.endsWith('/ >');
    
    if (isClosing) {
      // This is a closing tag like </div>
      if (openingTags.length === 0) {
        console.error(`❌ ${path.relative(__dirname, filePath)} - Closing tag without matching opening tag: ${fullTag} at pos ${match.index}`);
        hasError = true;
      } else {
        // Check if it matches the last opening tag
        const lastTag = openingTags.pop();
        if (lastTag !== tagName) {
          console.error(`❌ ${path.relative(__dirname, filePath)} - Tag mismatch: expected </${lastTag}> but found ${fullTag}`);
          hasError = true;
        }
      }
    } else if (!isSelfClosing) {
      // This is an opening tag that needs a closing tag
      openingTags.push(tagName);
    }
    // Self-closing tags are just skipped as they don't need a closing tag
  }
  
  // Check for any unclosed tags
  if (openingTags.length > 0) {
    console.error(`❌ ${path.relative(__dirname, filePath)} - Unclosed tags: ${openingTags.join(', ')}`);
    hasError = true;
  }
  
  if (!hasError) {
    console.log(`✅ ${path.relative(__dirname, filePath)} - JSX structure looks good`);
    return true;
  }
  
  return !hasError;
}

// Check for TypeScript leftovers
function checkTypeScriptLeftovers(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // More precise patterns that avoid false positives with JSX
  const typeScriptPatterns = [
    { 
      pattern: /\b[a-zA-Z0-9_]+\s*:\s*[A-Za-z][A-Za-z0-9_]*\s*[,=)}\]]/g,  // Type annotations like foo: string, 
      exclude: /className\s*:|key\s*:|id\s*:|type\s*:|src\s*:|alt\s*:|href\s*:|role\s*:|aria-\w+\s*:|data-\w+\s*:/g  // Exclude common JSX attributes
    },
    { 
      pattern: /\binterface\s+[A-Za-z0-9_]+/g,  // Interface declarations
      exclude: null
    },
    { 
      pattern: /\bextends\s+React\.[A-Za-z0-9_]+</g,  // React component type extensions
      exclude: null
    },
    { 
      pattern: /\bimport\s+type\s+/g,  // TypeScript-specific import syntax
      exclude: null
    },
    { 
      pattern: /:\s*React\.[A-Za-z0-9_]+/g,  // React type annotations
      exclude: null
    },
    { 
      pattern: /\bas\s+(const|[A-Z][A-Za-z0-9_]*)/g,  // Type assertions
      exclude: /\b(known|such|long|well|far|much|soon)\s+as\s+/g  // Exclude common English phrases
    }
  ];
  
  let hasError = false;
  
  // Check content against each pattern
  for (const { pattern, exclude } of typeScriptPatterns) {
    // Find all matches
    const matches = [];
    let match;
    
    // Create a new RegExp to use exec with global flag
    const regex = new RegExp(pattern.source, 'g');
    
    while ((match = regex.exec(content)) !== null) {
      // Check if this is a false positive by testing with exclude pattern
      if (exclude) {
        const matchStr = match[0];
        const matchPos = match.index;
        const lineStart = content.lastIndexOf('\n', matchPos) + 1;
        const lineEnd = content.indexOf('\n', matchPos);
        const line = content.substring(lineStart, lineEnd !== -1 ? lineEnd : content.length);
        
        // Skip if it matches the exclude pattern
        if (exclude.test(matchStr) || exclude.test(line)) {
          continue;
        }
      }
      
      matches.push(match[0]);
    }
    
    // Report matches
    if (matches.length > 0) {
      console.error(`❌ ${path.relative(__dirname, filePath)} - Possible TypeScript leftover: ${matches[0]}`);
      hasError = true;
    }
  }
  
  if (!hasError) {
    console.log(`✅ ${path.relative(__dirname, filePath)} - No TypeScript leftovers detected`);
    return true;
  }
  
  return !hasError;
}

// Main execution
console.log('Verifying JavaScript syntax in pre-fixed files...');
const jsFiles = findJSFiles(prefixedDir);
console.log(`Found ${jsFiles.length} JavaScript files to check.\n`);

let allPassed = true;

for (const file of jsFiles) {
  console.log(`\nChecking ${path.relative(__dirname, file)}...`);
  
  const syntaxOk = verifySyntax(file);
  const jsxOk = file.includes('components') ? verifyJSX(file) : true;
  const noTypeScriptLeftovers = checkTypeScriptLeftovers(file);
  
  allPassed = allPassed && syntaxOk && jsxOk && noTypeScriptLeftovers;
  
  console.log('-'.repeat(50));
}

if (allPassed) {
  console.log('\n✅ All files passed verification!');
  process.exit(0);
} else {
  console.error('\n❌ Some files have issues that need to be fixed.');
  process.exit(1);
}
