/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  generateEtags: false,
  poweredByHeader: false,
  transpilePackages: ['@ryzenpanel/shared'],
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
