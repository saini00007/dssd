// URL helpers: host aliasing, normalisation, slugs, page-vs-file detection.
import crypto from 'node:crypto';

const TRACKING = /^(utm_.*|fbclid|gclid|msclkid|dclid|yclid|mc_cid|mc_eid|_ga|_gl|igshid|ref_src|_hsenc|_hsmi|hsa_.*|vero_.*|mkt_tok)$/i;

const NON_HTML_EXT = new Set(`pdf zip rar gz tar 7z dmg exe apk
  png jpg jpeg gif webp avif svg ico bmp tif tiff heic
  mp4 webm mov m4v avi mkv mp3 wav ogg m4a
  css js mjs map json xml txt csv rss atom
  woff woff2 ttf otf eot glb gltf usdz riv lottie
  doc docx xls xlsx ppt pptx`.split(/\s+/));

export const shortHash = (s, n = 8) => crypto.createHash('sha1').update(String(s)).digest('hex').slice(0, n);

const stripWww = (h) => h.toLowerCase().replace(/^www\./, '');

/** Parses `--hosts` and the start URL into a matcher. */
export function makeSite(startUrl, hostsArg = '') {
  const start = new URL(startUrl);
  const canonicalHost = start.host.toLowerCase();
  const origin = `${start.protocol}//${start.host}`;
  const aliases = new Set(
    String(hostsArg).split(',').map((h) => h.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')).filter(Boolean),
  );
  const known = [canonicalHost, ...aliases];
  const matches = (u) => {
    const host = u.host.toLowerCase();
    return known.some((k) => k === host || k === u.hostname.toLowerCase() || stripWww(k) === stripWww(host));
  };
  return {
    origin, canonicalHost, aliases: [...aliases],
    isSameSite: matches,
    /** same site but NOT the canonical host -> a link the client should fix */
    isAliasHost: (u) => matches(u) && u.host.toLowerCase() !== canonicalHost,
    /** Map any alias host onto canonical origin. */
    toCanonical(u) {
      const c = new URL(u.href);
      if (matches(c)) { c.protocol = start.protocol; c.host = start.host; }
      return c;
    },
  };
}

/** Normalised absolute URL string for crawling/dedupe, or null if not a crawlable page. */
export function normalizePage(raw, site, base) {
  let u;
  try { u = new URL(raw, base || site.origin); } catch { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;
  if (!site.isSameSite(u)) return null;
  u = site.toCanonical(u);
  u.hash = '';
  const keep = [...u.searchParams.entries()].filter(([k]) => !TRACKING.test(k)).sort(([a], [b]) => a.localeCompare(b));
  u.search = '';
  for (const [k, v] of keep) u.searchParams.append(k, v);
  let p = u.pathname.replace(/\/{2,}/g, '/').replace(/\/index\.html?$/i, '/');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  u.pathname = p;
  const ext = /\.([a-z0-9]{1,6})$/i.exec(p)?.[1]?.toLowerCase();
  if (ext && NON_HTML_EXT.has(ext)) return null;
  if (/^\/(_next|_vercel|api)\//.test(p)) return null;
  return u.href;
}

export const pathOf = (url) => { const u = new URL(url); return u.pathname + u.search; };

export function slugForUrl(url) {
  const u = new URL(url);
  let s = u.pathname.replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').toLowerCase();
  if (!s) s = 'home';
  if (u.search) s += `-q-${shortHash(u.search, 6)}`;
  return s.slice(0, 120);
}

/** Decode a Next.js / Vercel image-optimiser URL -> { original (absolute), width } or null. */
export function decodeOptimizerUrl(raw, base) {
  let u;
  try { u = new URL(raw, base); } catch { return null; }
  if (!/\/(_next|_vercel)\/image\/?$/.test(u.pathname)) return null;
  const target = u.searchParams.get('url');
  if (!target) return null;
  try { return { original: new URL(target, u.origin).href, width: Number(u.searchParams.get('w')) || 0 }; } catch { return null; }
}

/** home | category | product | blog | static, from the path and (preferably) JSON-LD @type. */
export function guessPageType(pathname, ldTypes = []) {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p === '/') return 'home';
  const t = ldTypes.map((x) => String(x).toLowerCase());
  if (t.includes('product')) return 'product';
  if (t.some((x) => /article|blogposting|newsarticle/.test(x))) return 'blog';
  if (t.some((x) => /collectionpage|itemlist/.test(x))) return 'category';
  const seg = p.split('/').filter(Boolean);
  if (/^(blog|blogs|journal|news|stories|articles|recipes)$/i.test(seg[0])) return 'blog';
  if (/^(products?|shop|store|collections?|categories|category|catergries|catalog(ue)?|snacks|range)$/i.test(seg[0])) return seg.length >= 3 || (seg.length === 2 && /^(product|p)$/i.test(seg[0]) ) ? 'product' : 'category';
  return 'static';
}
