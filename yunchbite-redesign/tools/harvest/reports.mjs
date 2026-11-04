// Site-level outputs: sitemap.json / sitemap.md / issues.md / summary.md (built from pages/*/meta.json + manifest).
import fs from 'node:fs';
import path from 'node:path';
import { normalizePage } from './urls.mjs';

const fmtBytes = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : n >= 1024 ? `${Math.round(n / 1024)} KB` : `${n} B`);
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

export function loadMetas(outDir) {
  const dir = path.join(outDir, 'pages');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).map((d) => {
    try { return JSON.parse(fs.readFileSync(path.join(dir, d, 'meta.json'), 'utf8')); } catch { return null; }
  }).filter(Boolean);
}

export function buildSitemap({ metas, site, state }) {
  const startUrl = normalizePage(site.origin + '/', site);
  const done = metas.filter((m) => m.done);
  const byUrl = new Map(done.map((m) => [m.url, m]));
  const inbound = new Map();
  for (const m of done) for (const l of m.links?.internal || []) {
    if (!inbound.has(l.href)) inbound.set(l.href, new Set());
    inbound.get(l.href).add(m.path);
  }
  // click depth from the start page
  const depth = new Map([[startUrl, 0]]);
  const q = [startUrl];
  while (q.length) {
    const u = q.shift();
    for (const l of byUrl.get(u)?.links?.internal || []) if (!depth.has(l.href)) { depth.set(l.href, depth.get(u) + 1); q.push(l.href); }
  }
  const srcOf = (url) => new Set([...(state.pages[url]?.sources || []), ...(byUrl.get(url)?.sources || [])]);
  const rows = metas.map((m) => {
    const url = m.url;
    const sources = [...srcOf(url)];
    const from = [...(inbound.get(url) || [])];
    if (from.length && !sources.includes('crawl')) sources.push('crawl');
    return {
      url, path: m.path, slug: m.slug, title: m.title ?? null, h1: m.h1?.[0] ?? null, type: m.type ?? null,
      status: m.status ?? null, depth: depth.has(url) ? depth.get(url) : null, harvested: !!m.done, error: m.error,
      discoveredFrom: sources.sort(), linkedFrom: from.sort(), inSitemap: sources.some((s) => s === 'sitemap' || s === 'robots'),
      assets: m.assets?.length ?? 0, words: m.wordCount ?? null,
    };
  }).sort((a, b) => a.path.localeCompare(b.path));
  return rows;
}

function treeMd(rows) {
  const root = { kids: new Map(), page: null };
  for (const r of rows) {
    const segs = r.path.split('?')[0].split('/').filter(Boolean);
    let n = root;
    for (const s of segs) { if (!n.kids.has(s)) n.kids.set(s, { kids: new Map(), page: null }); n = n.kids.get(s); }
    if (!n.page) n.page = r; else n.extra = [...(n.extra || []), r];
  }
  const lines = [];
  const label = (r, seg) => `**${seg}** ${r ? `[${r.type}${r.status && r.status >= 400 ? `, HTTP ${r.status}` : ''}${r.depth == null ? ', orphan' : ''}] ${r.title ? `"${r.title}"` : ''}${r.h1 ? ` (h1: ${r.h1})` : ''}` : '(no page at this path)'}`;
  const walk = (n, seg, depth) => {
    lines.push(`${'  '.repeat(depth)}- ${label(n.page, seg === '' ? '/' : '/' + seg)}`);
    for (const e of n.extra || []) lines.push(`${'  '.repeat(depth + 1)}- ${label(e, e.path)}`);
    for (const [k, c] of [...n.kids].sort(([a], [b]) => a.localeCompare(b))) walk(c, k, depth + 1);
  };
  walk(root, '', 0);
  return lines.join('\n');
}

