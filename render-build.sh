#!/bin/bash

# Exit on error
set -e

# Debug info
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Clean install with TailwindCSS
echo "Installing dependencies with TailwindCSS..."
npm install --save tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.17

# Create TailwindCSS config files manually
echo "Creating TailwindCSS configuration files..."

# Create postcss.config.js
cat > postcss.config.js << 'EOL'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOL

# Create tailwind.config.js if it doesn't exist
cat > tailwind.config.js << 'EOL'
/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOL

# Create global.css with Tailwind directives
cat > app/globals.css << 'EOL'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOL

# Force node runtime for Next.js
echo "Creating Node.js runtime configuration..."
echo "export const runtime = 'nodejs';" > app/runtime.js

# Increase memory and build
echo "Building with increased memory allocation..."
NODE_OPTIONS="--max-old-space-size=4096" npm run build
