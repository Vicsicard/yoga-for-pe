#!/bin/bash

# Exit on error
set -e

# Debug info
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Clean node_modules to start fresh
echo "Cleaning existing node_modules..."
rm -rf node_modules
rm -rf .next

# Create runtime config file to globally set Node.js runtime
echo "Creating Next.js runtime config files..."

# Create runtime file for middleware
echo "export const runtime = 'nodejs';" > middleware.config.js

# Create config files for all API routes
mkdir -p app/api/config
echo "export const runtime = 'nodejs';\nexport const dynamic = 'force-dynamic';" > app/api/config.js

# Ensure mongoose doesn't get bundled with client code
echo "Creating browser mock for mongoose..."
cat > db-mock.js << 'EOL'
// This is a mock file used as an alias for mongoose/mongodb in client bundles
// It prevents Edge Runtime errors by providing empty implementations

// Mock mongoose exports
module.exports = {
  // Mock basic mongoose functionality with empty functions
  connect: () => Promise.resolve(),
  model: () => ({}),
  Schema: function() { return {} },
  connection: {
    on: () => {},
    once: () => {},
  },
  
  // Mock MongoDB functionality
  MongoClient: function() {
    return {
      connect: () => Promise.resolve({
        db: () => ({})
      }),
      close: () => Promise.resolve(),
    };
  },
  
  // Additional mongoose properties that might be referenced
  models: {},
  modelNames: () => [],
  
  // Add any other functions that might be called
  disconnect: () => Promise.resolve(),
  set: () => {},
};
EOL

# Create required configuration files
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

# Create tailwind.config.js
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

# Create runtime config files
echo "Creating Node.js runtime configurations..."
mkdir -p app/api
echo "export const runtime = 'nodejs';" > app/api/runtime.js
echo "export const runtime = 'nodejs';" > middleware.js

# Force mongoose to be excluded from client bundles
echo "Creating mongoose exclusion for client bundles..."
echo "module.exports = { mongoose: false }" > app/mongoose-browser-exclude.js

# Install TailwindCSS and its dependencies first
echo "Installing TailwindCSS explicitly..."
npm install tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.17

# Install all dependencies with clean install
echo "Installing all dependencies..."
npm ci || npm install

# Create global.css with Tailwind directives if it doesn't exist
if [ ! -f app/globals.css ]; then
  echo "Creating globals.css with Tailwind directives..."
  cat > app/globals.css << 'EOL'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOL
fi

# Build with increased memory
echo "Building with increased memory allocation..."
NODE_OPTIONS="--max-old-space-size=4096" NODE_ENV=production npm run build

echo "Build completed successfully!"

