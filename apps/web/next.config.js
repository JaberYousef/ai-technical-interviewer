/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared': require('path').resolve(__dirname, '../../packages/shared/src'),
    };
    return config;
  },
};

module.exports = nextConfig;
