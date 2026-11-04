#!/usr/bin/env node
// Frame-by-frame analysis of a screen recording of a motion-heavy website. See README.md.
import path from 'node:path';
import { mkdir, writeFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { log, round, fmtDur } from './util.mjs';
import { probeVideo } from './probe.mjs';
import { detectCrop, parseCrop, cropPreview } from './crop.mjs';
import { analyseMotion, sceneScores } from './motion.mjs';
import { buildTimeline, classifyFrames, deriveEvents, scrollProfile } from './segments.mjs';
import { Renderer, makeSheets, makeEventStrips, makeRawFrames } from './render.mjs';
import { renderTimelineChart } from './chart.mjs';
import { buildViewerHtml } from './viewer.mjs';
import { buildReport } from './report.mjs';

const HELP = `Usage: node video/analyze-video.mjs <video> [options]

Frame-by-frame motion analysis of a website screen recording (VFR-safe, browser chrome auto-cropped).

Options:
  --out <dir>        output directory (default: <dir of video>/../analysis/<basename>/)
  --crop <spec>      auto (default) | none | W:H:X:Y  (source pixels)
  --sheet-fps <n>    contact-sheet sampling rate, by timestamp (default 4)
  --max-strip <n>    max tiles per event filmstrip; longer events are sampled evenly (default 24)
  --all-frames       also write every frame as JPG (cropped, 960 px wide) to frames/raw/
  --label <name>     display name used in the report, chart and viewer (default: file basename)
  --no-strips        skip event strips (faster)
  --no-sheets        skip contact sheets
  -h, --help         this help
`;

function parseArgs(argv) {
  const a = { crop: 'auto', sheetFps: 4, maxStrip: 24, allFrames: false, strips: true, sheets: true };
  const pos = [];
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i], nx = () => { if (i + 1 >= argv.length) throw new Error(`${k} needs a value`); return argv[++i]; };
    if (k === '-h' || k === '--help') a.help = true;
    else if (k === '--out') a.out = nx();
    else if (k === '--crop') a.crop = nx();
    else if (k === '--sheet-fps') a.sheetFps = parseFloat(nx());
    else if (k === '--max-strip') a.maxStrip = parseInt(nx(), 10);
    else if (k === '--label') a.label = nx();
    else if (k === '--all-frames') a.allFrames = true;
    else if (k === '--no-strips') a.strips = false;
    else if (k === '--no-sheets') a.sheets = false;
    else if (k.startsWith('-')) throw new Error(`unknown option ${k}`);
    else pos.push(k);
  }
  a.video = pos[0];
  if (!(a.sheetFps > 0)) throw new Error('--sheet-fps must be > 0');
  if (!(a.maxStrip >= 2)) throw new Error('--max-strip must be >= 2');
  return a;
}

