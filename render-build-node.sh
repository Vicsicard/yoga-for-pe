#!/bin/bash

# Exit on error
set -e

# Debug info
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Clean everything to start fresh
echo "Cleaning existing build..."
rm -rf node_modules
rm -rf .next
rm -rf package-lock.json

# Create a simple next.config.js that completely disables bundling of mongoose
echo "Creating simplified Next.js config..."
cat > next.config.js << 'EOL'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  images: {
    domains: ['vimeo.com', 'player.vimeo.com', 'i.vimeocdn.com'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle mongoose on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        mongoose: false,
        mongodb: false,
        'mongodb-client-encryption': false,
        aws4: false,
        'mongoose-legacy-pluralize': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
EOL

# Create an empty placeholder file to mock mongoose in client bundles
echo "Creating mongoose mock file..."
mkdir -p lib/mock
cat > lib/mock/mongoose-mock.js << 'EOL'
// This is a mock module to prevent mongoose from being imported on the client
export const mongoose = {
  connect: () => Promise.resolve(),
  model: () => ({}),
  Schema: function() { return {} },
};
export default mongoose;
EOL

# Force Node.js runtime in key files
echo "Forcing Node.js runtime in API routes..."
find app/api -type d -exec sh -c 'echo "export const runtime = \"nodejs\";" > {}/config.js' \;

# Configure TailwindCSS
echo "Creating TailwindCSS configuration..."
cat > tailwind.config.js << 'EOL'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOL

# Configure PostCSS
echo "Creating PostCSS configuration..."
cat > postcss.config.js << 'EOL'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOL

# Create global.css if needed
if [ ! -f app/globals.css ]; then
  echo "Creating global CSS file with Tailwind directives..."
  cat > app/globals.css << 'EOL'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOL
fi

# Clean install dependencies
echo "Installing dependencies without package lock..."
npm install --no-package-lock

# Build with increased memory allocation
echo "Building with increased memory allocation..."
NODE_OPTIONS='--max_old_space_size=4096' NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production npm run build
