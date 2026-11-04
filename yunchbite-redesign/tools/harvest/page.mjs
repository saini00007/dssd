// Per-page harvesting: render in Playwright, scroll, capture network + DOM assets, write content/meta/screenshots.
import fs from 'node:fs';
import path from 'node:path';
import { contextOptions, DESKTOP, MOBILE, sleep } from '../lib/browser.mjs';
import { autoScroll, extractPage } from './inpage.mjs';
import { normalizePage, pathOf, slugForUrl, decodeOptimizerUrl, guessPageType } from './urls.mjs';
import { extOf } from './assets.mjs';

const MAX_BODY = 60 * 1024 * 1024;
const MAX_FETCH = 250 * 1024 * 1024;
const WANT_EXT = new Set('png jpg jpeg gif webp avif svg ico bmp mp4 webm mov m4v mp3 wav ogg m4a woff2 woff ttf otf eot css json lottie riv glb gltf usdz hdr'.split(' '));
const SKIP_RTYPE = new Set(['document', 'script', 'websocket', 'manifest', 'ping', 'eventsource', 'texttrack', 'signedexchange', 'cspviolationreport']);
const CSS_ASSET_EXT = new Set('png jpg jpeg gif webp avif svg ico mp4 webm woff2 woff ttf otf eot'.split(' '));

const abs = (u, base) => { try { const x = new URL(u, base); x.hash = ''; return x.href; } catch { return null; } };

async function pool(items, n, fn) {
  const q = [...items];
  await Promise.all(Array.from({ length: Math.min(n, q.length) }, async () => { while (q.length) await fn(q.shift()); }));
}

