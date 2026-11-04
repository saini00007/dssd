// Regression test: harvest the local mini-site fixture and assert the outputs.
// Run: node harvest/test.mjs   (from tools/)  -> exit 0 on success, 1 on failure.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startTestServer } from './test-server.mjs';
import { run, parseCli } from './harvest.mjs';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '_out');
let failures = 0;
let checks = 0;
const ok = (cond, msg, extra) => {
  checks++;
  if (cond) console.log(`  ok   ${msg}`);
  else { failures++; console.log(`  FAIL ${msg}${extra !== undefined ? `  -> ${JSON.stringify(extra)}` : ''}`); }
};
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(OUT, p), 'utf8'));
const read = (p) => fs.readFileSync(path.join(OUT, p), 'utf8');

fs.rmSync(OUT, { recursive: true, force: true });
const server = await startTestServer();
const hosts = `localhost:${server.port}`;
const quiet = () => {};
const args = (extra = []) => parseCli([server.url, '--hosts', hosts, '--out', OUT, '--delay', '50', ...extra]);

try {
  console.log(`fixture at ${server.url} (alias host ${server.altOrigin})`);
  const r1 = await run(args(), (m) => console.log(m));

  console.log('\nPages');
  const paths = r1.pages.map((p) => p.path);
  for (const p of ['/', '/about', '/products', '/products/makhana', '/products/makhana/peri-peri-makhana-50g', '/blog/some-post', '/contact', '/careers', '/landing-offer', '/old-page']) {
    ok(paths.includes(p), `page discovered: ${p}`);
  }
  const row = (p) => r1.pages.find((x) => x.path === p);
  ok(row('/landing-offer')?.inSitemap && row('/landing-offer').depth === null, 'sitemap-only page is flagged orphan', row('/landing-offer'));
  ok(row('/careers')?.discoveredFrom.includes('crawl') && !row('/careers').inSitemap, 'crawl-only page discovered via crawl');
  ok(row('/products')?.discoveredFrom.includes('sitemap') && row('/products').linkedFrom.length > 0, 'sitemap + inbound links recorded');
  ok(!paths.some((p) => p.includes('utm_') || p.includes('#')), 'tracking params / hash stripped');
  ok(paths.filter((p) => p.startsWith('/blog')).length === 1, 'blog link with utm/hash deduped with sitemap URL');
  ok(row('/old-page')?.status === 404, '404 page recorded');
  ok(row('/products/makhana/peri-peri-makhana-50g')?.type === 'product' && row('/products/makhana')?.type === 'category' && row('/')?.type === 'home' && row('/blog/some-post')?.type === 'blog', 'page type guesses');
  ok(r1.failed === 0, 'no page failed');

  console.log('\nCross-host links');
  const issues = read('issues.md');
  ok(issues.includes(`localhost:${server.port}`) && /Links pointing to another host/.test(issues), 'alias-host links reported in issues.md');
  ok(!paths.some((p) => /localhost/.test(p)) && r1.pages.every((p) => p.url.startsWith(server.url)), 'all pages mapped to canonical host');
  ok(/Broken pages[^\n]*\(1\)/.test(issues) && issues.includes('/old-page'), 'broken link /old-page reported');
  ok(/canonical-other-host/.test(issues), 'canonical on alias host reported');
  ok(/Duplicate titles \(1\)/.test(issues), 'duplicate titles reported');
  ok(/missing the alt attribute \(1\)/.test(issues), 'missing alt reported');
  ok(/Console errors \([1-9]/.test(issues), 'console errors reported (404 page resource)');

  console.log('\nAssets / manifest');
  const man = readJson('assets/manifest.json');
  const by = (re) => man.filter((e) => re.test(e.file) || e.sourceUrls.some((u) => re.test(u)));
  const one = (re) => by(re)[0];
  const lazy = one(/lazy-below-fold/);
  ok(lazy && lazy.pages.includes('/'), 'lazy (IntersectionObserver) image captured');
  const peri = by(/pack-peri/);
  ok(peri.length === 1, 'next/image original saved once (deduped)', peri.map((e) => e.file));
  ok(peri[0]?.width === 1200 && peri[0].mime === 'image/png', 'next/image original is full-res PNG, not the webp variant', [peri[0]?.width, peri[0]?.mime]);
  ok(peri[0]?.sourceUrls.filter((u) => u.includes('/_next/image')).length >= 3, 'optimiser variant URLs recorded in sourceUrls', peri[0]?.sourceUrls);
  ok(peri[0]?.originalUrl === `${server.url}/images/pack-peri.png`, 'originalUrl is decoded source', peri[0]?.originalUrl);
  ok(!man.some((e) => e.mime === 'image/webp' && /pack/.test(e.file)), 'no optimiser webp variants saved as files');
  ok(peri[0]?.pages.length >= 3, 'pack used on several pages tracked', peri[0]?.pages);
  ok(peri[0]?.roles.includes('product-pack'), 'pack role = product-pack', peri[0]?.roles);
  ok(one(/promo\.webp/) && one(/promo\.avif/) && one(/promo\.jpg/), '<picture> webp + avif + jpg sources all saved');
  const bg = one(/bg-pattern/);
  ok(bg && bg.roles.includes('background'), 'CSS background image captured with role background', bg?.roles);
  ok(one(/hover-only/), 'CSS url() never requested by the page (hover state) still downloaded');
  const logo = man.find((e) => e.type === 'svg' && e.usages.some((u) => u.how === 'inline-svg'));
  ok(logo && logo.roles.includes('logo') && /^<\?xml/.test(fs.readFileSync(path.join(OUT, 'assets', logo.file), 'utf8')), 'inline SVG logo saved as .svg with role logo', logo?.roles);
  const wm = one(/wordmark\.svg/);
  ok(wm && wm.type === 'svg' && wm.roles.includes('logo'), '<img src=.svg> saved (type svg, role logo)', wm?.roles);
  const gif = one(/mascot-dance\.gif/);
  ok(gif && gif.type === 'gif' && gif.animated && gif.frames === 24 && Math.abs(gif.durationSec - 2) < 0.1 && gif.fps > 10, 'GIF with frames/duration/fps', gif && [gif.frames, gif.durationSec, gif.fps]);
  ok(gif?.roles.includes('mascot'), 'GIF role mascot', gif?.roles);
  const vid = one(/hero-loop\.mp4/);
  ok(vid && vid.type === 'video' && vid.bytes > 100000 && Math.abs(vid.durationSec - 3) < 0.3 && vid.width === 640, 'video saved in FULL (not a range chunk) with metadata', vid && [vid.bytes, vid.durationSec]);
  ok(vid?.roles.includes('hero-video'), 'video role hero-video', vid?.roles);
  const poster = one(/hero-poster/);
  ok(poster && poster.roles.includes('video-poster'), 'video poster captured', poster?.roles);
  const font = man.find((e) => e.type === 'fonts');
  ok(font && font.mime === 'font/woff2' && font.fontFamily === 'YB Display' && font.fontWeight === '600', 'woff2 font with @font-face family/weight', font && [font.file, font.fontFamily, font.fontWeight]);
  ok(font?.file === 'fonts/yb-display.woff2', 'Next.js hashed font filename cleaned', font?.file);
  const fav = man.find((e) => e.roles.includes('favicon'));
  ok(fav && fav.type === 'icons', 'favicon in icons/', fav?.file);
  ok(man.some((e) => e.roles.includes('app-icon')), 'apple-touch-icon present');
  const og = man.find((e) => e.roles.includes('og-image') && /og\.jpg/.test(e.file));
  ok(og, 'og:image present with role og-image');
  ok(man.some((e) => e.type === 'lottie' && /loader/.test(e.file)), 'Lottie JSON detected by shape');
  ok(!man.some((e) => /api\/hello/.test(e.sourceUrls.join())), 'non-lottie JSON not saved');
  const alpha = one(/pack-classic/); const opaque = one(/banner-opaque/);
  ok(peri[0]?.hasAlpha === true && alpha?.hasAlpha === true, 'PNG alpha detected true for alpha images');
  ok(opaque?.hasAlpha === false && one(/hero\.jpg/)?.hasAlpha === false, 'opaque PNG/JPG alpha false', opaque?.hasAlpha);
  ok(peri[0]?.hasTransparency === true, 'actual transparent pixels verified');
  ok(man.every((e) => /^[0-9a-f]{64}$/.test(e.sha256)) && new Set(man.map((e) => e.sha256)).size === man.length, 'sha256 unique per manifest entry');
  ok(man.every((e) => fs.existsSync(path.join(OUT, 'assets', e.file))), 'every manifest file exists on disk');
  ok(fs.existsSync(path.join(OUT, 'assets/manifest.csv')) && read('assets/manifest.csv').split('\n').length > man.length, 'manifest.csv written');
  ok(fs.existsSync(path.join(OUT, 'assets/contact-sheet-1.jpg')) && fs.statSync(path.join(OUT, 'assets/contact-sheet-1.jpg')).size > 20000, 'contact sheet written');

  console.log('\nPer-page content');
  const home = read('pages/home/content.md');
  const order = ['Crunch Without the Guilt', 'Our Makhana Range', 'Peri Peri', 'Why Yunch Bite', 'Snacks that love you back', 'Fresh from the farm', 'Made with love in India'];
  const idx = order.map((s) => home.indexOf(s));
  ok(idx.every((i) => i >= 0) && idx.every((v, i) => i === 0 || v > idx[i - 1]), 'home content.md has headings/text in DOM order', idx);
  ok(/^# Crunch Without the Guilt$/m.test(home) && /^## Our Makhana Range$/m.test(home) && /^- High protein$/m.test(home) && /\*\*bold flavours\*\*/.test(home), 'markdown structure (h1/h2/list/bold)');
  ok(/\[CTA: Shop Makhana\]/.test(home) && /\[Button: Join the waitlist\]/.test(home), 'CTAs and buttons rendered');
  ok(/!\[Yunchi the dancing mascot\]/.test(home) && !home.includes('_next/image'), 'image alts included, optimiser URLs decoded');
  ok(/Snacks that love you back/.test(home), 'client-rendered text captured');
  const contact = read('pages/contact/content.md');
  ok(/# Contact Us/.test(contact) && /Send message/.test(contact), 'client-rendered-only page (/contact) captured');
  const prod = read('pages/products-makhana-peri-peri-makhana-50g/content.md');
  ok(['Peri Peri Makhana 50g', 'Description', 'Net wt. 50g', 'Add to cart'].every((s) => prod.includes(s)), 'product page content');

  console.log('\nmeta.json');
  const pm = readJson('pages/products-makhana-peri-peri-makhana-50g/meta.json');
  ok(pm.jsonLd?.[0]?.['@type'] === 'Product' && pm.jsonLd[0].offers.price === '99', 'JSON-LD Product parsed', pm.jsonLd);
  ok(pm.title === 'Peri Peri Makhana 50g | Yunch Bite' && pm.description && pm.h1[0] === 'Peri Peri Makhana 50g', 'title/description/h1');
  ok(pm.og['og:image']?.endsWith('/images/pack-peri.png') && pm.canonical.includes('localhost'), 'og tags + canonical captured');
  ok(pm.images.some((i) => i.rendered === '600x600' && i.alt === 'Peri Peri Makhana 50g pack front' && /pack-peri/.test(i.asset)), 'images list: alt + rendered size + asset', pm.images);
  ok(pm.links.internal.length > 3 && pm.links.otherHosts.length > 0 && pm.links.external.some((l) => l.href.startsWith('https://example.com')), 'links classified (internal / other-host / external)');
  ok(pm.links.contacts.some((c) => c.href.startsWith('mailto:')), 'mailto links separated');
  for (const slug of ['home', 'about', 'products-makhana-peri-peri-makhana-50g']) {
    for (const f of ['screenshot-desktop.jpg', 'screenshot-mobile.jpg', 'dom.html', 'content.md', 'meta.json']) {
      if (!fs.existsSync(path.join(OUT, 'pages', slug, f)) || fs.statSync(path.join(OUT, 'pages', slug, f)).size < 200) ok(false, `${slug}/${f} exists`);
    }
  }
  ok(fs.statSync(path.join(OUT, 'pages/home/screenshot-desktop.jpg')).size > 10000, 'screenshots exist');
  for (const f of ['sitemap.json', 'sitemap.md', 'issues.md', 'summary.md']) ok(fs.existsSync(path.join(OUT, f)), `${f} written`);

  console.log('\nResume');
  const manBefore = JSON.stringify(readJson('assets/manifest.json').map((e) => [e.file, e.sha256]));
  const hitsBefore = server.hits.filter((h) => !h.path.startsWith('/sitemap') && h.path !== '/robots.txt').length;
  const r2 = await run(args(), quiet);
  ok(r2.harvested === 0 && r2.skipped === r1.harvested, 'second run skips all done pages', [r2.harvested, r2.skipped]);
  ok(r2.pages.length === r1.pages.length, 'second run still discovers/reports every page via stored links');
  ok(server.hits.filter((h) => !h.path.startsWith('/sitemap') && h.path !== '/robots.txt').length === hitsBefore, 'second run made no page/asset requests');
  ok(JSON.stringify(readJson('assets/manifest.json').map((e) => [e.file, e.sha256])) === manBefore, 'manifest unchanged after resume');

  // --paths + --no-crawl + --force
  const r3 = await run(args(['--paths', '/products', '--no-crawl', '--force', '--no-screens', '--no-contact']), quiet);
  ok(r3.harvested >= 8 && r3.skipped === 0, '--force re-harvests sitemap pages (no-crawl skips careers/old-page)', [r3.harvested, r3.skipped]);
} catch (e) {
  failures++;
  console.error('TEST CRASHED', e);
} finally {
  await server.close();
}
console.log(`\n${checks - failures}/${checks} checks passed${failures ? `, ${failures} FAILED` : ''}`);
process.exit(failures ? 1 : 0);
