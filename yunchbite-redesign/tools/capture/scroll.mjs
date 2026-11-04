// Pass 1: intro + scroll video. Records from navigation start (so the loader is captured),
// scrolls top -> bottom with real wheel input, pauses, then scrolls back up partway.
// Produces video/scroll.mp4 and scroll-timeline.json.
import fs from 'node:fs';
import path from 'node:path';
import { sleep } from '../lib/browser.mjs';
import { cleanupVideoDir, openPage } from './session.mjs';
import { ensureDir, ffprobeDuration, log, toMp4, writeJson } from './util.mjs';

const TICK_MS = 50; // wheel cadence: one event every ~50 ms with speed*dt pixels each
const SAMPLE_MS = 250;
const STALL_MS = 2500; // scroll position unchanged this long while wheeling => scroll-jacked / blocked
const BOTTOM_HOLD_MS = 1200; // at the bottom with no height growth this long => finished

export async function runScroll(run) {
  const { dir, opts, deadline } = run;
  const s = await openPage(run, { video: true, label: 'scroll' });
  const { page } = s;
  const samples = [];
  const phases = [];
  let phase = 'intro';
  const phaseStart = (name) => {
    phase = name;
    phases.push({ name, from: +((Date.now() - s.navStart) / 1000).toFixed(2), to: null });
  };
  const phaseEnd = () => {
    phases[phases.length - 1].to = +((Date.now() - s.navStart) / 1000).toFixed(2);
  };
  let latest = { y: 0, h: 0 };
  const sample = async () => {
    const st = await page.evaluate(() => ({ y: Math.round(window.__cap.scrollTop()), docHeight: Math.round(window.__cap.scrollHeight()), section: window.__cap.inView() })).catch(() => null);
    if (!st) return;
    latest = { y: st.y, h: st.docHeight };
    samples.push({ t: +((Date.now() - s.navStart) / 1000).toFixed(2), scrollY: st.y, docHeight: st.docHeight, section: st.section, phase });
  };

  let endReason = {};
  let video = null;
  try {
    phaseStart('intro');
    await s.waitIntro(sample);
    phaseEnd();
    const scroller = await s.initScroller();
    const vh = (await scroller.state()).vh;
    const hardStop = Math.min(deadline, Date.now() + opts.scrollMax * 1000);

    /** Wheel steadily in `dir` until `done(state)` returns a reason, scroll stalls, or time runs out. */
    const drive = async (dir, done) => {
      let lastTick = Date.now();
      let lastSample = 0;
      let lastY = latest.y;
      let lastChange = Date.now();
      let bottomSince = null;
      let first = true;
      while (Date.now() < hardStop) {
        const now = Date.now();
        const px = Math.min(150, (opts.scrollSpeed * (now - lastTick)) / 1000);
        lastTick = now;
        if (px > 0) await scroller.wheel(dir * px, first);
        first = false;
        if (now - lastSample >= SAMPLE_MS) {
          lastSample = now;
          await sample();
          if (latest.y !== lastY) {
            lastY = latest.y;
            lastChange = Date.now();
          }
          if (Date.now() - lastChange > STALL_MS) return 'stalled (scroll position stopped changing)';
          const atBottom = latest.y + vh >= latest.h - 2;
          if (dir > 0) {
            bottomSince = atBottom ? bottomSince ?? Date.now() : null;
            if (bottomSince && Date.now() - bottomSince > BOTTOM_HOLD_MS) return 'bottom reached';
          }
          const reason = done(latest);
          if (reason) return reason;
        }
        await sleep(Math.max(0, TICK_MS - (Date.now() - now)));
      }
      return 'time cap reached';
    };

    log('scroll', `scrolling down at ~${opts.scrollSpeed}px/s (viewport ${vh}px)`);
    phaseStart('scroll-down');
    endReason.down = await drive(1, () => null);
    phaseEnd();
    const bottomY = latest.y;

    phaseStart('pause-bottom');
    for (let i = 0; i < 6; i++) {
      await sleep(250);
      await sample();
    }
    phaseEnd();

    const upBy = Math.min(6000, Math.max(vh * 2, latest.h * 0.4));
    log('scroll', `scrolling back up ~${Math.round(upBy)}px`);
    phaseStart('scroll-up');
    endReason.up = await drive(-1, (st) => (st.y <= Math.max(0, bottomY - upBy) ? 'target reached' : null));
    phaseEnd();
    for (let i = 0; i < 3; i++) {
      await sleep(250);
      await sample();
    }
    log('scroll', `done: down=${endReason.down}; up=${endReason.up}`);

    const webm = await s.close();
    ensureDir(path.join(dir, 'video'));
    const mp4 = path.join(dir, 'video', 'scroll.mp4');
    if (!webm) throw new Error('no video was recorded');
    await toMp4(webm, mp4);
    cleanupVideoDir(s);
    video = mp4;
    const duration = await ffprobeDuration(mp4);
    const timelineFile = path.join(dir, 'scroll-timeline.json');
    writeJson(timelineFile, {
      url: run.url,
      profile: run.profile.name,
      viewport: run.profile.viewport,
      scroller: scroller.info,
      scrollSpeedPxPerSec: opts.scrollSpeed,
      endReason,
      videoDurationSec: +duration.toFixed(2),
      note: 'Timeline t = seconds since navigation start; video t = seconds since page creation. They agree within ~0.3 s (the video starts slightly before the first sample).',
      maxDocHeight: Math.max(...samples.map((x) => x.docHeight)),
      phases,
      samples,
    });
    run.shared.scroll = { mp4, timelineFile, duration };
    return { video: path.relative(dir, mp4), durationSec: +duration.toFixed(2), samples: samples.length, endReason };
  } catch (e) {
    if (!video) {
      await s.close().catch(() => {});
      fs.rmSync(s.videoDir, { recursive: true, force: true });
    }
    throw e;
  }
}