export function writeSitemap(outDir, rows, site) {
  fs.writeFileSync(path.join(outDir, 'sitemap.json'), JSON.stringify({ site: site.origin, generatedAt: new Date().toISOString(), pages: rows }, null, 2));
  fs.writeFileSync(path.join(outDir, 'sitemap.md'),
    `# Sitemap (${rows.length} pages)\n\nTree of harvested pages. \`[type, depth/orphan]\`; orphan = not reachable by clicking from the home page (sitemap/--paths only).\n\n${treeMd(rows)}\n\n## Flat list\n\n| path | type | status | depth | title | discovered from | linked from |\n|---|---|---|---|---|---|---|\n` +
    rows.map((r) => `| ${esc(r.path)} | ${r.type ?? ''} | ${r.status ?? (r.harvested ? '' : 'FAILED')} | ${r.depth ?? 'orphan'} | ${esc(r.title)} | ${r.discoveredFrom.join(', ')} | ${esc(r.linkedFrom.slice(0, 4).join(', '))}${r.linkedFrom.length > 4 ? ` (+${r.linkedFrom.length - 4})` : ''} |`).join('\n') + '\n');
}

export function writeIssues({ outDir, metas, rows, entries, site, notes, skippedCap }) {
  const done = metas.filter((m) => m.done);
  const failed = metas.filter((m) => !m.done);
  const out = [];
  const sec = (title, lines, hint) => {
    out.push(`## ${title} (${lines.length})`, '');
    if (hint) out.push(`_${hint}_`, '');
    out.push(...(lines.length ? lines : ['None.']), '');
  };
  const counts = {};
  const track = (k, n) => { counts[k] = n; };
  const rowByPath = new Map(rows.map((r) => [r.path, r]));
  const linkedFrom = (url) => { const r = rows.find((x) => x.url === url); return r?.linkedFrom?.length ? ` - linked from: ${r.linkedFrom.slice(0, 5).join(', ')}${r.linkedFrom.length > 5 ? ` (+${r.linkedFrom.length - 5})` : ''}` : ''; };

  out.push('# Issues', '', `Generated ${new Date().toISOString()} for ${site.origin} (aliases treated as same site: ${site.aliases.join(', ') || 'none'}).`, '');
  if (notes.length) { sec('Discovery notes', notes.map((n) => `- ${n}`)); }

  // 1. broken pages
  const broken = done.filter((m) => m.status >= 400);
  sec('Broken pages (HTTP 4xx/5xx)', broken.map((m) => `- **${m.status}** ${m.path}${linkedFrom(m.url)}`), 'Internal links that resolve to an error page.');
  track('broken pages', broken.length);
  sec('Pages that failed to harvest', failed.map((m) => `- ${m.path || m.url}: ${m.error} (${m.phase || 'unknown'})`));
  if (skippedCap) sec('Pages skipped (--max-pages reached)', [`- ${skippedCap} discovered URLs were not harvested`]);

  // 2. other-host links
  const byHost = new Map();
  for (const m of done) for (const l of m.links?.otherHosts || []) {
    let h = ''; try { h = new URL(l.href).host; } catch { /* */ }
    const arr = byHost.get(h) || []; arr.push({ from: m.path, ...l }); byHost.set(h, arr);
  }
  const hostLines = [];
  for (const [h, arr] of byHost) {
    hostLines.push(`- **${h}**: ${arr.length} links on ${new Set(arr.map((a) => a.from)).size} pages (should point to ${site.canonicalHost})`);
    const seen = new Set();
    for (const a of arr) {
      const k = `${a.href}|${a.region}`;
      if (seen.has(k)) continue;
      seen.add(k);
      const pages = arr.filter((x) => x.href === a.href).map((x) => x.from);
      hostLines.push(`  - \`${a.href}\` ("${esc(a.text)}", ${a.region}) -> use \`${a.suggested}\`; on ${pages.slice(0, 4).join(', ')}${pages.length > 4 ? ` (+${pages.length - 4})` : ''}`);
    }
  }
  sec('Links pointing to another host of the same site', hostLines, 'Bug list: these links work only because the other host exists (e.g. a Vercel preview URL). They were normalised to the canonical host for crawling.');
  track('alias-host links', [...byHost.values()].reduce((a, b) => a + b.length, 0));
  const canon = [];
  for (const m of done) for (const i of m.issues || []) if (['canonical-other-host', 'og-image-other-host'].includes(i.type)) canon.push(`- ${m.path}: ${i.type} -> ${i.detail}`);
  sec('Canonical / og:image pointing at another host', canon);
  const redirects = done.filter((m) => m.redirected || m.offSiteRedirect).map((m) => `- ${m.requestedUrl} -> ${m.redirected || m.finalUrl}`);
  sec('Redirects', redirects);

  // 3. metadata
  const withIssue = (t) => done.filter((m) => (m.issues || []).some((i) => i.type === t));
  sec('Pages with no meta description', withIssue('no-meta-description').map((m) => `- ${m.path}`));
  track('no meta description', withIssue('no-meta-description').length);
  sec('Pages with no <title>', withIssue('no-title').map((m) => `- ${m.path}`));
  sec('Pages with no h1', withIssue('no-h1').map((m) => `- ${m.path}`));
  sec('Pages with multiple h1', withIssue('multiple-h1').map((m) => `- ${m.path}: ${(m.issues.find((i) => i.type === 'multiple-h1')).detail}`));
  sec('Pages with no og:image', withIssue('no-og-image').map((m) => `- ${m.path}`));
  sec('noindex pages', withIssue('noindex').map((m) => `- ${m.path}: ${m.robots}`));
  const titles = new Map();
  for (const m of done) if (m.title) titles.set(m.title, [...(titles.get(m.title) || []), m.path]);
  const dups = [...titles].filter(([, p]) => p.length > 1);
  sec('Duplicate titles', dups.map(([t, p]) => `- "${t}": ${p.join(', ')}`));
  track('duplicate titles', dups.length);

  // 4. images
  const missingAlt = [];
  const emptyAlt = [];
  for (const m of done) {
    const miss = (m.issues || []).filter((i) => i.type === 'img-missing-alt');
    if (miss.length) missingAlt.push(`- ${m.path} (${miss.length}): ${[...new Set(miss.map((i) => i.detail))].slice(0, 6).join(', ')}`);
    const emp = (m.issues || []).filter((i) => i.type === 'img-empty-alt');
    if (emp.length) emptyAlt.push(`- ${m.path} (${emp.length}): ${[...new Set(emp.map((i) => i.detail))].slice(0, 6).join(', ')}`);
  }
  sec('Images missing the alt attribute', missingAlt, 'Screen readers announce the file name. Add alt text (or alt="" if purely decorative).');
  track('missing alt', missingAlt.length);
  sec('Images with empty alt=""', emptyAlt, 'Valid only if decorative - review.');
  const big = entries.filter((e) => ['images', 'gif', 'icons'].includes(e.type) && e.bytes > 500 * 1024).sort((a, b) => b.bytes - a.bytes);
  sec('Images larger than 500 KB', big.map((e) => `- ${fmtBytes(e.bytes)} ${e.file}${e.width ? ` (${e.width}x${e.height})` : ''} - used on ${e.pages.slice(0, 4).join(', ')}`), 'Sizes are of the ORIGINAL files; the Next.js optimiser serves smaller variants.');
  track('images > 500KB', big.length);
  const bigVid = entries.filter((e) => e.type === 'video' && e.bytes > 5 * 1024 * 1024);
  sec('Videos larger than 5 MB', bigVid.map((e) => `- ${fmtBytes(e.bytes)} ${e.file}${e.durationSec ? ` (${e.durationSec}s)` : ''}`));
  const fb = entries.filter((e) => e.originalFetchFailed);
  sec('Assets where only an optimised variant could be saved', fb.map((e) => `- ${e.file}: original not downloadable (${e.originalUrl})`));

  // 5. runtime
  const rt = (t, fmt) => done.flatMap((m) => (m.issues || []).filter((i) => i.type === t).map((i) => `- ${m.path}: ${fmt(i)}`));
  const ce = rt('console-error', (i) => i.detail);
  sec('Console errors', ce); track('console errors', ce.length);
  const fr = rt('failed-request', (i) => i.detail);
  sec('Failed requests', fr); track('failed requests', fr.length);
  const br = rt('bad-response', (i) => i.detail);
  sec('HTTP error responses for sub-resources (404 images, fonts, API ...)', br); track('bad responses', br.length);
  const au = rt('asset-unavailable', (i) => i.detail);
  sec('Referenced assets that could not be downloaded', au);

  // 6. discovery gaps
  const orphans = rows.filter((r) => r.inSitemap && r.linkedFrom.length === 0 && r.path !== '/');
  sec('In sitemap but not linked from any crawled page (orphans)', orphans.map((r) => `- ${r.path}`));
  const notInMap = rows.filter((r) => !r.inSitemap && r.harvested);
  sec('Linked but missing from sitemap.xml', notInMap.map((r) => `- ${r.path}`), 'Search engines may not discover these.');
  track('orphans', orphans.length);

  // 7. external
  const ext = new Map();
  for (const m of done) for (const l of m.links?.external || []) {
    let h = ''; try { h = new URL(l.href).host; } catch { /* */ }
    const o = ext.get(h) || { n: 0, pages: new Set(), ex: l.href }; o.n++; o.pages.add(m.path); ext.set(h, o);
  }
  sec('External links (informational, not crawled or checked)', [...ext].sort((a, b) => b[1].n - a[1].n).map(([h, o]) => `- ${h}: ${o.n} links on ${o.pages.size} pages (e.g. ${o.ex})`));

  void rowByPath;
  const summaryLine = Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(' · ');
  out.splice(3, 0, `**At a glance:** ${summaryLine}`, '');
  fs.writeFileSync(path.join(outDir, 'issues.md'), out.join('\n'));
  return counts;
}

