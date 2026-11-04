#!/usr/bin/env node
// Prepares a CI checkout for the static GitHub Pages preview build (STATIC_EXPORT=1). Run it in CI only:
// it deletes and edits files in the working copy.
//
// Static export has no server, so the preview drops what needs one:
// - src/proxy.ts          real 404s for unknown slugs (Pages serves out/404.html instead)
// - src/app/api           the contact form endpoint (forms show their error state in the preview)
// - sitemap/robots/manifest metadata routes (not needed for a noindex preview)
// - `export const instant = false` route config: it requires Cache Components, which static export cannot use
//   (Cache Components implies Partial Prerendering); next.config.ts turns Cache Components off for the export.
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rel = (p) => join(root, p);

for (const p of ["src/proxy.ts", "src/app/api", "src/app/sitemap.ts", "src/app/robots.ts", "src/app/manifest.ts"]) {
  if (existsSync(rel(p))) {
    rmSync(rel(p), { recursive: true, force: true });
    console.log(`removed ${p}`);
  }
}

for (const p of ["src/app/products/[slug]/page.tsx", "src/app/categories/[category]/page.tsx", "src/app/articles/[slug]/page.tsx"]) {
  const file = rel(p);
  const src = readFileSync(file, "utf8");
  const out = src.replace(/^export const instant = false;?\s*$/m, "");
  if (out !== src) {
    writeFileSync(file, out);
    console.log(`removed instant config from ${p}`);
  }
}
