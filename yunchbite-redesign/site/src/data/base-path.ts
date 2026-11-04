/**
 * Path prefix for files in /public. Empty for the real site (yunchbite.com); set to "/dssd" for the GitHub Pages
 * preview build (project pages live under /<repo>/). next/link and the router add `basePath` themselves; plain
 * `<img src>` and `next/image` do not, so every public asset path in src/data goes through `withBase`.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const withBase = (path: string): string => (path.startsWith("/") && !path.startsWith("//") ? `${BASE_PATH}${path}` : path);
