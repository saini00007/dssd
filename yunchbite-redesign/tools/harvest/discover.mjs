// Page discovery from robots.txt + sitemap(.xml / index). BFS crawling lives in harvest.mjs.
import { normalizePage } from './urls.mjs';

const UA = 'Mozilla/5.0 (compatible; YunchBiteHarvester/1.0)';

async function get(url, headers, timeoutMs = 20000) {
  const res = await fetch(url, {
    headers: { 'user-agent': UA, accept: 'application/xml,text/xml,text/plain,*/*', ...headers },
    redirect: 'follow', signal: AbortSignal.timeout(timeoutMs),
  });
  return { status: res.status, text: res.ok ? await res.text() : '' };
}

const locs = (xml) => [...xml.matchAll(/<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]]+?)\s*(?:\]\]>)?\s*<\/loc>/gi)].map((m) => m[1].replace(/&amp;/g, '&'));

/**
 * @returns {{ pages: Map<string,Set<string>>, notes: string[] }}  pages: normalised url -> sources ('sitemap'|'robots')
 */
export async function discoverFromSitemaps(site, headers = {}, log = () => {}) {
  const pages = new Map();
  const notes = [];
  const add = (raw, src) => {
    const n = normalizePage(raw, site);
    if (!n) return;
    if (!pages.has(n)) pages.set(n, new Set());
    pages.get(n).add(src);
  };

  const sitemapUrls = new Map(); // url -> source label
  sitemapUrls.set(`${site.origin}/sitemap.xml`, 'sitemap');

  try {
    const r = await get(`${site.origin}/robots.txt`, headers);
    if (r.status === 401 || r.status === 403) notes.push(`robots.txt returned HTTP ${r.status} (deployment protection / auth wall?)`);
    for (const m of r.text.matchAll(/^\s*sitemap:\s*(\S+)/gim)) {
      let u = m[1];
      try { u = site.toCanonical(new URL(u)).href; } catch { continue; }
      sitemapUrls.set(u, 'robots');
    }
  } catch (e) { notes.push(`robots.txt fetch failed: ${e.message}`); }

  const seen = new Set();
  const queue = [...sitemapUrls.entries()];
  while (queue.length && seen.size < 50) {
    const [url, src] = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);
    try {
      const r = await get(url, headers);
      if (r.status === 401 || r.status === 403) { notes.push(`${url} returned HTTP ${r.status} (deployment protection / auth wall?)`); continue; }
      if (!r.text) { if (r.status !== 404) notes.push(`${url} returned HTTP ${r.status}`); continue; }
      const urls = locs(r.text);
      if (/<sitemapindex/i.test(r.text)) {
        log(`  sitemap index ${url}: ${urls.length} child sitemaps`);
        for (const u of urls) {
          let c = u; try { c = site.toCanonical(new URL(u)).href; } catch { continue; }
          queue.push([c, src]);
        }
      } else {
        log(`  sitemap ${url}: ${urls.length} urls`);
        for (const u of urls) add(u, src === 'robots' ? 'robots' : 'sitemap');
      }
    } catch (e) { notes.push(`${url} fetch failed: ${e.message}`); }
  }
  if (pages.size === 0) notes.push('No URLs found in sitemap(s); relying on explicit paths + crawl.');
  return { pages, notes };
}
