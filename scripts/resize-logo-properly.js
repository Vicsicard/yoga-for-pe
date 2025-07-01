const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Define paths
const inputPath = path.join(__dirname, '../public/images/Logo S No bg green- use.png');
const outputPath = path.join(__dirname, '../public/images/logo-resized-200x40.png');

// Resize image to 200x40 pixels with proper settings
sharp(inputPath)
  .resize({
    width: 200,
    height: 40,
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
  })
  .png({ quality: 100 })
  .toFile(outputPath)
  .then(info => {
    console.log('Image resized successfully!');
    console.log('Output image info:', info);
    console.log(`Saved to: ${outputPath}`);
  })
  .catch(err => {
    console.error('Error resizing image:', err);
  });