/** Launch one rendering pass with a profile; returns everything observed. */
async function visit({ browser, url, profile, opts, extract, contexts }) {
  const context = await browser.newContext(contextOptions(profile, {
    extraHTTPHeaders: opts.headers, serviceWorkers: 'block', acceptDownloads: false,
  }));
  contexts.push(context);
  const page = await context.newPage();
  page.setDefaultTimeout(opts.navTimeout);

  const v = {
    context, page, captured: new Map(), optimizer: new Map(), mediaUrls: new Set(),
    consoleErrors: [], failedRequests: [], badResponses: [], status: null, finalUrl: url,
  };
  const jobs = [];
  page.on('console', (m) => { if (m.type() === 'error') v.consoleErrors.push(m.text().slice(0, 300)); });
  page.on('pageerror', (e) => v.consoleErrors.push(`pageerror: ${String(e.message).slice(0, 300)}`));
  page.on('requestfailed', (r) => {
    const err = r.failure()?.errorText || '';
    if (!/ABORTED|BLOCKED_BY_CLIENT/i.test(err)) v.failedRequests.push({ url: r.url(), error: err, type: r.resourceType() });
  });
  page.on('response', (r) => jobs.push((async () => {
    try {
      const rurl = r.url();
      if (rurl.startsWith('data:')) return;
      const status = r.status();
      const rtype = r.request().resourceType();
      if (status >= 400) { if (!['document', 'script'].includes(rtype) || rurl !== url) v.badResponses.push({ url: rurl, status, type: rtype }); return; }
      if (status >= 300 || status === 204 || SKIP_RTYPE.has(rtype)) return;
      const headers = r.headers();
      const ct = (headers['content-type'] || '').split(';')[0].trim().toLowerCase();
      const len = Number(headers['content-length'] || 0);
      const opt = decodeOptimizerUrl(rurl, url);
      if (opt) {
        if (len > MAX_BODY) return;
        const body = await r.body();
        const list = v.optimizer.get(opt.original) || [];
        list.push({ url: rurl, width: opt.width, body, mime: ct });
        v.optimizer.set(opt.original, list);
        return;
      }
      const ext = extOf(rurl);
      const wanted = ['image', 'media', 'font', 'stylesheet'].includes(rtype) || /^(image|video|audio|font)\//.test(ct) ||
        ct.includes('json') || ct.includes('font') || ct === 'text/css' || WANT_EXT.has(ext);
      if (!wanted) return;
      if (rtype === 'media' || /^(video|audio)\//.test(ct) || status === 206) { v.mediaUrls.add(rurl); return; }
      if (len > MAX_BODY) { v.mediaUrls.add(rurl); return; }
      if (ct.includes('json') && len > 30 * 1024 * 1024) return;
      v.captured.set(rurl, { url: rurl, mime: ct, body: await r.body(), status, rtype });
    } catch { /* body unavailable (redirect, aborted) */ }
  })()));

  let resp = null;
  for (let attempt = 1; ; attempt++) {
    try { resp = await page.goto(url, { waitUntil: 'load', timeout: opts.navTimeout }); break; }
    catch (e) {
      if (attempt >= opts.retries) throw e;
      await sleep(800 * attempt);
    }
  }
  v.status = resp ? resp.status() : null;
  v.finalUrl = page.url();
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.evaluate(autoScroll, { stepFrac: 0.6, delayMs: opts.scrollDelay, maxSteps: 160, maxMs: 40000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await sleep(400);
  if (extract) {
    try { v.data = await page.evaluate(extractPage, { minSvg: opts.minSvg }); }
    catch { await sleep(800); v.data = await page.evaluate(extractPage, { minSvg: opts.minSvg }); }
  }
  v.settleJobs = async () => { await Promise.allSettled(jobs); };
  return v;
}

async function screenshot(page, file) {
  const h = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0));
  const vw = page.viewportSize().width;
  const opts = { path: file, type: 'jpeg', quality: 78, fullPage: true };
  if (h > 16000) opts.clip = { x: 0, y: 0, width: vw, height: 16000 };
  await page.screenshot(opts);
  return { height: h, capped: h > 16000 };
}

/** Parse @font-face rules and url() references out of CSS text. */
function parseCss(text, base) {
  const faces = [];
  for (const m of text.matchAll(/@font-face\s*\{([^}]*)\}/gi)) {
    const body = m[1];
    const family = /font-family\s*:\s*([^;]+)/i.exec(body)?.[1]?.trim().replace(/^["']|["']$/g, '');
    const weight = /font-weight\s*:\s*([^;]+)/i.exec(body)?.[1]?.trim();
    const style = /font-style\s*:\s*([^;]+)/i.exec(body)?.[1]?.trim();
    const urls = [...body.matchAll(/url\(\s*(['"]?)([^)'"]+)\1\s*\)/g)].map((x) => abs(x[2], base)).filter(Boolean);
    for (const u of urls) faces.push({ url: u, family, weight, style });
  }
  const urls = new Set();
  for (const m of text.matchAll(/url\(\s*(['"]?)([^)'"]+)\1\s*\)/g)) {
    if (m[2].startsWith('data:') || m[2].startsWith('#')) continue;
    const u = abs(m[2], base);
    if (u && CSS_ASSET_EXT.has(extOf(u))) urls.add(u);
  }
  return { faces, urls: [...urls] };
}

/** Turn everything a visit saw into stored assets. Returns per-url lookups for meta.json. */
async function ingestAssets({ v, store, site, pagePath, pageUrl, opts, log }) {
  const refMap = new Map(); // target url -> { usages: [], via: Set, optimizerOnly }
  const addRef = (rawUrl, usage) => {
    const clean = abs(rawUrl, pageUrl);
    if (!clean) return;
    const opt = decodeOptimizerUrl(clean, pageUrl);
    const target = opt ? abs(opt.original, pageUrl) : clean;
    if (!target) return;
    const r = refMap.get(target) || { usages: [], via: new Set(), original: !!opt };
    if (opt) { r.via.add(clean); r.original = true; }
    if (usage) r.usages.push(usage);
    refMap.set(target, r);
  };

  for (const ref of v.data?.refs || []) addRef(ref.url, ref);
  for (const [u, c] of v.captured) addRef(u, { how: 'network', mime: c.mime });
  for (const [orig, list] of v.optimizer) for (const o of list) { addRef(o.url, { how: 'network' }); void orig; }
  for (const u of v.mediaUrls) addRef(u, { how: 'network' });

  // 1) CSS first: lets us name fonts by family and find url()s the page never requested
  const cssTexts = [];
  for (const [u, c] of v.captured) {
    if (c.mime === 'text/css' || (c.rtype === 'stylesheet')) cssTexts.push({ url: u, text: c.body.toString('utf8') });
  }
  for (const t of v.data?.inlineCss || []) cssTexts.push({ url: pageUrl, text: t });
  for (const { url: cu, text } of cssTexts) {
    const { faces, urls } = parseCss(text, cu);
    for (const f of faces) store.fontFaces.set(f.url, { family: f.family, weight: f.weight, style: f.style });
    for (const u of urls) if (!refMap.has(u)) addRef(u, { how: 'css-url', cssUrl: cu });
  }
  // web app manifest icons
  if (v.data?.manifestHref) {
    try {
      const r = await v.context.request.get(v.data.manifestHref, { timeout: 15000 });
      if (r.ok()) {
        const j = JSON.parse((await r.body()).toString('utf8'));
        for (const ic of j.icons || []) addRef(abs(ic.src, v.data.manifestHref), { how: 'apple-touch-icon', sizes: ic.sizes });
      }
    } catch { /* ignore */ }
  }

  const missing = [];
  const siteHost = (u) => { try { return site.isSameSite(new URL(u)); } catch { return false; } };
  const touched = new Map(); // target -> entry

  await pool([...refMap.entries()], 6, async ([target, r]) => {
    try {
      const iconHint = r.usages.some((u) => u.how === 'favicon' || u.how === 'apple-touch-icon');
      let entry = opts.force ? null : store.known(target);
      if (entry) {
        store.linkUrls(entry, [...r.via]);
      } else {
        let buf, mime;
        const cap = v.captured.get(target);
        if (cap && !v.mediaUrls.has(target)) { buf = cap.body; mime = cap.mime; }
        else {
          try {
            const res = await v.context.request.get(target, { timeout: opts.navTimeout, maxRedirects: 5 });
            if (res.ok()) {
              const body = await res.body();
              if (body.length <= MAX_FETCH) { buf = body; mime = (res.headers()['content-type'] || '').split(';')[0]; }
            } else missing.push({ url: target, status: res.status() });
          } catch (e) { missing.push({ url: target, error: String(e.message).split('\n')[0] }); }
        }
        let fallback = false;
        if (!buf && r.via.size) {
          // original unavailable: keep the largest optimiser variant rather than nothing
          const list = (v.optimizer.get(target) || []).sort((a, b) => b.width - a.width);
          if (list[0]) { buf = list[0].body; mime = list[0].mime; fallback = true; }
        }
        if (!buf) return;
        if (buf.length < 100 && /^image\/(?!svg)/.test(mime || '') && !iconHint) return; // tracking pixels
        entry = store.ingest({
          buf, url: target, nameUrl: target, mime, alsoUrls: [...r.via],
          originalUrl: r.original ? target : undefined, iconHint, thirdParty: !siteHost(target),
        });
        if (entry && fallback) entry.originalFetchFailed = true;
      }
      if (entry) {
        touched.set(target, entry);
        for (const u of r.usages) store.addUsage(entry, pagePath, u);
        if (!r.usages.length) store.addUsage(entry, pagePath, { how: 'network' });
      }
    } catch (e) { missing.push({ url: target, error: e.message }); }
  });

  // 2) inline SVGs
  const svgFiles = [];
  for (const s of v.data?.svgs || []) {
    const buf = Buffer.from(s.markup, 'utf8');
    const slugName = (s.nameHint || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    const entry = store.ingest({
      buf, url: `inline-svg://${pagePath}#${slugName || 'svg'}`, nameUrl: `/inline-${slugName || 'svg'}.svg`, mime: 'image/svg+xml', originalUrl: `inline-svg on ${pagePath}`,
    });
    if (entry) { store.addUsage(entry, pagePath, { ...s, how: 'inline-svg', markup: undefined }); svgFiles.push(entry.file); }
  }
  return { touched, missing, svgFiles };
}

function analyzeLinks(data, site, pageUrl) {
  const internal = new Map(); const external = []; const contacts = []; const aliasLinks = []; const files = [];
  for (const l of data.links) {
    let u; try { u = new URL(l.href); } catch { continue; }
    if (!/^https?:$/.test(u.protocol)) { contacts.push({ href: l.href, text: l.text }); continue; }
    if (site.isSameSite(u)) {
      const n = normalizePage(l.href, site);
      if (site.isAliasHost(u)) aliasLinks.push({ href: l.href, text: l.text, region: l.region, suggested: n || site.toCanonical(u).href });
      if (n) { if (n !== pageUrl && !internal.has(n)) internal.set(n, { href: n, text: l.text, region: l.region, raw: l.raw }); }
      else files.push({ href: l.href, text: l.text });
    } else external.push({ href: l.href, text: l.text, region: l.region });
  }
  return { internal: [...internal.values()], external, contacts, aliasLinks, files };
}

export function pageDirFor(outDir, url) { return path.join(outDir, 'pages', slugForUrl(url)); }

/**
 * Harvest one page. Never throws: failures are returned (and written) as { error }.
 */
export async function harvestPage({ browser, url, site, opts, store, outDir, sources = [], log }) {
  const dir = pageDirFor(outDir, url);
  const pagePath = pathOf(url);
  fs.mkdirSync(dir, { recursive: true });
  const contexts = [];
  const t0 = Date.now();

  const work = async () => {
    let v;
    try { v = await visit({ browser, url, profile: DESKTOP, opts, extract: true, contexts }); }
    catch (e) { throw Object.assign(e, { phase: 'navigation' }); }
    await v.settleJobs();
    const data = v.data;
    const finalNorm = normalizePage(v.finalUrl, site);
    const offSiteRedirect = !finalNorm && /^https?:/.test(v.finalUrl);

    // assets from the desktop pass
    const ing = await ingestAssets({ v, store, site, pagePath, pageUrl: v.finalUrl, opts, log });

    // screenshots
    const shots = {};
    if (opts.screens) {
      try { shots.desktop = await screenshot(v.page, path.join(dir, 'screenshot-desktop.jpg')); } catch (e) { shots.desktopError = e.message; }
    }
    // mobile pass (screenshot + any mobile-only assets, e.g. different <picture> art direction)
    if (opts.screens) {
      try {
        const m = await visit({ browser, url, profile: MOBILE, opts, extract: true, contexts });
        await m.settleJobs();
        const mi = await ingestAssets({ v: m, store, site, pagePath, pageUrl: m.finalUrl, opts, log });
        for (const [k, e] of mi.touched) if (!ing.touched.has(k)) ing.touched.set(k, e);
        ing.missing.push(...mi.missing);
        shots.mobile = await screenshot(m.page, path.join(dir, 'screenshot-mobile.jpg'));
        for (const e of m.consoleErrors) if (!v.consoleErrors.includes(e)) v.consoleErrors.push(e);
        await m.context.close();
      } catch (e) { shots.mobileError = e.message; }
    }
    await v.context.close();

    // content + dom
    const links = analyzeLinks(data, site, finalNorm || url);
    const jsonLd = []; const jsonLdErrors = [];
    for (const raw of data.meta.jsonLdRaw) {
      try { const j = JSON.parse(raw); jsonLd.push(j); } catch (e) { jsonLdErrors.push(`${e.message}: ${raw.slice(0, 80)}`); }
    }
    const ldTypes = jsonLd.flatMap((j) => (Array.isArray(j) ? j : j['@graph'] || [j]).map((x) => x?.['@type']).flat().filter(Boolean));
    const h1s = data.headings.filter((h) => h.level === 1).map((h) => h.text);
    const heading = (s) => String(s ?? '').replace(/\n/g, ' ');
    fs.writeFileSync(path.join(dir, 'content.md'),
      `---\nurl: ${finalNorm || v.finalUrl}\ntitle: ${heading(data.meta.title)}\ndescription: ${heading(data.meta.description)}\nh1: ${heading(h1s.join(' / '))}\n---\n\n${data.markdown}\n`);
    fs.writeFileSync(path.join(dir, 'dom.html'), data.html);

    const imgFile = (src) => {
      const a = abs(src, v.finalUrl); if (!a) return null;
      const o = decodeOptimizerUrl(a, v.finalUrl);
      return (touchedFile(o ? abs(o.original, v.finalUrl) : a));
    };
    const touchedFile = (u) => ing.touched.get(u)?.file || store.known(u)?.file || null;
    const images = data.images.map((i) => ({
      src: i.src, original: i.currentSrc || i.src ? (() => { const a = abs(i.currentSrc || i.src, v.finalUrl); const o = a && decodeOptimizerUrl(a, v.finalUrl); return o ? o.original : a; })() : null,
      alt: i.alt, hasAlt: i.hasAlt, natural: `${i.naturalW}x${i.naturalH}`, rendered: `${i.renderedW}x${i.renderedH}`,
      loading: i.loading, asset: imgFile(i.currentSrc || i.src),
    }));

    const issues = [];
    const m = data.meta;
    const st = v.status;
    if (st && st >= 400) issues.push({ type: 'http-error', detail: `HTTP ${st}` });
    if (!m.title) issues.push({ type: 'no-title' });
    if (!m.description) issues.push({ type: 'no-meta-description' });
    if (h1s.length === 0) issues.push({ type: 'no-h1' });
    if (h1s.length > 1) issues.push({ type: 'multiple-h1', detail: h1s.join(' | ') });
    for (const i of images) if (!i.hasAlt) issues.push({ type: 'img-missing-alt', detail: i.original });
    for (const i of images) if (i.hasAlt && !(i.alt || '').trim()) issues.push({ type: 'img-empty-alt', detail: i.original });
    if (m.canonical) {
      try { if (!site.isSameSite(new URL(m.canonical)) || site.isAliasHost(new URL(m.canonical))) issues.push({ type: 'canonical-other-host', detail: m.canonical }); } catch { /* ignore */ }
    }
    const ogImg = m.og?.['og:image'];
    if (ogImg) { try { if (site.isAliasHost(new URL(ogImg, v.finalUrl))) issues.push({ type: 'og-image-other-host', detail: ogImg }); } catch { /* ignore */ } }
    else issues.push({ type: 'no-og-image' });
    if (/noindex/i.test(m.robots || '')) issues.push({ type: 'noindex', detail: m.robots });
    if (jsonLdErrors.length) issues.push({ type: 'json-ld-invalid', detail: jsonLdErrors.join('; ') });
    if (offSiteRedirect) issues.push({ type: 'redirects-off-site', detail: v.finalUrl });
    for (const e of v.consoleErrors) issues.push({ type: 'console-error', detail: e });
    for (const f of v.failedRequests) issues.push({ type: 'failed-request', detail: `${f.type} ${f.url} (${f.error})` });
    for (const f of v.badResponses) issues.push({ type: 'bad-response', detail: `${f.status} ${f.type} ${f.url}` });
    for (const f of ing.missing) issues.push({ type: 'asset-unavailable', detail: `${f.url} (${f.status || f.error})` });

    const meta = {
      done: true, url: finalNorm || v.finalUrl, requestedUrl: url, finalUrl: v.finalUrl, path: pagePath, slug: path.basename(dir),
      status: st, redirected: finalNorm && finalNorm !== url ? finalNorm : undefined, offSiteRedirect: offSiteRedirect || undefined,
      type: guessPageType(new URL(finalNorm || url).pathname, ldTypes),
      title: m.title, description: m.description, canonical: m.canonical, robots: m.robots, lang: m.lang, themeColor: m.themeColor,
      og: m.og, twitter: m.twitter, h1: h1s, headings: data.headings, framework: m.isNext ? 'next.js' : undefined,
      jsonLd, links: { internal: links.internal, external: links.external, otherHosts: links.aliasLinks, files: links.files, contacts: links.contacts },
      images, assets: [...new Set([...ing.touched.values()].map((e) => e.file).concat(ing.svgFiles))].sort(),
      screenshots: { ...shots }, docHeight: m.docHeight, wordCount: (data.markdown.match(/\b[\p{L}\p{N}']+\b/gu) || []).length,
      sources, issues, consoleErrors: v.consoleErrors, failedRequests: v.failedRequests, badResponses: v.badResponses,
      harvestedAt: new Date().toISOString(), tookMs: Date.now() - t0,
    };
    fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2));
    return meta;
  };

  const p = work();
  p.catch(() => {});
  let timer;
  try {
    const meta = await Promise.race([p, new Promise((_, rej) => { timer = setTimeout(() => rej(new Error(`page timeout after ${opts.pageTimeout}ms`)), opts.pageTimeout); })]);
    return { meta };
  } catch (e) {
    const err = { done: false, url, path: pagePath, slug: path.basename(dir), error: String(e.message).split('\n')[0], phase: e.phase, sources, failedAt: new Date().toISOString() };
    fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(err, null, 2));
    return { error: err };
  } finally {
    clearTimeout(timer);
    await Promise.allSettled(contexts.map((c) => c.close()));
  }
}
