// Heuristic role guessing for harvested assets. Pure function of the manifest entry.
// Roles are GUESSES to speed up human triage; evidence is filename, alt text, DOM context and size.
const KW = {
  logo: /(^|[^a-z])(logo|wordmark|brandmark|logotype|lockup)([^a-z]|$)/i,
  mascot: /(mascot|character|mascott|avatar|buddy|yunchi|animated)/i,
  pack: /(pack|pouch|packet|sachet|jar|carton|product|makhana|net[-_ ]?wt|\b\d{2,4}\s?-?g\b|\d{2,4}g\b)/i,
  hero: /(hero|banner|cover|masthead|splash)/i,
  bg: /(^|[^a-z])(bg|background|pattern|texture|wallpaper)([^a-z]|$)/i,
  icon: /(^|[^a-z])(icon|ico|glyph|symbol|badge)([^a-z]|$)/i,
};
const PRODUCT_PATH = /^\/(products?|shop|store|collections?)\/[^/]/i;

export function guessRoles(e) {
  const roles = new Set();
  const add = (r) => roles.add(r);
  const base = (e.file || '').split('/').pop().toLowerCase();
  const orig = (() => { try { return decodeURIComponent(new URL(e.originalUrl || '', 'http://x').pathname.split('/').pop() || ''); } catch { return ''; } })().toLowerCase();
  const nameTxt = `${base} ${orig}`;
  const alts = (e.alts || []).join(' ').toLowerCase();
  const U = e.usages || [];
  const hows = new Set(U.map((u) => u.how));
  const clsTxt = U.map((u) => `${u.cls || ''} ${u.id || ''} ${u.parentCls || ''}`).join(' ').toLowerCase();
  const visual = ['images', 'svg', 'gif', 'icons'].includes(e.type);

  if (e.type === 'fonts') return ['font'];
  if (e.type === 'css') return ['stylesheet'];
  if (e.type === 'lottie') return ['animation'];
  if (e.type === '3d') return ['3d-model'];
  if (e.type === 'audio') return ['audio'];
  if (e.type === 'video') {
    add('video');
    if (U.some((u) => u.autoplay && (u.docTop ?? 9999) < 1400)) add('hero-video');
    if (U.some((u) => u.autoplay && u.loop)) add('background-video');
    return [...roles];
  }

  if (hows.has('favicon')) add('favicon');
  if (hows.has('apple-touch-icon')) add('app-icon');
  if (hows.has('og-image')) add('og-image');
  if (hows.has('video-poster')) add('video-poster');
  if (e.type === 'icons' && !roles.size) add('icon');

  const logoByCtx = U.some((u) => (u.how === 'inline-svg' || u.how === 'img') && (u.inHeader || u.inNav) && u.link && (() => { try { return new URL(u.link).pathname === '/'; } catch { return false; } })());
  if (KW.logo.test(nameTxt) || KW.logo.test(alts) || KW.logo.test(clsTxt) || logoByCtx) add('logo');

  if (KW.mascot.test(nameTxt) || KW.mascot.test(alts)) add('mascot');
  if (e.type === 'gif' || e.animated) { add('animation'); }

  const productCtx = U.some((u) => /^(img|img-srcset|picture-source|img-lazy)$/.test(u.how) && (
    (PRODUCT_PATH.test(u.page || '') && u.inMain && Math.max(u.w || 0, u.h || 0) >= 200) ||
    (u.link && (() => { try { return PRODUCT_PATH.test(new URL(u.link).pathname); } catch { return false; } })())
  ));
  if (!roles.has('logo') && !roles.has('favicon') && !roles.has('og-image') && visual &&
      (KW.pack.test(nameTxt) || KW.pack.test(alts) || productCtx)) add('product-pack');
  if (roles.has('og-image') && (KW.pack.test(nameTxt) || KW.pack.test(alts) || productCtx)) add('product-pack');

  const heroCtx = U.some((u) => /^(img|img-srcset|picture-source|css-bg|img-lazy)$/.test(u.how) && !u.inHeader && !u.inFooter && (u.docTop ?? 9999) < 900 && (u.w || 0) >= 860 && (e.width || 0) >= 800);
  if (visual && !roles.has('logo') && (KW.hero.test(nameTxt) || KW.hero.test(clsTxt) || heroCtx)) add('hero');

  if (visual && (hows.has('css-bg') || hows.has('css-url') || KW.bg.test(nameTxt)) && !roles.has('hero')) add('background');

  const dim = Math.max(e.width || 0, e.height || 0);
  if (visual && !roles.has('logo') && !roles.has('favicon') && !roles.has('app-icon') &&
      (KW.icon.test(nameTxt) || KW.icon.test(alts) || (dim > 0 && dim <= 128 && !roles.has('product-pack')))) add('icon');

  if (e.type === 'gif' && !roles.has('mascot') && ![...roles].some((r) => ['logo', 'icon', 'product-pack', 'hero', 'background'].includes(r))) add('mascot');

  if (!roles.size || (roles.size === 1 && roles.has('animation'))) add('content-image');
  return [...roles];
}
