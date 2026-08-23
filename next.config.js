/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // pdf-parse bundles pdf.js, keep it as a plain node require on the server
    serverComponentsExternalPackages: ["pdf-parse"],
  },
};

module.exports = nextConfig;
