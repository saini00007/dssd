#!/usr/bin/env node
// Brand website harvester: crawl a (Next.js) site and pull out every reusable asset + all page copy.
// See README.md. Usage: node harvest/harvest.mjs <startUrl> [options]
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { launch, sleep } from '../lib/browser.mjs';
import { makeSite, normalizePage, pathOf } from './urls.mjs';
import { discoverFromSitemaps } from './discover.mjs';
import { AssetStore } from './assets.mjs';
import { harvestPage, pageDirFor } from './page.mjs';
import { ensureEnvProxy } from './http.mjs';
import { buildContactSheets } from './contact.mjs';
import { loadMetas, buildSitemap, writeSitemap, writeIssues, writeSummary } from './reports.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUT = path.resolve(HERE, '../../research/current-site');

const HELP = `Brand website harvester

Usage: node harvest/harvest.mjs <startUrl> [options]

Options:
  --hosts a,b,c        extra hosts treated as the SAME site (mapped to the start host; links to them are reported)
  --out <dir>          output directory (default: ${DEFAULT_OUT})
  --max-pages <n>      stop discovering after n pages (default 200)
  --concurrency <n>    pages rendered in parallel (default 3)
  --paths /a,/b        extra paths to harvest even if nothing links to them
  --no-screens         skip desktop/mobile screenshots (also skips the mobile pass)
  --no-crawl           only harvest sitemap + --paths + start page; do not follow links
  --no-sitemap         do not read robots.txt / sitemap.xml
  --no-contact         skip contact-sheet generation
  --force              re-harvest pages already done (default: resume, skipping them)
  --header "K: V"      extra HTTP header for every request (repeatable), e.g. a Vercel protection-bypass header
  --delay <ms>         polite delay before each page (default 250)
  --timeout <s>        per-page hard timeout in seconds (default 180)
  --retries <n>        navigation attempts per page (default 3)
  --note "text"       free-text note recorded in summary.md (e.g. why this start host was chosen)
  --min-svg <px>       inline <svg> smaller than this (max side) are ignored (default 24)
  -h, --help           show this help

Example:
  node harvest/harvest.mjs https://yunchbite.com/ --hosts yunchbite-git-main-pradeeps-projects-bf5ebbc6.vercel.app,www.yunchbite.com
`;

export function parseCli(argv) {
  const { values, positionals } = parseArgs({
    args: argv, allowPositionals: true,
    options: {
      hosts: { type: 'string', default: '' }, out: { type: 'string' }, 'max-pages': { type: 'string', default: '200' },
      concurrency: { type: 'string', default: '3' }, paths: { type: 'string', default: '' },
      'no-screens': { type: 'boolean', default: false }, 'no-crawl': { type: 'boolean', default: false },
      'no-sitemap': { type: 'boolean', default: false }, 'no-contact': { type: 'boolean', default: false },
      force: { type: 'boolean', default: false }, header: { type: 'string', multiple: true, default: [] },
      delay: { type: 'string', default: '250' }, timeout: { type: 'string', default: '180' }, retries: { type: 'string', default: '3' },
      'min-svg': { type: 'string', default: '24' }, note: { type: 'string', default: '' }, help: { type: 'boolean', short: 'h', default: false },
    },
  });
  const headers = {};
  for (const h of values.header) { const i = h.indexOf(':'); if (i > 0) headers[h.slice(0, i).trim()] = h.slice(i + 1).trim(); }
  return {
    help: values.help, startUrl: positionals[0], hosts: values.hosts, out: path.resolve(values.out || DEFAULT_OUT),
    maxPages: Number(values['max-pages']), concurrency: Math.max(1, Number(values.concurrency)),
    paths: values.paths.split(',').map((s) => s.trim()).filter(Boolean),
    screens: !values['no-screens'], crawl: !values['no-crawl'], sitemap: !values['no-sitemap'], contact: !values['no-contact'],
    force: values.force, headers, delay: Number(values.delay), pageTimeout: Number(values.timeout) * 1000,
    navTimeout: 45000, retries: Number(values.retries), minSvg: Number(values['min-svg']), note: values.note, scrollDelay: 160,
  };
}

