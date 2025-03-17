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
}

module.exports = nextConfig
