const path = require('path');
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // ESLint: keep ignored during builds until root flat config conflict is resolved
  eslint: { ignoreDuringBuilds: true },
  // Silence workspace root warning due to nested app structure
  outputFileTracingRoot: path.join(__dirname, '..', '..'),
};

module.exports = nextConfig;
