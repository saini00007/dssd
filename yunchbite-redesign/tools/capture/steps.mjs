// Pass 3: deterministic scroll states. Wheel the document in fixed increments, wait for motion to
// settle, screenshot each state; finish with one full-page screenshot.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { sleep } from '../lib/browser.mjs';
import { openPage } from './session.mjs';
import { ensureDir, log, pad, writeJson } from './util.mjs';

/** In-page quiescence probe: finite animations, active gsap tweens, Lenis smoothing. */
function quietProbe() {
  const finite = document.getAnimations().filter((a) => {
    if (a.playState !== 'running') return false;
    const end = a.effect && a.effect.getComputedTiming().endTime;
    return Number.isFinite(end);
  }).length;
  const g = window.gsap;
  const tweens = g
    ? g.globalTimeline.getChildren(true, true, false).filter((t) => t.isActive() && Number.isFinite(t.totalDuration())).length
    : 0;
  return { finite, tweens, lenisScrolling: window.lenis ? !!window.lenis.isScrolling : false, y: Math.round(window.__cap.scrollTop()) };
}

/**
 * Wait for motion to settle: scroll position, finite animations, gsap tweens and Lenis are quiet for two
 * polls (endless loops such as marquees are ignored); otherwise two consecutive screenshots hash equal.
 */
export async function settle(page, timeoutMs) {
  const start = Date.now();
  let prevY = null;
  let prevHash = null;
  while (Date.now() - start < timeoutMs) {
    const q = await page.evaluate(quietProbe);
    if (q.finite === 0 && q.tweens === 0 && !q.lenisScrolling && q.y === prevY) return { how: 'no running animations', ms: Date.now() - start };
    prevY = q.y;
    // Not quiet by DOM measures: fall back to comparing screenshots once the quick checks had a chance.
    if (Date.now() - start > 1800) {
      const hash = crypto.createHash('md5').update(await page.screenshot({ type: 'jpeg', quality: 40, scale: 'css' })).digest('hex');
      if (hash === prevHash) return { how: 'identical frames', ms: Date.now() - start };
      prevHash = hash;
    }
    await sleep(120);
  }
  return { how: 'timeout (continuous motion on page)', ms: Date.now() - start };
}

export async function runSteps(run) {
  const { dir, opts, deadline } = run;
  const outDir = path.join(dir, 'steps');
  fs.rmSync(outDir, { recursive: true, force: true });
  ensureDir(outDir);
  const s = await openPage(run, { label: 'steps' });
  try {
    const { page } = s;
    await s.waitIntro();
    const scroller = await s.initScroller();
    const steps = [];
    const shot = async (settled) => {
      const st = await scroller.state();
      const section = await page.evaluate(() => window.__cap.inView());
      const index = steps.length;
      const file = `steps/step-${pad(index)}-y${pad(st.y, 4)}.jpg`;
      await page.screenshot({ path: path.join(dir, file), type: 'jpeg', quality: 85, scale: 'css', timeout: 40000 });
      steps.push({ index, file, scrollY: st.y, docHeight: st.h, viewportHeight: st.vh, section, settled: settled.how, settleMs: settled.ms });
      return st;
    };

    let st = await scroller.state();
    const stepPx = Math.round(st.vh * opts.stepFraction);
    log('steps', `stepping ${stepPx}px (${opts.stepFraction} viewport)`);
    await shot(await settle(page, opts.settleTimeout)).catch((e) => log('steps', `first screenshot failed: ${e.message.split('\n')[0]}`));
    let stuck = 0;
    let failures = 0;
    while (steps.length < opts.maxSteps && Date.now() < deadline && failures < 3) {
      const before = (await scroller.state()).y;
      await scroller.flick(stepPx, { parts: 5, ms: 200 });
      const how = await settle(page, opts.settleTimeout);
      try {
        st = await shot(how);
        failures = 0;
      } catch (e) {
        failures++;
        log('steps', `screenshot failed at y=${(await scroller.state()).y}: ${e.message.split('\n')[0]}`);
        continue;
      }
      if (st.y === before) {
        if (++stuck >= 2) break;
      } else stuck = 0;
      if (st.y + st.vh >= st.h - 2) break;
    }

    // Full-page screenshot after everything has been scrolled through (lazy content/reveals done).
    await page.evaluate(() => (window.lenis ? window.lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0)));
    await sleep(800);
    const final = await scroller.state();
    const height = Math.min(final.h, opts.fullPageCap);
    let fullPage = { file: 'steps/fullpage.jpg', height, capped: final.h > opts.fullPageCap, docHeight: final.h };
    try {
      await page.screenshot({ path: path.join(dir, fullPage.file), type: 'jpeg', quality: 80, scale: 'css', fullPage: true, clip: { x: 0, y: 0, width: final.vw, height }, timeout: 30000 });
    } catch (e) {
      fullPage = { ...fullPage, file: null, error: e.message.split('\n')[0] };
    }
    fullPage.limitations =
      'Full-page capture resizes the viewport, so vh-based layouts, pinned (ScrollTrigger) sections, smooth-scroll wrappers and scroll-linked reveals can look different from the real scrolled page' +
      (scroller.info.mode === 'element' ? '; this page scrolls an inner container, so the full-page image only shows the outer document' : '');

    writeJson(path.join(dir, 'steps', 'steps.json'), { stepPx, scroller: scroller.info, steps, fullPage, abortedAfterScreenshotFailures: failures >= 3 });
    log('steps', `${steps.length} step screenshots, full page ${fullPage.file ? 'ok' : 'failed'}`);
    return { steps: steps.length, fullPage: fullPage.file };
  } finally {
    await s.close();
  }
}
