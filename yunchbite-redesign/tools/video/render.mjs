// Rendering: frame extraction (honouring VFR timestamps), contact sheets, event filmstrips.
// Tiles are composed as HTML and screenshotted with Playwright (via ../lib/browser.mjs): this gives readable
// caption bars under every tile without needing ffmpeg drawtext/freetype.
import { mkdir, readFile, writeFile, readdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { ffmpeg, log, nearestIdx, fesc, round } from './util.mjs';
import { launch } from '../lib/browser.mjs';

export class Renderer {
  async open() { this.browser = await launch(); this.ctx = await this.browser.newContext({ deviceScaleFactor: 1 }); this.page = await this.ctx.newPage(); return this; }
  async close() { try { await this.browser?.close(); } catch { /* ignore */ } }
  async html(html, width, outFile, { type = 'jpeg', quality = 88, height = 400 } = {}) {
    await this.page.setViewportSize({ width, height });
    await this.page.setContent(html, { waitUntil: 'load' });
    await this.page.evaluate(() => Promise.all([...document.images].map((i) => (i.decode ? i.decode().catch(() => {}) : null))));
    await this.page.screenshot({ path: outFile, fullPage: true, type, ...(type === 'jpeg' ? { quality } : {}) });
  }
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
async function dataUri(file) { return 'data:image/jpeg;base64,' + (await readFile(file)).toString('base64'); }

const CSS = `*{box-sizing:border-box}body{margin:0;background:#121212;color:#eee;font-family:ui-monospace,Menlo,Consolas,"DejaVu Sans Mono",monospace}
.hd{padding:12px 16px;font-size:18px;font-weight:700;background:#1c1c1c;border-bottom:2px solid #333;line-height:1.35}.hd small{font-weight:400;color:#aaa;font-size:14px;display:block}
.g{display:grid;gap:10px;padding:10px}.t{background:#000;border:2px solid #3a3a3a}.t.ctx{border:2px dashed #666;opacity:.72}.t.first{border-color:#4ea1ff}.t.last{border-color:#ffb454}
.t img{display:block;width:100%;height:auto}.cap{padding:5px 8px;font-size:15px;font-weight:700;background:#222;color:#fff;white-space:nowrap;overflow:hidden}
.cap i{font-style:normal;color:#9ad}`;

/** Compose captioned tiles into one image. tiles: [{file, caption, cls}] */
export async function renderTiles(R, tiles, { cols, tileW, title, subtitle, outFile }) {
  const gap = 10, width = cols * tileW + (cols + 1) * gap + 2 * 0;
  const imgs = await Promise.all(tiles.map((t) => dataUri(t.file)));
  const body = tiles.map((t, i) => `<div class="t ${t.cls || ''}"><img src="${imgs[i]}"><div class="cap">${t.caption}</div></div>`).join('');
  const hd = title ? `<div class="hd">${esc(title)}${subtitle ? `<small>${esc(subtitle)}</small>` : ''}</div>` : '';
  const html = `<!doctype html><meta charset=utf-8><style>${CSS}.g{grid-template-columns:repeat(${cols},${tileW}px)}</style>${hd}<div class="g">${body}</div>`;
  await R.html(html, width, outFile);
}

/**
 * Extract the given frame indices as JPGs. Seeks per window of nearby frames (so a few events do not need a full
 * decode); the n-th output of a window is mapped to indices via the probed timestamps.
 * names: Map(index -> output file path)
 */
export async function extractFrames(file, probe, names, vf, { q = 3, mergeGap = 40 } = {}) {
  const idx = [...names.keys()].sort((a, b) => a - b);
  if (!idx.length) return 0;
  const t0 = probe.stats.t0, T = probe.times;
  const wins = [];
  for (const i of idx) {
    const w = wins[wins.length - 1];
    if (w && i - w.last <= mergeGap) { w.list.push(i); w.last = i; } else wins.push({ first: i, last: i, list: [i] });
  }
  let done = 0;
  for (const w of wins) {
    const outDir = path.dirname(names.get(w.first));
    const tmp = path.join(outDir, `.tmp-${w.first}`);
    await mkdir(tmp, { recursive: true });
    const sel = w.list.map((i) => `eq(n\\,${i - w.first})`).join('+');
    const ss = Math.max(0, T[w.first] + t0 - 0.01);
    const span = T[w.last] - T[w.first] + 0.05;
    try {
      await ffmpeg(['-ss', String(ss), '-i', file, '-t', String(span), '-an', '-vf', `select=${sel},${vf}`,
        '-fps_mode', 'passthrough', '-q:v', String(q), '-y', path.join(tmp, '%06d.jpg')], { timeout: 600000 });
      const outs = (await readdir(tmp)).filter((f) => f.endsWith('.jpg')).sort();
      if (outs.length !== w.list.length) log(`WARNING: window @f#${w.first}: extracted ${outs.length} frames, expected ${w.list.length}`);
      for (let k = 0; k < Math.min(outs.length, w.list.length); k++) { await rename(path.join(tmp, outs[k]), names.get(w.list[k])); done++; }
    } finally { await rm(tmp, { recursive: true, force: true }); }
  }
  return done;
}

/** Evenly pick up to `max` entries from list, always including first and last. */
export function sampleEven(list, max) {
  if (list.length <= max) return list.slice();
  const out = [];
  for (let k = 0; k < max; k++) out.push(list[Math.round((k * (list.length - 1)) / (max - 1))]);
  return [...new Set(out)];
}

const pad = (n, w = 5) => String(n).padStart(w, '0');

/** Overview contact sheets at sheetFps, selecting by TIMESTAMP (VFR-safe). */
export async function makeSheets({ file, probe, crop, outDir, sheetFps, R }) {
  const T = probe.times, dur = T[T.length - 1];
  const picks = [];
  for (let k = 0; k / sheetFps <= dur + 1e-9; k++) {
    const i = nearestIdx(T, k / sheetFps);
    if (!picks.length || picks[picks.length - 1] !== i) picks.push(i);
  }
  const tmp = path.join(outDir, '.sheet-tmp'); await mkdir(tmp, { recursive: true });
  const dirOut = path.join(outDir, 'sheets'); await mkdir(dirOut, { recursive: true });
  const tileW = 560, cols = 4, rows = 3, per = cols * rows;
  const names = new Map(picks.map((i) => [i, path.join(tmp, `f${pad(i)}.jpg`)]));
  log(`sheets: extracting ${picks.length} frames (${sheetFps} fps by timestamp)`);
  await extractFrames(file, probe, names, `crop=${crop.w}:${crop.h}:${crop.x}:${crop.y},scale=${tileW}:-2:flags=area`, { q: 4, mergeGap: 1e9 });
  const files = [];
  for (let s = 0; s * per < picks.length; s++) {
    const chunk = picks.slice(s * per, (s + 1) * per);
    const tiles = chunk.map((i) => ({ file: names.get(i), caption: `${T[i].toFixed(3)}s <i>f#${i}</i>` }));
    const of = path.join(dirOut, `sheet-${pad(s + 1, 3)}_${T[chunk[0]].toFixed(1)}s-${T[chunk[chunk.length - 1]].toFixed(1)}s.jpg`);
    await renderTiles(R, tiles, { cols, tileW, title: `${path.basename(file)}   cropped content ${crop.w}x${crop.h}   sheet ${s + 1}/${Math.ceil(picks.length / per)}`,
      subtitle: `${sheetFps} fps overview, tiles picked by nearest real timestamp (VFR). Each tile = one real frame: time + frame index n.`, outFile: of });
    files.push(path.relative(outDir, of));
  }
  await rm(tmp, { recursive: true, force: true });
  return { files, frames: picks.length };
}

/** Per-event filmstrips + individual frames. Returns map id -> info. */
export async function makeEventStrips({ file, probe, crop, events, timeline, outDir, maxStrip, R, onlyTypes = ['animation', 'anim-scroll', 'pinned', 'hscroll', 'cut'] }) {
  const T = probe.times, N = T.length, res = {};
  const targets = events.filter((e) => onlyTypes.includes(e.type));
  let k = 0;
  for (const e of targets) {
    k++;
    const dir = path.join(outDir, 'events', `${e.id}-${e.type}`);
    const fdir = path.join(dir, 'frames');
    await mkdir(fdir, { recursive: true });
    try {
      const ctxB = [e.startFrame - 2, e.startFrame - 1].filter((i) => i >= 0), ctxA = [e.endFrame + 1, e.endFrame + 2].filter((i) => i < N);
      const evFrames = []; for (let i = e.startFrame; i <= e.endFrame; i++) evFrames.push(i);
      const frameSet = sampleEven(evFrames, 120);
      const stripSet = sampleEven(frameSet, maxStrip);
      const all = [...new Set([...ctxB, ...frameSet, ...ctxA])];
      const fname = (i) => path.join(fdir, `f${pad(i)}_${T[i].toFixed(3)}s.jpg`);
      const names = new Map(all.map((i) => [i, fname(i)]));
      const vfFull = `crop=${crop.w}:${crop.h}:${crop.x}:${crop.y},scale=960:-2:flags=area`;
      await extractFrames(file, probe, names, vfFull);
      const stride = stripSet.length > 1 ? (e.endFrame - e.startFrame) / (stripSet.length - 1) : 1;
      const cap = (i) => {
        const ms = Math.round((T[i] - T[e.startFrame]) * 1000);
        return `f#${i} &nbsp;${T[i].toFixed(3)}s &nbsp;<i>${ms >= 0 ? '+' : ''}${ms}ms</i>`;
      };
      const mkTiles = (fnameOf) => [
        ...ctxB.map((i) => ({ file: fnameOf(i), caption: cap(i), cls: 'ctx' })),
        ...stripSet.map((i) => ({ file: fnameOf(i), caption: cap(i), cls: i === e.startFrame ? 'first' : i === e.endFrame ? 'last' : '' })),
        ...ctxA.map((i) => ({ file: fnameOf(i), caption: cap(i), cls: 'ctx' })),
      ];
      const sub = `${e.type} | ${e.region || ''} | f#${e.startFrame}-f#${e.endFrame} (${e.frames} frames) | ${e.startT.toFixed(3)}s-${e.endT.toFixed(3)}s (${(e.duration * 1000).toFixed(0)}ms)  | ` +
        (stripSet.length < evFrames.length ? `showing ${stripSet.length} of ${evFrames.length} frames, stride ~${stride.toFixed(1)}` : `ALL ${evFrames.length} frames shown`) +
        ' | dashed = context frames outside the event';
      const title = `${e.id}  ${e.type}`;
      const cols = Math.min(6, mkTiles(fname).length), tileW = Math.floor((2400 - (cols + 1) * 10) / cols);
      const full = path.join(dir, e.localised ? 'strip-full.jpg' : 'strip.jpg');
      await renderTiles(R, mkTiles(fname), { cols, tileW, title, subtitle: sub + ' | full cropped content', outFile: full });
      const info = { dir: path.relative(outDir, dir), strip: path.relative(outDir, path.join(dir, 'strip.jpg')), stripFull: path.relative(outDir, full), shown: stripSet.length, of: evFrames.length, stride: round(stride, 2), frames: frameSet.length };

      if (e.localised && e.box) {
        const cdir = path.join(dir, 'frames-crop'); await mkdir(cdir, { recursive: true });
        const [bx0, by0, bx1, by1] = e.box;
        const cx = Math.floor((crop.x + bx0 * crop.w) / 2) * 2, cy = Math.floor((crop.y + by0 * crop.h) / 2) * 2;
        const cw = Math.max(32, Math.floor(((bx1 - bx0) * crop.w) / 2) * 2), ch = Math.max(32, Math.floor(((by1 - by0) * crop.h) / 2) * 2);
        const cname = (i) => path.join(cdir, `f${pad(i)}_${T[i].toFixed(3)}s.jpg`);
        const cset = [...new Set([...ctxB, ...stripSet, ...ctxA])];
        const cnames = new Map(cset.map((i) => [i, cname(i)]));
        await extractFrames(file, probe, cnames, `crop=${cw}:${ch}:${cx}:${cy},scale='min(iw,900)':-2:flags=bicubic`, { q: 2 });
        const asp = cw / ch;
        const ccols = Math.min(cset.length, asp > 1.6 ? 3 : asp > 0.9 ? 4 : 6);
        const ctw = Math.floor((2400 - (ccols + 1) * 10) / ccols);
        await renderTiles(R, mkTiles(cname), { cols: ccols, tileW: ctw, title: title + '  (active region)', subtitle: sub + ` | crop ${cw}x${ch} @ +${cx - crop.x},+${cy - crop.y} (content px)`, outFile: path.join(dir, 'strip.jpg') });
        info.crop = { x: cx, y: cy, w: cw, h: ch };
      }
      res[e.id] = info;
      log(`strip ${k}/${targets.length} ${e.id} ${e.type}: ${stripSet.length}/${evFrames.length} frames`);
    } catch (err) {
      res[e.id] = { error: String(err.message || err) };
      log(`strip ${e.id} FAILED: ${err.message}`);
    }
  }
  return res;
}

export async function makeRawFrames({ file, probe, crop, outDir }) {
  const dir = path.join(outDir, 'frames', 'raw'); await mkdir(dir, { recursive: true });
  const T = probe.times;
  const names = new Map(T.map((t, i) => [i, path.join(dir, `f${pad(i)}_${t.toFixed(3)}s.jpg`)]));
  await extractFrames(file, probe, names, `crop=${crop.w}:${crop.h}:${crop.x}:${crop.y},scale=960:-2:flags=area`, { q: 4, mergeGap: 1e9 });
  return T.length;
}
