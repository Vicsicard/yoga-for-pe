// Script to test if the pre-fixed files correctly fix the syntax issues
const fs = require('fs');
const path = require('path');

// Files to check with their known issues
const filesToCheck = [
  {
    file: 'components/Footer.js',
    badPattern: '</span></a>',
    goodPattern: '<span className="sr-only">Facebook</span>'
  },
  {
    file: 'components/Navbar.js',
    badPattern: 'else:',
    goodPattern: 'else {'
  },
  {
    file: 'components/PremiumModal.js',
    badPattern: 'function logDebug(message, data  {',
    goodPattern: 'function logDebug(message, data) {'
  },
  {
    file: 'components/SubscriptionCTA.js',
    badPattern: '<h2>Unlock Premium Content',
    goodPattern: 'font-bold mb-4 text-white">Unlock Premium Content</h2>'
  },
  {
    file: 'components/VideoCard.js',
    badPattern: 'videoSection : string',
    goodPattern: 'export default function VideoCard({ video, isPremium = false, videoSection })'
  },
  {
    file: 'components/Button.js',
    badPattern: 'export: default',
    goodPattern: 'export default function Button'
  }
];

// Check if pre-fixed-js directory exists
if (!fs.existsSync('pre-fixed-js')) {
  console.error('❌ ERROR: pre-fixed-js directory not found!');
  process.exit(1);
}

// Test function to check if files have the correct content
function testFiles() {
  console.log('📋 Testing pre-fixed files for correct content...\n');
  
  let allPassed = true;
  
  // First, test if pre-fixed files exist and contain good patterns
  for (const item of filesToCheck) {
    const prefixedPath = path.join('pre-fixed-js', path.basename(item.file));
    
    if (!fs.existsSync(prefixedPath)) {
      console.error(`❌ ERROR: Pre-fixed file ${prefixedPath} not found!`);
      allPassed = false;
      continue;
    }
    
    const content = fs.readFileSync(prefixedPath, 'utf8');
    
    // Check that pre-fixed file contains good pattern and not bad pattern
    if (content.includes(item.badPattern)) {
      console.error(`❌ ERROR: Pre-fixed ${prefixedPath} still contains bad pattern: ${item.badPattern}`);
      allPassed = false;
    } else if (!content.includes(item.goodPattern)) {
      console.error(`❌ ERROR: Pre-fixed ${prefixedPath} doesn't contain expected good pattern: ${item.goodPattern}`);
      allPassed = false;
    } else {
      console.log(`✅ Pre-fixed ${prefixedPath} looks good!`);
    }
  }
  
  console.log('\n🔍 Testing file copy functionality...');
  
  // Now simulate the copy operation
  for (const item of filesToCheck) {
    const prefixedPath = path.join('pre-fixed-js', path.basename(item.file));
    const targetPath = path.join('build-test', item.file);
    
    // Create directory structure if it doesn't exist
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    try {
      // Copy pre-fixed file to build-test area
      fs.copyFileSync(prefixedPath, targetPath);
      console.log(`✅ Successfully copied ${prefixedPath} to ${targetPath}`);
      
      // Verify the copy worked correctly
      const copiedContent = fs.readFileSync(targetPath, 'utf8');
      if (copiedContent.includes(item.badPattern)) {
        console.error(`❌ ERROR: Copied file ${targetPath} still contains bad pattern!`);
        allPassed = false;
      } else if (!copiedContent.includes(item.goodPattern)) {
        console.error(`❌ ERROR: Copied file ${targetPath} doesn't contain expected good pattern!`);
        allPassed = false;
      } else {
        console.log(`✅ Copied file ${targetPath} has correct content!`);
      }
    } catch (error) {
      console.error(`❌ ERROR copying ${prefixedPath} to ${targetPath}:`, error);
      allPassed = false;
    }
  }
  
  if (allPassed) {
    console.log('\n✅ SUCCESS: All pre-fixed files are correct and copy operations work properly!');
    console.log('\nYour build should now complete successfully with these fixes.');
  } else {
    console.log('\n❌ FAILURE: Some tests failed. Please review the errors above.');
  }
}

testFiles();
