#!/usr/bin/env node
// Motion & interaction capture toolkit. See README.md.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { DESKTOP, MOBILE, launch, slugify } from '../lib/browser.mjs';
import { runCursor } from './cursor.mjs';
import { runFrames } from './frames.mjs';
import { runHover } from './hover.mjs';
import { runProbe } from './probe.mjs';
import { summarizeProfile, writeBlocked, writeReport } from './report.mjs';
import { runScroll } from './scroll.mjs';
import { BlockedError } from './session.mjs';
import { runSteps } from './steps.mjs';
import { runTransition } from './transition.mjs';
import { ensureDir, log, writeJson } from './util.mjs';

const HELP = `Usage: node capture/capture.mjs <url> [options]

  --out <dir>            output folder (default research/references/<host+path slug>/)
  --label <name>         use <name> instead of the URL slug for the default folder
  --profiles <list>      desktop,mobile (default both)
  --passes <list>        all | probe,scroll,frames,steps,hover,cursor,transition (default all)
                         (scroll implies frames; hover/cursor are skipped on touch profiles under "all")
  --max-hovers <n>       hover elements to capture (default 24)
  --scroll-speed <px/s>  wheel speed for the scroll video (default 900)
  --intro-wait <ms>      time after navigation to let loaders/intros play (default 4000)
  --budget <sec>         time budget per profile (default 420); later passes are skipped when spent
  --scroll-max <sec>     cap on the scroll-down phase (default 150)
  --step <fraction>      scroll-steps increment in viewports (default 0.5)
  --max-steps <n>        cap on step screenshots (default 80)
  --scene-threshold <x>  ffmpeg scene-change threshold for keyframes (default 0.08)
  --max-keyframes <n>    cap on keyframes (default 60)
  --sheet-fps <n>        contact sheet sampling rate (default 4)
  --full-page-cap <px>   cap for the full-page screenshot height (default 20000)
  -h, --help
`;

const PASS_ORDER = ['probe', 'scroll', 'frames', 'steps', 'hover', 'cursor', 'transition'];
const RUNNERS = { probe: runProbe, scroll: runScroll, frames: runFrames, steps: runSteps, hover: runHover, cursor: runCursor, transition: runTransition };
const PROFILES = { desktop: DESKTOP, mobile: MOBILE };

function parseCli(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      out: { type: 'string' }, label: { type: 'string' }, profiles: { type: 'string', default: 'desktop,mobile' }, passes: { type: 'string', default: 'all' },
      'max-hovers': { type: 'string', default: '24' }, 'scroll-speed': { type: 'string', default: '900' }, 'intro-wait': { type: 'string', default: '4000' },
      budget: { type: 'string', default: '420' }, 'scroll-max': { type: 'string', default: '150' }, step: { type: 'string', default: '0.5' }, 'max-steps': { type: 'string', default: '80' },
      'scene-threshold': { type: 'string', default: '0.08' }, 'max-keyframes': { type: 'string', default: '60' }, 'sheet-fps': { type: 'string', default: '4' }, 'full-page-cap': { type: 'string', default: '20000' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help || !positionals.length) {
    console.log(HELP);
    process.exit(values.help ? 0 : 1);
  }
  const url = positionals[0];
  try {
    new URL(url);
  } catch {
    console.error(`Invalid URL: ${url}`);
    process.exit(1);
  }
  const u = new URL(url);
  const profiles = values.profiles.split(',').map((p) => p.trim()).filter(Boolean);
  for (const p of profiles) if (!PROFILES[p]) throw new Error(`unknown profile "${p}" (desktop, mobile)`);
  const explicit = values.passes === 'all' ? null : values.passes.split(',').map((p) => p.trim());
  if (explicit) for (const p of explicit) if (!RUNNERS[p]) throw new Error(`unknown pass "${p}"`);
  const num = (k) => Number(values[k]);
  return {
    url,
    out: path.resolve(values.out || path.join(fileURLToPath(new URL('../../research/references/', import.meta.url)), values.label || slugify(u.host + u.pathname))),
    profiles,
    explicit,
    opts: {
      maxHovers: num('max-hovers'), scrollSpeed: num('scroll-speed'), introWait: num('intro-wait'), budget: num('budget'), scrollMax: num('scroll-max'),
      stepFraction: num('step'), maxSteps: num('max-steps'), sceneThreshold: num('scene-threshold'), maxKeyframes: num('max-keyframes'), sheetFps: num('sheet-fps'),
      fullPageCap: num('full-page-cap'), settleTimeout: 2500, navTimeout: 30000, maxTransitions: 2,
    },
  };
}

