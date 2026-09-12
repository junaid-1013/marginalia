/** @type {import('next').NextConfig} */
const nextConfig = {
  // lets a second server or a test build use its own folder, so it never overwrites the files of a running `next dev`
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    // pdf-parse bundles pdf.js, keep it as a plain node require on the server
    serverComponentsExternalPackages: ["pdf-parse"],
  },
};

module.exports = nextConfig;