export function writeSummary({ outDir, site, metas, rows, entries, counts, run, sheets }) {
  const done = metas.filter((m) => m.done);
  const failed = metas.filter((m) => !m.done);
  const byType = {};
  for (const e of entries) { const t = (byType[e.type] ||= { n: 0, bytes: 0 }); t.n++; t.bytes += e.bytes; }
  const roles = {};
  for (const e of entries) for (const r of e.roles || []) roles[r] = (roles[r] || 0) + 1;
  const pageTypes = {};
  for (const r of rows) pageTypes[r.type || 'failed'] = (pageTypes[r.type || 'failed'] || 0) + 1;
  const md = `# Harvest summary

- Site: ${site.origin} (aliases: ${site.aliases.join(', ') || 'none'})
- Run: ${run.startedAt} (${Math.round(run.ms / 1000)}s) - pages harvested this run: ${run.harvested}, skipped (already done): ${run.skipped}, failed: ${run.failed}
- Pages total: ${rows.length} (${done.length} ok, ${failed.length} failed) - by type: ${Object.entries(pageTypes).map(([k, v]) => `${k} ${v}`).join(', ')}
- Unique assets: ${entries.length} (${fmtBytes(entries.reduce((a, b) => a + b.bytes, 0))}); duplicates collapsed this run: ${run.duplicates}

## Assets by type

| type | files | size |
|---|---|---|
${Object.entries(byType).sort().map(([t, v]) => `| ${t} | ${v.n} | ${fmtBytes(v.bytes)} |`).join('\n')}

## Roles (guessed)

${Object.entries(roles).sort((a, b) => b[1] - a[1]).map(([r, n]) => `- ${r}: ${n}`).join('\n') || 'None.'}

## Findings at a glance

${Object.entries(counts).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

See [issues.md](issues.md) for the full list.

## Where things are

| path | contents |
|---|---|
| \`pages/<slug>/content.md\` | readable markdown copy of each page (headings, paragraphs, lists, CTAs, image alts, nav/footer) |
| \`pages/<slug>/meta.json\` | title, description, og/twitter tags, canonical, h1/headings, JSON-LD, links, images with rendered sizes, issues |
| \`pages/<slug>/screenshot-{desktop,mobile}.jpg\` | full-page screenshots (1440px desktop, Pixel 7 mobile; capped at 16000px) |
| \`pages/<slug>/dom.html\` | rendered DOM snapshot |
| \`assets/<type>/\` | de-duplicated files: images, svg, gif, video, audio, fonts, lottie, 3d, css, icons |
| \`assets/manifest.json\` / \`.csv\` | one row per unique file: hash, size, dimensions, alpha, duration/fps, source URLs, original URL, pages, alts, guessed roles |
| \`assets/${(sheets && sheets[0]) || 'contact-sheet-1.jpg'}\` | contact sheet(s): thumbnails of every visual asset with filename ${sheets?.length > 1 ? `(${sheets.length} sheets)` : ''} |
| \`sitemap.json\` / \`sitemap.md\` | all pages with type, depth, discovery source, inbound links |
| \`issues.md\` | broken links, other-host links, SEO/alt/perf findings, console errors |
`;
  fs.writeFileSync(path.join(outDir, 'summary.md'), md);
}