async function main() {
  const t0 = Date.now();
  let args;
  try { args = parseArgs(process.argv.slice(2)); } catch (e) { console.error(e.message + '\n\n' + HELP); process.exit(2); }
  if (args.help || !args.video) { console.log(HELP); process.exit(args.help ? 0 : 2); }
  const video = path.resolve(args.video);
  if (!existsSync(video)) { console.error(`input not found: ${video}`); process.exit(2); }
  const base = path.basename(video).replace(/\.[^.]+$/, '');
  const outDir = path.resolve(args.out || path.join(path.dirname(video), '..', 'analysis', base));
  const label = args.label || base;
  await mkdir(outDir, { recursive: true });
  log(`input  ${video}\n         output ${outDir}`);

  const errors = [];
  const stage = async (name, fn) => {
    const s = Date.now();
    try { const r = await fn(); log(`stage ${name}: ok (${fmtDur((Date.now() - s) / 1000)})`); return r; }
    catch (e) { errors.push({ stage: name, message: String(e.stack?.split('\n').slice(0, 2).join(' ') || e.message || e) }); log(`stage ${name}: FAILED: ${e.message}`); return null; }
  };

  const probe = await stage('probe', () => probeVideo(video));
  if (!probe) { await writeFile(path.join(outDir, 'report.md'), buildReport({ label, input: video, errors })); process.exit(1); }
  log(`probe: ${probe.width}x${probe.height} ${probe.codec}, ${probe.stats.frames} frames, ${probe.stats.duration.toFixed(2)}s, avg ${probe.stats.avgFps.toFixed(2)} fps (VFR; ${probe.stats.gapFrames} gap frames)`);

  // crop
  let crop = await stage('crop', async () => parseCrop(args.crop, probe.width, probe.height) || detectCrop(video, probe));
  if (!crop) { crop = { x: 0, y: 0, w: probe.width & ~1, h: probe.height & ~1, source: 'fallback-none' }; }
  await stage('crop-preview', () => cropPreview(video, probe, crop, path.join(outDir, 'crop-preview.jpg')));

  // motion
  const motion = await stage('motion', () => analyseMotion(video, probe, crop));
  let scene = null;
  if (motion) scene = await stage('scene-scores', () => sceneScores(video, crop, motion.aw, motion.ah, probe.times.length));

  let timeline = null, events = [], profile = null, noise = null, params = null;
  if (motion) {
    const seg = await stage('segments', async () => {
      const tl = buildTimeline({ times: probe.times, motion, crop, scene });
      const c = classifyFrames(tl);
      const ev = deriveEvents(c.timeline, c.params);
      return { ...c, events: ev };
    });
    if (seg) { timeline = seg.timeline; events = seg.events; noise = seg.noise; params = seg.params; profile = scrollProfile(timeline, events); }
  }

  const R = await new Renderer().open().catch((e) => { errors.push({ stage: 'playwright', message: e.message }); return null; });
  let strips = null, sheets = null;

  if (timeline) {
    await stage('timeline.png', async () => { if (!R) throw new Error('no browser'); await renderTimelineChart(R, { tl: timeline, events, probe, label, crop, noise }, path.join(outDir, 'timeline.png')); });
    if (args.sheets) sheets = await stage('sheets', async () => { if (!R) throw new Error('no browser'); return makeSheets({ file: video, probe, crop, outDir, sheetFps: args.sheetFps, R }); });
    if (args.strips) strips = await stage('event-strips', async () => { if (!R) throw new Error('no browser'); return makeEventStrips({ file: video, probe, crop, events, timeline, outDir, maxStrip: args.maxStrip, R }); });
    if (args.allFrames) await stage('raw-frames', () => makeRawFrames({ file: video, probe, crop, outDir }));
    for (const e of events) if (strips?.[e.id] && !strips[e.id].error) e.strip = strips[e.id].strip;
  }
  await R?.close();

  // JSON outputs
  if (timeline) {
    await stage('json', async () => {
      const r = (v, d) => round(v, d);
      const frames = timeline.map((f) => ({
        n: f.n, t: r(f.t, 5), dt: r(f.dt, 5), dy: r(f.dy, 2), dx: r(f.dx, 2), confidence: r(f.confidence, 3),
        scrollVelocity: r(f.scrollVelocity, 1), scrollVelocityX: r(f.scrollVelocityX, 1), scrollPos: r(f.scrollPos, 1),
        residual: r(f.residual, 3), rawDiff: r(f.rawDiff, 3), energy: r(f.energy, 3), regionGrid: f.regionGrid.map((v) => r(v, 2)),
        sceneScore: f.sceneScore == null ? null : r(f.sceneScore, 3), class: f.class, lowConfidence: f.lowConf,
      }));
      const meta = { input: video, label, frames: probe.stats.frames, duration: probe.stats.duration, stats: probe.stats, crop, analysis: { width: motion.aw, height: motion.ah, scaleX: motion.kx, scaleY: motion.ky },
        grid: { cols: 4, rows: 3, order: 'row-major, top-left first' }, noise, params,
        units: { dy: 'source px since previous frame, + = page scrolled down', dx: '+ = content moved left', scrollVelocity: 'px/s, centred 3-frame', residual: 'mean abs gray diff 0-255 after shift compensation', energy: 'residual above noise floor' } };
      await writeFile(path.join(outDir, 'timeline.json'), JSON.stringify({ meta, frames }));
      await writeFile(path.join(outDir, 'events.json'), JSON.stringify({ meta: { input: video, label, crop }, scrollProfile: profile, events }, null, 1));
    });
    await stage('viewer', async () => {
      const frameImages = {};
      for (const ev of events) {
        const d = path.join(outDir, 'events', `${ev.id}-${ev.type}`, 'frames');
        if (!existsSync(d)) continue;
        for (const fn of await readdir(d)) { const m = /^f(\d+)_/.exec(fn); if (m && fn.endsWith('.jpg')) frameImages[+m[1]] = path.posix.join('events', `${ev.id}-${ev.type}`, 'frames', fn); }
      }
      const rawDir = path.join(outDir, 'frames', 'raw');
      if (existsSync(rawDir)) for (const fn of await readdir(rawDir)) { const m = /^f(\d+)_/.exec(fn); if (m) frameImages[+m[1]] = path.posix.join('frames', 'raw', fn); }
      const rel = path.relative(outDir, video).split(path.sep).join('/');
      await writeFile(path.join(outDir, 'viewer.html'), buildViewerHtml({ label, videoRel: rel, timeline, events, probe, crop, frameImages }));
    });
  }
  const runtimeSec = (Date.now() - t0) / 1000;
  await writeFile(path.join(outDir, 'report.md'), buildReport({ label, input: video, probe, crop, timeline, events, profile, noise, strips, sheets, errors, params, runtimeSec,
    args: process.argv.slice(2).join(' ') }));
  log(`done in ${fmtDur(runtimeSec)}; ${events.length} events; ${errors.length} stage errors. report: ${path.join(outDir, 'report.md')}`);
  process.exit(errors.length ? 3 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
