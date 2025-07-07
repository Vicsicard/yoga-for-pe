/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  // Explicitly set which routes should NOT use Edge Runtime
  experimental: {
    runtime: 'nodejs',
    serverComponentsExternalPackages: ['mongoose', 'bcryptjs'],
  },
}

module.exports = nextConfig
