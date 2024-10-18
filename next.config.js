/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cxubggguaz3oakrz.public.blob.vercel-storage.com'],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
}

module.exports = nextConfig
