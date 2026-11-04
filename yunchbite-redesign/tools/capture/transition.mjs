// Pass 6: page transitions. Click up to two same-origin links, record the click -> settled window,
// classify as full reload vs SPA-style, and extract a contact sheet. Output: transition/ + video/transition-N.mp4
import fs from 'node:fs';
import path from 'node:path';
import { sleep } from '../lib/browser.mjs';
import { contactSheets } from './frames.mjs';
import { cleanupVideoDir, openPage } from './session.mjs';
import { ensureDir, ffprobeDuration, log, toMp4, writeJson } from './util.mjs';

/** Same-origin navigation links, preferring explicit transition markers and nav/header links. */
function linkCandidatesInPage() {
  const cap = window.__cap;
  const here = new URL(location.href);
  const seen = new Set();
  const out = [];
  cap.linkEls = [];
  for (const a of document.querySelectorAll('a[href]')) {
    let u;
    try {
      u = new URL(a.href, location.href);
    } catch {
      continue;
    }
    if (u.origin !== here.origin || !/^https?:$/.test(u.protocol)) continue;
    if (u.pathname === here.pathname && u.search === here.search) continue;
    if (/\.(pdf|zip|png|jpe?g|webp|svg|mp4|xml|json)$/i.test(u.pathname) || a.target === '_blank' || a.hasAttribute('download')) continue;
    const r = a.getBoundingClientRect();
    const cs = getComputedStyle(a);
    if (r.width < 8 || r.height < 8 || cs.display === 'none' || cs.visibility === 'hidden') continue;
    const key = u.pathname + u.search;
    if (seen.has(key)) continue;
    seen.add(key);
    const marked = [...a.attributes].some((x) => /transition|barba|swup|taxi/i.test(x.name));
    cap.linkEls.push(a);
    out.push({ i: cap.linkEls.length - 1, href: u.href, text: (a.innerText || a.getAttribute('aria-label') || '').trim().slice(0, 40), selector: cap.sel(a), score: (marked ? 5 : 0) + (a.closest('nav, header') ? 2 : 0) + Math.min(2, Math.log10(r.width * r.height)) });
  }
  return out.sort((a, b) => b.score - a.score);
}

/** Large fixed/absolute opaque-ish elements covering the viewport: typical wipe/curtain overlays. */
function overlayProbeInPage() {
  const vw = innerWidth * innerHeight;
  const res = [];
  for (const el of document.body ? document.body.querySelectorAll('*') : []) {
    const cs = getComputedStyle(el);
    if (!['fixed', 'absolute'].includes(cs.position) || cs.display === 'none') continue;
    const r = el.getBoundingClientRect();
    const w = Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0));
    const h = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
    if ((w * h) / vw > 0.25 && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && parseFloat(cs.opacity) > 0.1) res.push(window.__cap.sel(el));
  }
  return res;
}

export async function runTransition(run) {
  const { dir, opts, deadline } = run;
  const outDir = path.join(dir, 'transition');
  fs.rmSync(outDir, { recursive: true, force: true });
  ensureDir(outDir);
  ensureDir(path.join(dir, 'video'));

  // discover candidates in a throwaway session
  const probe = await openPage(run, { label: 'transition-scan' });
  let cands;
  try {
    await probe.waitIntro();
    cands = (await probe.page.evaluate(linkCandidatesInPage)).slice(0, opts.maxTransitions);
  } finally {
    await probe.close();
  }
  log('transition', `${cands.length} link(s) to test`);
  const results = [];
  for (const [n, cand] of cands.entries()) {
    if (Date.now() > deadline) break;
    const s = await openPage(run, { video: true, label: `transition-${n + 1}` });
    const { page } = s;
    let webm;
    try {
      const events = [];
      let clickAt = 0;
      const rel = () => (clickAt ? Date.now() - clickAt : null);
      page.on('framenavigated', (f) => f === page.mainFrame() && clickAt && events.push({ type: 'framenavigated', ms: rel(), url: f.url() }));
      page.on('load', () => clickAt && events.push({ type: 'load', ms: rel() }));
      await s.waitIntro();
      const scroller = await s.initScroller();
      await page.evaluate(linkCandidatesInPage); // re-collect element refs in this page
      const idx = (await page.evaluate(() => window.__cap.linkEls.map((a) => a.href))).indexOf(cand.href);
      if (idx < 0) throw new Error('link no longer present');
      const handle = await page.evaluateHandle((i) => window.__cap.linkEls[i], idx);
      await scroller.toElement(handle);
      await sleep(300);
      const urlBefore = page.url();
      await page.evaluate(() => (window.__spaMarker = 'alive'));
      const box = await handle.asElement().boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
      await sleep(200);
      const videoClickOffset = (Date.now() - s.navStart) / 1000;
      clickAt = Date.now();
      await page.mouse.down();
      await page.mouse.up();

      // poll for overlays while the transition plays (evaluate fails during a document swap: ignore)
      const overlays = new Set();
      while (Date.now() - clickAt < 1800) {
        (await page.evaluate(overlayProbeInPage).catch(() => [])).forEach((o) => overlays.add(o));
        await sleep(60);
      }
      await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {});
      await sleep(1500);
      const urlAfter = page.url();
      const markerAlive = await page.evaluate(() => window.__spaMarker === 'alive').catch(() => false);
      const spaCalls = await page.evaluate(() => window.__cap.nav).catch(() => []);
      const navigated = urlAfter !== urlBefore;
      const fullReload = events.some((e) => e.type === 'load');
      const type = !navigated ? 'no navigation (in-page / blocked)' : fullReload || !markerAlive ? 'full page reload' : 'SPA-style (URL changed without page load)';
      const settledMs = rel();

      webm = await s.close();
      const clip = path.join(dir, 'video', `transition-${n + 1}.mp4`);
      let sheets = [];
      if (webm) {
        const ss = Math.max(0, videoClickOffset - 0.4);
        await toMp4(webm, clip, { ss });
        const dur = await ffprobeDuration(clip);
        const sheetDir = path.join(outDir, `link-${n + 1}`);
        sheets = (await contactSheets(clip, { outDir: sheetDir, prefix: 'sheet', fps: 8, cols: run.profile.viewport.width >= run.profile.viewport.height ? 4 : 6, rows: run.profile.viewport.width >= run.profile.viewport.height ? 3 : 2, tileW: run.profile.viewport.width >= run.profile.viewport.height ? 560 : 300, duration: dur, label: (t) => `click ${(t - 0.4).toFixed(2)}s` })).map((x) => ({ file: `transition/link-${n + 1}/${x.file}`, frames: x.frames }));
      }
      cleanupVideoDir(s);
      const rec = { link: { href: cand.href, text: cand.text, selector: cand.selector }, urlBefore, urlAfter, type, loadEvents: events, historyCalls: spaCalls, overlayElementsSeen: [...overlays], settledAfterMs: settledMs, clip: webm ? `video/transition-${n + 1}.mp4` : null, contactSheets: sheets, note: 'Contact-sheet labels are seconds relative to the click (video is trimmed to start 0.4 s before it).' };
      results.push(rec);
      log('transition', `${cand.href}: ${type}${overlays.size ? `, overlay ${[...overlays].join(', ')}` : ''}`);
    } catch (e) {
      await s.close().catch(() => {});
      fs.rmSync(s.videoDir, { recursive: true, force: true });
      results.push({ link: { href: cand.href, text: cand.text }, error: e.message.split('\n')[0] });
    }
  }
  writeJson(path.join(dir, 'transition', 'transitions.json'), { tested: results });
  return { tested: results.length };
}
