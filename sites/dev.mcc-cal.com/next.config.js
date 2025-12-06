const path = require('path');
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  // Silence workspace root warning due to nested app structure
  outputFileTracingRoot: path.join(__dirname, '..', '..'),
};

module.exports = nextConfig;
