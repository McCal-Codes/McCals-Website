const path = require('path');
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // ESLint: keep ignored during builds until root flat config conflict is resolved
  eslint: { ignoreDuringBuilds: true },
  // Silence workspace root warning due to nested app structure
  outputFileTracingRoot: path.join(__dirname, '..', '..'),
  // Fix: Windows throws EISDIR instead of EINVAL on readlink for regular files.
  // Disabling symlink resolution prevents webpack from calling readlink entirely.
  webpack: (config) => {
    config.resolve.symlinks = false;
    return config;
  },
};

module.exports = nextConfig;
