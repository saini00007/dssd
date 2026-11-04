#!/usr/bin/env node
// Scripted interaction journeys, recorded as one continuous video and then analysed frame by frame.
//
// Use it where the standard capture can't follow the experience, e.g. wheel-driven carousels
// that never move window.scrollY, menus, clicks into product pages, multi-page flows.
//
//   node capture/journey.mjs <journey.json> [--out <dir>] [--no-analyze]
//
// journey.json:
// {
//   "name": "home-jar-slider",                 // file-safe name for the video and analysis folder
//   "site": "agrumeafarm",                     // folder under research/references/ (default out)
//   "url": "https://www.agrumeafarm.it/en",
//   "profile": "desktop",                      // desktop | mobile
//   "steps": [
//     { "do": "wait", "ms": 9000, "label": "loader" },
//     { "do": "consent" },                                     // click a cookie "accept" if one shows
//     { "do": "wheel", "dy": 100, "every": 120, "forMs": 15000 }, // steady wheel input for a fixed time
//     { "do": "wheelToEnd", "dy": 100, "every": 110, "maxMs": 60000 }, // until the page stops scrolling
//     { "do": "move", "x": 720, "y": 450, "ms": 600 },            // glide the mouse (in steps)
//     { "do": "sweep", "from": [200, 450], "to": [1240, 450], "ms": 3000 },
//     { "do": "hover", "selector": "a.card", "nth": 0, "holdMs": 1500 },
//     { "do": "click", "selector": "button.menu" } | { "do": "click", "text": "About" },
//     { "do": "key", "key": "Escape" },
//     { "do": "goto", "url": "https://…" },
//     { "do": "waitForLoad", "ms": 4000 }                       // load event + settle time
//   ]
// }
//
// Outputs (default <repo>/research/references/<site>/journeys/):
//   video/<name>.mp4            the recording (git-ignored: large)
//   <name>.log.json             every step with its start/end time in VIDEO seconds
//   analysis/<name>/            the frame-by-frame analysis from tools/video (events, strips, viewer)
//
// Like the rest of the toolkit, journeys never try to get past bot protection.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { launch, contextOptions, DESKTOP, MOBILE, sleep } from '../lib/browser.mjs';
import { dismissConsent } from './session.mjs';
import { ensureDir, log, toMp4, writeJson, ffprobeDuration } from './util.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');

function parseCli(argv) {
  const opts = { analyze: true };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') opts.out = argv[++i];
    else if (a === '--no-analyze') opts.analyze = false;
    else if (a === '-h' || a === '--help') opts.help = true;
    else rest.push(a);
  }
  opts.file = rest[0];
  return opts;
}

const HELP = `Usage: node capture/journey.mjs <journey.json> [--out <dir>] [--no-analyze]
Runs the scripted steps in Chromium while recording one continuous video, writes a step log with
video timestamps, converts to mp4 and runs tools/video/analyze-video.mjs on it.
See the header of this file for the journey format.`;

/**
 * Move the mouse along a straight path in real time so hover/parallax/magnetic effects react like a
 * user. Time-based: on heavy pages each mouse event can take 100+ ms to be processed, so positions are
 * computed from elapsed time (fewer, larger steps) instead of a fixed step count that would stretch
 * a 0.5 s glide into many seconds.
 */
async function glide(page, state, x, y, ms = 500) {
  const { x: x0, y: y0 } = state.mouse;
  const start = Date.now();
  for (;;) {
    const f = Math.min(1, (Date.now() - start) / ms);
    await page.mouse.move(x0 + (x - x0) * f, y0 + (y - y0) * f);
    if (f >= 1) break;
    await sleep(16);
  }
  state.mouse = { x, y };
}

async function scrollPos(page) {
  return page
    .evaluate(() => {
      // Window scroll, or Lenis' animated position when the site exposes its instance.
      const de = document.scrollingElement || document.documentElement;
      const lenis = window.lenis && typeof window.lenis.scroll === 'number' ? window.lenis.scroll : 0;
      return Math.round(Math.max(de.scrollTop, lenis));
    })
    .catch(() => 0);
}

function locate(page, step) {
  let loc = step.selector ? page.locator(step.selector) : page.getByText(step.text, { exact: !!step.exact });
  return loc.nth(step.nth ?? 0);
}