/** Run a harvest; resolves with a result object (used by test.mjs). */
export async function run(opts, log = (...a) => console.log(...a)) {
  const startedAt = new Date();
  const site = makeSite(opts.startUrl, opts.hosts);
  const outDir = opts.out;
  fs.mkdirSync(path.join(outDir, 'pages'), { recursive: true });
  const startNorm = normalizePage(site.origin + '/', site);

  log(`Harvesting ${site.origin}  (aliases: ${site.aliases.join(', ') || 'none'})  ->  ${outDir}`);
  const statePath = path.join(outDir, 'crawl-state.json');
  const state = { pages: {} };
  try { Object.assign(state, JSON.parse(fs.readFileSync(statePath, 'utf8'))); } catch { /* first run */ }

  const store = new AssetStore(outDir, { log, force: opts.force });
  const notes = [];

  // ---- seeding
  const queue = [];
  const seen = new Set();
  let skippedCap = 0;
  const enqueue = (raw, source, base) => {
    const n = normalizePage(raw, site, base);
    if (!n) return false;
    const s = (state.pages[n] ||= { sources: [] });
    if (!s.sources.includes(source)) s.sources.push(source);
    if (seen.has(n)) return false;
    if (seen.size >= opts.maxPages) { skippedCap++; return false; }
    seen.add(n); queue.push(n);
    return true;
  };

  enqueue(opts.startUrl, 'start');
  if (opts.sitemap) {
    log('Discovering from robots.txt / sitemap.xml ...');
    const d = await discoverFromSitemaps(site, opts.headers, log);
    notes.push(...d.notes);
    for (const n of d.notes) log(`  note: ${n}`);
    for (const [u, srcs] of d.pages) for (const s of srcs) enqueue(u, s);
  }
  for (const p of opts.paths) enqueue(p, 'paths');
  log(`Seeded ${queue.length} pages; crawling links${opts.crawl ? '' : ' disabled'} ...`);

  // ---- crawl
  const browser = await launch();
  const stats = { harvested: 0, skipped: 0, failed: 0 };
  let active = 0;
  let saveChain = Promise.resolve();
  const save = () => (saveChain = saveChain.then(() => store.save()).catch(() => {}));
  const finish = async () => { await saveChain; fs.writeFileSync(statePath, JSON.stringify(state, null, 2)); };
  const onSig = async () => { log('\nInterrupted - saving manifest ...'); try { await save(); await finish(); await browser.close(); } finally { process.exit(130); } };
  process.once('SIGINT', onSig);

  const followLinks = (meta, from) => {
    if (!opts.crawl) return;
    for (const l of meta.links?.internal || []) enqueue(l.href, 'crawl', meta.url);
    void from;
  };

  async function processOne(url) {
    const dir = pageDirFor(outDir, url);
    const metaFile = path.join(dir, 'meta.json');
    const n = stats.harvested + stats.skipped + stats.failed + 1;
    if (!opts.force && fs.existsSync(metaFile)) {
      try {
        const prev = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
        if (prev.done) {
          stats.skipped++;
          log(`[${n}/${seen.size}] SKIP ${pathOf(url)} (already harvested)`);
          if (prev.url && prev.url !== url) seen.add(prev.url);
          followLinks(prev);
          return;
        }
      } catch { /* re-harvest */ }
    }
    await sleep(opts.delay);
    const before = { assets: store.entries.length, dup: store.stats.duplicates };
    const t0 = Date.now();
    const { meta, error } = await harvestPage({ browser, url, site, opts, store, outDir, sources: state.pages[url]?.sources || [], log });
    if (error) {
      stats.failed++;
      log(`[${n}/${seen.size}] FAIL ${pathOf(url)}  ${error.error}`);
      return;
    }
    stats.harvested++;
    if (meta.url !== url) seen.add(meta.url);
    await save();
    log(`[${n}/${seen.size}] OK   ${pathOf(url)}  HTTP ${meta.status}  ${meta.type}  words=${meta.wordCount}  +${store.entries.length - before.assets} new assets (${store.stats.duplicates - before.dup} dup)  ${((Date.now() - t0) / 1000).toFixed(1)}s${meta.issues.some((i) => i.type === 'console-error') ? '  [console errors]' : ''}`);
    followLinks(meta);
  }

  async function worker() {
    for (;;) {
      const u = queue.shift();
      if (!u) { if (active === 0) return; await sleep(80); continue; }
      active++;
      try { await processOne(u); } catch (e) { stats.failed++; log(`[x] ${u}: unexpected ${e.stack || e}`); } finally { active--; }
    }
  }
  await Promise.all(Array.from({ length: opts.concurrency }, worker));
  process.off('SIGINT', onSig);

  // ---- finalise
  log('Finalising assets, contact sheet and reports ...');
  await save();
  await saveChain;
  let sheets = [];
  const entries = await store.save();
  if (opts.contact) {
    try { sheets = await buildContactSheets(store.dir, entries, { log, browser }); }
    catch (e) { log(`  contact sheet failed: ${e.message}`); }
  }
  await browser.close();
  await finish();

  const metas = loadMetas(outDir);
  const rows = buildSitemap({ metas, site, state });
  writeSitemap(outDir, rows, site);
  const counts = writeIssues({ outDir, metas, rows, entries, site, notes, skippedCap });
  const result = { ...stats, duplicates: store.stats.duplicates, startedAt: startedAt.toISOString(), ms: Date.now() - startedAt, skippedCap };
  writeSummary({ outDir, site, metas, rows, entries, counts, run: result, sheets, startUrl: opts.startUrl, note: opts.note });
  log(`Done in ${Math.round(result.ms / 1000)}s: ${stats.harvested} harvested, ${stats.skipped} skipped, ${stats.failed} failed; ${entries.length} unique assets.`);
  log(`Output: ${outDir}  (see summary.md, issues.md, assets/manifest.json)`);
  return { ...result, outDir, pages: rows, entries, counts, sheets, startNorm };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ensureEnvProxy();
  let opts;
  try { opts = parseCli(process.argv.slice(2)); } catch (e) { console.error(e.message + '\n'); console.error(HELP); process.exit(2); }
  if (opts.help || !opts.startUrl) { console.log(HELP); process.exit(opts.help ? 0 : 2); }
  try {
    new URL(opts.startUrl);
  } catch { console.error(`Invalid start URL: ${opts.startUrl}`); process.exit(2); }
  run(opts).then((r) => process.exit(r.harvested + r.skipped > 0 ? 0 : 1)).catch((e) => { console.error(e); process.exit(1); });
}
