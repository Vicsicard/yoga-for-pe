const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Define paths
const inputPath = path.join(__dirname, '../public/images/Logo S No bg green- use.png');
const outputPath = path.join(__dirname, '../public/images/logo-resized.png');

// Resize image to 200x40 pixels
sharp(inputPath)
  .resize(200, 40, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
  })
  .toFile(outputPath)
  .then(info => {
    console.log('Image resized successfully!');
    console.log('Output image info:', info);
    
    // Update the Logo.tsx component to use the new resized logo
    const logoComponentPath = path.join(__dirname, '../components/Logo.tsx');
    let logoComponent = fs.readFileSync(logoComponentPath, 'utf8');
    
    // Replace the image source
    logoComponent = logoComponent.replace(
      /src="\/images\/[^"]+"/,
      'src="/images/logo-resized.png"'
    );
    
    // Write the updated component back to the file
    fs.writeFileSync(logoComponentPath, logoComponent);
    console.log('Logo component updated to use the resized image');
  })
  .catch(err => {
    console.error('Error resizing image:', err);
  });