async function runStep(page, state, step) {
  switch (step.do) {
    case 'wait':
      await sleep(step.ms ?? 1000);
      break;
    case 'waitForLoad':
      await page.waitForLoadState('load', { timeout: 30000 }).catch(() => {});
      await sleep(step.ms ?? 3000);
      break;
    case 'consent':
      await dismissConsent(page);
      await sleep(step.ms ?? 600);
      break;
    case 'goto':
      await page.goto(step.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      break;
    case 'move':
      await glide(page, state, step.x, step.y, step.ms);
      break;
    case 'sweep':
      await glide(page, state, step.from[0], step.from[1], 300);
      await glide(page, state, step.to[0], step.to[1], step.ms ?? 3000);
      break;
    case 'key':
      await page.keyboard.press(step.key);
      await sleep(step.ms ?? 800);
      break;
    case 'wheel': {
      const end = Date.now() + (step.forMs ?? 5000);
      while (Date.now() < end) {
        await page.mouse.wheel(0, step.dy ?? 100);
        await sleep(step.every ?? 120);
      }
      break;
    }
    case 'wheelToEnd': {
      const end = Date.now() + (step.maxMs ?? 60000);
      let last = await scrollPos(page);
      let stillSince = Date.now();
      while (Date.now() < end) {
        await page.mouse.wheel(0, step.dy ?? 100);
        await sleep(step.every ?? 110);
        const y = await scrollPos(page);
        if (Math.abs(y - last) > 2) {
          last = y;
          stillSince = Date.now();
        } else if (Date.now() - stillSince > (step.idleMs ?? 2500)) break;
      }
      await sleep(step.settleMs ?? 1200);
      break;
    }
    case 'hover': {
      const loc = locate(page, step);
      await loc.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
      const box = await loc.boundingBox({ timeout: 5000 });
      if (!box) throw new Error(`hover target not visible: ${step.selector || step.text}`);
      await glide(page, state, box.x + box.width / 2, box.y + box.height / 2, step.moveMs ?? 500);
      await sleep(step.holdMs ?? 1500);
      break;
    }
    case 'click': {
      const loc = locate(page, step);
      const box = await loc.boundingBox({ timeout: 8000 }).catch(() => null);
      if (box) await glide(page, state, box.x + box.width / 2, box.y + box.height / 2, step.moveMs ?? 500);
      await sleep(step.preMs ?? 400);
      await loc.click({ timeout: 8000, force: !!step.force });
      await sleep(step.ms ?? 2500);
      break;
    }
    default:
      throw new Error(`unknown step "${step.do}"`);
  }
}

function runAnalyzer(mp4) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(REPO, 'tools/video/analyze-video.mjs'), mp4, '--crop', 'none'], { stdio: 'inherit' });
    child.on('close', (code) => resolve(code));
  });
}

async function main() {
  const opts = parseCli(process.argv.slice(2));
  if (opts.help || !opts.file) {
    console.log(HELP);
    process.exit(opts.help ? 0 : 1);
  }
  const journey = JSON.parse(fs.readFileSync(opts.file, 'utf8'));
  const name = journey.name || path.basename(opts.file, '.json');
  const out = path.resolve(opts.out || path.join(REPO, 'research/references', journey.site || 'misc', 'journeys'));
  const videoDir = path.join(out, 'video');
  const tmpDir = path.join(out, '.tmp-' + name);
  ensureDir(videoDir);
  ensureDir(tmpDir);
  const profile = journey.profile === 'mobile' ? MOBILE : DESKTOP;
  const size = profile.viewport;

  const browser = await launch();
  const context = await browser.newContext(contextOptions(profile, { recordVideo: { dir: tmpDir, size } }));
  const t0 = Date.now(); // the video starts when the page is created
  const page = await context.newPage();
  const state = { mouse: { x: size.width / 2, y: size.height / 2 } };
  const stepLog = [];
  log('journey', `${name}: ${journey.url} (${journey.steps.length} steps)`);
  try {
    await page.goto(journey.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.mouse.move(state.mouse.x, state.mouse.y);
    for (const [i, step] of journey.steps.entries()) {
      const entry = { i, ...step, start: (Date.now() - t0) / 1000 };
      try {
        await runStep(page, state, step);
        entry.ok = true;
      } catch (err) {
        entry.ok = false;
        entry.error = String(err.message || err).split('\n')[0];
        log('journey', `step ${i} (${step.do}) failed: ${entry.error}`);
      }
      entry.end = (Date.now() - t0) / 1000;
      entry.url = page.url();
      stepLog.push(entry);
      log('journey', `step ${i} ${step.do}${step.label ? ` "${step.label}"` : ''} ${entry.start.toFixed(1)}–${entry.end.toFixed(1)}s ${entry.ok ? 'ok' : 'FAILED'}`);
    }
  } finally {
    await context.close(); // finalises the webm
    await browser.close();
  }

  const webm = fs.readdirSync(tmpDir).find((f) => f.endsWith('.webm'));
  const mp4 = path.join(videoDir, `${name}.mp4`);
  await toMp4(path.join(tmpDir, webm), mp4);
  fs.rmSync(tmpDir, { recursive: true, force: true });
  const duration = await ffprobeDuration(mp4);
  writeJson(path.join(out, `${name}.log.json`), { name, url: journey.url, profile: profile.name, viewport: size, recordedAt: new Date(t0).toISOString(), videoSeconds: duration, steps: stepLog });
  log('journey', `video ${path.relative(REPO, mp4)} (${duration.toFixed(1)}s), log ${name}.log.json`);

  if (opts.analyze) {
    const code = await runAnalyzer(mp4);
    log('journey', `frame analysis ${code === 0 ? 'done' : `exited ${code}`}: ${path.relative(REPO, path.join(out, 'analysis', name))}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
