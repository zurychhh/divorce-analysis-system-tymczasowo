/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config) {
    return config;
  },
  experimental: {
    scrollRestoration: true,
  },
};

export default nextConfig;
