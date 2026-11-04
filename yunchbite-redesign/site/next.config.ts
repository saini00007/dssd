import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets parallel dev servers run from the same folder (e.g. NEXT_DIST_DIR=.next-b1 next dev -p 3101).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
