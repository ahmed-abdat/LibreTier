/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: Tier items use standard <img> tags with Base64 data URLs
  // No remote patterns needed since we don't use next/image for external images
  // Add stale times configuration for client-side router cache
  experimental: {
    staleTimes: {
      dynamic: 30 * 60, // 30 minutes for dynamic content
      static: 24 * 60 * 60, // 24 hours for static content
    },
  },
};

export default nextConfig;
