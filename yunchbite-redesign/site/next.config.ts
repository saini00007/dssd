import type { NextConfig } from "next";

/**
 * Two builds from one codebase:
 * - default: the real site (server features: Proxy for real 404s, /api/contact, image optimization).
 * - STATIC_EXPORT=1: a static preview for GitHub Pages (.github/workflows/yunchbite-pages.yml). Pages only serves
 *   files, so the workflow removes the server features before building (src/proxy.ts, src/app/api) and the metadata
 *   routes a preview doesn't need (sitemap, robots, manifest); images are served as-is, the site lives under
 *   NEXT_PUBLIC_BASE_PATH (e.g. "/dssd" for saini00007.github.io/dssd), and every page is noindex (see layout.tsx).
 */
const isStaticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // Lets parallel dev servers run from the same folder (e.g. NEXT_DIST_DIR=.next-b1 next dev -p 3101).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Cache Components implies Partial Prerendering, which static export cannot do; the Pages preview renders every
  // page fully at build (scripts/prepare-static-export.mjs strips the config that depends on it).
  cacheComponents: !isStaticExport,
  partialPrefetching: !isStaticExport,
  images: {
    formats: ["image/avif", "image/webp"],
    ...(isStaticExport ? { unoptimized: true } : {}),
  },
  ...(isStaticExport ? { output: "export" as const, trailingSlash: true, basePath } : {}),
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
