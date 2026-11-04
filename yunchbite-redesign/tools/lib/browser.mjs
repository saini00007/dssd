// Shared browser setup for every tool in this folder.
//
// Playwright is pre-installed globally in this environment and must NOT be
// re-installed (another version would not find the bundled Chromium). Global
// modules are not visible to ESM `import`, so we load it through createRequire.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const playwright = require('playwright');

export const { chromium, devices } = playwright;

/** Desktop capture viewport (common laptop size, matches most reference reviews). */
export const DESKTOP = {
  name: 'desktop',
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  isMobile: false,
  hasTouch: false,
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
};

/** Mobile capture profile. Chromium-based Android preset: most Indian traffic is Android Chrome. */
export const MOBILE = {
  name: 'mobile',
  ...devices['Pixel 7'],
};

/** Chromium flags: software WebGL so three.js / WebGL heroes render headless, autoplay for hero videos. */
export const LAUNCH_ARGS = [
  '--enable-unsafe-swiftshader',
  '--use-angle=swiftshader',
  '--ignore-gpu-blocklist',
  '--enable-webgl',
  '--autoplay-policy=no-user-gesture-required',
  '--hide-scrollbars',
  '--disable-blink-features=AutomationControlled',
];

export async function launch(opts = {}) {
  return chromium.launch({ headless: true, args: LAUNCH_ARGS, ...opts });
}

/**
 * Context options for a profile. `extra` is merged last, e.g. { recordVideo: { dir, size } }.
 * reducedMotion is forced to 'no-preference' so sites play their full motion.
 */
export function contextOptions(profile, extra = {}) {
  const { name, defaultBrowserType, ...pw } = profile;
  return {
    ...pw,
    reducedMotion: 'no-preference',
    colorScheme: 'light',
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
    ignoreHTTPSErrors: false,
    ...extra,
  };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Filesystem-safe slug for URLs and labels. */
export function slugify(input, max = 80) {
  return (
    String(input)
      .replace(/^https?:\/\//, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, max) || 'root'
  );
}
