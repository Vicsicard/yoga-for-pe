#!/usr/bin/env bash

# Exit on error
set -e

# Debug info
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Remove existing node_modules (if any)
rm -rf node_modules

# Install ALL dependencies
npm install

# Explicitly install tailwindcss and related packages
npm install tailwindcss@3.4.1 postcss autoprefixer --save

# Create tailwind config if needed
echo "Creating Tailwind configuration..."
touch postcss.config.js
cat > postcss.config.js << EOL
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOL

touch tailwind.config.js
cat > tailwind.config.js << EOL
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOL

# Create custom edge runtime config
echo "Creating Edge Runtime compatibility configurations..."
touch app/edge-runtime-config.js
cat > app/edge-runtime-config.js << EOL
// Explicitly set to use Node.js runtime instead of Edge Runtime
export const runtime = 'nodejs';
EOL

# Copy to authentication routes
mkdir -p app/sign-in
mkdir -p app/sign-up
cp app/edge-runtime-config.js app/sign-in/config.js
cp app/edge-runtime-config.js app/sign-up/config.js

# Force disable Edge Runtime for this application
echo "Configuring Next.js to not use Edge Runtime..."
export NODE_OPTIONS="--max-old-space-size=4096"
echo "Building application..."
npm run build

echo "Build completed successfully!"
