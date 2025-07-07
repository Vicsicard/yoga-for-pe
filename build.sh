#!/bin/bash

# Install dependencies explicitly
npm install
npm install tailwindcss postcss autoprefixer --no-save

# Create Tailwind config if it doesn't exist
if [ ! -f "tailwind.config.js" ]; then
  npx tailwindcss init -p
fi

# Build the application
npm run build
