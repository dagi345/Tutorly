/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }, // wildcard allows any https host
    ],
  },
};

module.exports = nextConfig;