/** Which passes to run for a profile, with reasons for those left out. */
function planPasses(explicit, profile) {
  const wanted = new Set(explicit || PASS_ORDER);
  if (wanted.has('scroll')) wanted.add('frames');
  const plan = [];
  const skipped = {};
  for (const p of PASS_ORDER) {
    if (!wanted.has(p)) continue;
    if (!explicit && profile.isMobile && (p === 'hover' || p === 'cursor')) skipped[p] = { status: 'skipped', reason: 'touch profile: hover and pointer effects do not apply (request explicitly with --passes to force)' };
    else plan.push(p);
  }
  return { plan, skipped };
}

export async function capture(argv) {
  const cli = parseCli(argv);
  ensureDir(cli.out);
  const started = Date.now();
  log('capture', `${cli.url} -> ${cli.out}`);
  const browser = await launch();
  const summaries = [];
  let blocked = null;
  try {
    for (const name of cli.profiles) {
      const profile = PROFILES[name];
      const dir = path.join(cli.out, name);
      ensureDir(dir);
      const run = { browser, profile, url: cli.url, dir, opts: cli.opts, deadline: Date.now() + cli.opts.budget * 1000, shared: {} };
      const { plan, skipped } = planPasses(cli.explicit, profile);
      const status = { ...skipped };
      const profileStart = Date.now();
      log('capture', `=== profile ${name}: ${plan.join(', ')}`);
      for (const pass of plan) {
        if (blocked) {
          status[pass] = { status: 'skipped', reason: 'site is blocking automated access' };
          continue;
        }
        if (Date.now() > run.deadline) {
          status[pass] = { status: 'skipped', reason: 'time budget exhausted' };
          log(pass, 'skipped: time budget exhausted');
          continue;
        }
        const t0 = Date.now();
        try {
          log(pass, 'start');
          const detail = await RUNNERS[pass](run);
          status[pass] = { status: 'ok', seconds: +((Date.now() - t0) / 1000).toFixed(1), detail };
        } catch (e) {
          if (e instanceof BlockedError) {
            blocked = e.info;
            status[pass] = { status: 'blocked', seconds: +((Date.now() - t0) / 1000).toFixed(1), reason: e.info.reason };
            log(pass, `BLOCKED: ${e.info.reason}`);
          } else {
            status[pass] = { status: 'failed', seconds: +((Date.now() - t0) / 1000).toFixed(1), error: e.message.split('\n')[0] };
            log(pass, `FAILED: ${e.message}`);
          }
        }
      }
      writeJson(path.join(dir, 'status.json'), status);
      summaries.push({ ...summarizeProfile(dir, name, status), seconds: +((Date.now() - profileStart) / 1000).toFixed(1) });
      if (blocked) break;
    }
  } finally {
    await browser.close();
  }
  const meta = { capturedAt: new Date().toISOString(), totalSeconds: +((Date.now() - started) / 1000).toFixed(1) };
  if (blocked) writeBlocked(cli.out, cli.url, blocked, meta);
  else writeReport(cli.out, cli.url, summaries, meta);
  log('capture', `${blocked ? 'BLOCKED - ' + blocked.reason : 'done'} in ${meta.totalSeconds}s; report: ${path.join(cli.out, 'report.md')}`);
  return { out: cli.out, summaries, blocked };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  capture(process.argv.slice(2)).then((r) => process.exit(r.blocked ? 2 : 0), (e) => {
    console.error(e.message);
    process.exit(1);
  });
}
