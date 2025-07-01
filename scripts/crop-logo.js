const sharp = require('sharp');
const path = require('path');

async function cropLogo() {
  try {
    const inputPath = path.join(__dirname, '..', 'public', 'images', 'Logo S No bg green- use.png');
    const outputPath = path.join(__dirname, '..', 'public', 'images', 'logo-cropped.png');
    
    // Get image info first
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    console.log('Original image dimensions:', metadata.width, 'x', metadata.height);
    
    // Auto-trim the image to remove transparent/white borders
    const trimmed = await image
      .trim({
        background: { r: 255, g: 255, b: 255, alpha: 0 }, // Remove white and transparent
        threshold: 10 // Tolerance for near-white pixels
      })
      .png()
      .toBuffer();
    
    // Save the cropped image
    await sharp(trimmed).toFile(outputPath);
    
    // Get new dimensions
    const croppedMetadata = await sharp(outputPath).metadata();
    console.log('Cropped image dimensions:', croppedMetadata.width, 'x', croppedMetadata.height);
    console.log('Logo cropped successfully! Saved as logo-cropped.png');
    
  } catch (error) {
    console.error('Error cropping logo:', error);
  }
}

cropLogo();
