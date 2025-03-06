/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    scrollRestoration: true,
  },
  // This explicitly tells Next.js where to find the source files
  distDir: '.next',
  // Use src directory for app router
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
