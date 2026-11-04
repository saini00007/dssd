// Browser session helpers shared by the passes: opening a prepared page (init scripts,
// consent, bot-wall check), finding the real scroll container, and driving scrolling
// with real wheel input.
import fs from 'node:fs';
import path from 'node:path';
import { contextOptions, sleep } from '../lib/browser.mjs';
import { helpersScript, hooksScript } from './page-helpers.mjs';
import { ensureDir, log } from './util.mjs';

const CONSENT_RE =
  /^(accept( all)?( cookies)?|allow all( cookies)?|allow cookies|agree( (and|&) (continue|close))?|i agree|i accept|got it|ok|okay|accept (and|&) (continue|close)|yes,? i (agree|accept)|accept all (and|&) close)$/i;

/** Click a cookie/consent "accept" button if one is visible. Returns the clicked label or null. */
export async function dismissConsent(page) {
  try {
    const label = await page.evaluate((reSrc) => {
      const re = new RegExp(reSrc, 'i');
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
      };
      const all = [...document.querySelectorAll('button, a, [role=button], input[type=button], input[type=submit]')].filter(visible);
      const hits = all.filter((el) => re.test((el.innerText || el.value || '').replace(/\s+/g, ' ').trim()));
      const inBanner = (el) => el.closest('[id*=cookie i],[class*=cookie i],[id*=consent i],[class*=consent i],[id*=cmp i],[class*=cmp i],[id*=onetrust i],[class*=gdpr i],[id*=gdpr i],[role=dialog]');
      const pick = hits.find(inBanner) || (hits.length === 1 ? hits[0] : null);
      if (!pick) return null;
      pick.setAttribute('data-cap-consent', '1');
      return (pick.innerText || pick.value).trim();
    }, CONSENT_RE.source);
    if (!label) return null;
    await page.locator('[data-cap-consent]').first().click({ timeout: 2500 });
    log('consent', `clicked "${label}"`);
    return label;
  } catch {
    return null;
  }
}

/** Close an open modal/popup with Escape (only when one is actually showing). */
export async function dismissPopups(page) {
  const open = await page
    .evaluate(() => !!document.querySelector('dialog[open], [role=dialog]:not([aria-hidden=true]), [aria-modal=true]'))
    .catch(() => false);
  if (open) await page.keyboard.press('Escape').catch(() => {});
}

export class BlockedError extends Error {
  constructor(info) {
    super(`blocked: ${info.reason}`);
    this.info = info;
  }
}

/**
 * Detect that the site refused us or served a challenge/error page instead of itself. We only detect
 * and report this; nothing here tries to get past a bot wall.
 * `net` = { status, challengeSeen, cssTotal, cssFailed } gathered from network events during load.
 */
