/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Add stale times configuration for client-side router cache
  experimental: {
    staleTimes: {
      dynamic: 30 * 60, // 30 minutes for dynamic content
      static: 24 * 60 * 60, // 24 hours for static content
    },
  },
};

export default nextConfig;
