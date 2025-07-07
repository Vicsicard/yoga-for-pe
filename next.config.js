/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Completely disable Edge Runtime
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'bcryptjs'],
    disableOptimizedLoading: true,
    appDocumentPreloading: false,
  },
  // Disable Edge Runtime for all routes
  // This ensures all API routes use Node.js runtime
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    domains: ['vimeo.com', 'player.vimeo.com', 'i.vimeocdn.com'],
  },
  // Configure webpack to prevent Mongoose from being included in client bundles
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle mongoose on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        mongoose: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
