const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Input and output paths
const inputPath = path.join(__dirname, '../public/images/Logo S No bg green- use.png');
const outputPath = path.join(__dirname, '../public/images/yoga-logo-final.png');

// Make sure the input file exists
if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

// Resize the image to a larger size suitable for the header
sharp(inputPath)
  .resize({
    width: 300,  // Larger width for better visibility
    height: 60,  // Larger height for better visibility
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
  })
  .png({ quality: 100 })
  .toFile(outputPath)
  .then(info => {
    console.log('Image resized successfully!');
    console.log(info);
    console.log(`Saved to: ${outputPath}`);
  })
  .catch(err => {
    console.error('Error resizing image:', err);
  });