export async function assessBlocked(page, net) {
  if ([401, 403, 429, 503].includes(net.status)) return { blocked: true, reason: `document returned HTTP ${net.status}`, httpStatus: net.status };
  if (net.challengeSeen) return { blocked: true, reason: `bot-protection challenge script requested (${net.challengeSeen})`, httpStatus: net.status };
  if (net.cssTotal > 0 && net.cssFailed === net.cssTotal) return { blocked: true, reason: `all ${net.cssTotal} stylesheets failed to load (likely blocked)`, httpStatus: net.status };
  const wall = await page
    .evaluate(() => {
      const title = document.title || '';
      const text = (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').trim();
      const re = /just a moment|attention required|access denied|are you a (human|robot)|verify you are (a )?human|security check|captcha|unusual traffic|pardon our interruption|press (and|&) hold|checking your browser|vercel security checkpoint/i;
      const widget = document.querySelector('iframe[src*="challenges.cloudflare"], iframe[src*="captcha"], #px-captcha, .g-recaptcha, #challenge-form, .cf-turnstile');
      const hit = re.test(title) || (text.length < 1200 && re.test(text)) || (!!widget && text.length < 1200);
      return hit ? { title, sample: text.slice(0, 160) } : null;
    })
    .catch(() => null);
  if (wall) return { blocked: true, reason: `challenge page content ("${wall.title || wall.sample.slice(0, 60)}")`, httpStatus: net.status };
  return null;
}

/**
 * Find what actually scrolls. Window by default; an inner scroller when the document itself cannot
 * scroll (body overflow:hidden + app shell). The element is tagged data-cap-scroller for page helpers.
 */
export async function findScroller(page) {
  return page.evaluate(() => {
    const de = document.scrollingElement || document.documentElement;
    const hidden = (el) => ['hidden', 'clip'].includes(getComputedStyle(el).overflowY);
    if (de.scrollHeight > innerHeight * 1.15 && !hidden(document.body) && !hidden(de)) return { mode: 'window' };
    let best = null;
    let bestArea = 0;
    let n = 0;
    for (const el of document.querySelectorAll('body *')) {
      if (++n > 5000) break;
      const oy = getComputedStyle(el).overflowY;
      if (!['auto', 'scroll', 'overlay'].includes(oy)) continue;
      if (el.scrollHeight <= el.clientHeight * 1.15 || el.clientHeight < innerHeight * 0.5 || el.clientWidth < innerWidth * 0.5) continue;
      const area = el.clientWidth * el.clientHeight;
      if (area > bestArea) {
        best = el;
        bestArea = area;
      }
    }
    if (!best) return { mode: 'window' };
    best.setAttribute('data-cap-scroller', '1');
    return { mode: 'element', selector: window.__cap.sel(best) };
  });
}

/** Drives scrolling through real wheel events so smooth-scroll libraries respond like they do for users. */
export class Scroller {
  constructor(page, info) {
    this.page = page;
    this.info = info;
  }

  /** Current scroll position, scrollable height and viewport height. */
  async state() {
    return this.page.evaluate(() => ({ y: Math.round(window.__cap.scrollTop()), h: Math.round(window.__cap.scrollHeight()), vh: innerHeight, vw: innerWidth }));
  }

  /** Where the wheel should be dispatched: over the scroll container, else viewport centre. */
  async point() {
    return this.page.evaluate(() => {
      const s = window.__cap.scrollEl();
      const r = s ? s.getBoundingClientRect() : { left: 0, top: 0, width: innerWidth, height: innerHeight };
      return { x: Math.round(Math.max(0, r.left) + Math.min(r.width, innerWidth) / 2), y: Math.round(Math.max(0, r.top) + Math.min(r.height, innerHeight) / 2) };
    });
  }

  /** One wheel event at the scroll point; `move` repositions the pointer first (skip it for rapid streams). */
  async wheel(dy, move = true) {
    if (!this._pt) this._pt = await this.point();
    if (move) await this.page.mouse.move(this._pt.x, this._pt.y);
    await this.page.mouse.wheel(0, dy);
  }

  /** Wheel `px` pixels as `parts` events over ~`ms`, like a trackpad flick. */
  async flick(px, { parts = 4, ms = 160 } = {}) {
    for (let i = 0; i < parts; i++) {
      await this.wheel(px / parts, i === 0);
      await sleep(ms / parts);
    }
  }

  /** Wait until scroll position stops changing (smooth scrollers keep moving after the wheel stops). */
  async waitIdle({ timeout = 1500, stable = 3, poll = 80 } = {}) {
    const end = Date.now() + timeout;
    let last = null;
    let same = 0;
    while (Date.now() < end) {
      const { y } = await this.state();
      same = y === last ? same + 1 : 0;
      if (same >= stable) return true;
      last = y;
      await sleep(poll);
    }
    return false;
  }

  /** Wheel until the element's centre sits near the middle of the viewport. Returns its viewport rect or null. */
  async toElement(handle, { tolerance = 0.18 } = {}) {
    for (let i = 0; i < 24; i++) {
      const r = await handle.evaluate((el) => {
        const b = el.getBoundingClientRect();
        return { x: b.x, y: b.y, width: b.width, height: b.height, vh: innerHeight, vw: innerWidth };
      });
      const off = r.y + r.height / 2 - r.vh / 2;
      const fits = r.height < r.vh * 0.8;
      if (Math.abs(off) < r.vh * tolerance || (!fits && r.y < r.vh * 0.5 && r.y + r.height > r.vh * 0.5)) return r;
      const before = (await this.state()).y;
      await this.flick(Math.max(-1400, Math.min(1400, off)), { parts: 4, ms: 140 });
      await this.waitIdle({ timeout: 1800 });
      if ((await this.state()).y === before) return r; // cannot scroll further
    }
    return handle.evaluate((el) => {
      const b = el.getBoundingClientRect();
      return { x: b.x, y: b.y, width: b.width, height: b.height, vh: innerHeight, vw: innerWidth };
    });
  }
}

/**
 * Open the target URL in a fresh context with the init scripts installed.
 * Returns { context, page, scroller, navStart, waitIntro, close }.
 *  - video:  record at viewport size from page creation (captures the loader)
 *  - hooks:  also install the recording hooks (probe)
 */
export async function openPage(run, { video = false, hooks = false, label = 'page', onResponse } = {}) {
  const { browser, profile, url, dir, opts } = run;
  const viewport = profile.viewport;
  const videoDir = path.join(dir, 'video', `_tmp-${label}`);
  if (video) {
    fs.rmSync(videoDir, { recursive: true, force: true });
    ensureDir(videoDir);
  }
  const context = await browser.newContext(contextOptions(profile, video ? { recordVideo: { dir: videoDir, size: viewport } } : {}));
  context.setDefaultTimeout(15000);
  await context.addInitScript(helpersScript);
  if (hooks) await context.addInitScript(hooksScript);
  const navStart = Date.now();
  const page = await context.newPage();
  const net = { status: null, challengeSeen: null, cssTotal: 0, cssFailed: 0 };
  page.on('response', (res) => {
    const req = res.request();
    if (req.isNavigationRequest() && req.frame() === page.mainFrame() && net.status === null) net.status = res.status();
    if (/\/\.well-known\/vercel\/security|challenges\.cloudflare\.com|cdn-cgi\/challenge-platform|captcha-delivery|px-cdn\.net/i.test(res.url())) net.challengeSeen = res.url().slice(0, 120);
    if (req.resourceType() === 'stylesheet') {
      net.cssTotal++;
      if (res.status() >= 400) net.cssFailed++;
    }
    if (onResponse) onResponse(res);
  });
  page.on('requestfailed', (req) => {
    if (req.resourceType() === 'stylesheet') {
      net.cssTotal++;
      net.cssFailed++;
    }
  });
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: opts.navTimeout });
  } catch (e) {
    await context.close().catch(() => {});
    throw new Error(`navigation to ${url} failed: ${e.message.split('\n')[0]}`);
  }
  await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => log(label, 'network never idle (continuing)'));
  const blocked = await assessBlocked(page, net);
  if (blocked) {
    run.shared.blocked = blocked;
    await context.close().catch(() => {});
    throw new BlockedError(blocked);
  }
  await dismissConsent(page);

  const session = {
    context,
    page,
    navStart,
    scroller: null,
    videoDir,
    /** Wait out the intro: until `introWait` ms after navigation started. `tick` runs every ~250 ms. */
    async waitIntro(tick) {
      const end = navStart + opts.introWait;
      while (Date.now() < end) {
        if (tick) await tick();
        await sleep(Math.min(250, Math.max(0, end - Date.now())));
      }
      await dismissConsent(page);
      await dismissPopups(page);
    },
    async initScroller() {
      session.scroller = new Scroller(page, await findScroller(page));
      return session.scroller;
    },
    /** Close the context (flushes the video). Returns the recorded webm path or null. */
    async close() {
      let videoPath = null;
      if (video) {
        const v = page.video();
        await context.close().catch(() => {});
        videoPath = v ? await v.path().catch(() => null) : null;
      } else {
        await context.close().catch(() => {});
      }
      return videoPath;
    },
  };
  return session;
}

/** Remove the temp video folder after the webm has been moved/converted. */
export function cleanupVideoDir(session) {
  fs.rmSync(session.videoDir, { recursive: true, force: true });
}

