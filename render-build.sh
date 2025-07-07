#!/bin/bash

# Exit on error
set -e

# Debug info
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install TailwindCSS first
echo "Installing TailwindCSS..."
npm install --save tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.17

# Now install all dependencies
echo "Installing all dependencies..."
npm install

# Force node runtime for Next.js
echo "export const runtime = 'nodejs';" > middleware.js

# Build with extra memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
