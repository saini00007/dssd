// Motion analysis for every consecutive frame pair.
// Decode once (cropped + scaled gray rawvideo pipe, passthrough timestamps), keep only the previous frame.
//
// Per pair we estimate the global shift that aligns frame n-1 to n:
//   b(y, x) ~= a(y + dy, x + dx)      dy > 0  => page scrolled DOWN (content moved up)
// Coarse search on a 2x-downsampled copy, refine +-3 px at full analysis scale, parabola sub-pixel.
// Then a horizontal search at the found dy. Residual = mean |b - shifted a| over the overlap (bilinear for
// sub-pixel shifts) = in-place animation energy; rawDiff = same without compensation.
import { spawn } from 'node:child_process';
import { clamp, log, fmtDur } from './util.mjs';

export const GRID_COLS = 4, GRID_ROWS = 3;
const CLAMP_DIFF = 40; // robust SAD: a few fixed UI elements / flying objects must not dominate the alignment
const LUT = new Float32Array(511);
for (let i = 0; i < 511; i++) LUT[i] = Math.min(Math.abs(i - 255), CLAMP_DIFF);

function down2(src, w, h, dst) {
  const w2 = w >> 1, h2 = h >> 1;
  for (let y = 0; y < h2; y++) {
    let i = 2 * y * w, o = y * w2;
    for (let x = 0; x < w2; x++, i += 2) dst[o + x] = (src[i] + src[i + 1] + src[i + w] + src[i + w + 1] + 2) >> 2;
  }
}

/** mean clamped |b(y,x) - a(y+sy, x+sx)| over the overlap */
function sad(a, b, w, h, sy, sx) {
  const y0 = Math.max(0, -sy), y1 = Math.min(h, h - sy), x0 = Math.max(0, -sx), x1 = Math.min(w, w - sx);
  if (y1 <= y0 || x1 <= x0) return Infinity;
  let s = 0;
  for (let y = y0; y < y1; y++) {
    let ib = y * w + x0, ia = (y + sy) * w + x0 + sx;
    for (let x = x0; x < x1; x++, ib++, ia++) s += LUT[b[ib] - a[ia] + 255];
  }
  return s / ((y1 - y0) * (x1 - x0));
}

/** Unclamped mean abs diff at an integer shift (0,0 => rawDiff) + 4x3 grid. */
function diffGrid(a, b, w, h) {
  const gs = new Float64Array(GRID_COLS * GRID_ROWS), gc = new Float64Array(GRID_COLS * GRID_ROWS);
  let tot = 0;
  for (let y = 0; y < h; y++) {
    const cy = Math.min(GRID_ROWS - 1, Math.floor((y * GRID_ROWS) / h)) * GRID_COLS;
    let rowSum = 0;
    for (let cx = 0; cx < GRID_COLS; cx++) {
      const xs = Math.floor((cx * w) / GRID_COLS), xe = Math.floor(((cx + 1) * w) / GRID_COLS);
      let s = 0;
      for (let x = xs, i = y * w + xs; x < xe; x++, i++) { const d = b[i] - a[i]; s += d < 0 ? -d : d; }
      gs[cy + cx] += s; gc[cy + cx] += xe - xs; rowSum += s;
    }
    tot += rowSum;
  }
  const grid = Array.from(gs, (s, i) => (gc[i] ? s / gc[i] : 0));
  return { mean: tot / (w * h), grid };
}

/** Residual after compensating a (fractional) shift, bilinear. Returns mean + 4x3 grid (b coordinates). */
function residual(a, b, w, h, sy, sx) {
  const iy = Math.floor(sy), fy = sy - iy, ix = Math.floor(sx), fx = sx - ix;
  const y0 = Math.max(0, -iy), y1 = Math.min(h, h - iy - 1), x0 = Math.max(0, -ix), x1 = Math.min(w, w - ix - 1);
  if (y1 <= y0 + 2 || x1 <= x0 + 2) return null;
  const gs = new Float64Array(GRID_COLS * GRID_ROWS), gc = new Float64Array(GRID_COLS * GRID_ROWS);
  const w00 = (1 - fy) * (1 - fx), w01 = (1 - fy) * fx, w10 = fy * (1 - fx), w11 = fy * fx;
  let tot = 0, cnt = 0;
  for (let y = y0; y < y1; y++) {
    const cy = Math.min(GRID_ROWS - 1, Math.floor((y * GRID_ROWS) / h)) * GRID_COLS;
    for (let x = x0; x < x1; x++) {
      const ia = (y + iy) * w + x + ix;
      const p = w00 * a[ia] + w01 * a[ia + 1] + w10 * a[ia + w] + w11 * a[ia + w + 1];
      const d = Math.abs(b[y * w + x] - p);
      tot += d; cnt++;
      const c = cy + Math.min(GRID_COLS - 1, Math.floor((x * GRID_COLS) / w));
      gs[c] += d; gc[c]++;
    }
  }
  return { mean: tot / cnt, grid: Array.from(gs, (s, i) => (gc[i] ? s / gc[i] : 0)) };
}

function parabola(sm, s0, sp) {
  const den = sm - 2 * s0 + sp;
  if (!(den > 1e-9)) return 0;
  return clamp(0.5 * (sm - sp) / den, -0.5, 0.5);
}

/** Search a 1-D shift range; returns {best, S0, second, med, arr}. axis 'y' or 'x'. */
function coarseSearch(a, b, w, h, axis, R, fixedSy = 0) {
  const n = 2 * R + 1, S = new Float32Array(n);
  for (let k = -R; k <= R; k++) S[k + R] = axis === 'y' ? sad(a, b, w, h, k, 0) : sad(a, b, w, h, fixedSy, k);
  let bi = 0;
  for (let i = 1; i < n; i++) if (S[i] < S[bi]) bi = i;
  let second = Infinity;
  for (let i = 0; i < n; i++) if (Math.abs(i - bi) > 2 && S[i] < second) second = S[i];
  const sorted = Float32Array.from(S).sort();
  return { best: bi - R, bestS: S[bi], second, med: sorted[sorted.length >> 1] };
}

function confidenceOf(c) {
  const contrast = (c.med - c.bestS) / (c.med + 3);
  const sep = Number.isFinite(c.second) ? (c.second - c.bestS) / (c.second + 1.5) : 1;
  return clamp(Math.min(contrast * 1.3, sep * 2), 0, 1);
}

export class PairAnalyser {
  constructor(w, h) {
    this.w = w; this.h = h; this.w2 = w >> 1; this.h2 = h >> 1;
    this.ph = new Uint8Array(this.w2 * this.h2); this.ch = new Uint8Array(this.w2 * this.h2);
    this.havePrev = false;
  }
  /** a = previous full frame, b = current full frame. Caller must call setPrevHalf if it skipped analyse. */
  analyse(a, b) {
    const { w, h, w2, h2 } = this;
    down2(b, w, h, this.ch);
    if (!this.havePrev) down2(a, w, h, this.ph);
    const out = { dy: 0, dx: 0, conf: 1, resid: 0, raw: 0, grid: null, sBest: 0, s0: 0, searched: false };
    const raw = diffGrid(a, b, w, h);
    out.raw = raw.mean; out.grid = raw.grid; out.resid = raw.mean;
    if (raw.mean >= 0.12) {
      out.searched = true;
      const R = Math.floor(0.45 * h2);
      const cs = coarseSearch(this.ph, this.ch, w2, h2, 'y', R);
      out.conf = confidenceOf(cs);
      const s0f = sad(a, b, w, h, 0, 0);
      const c = 2 * cs.best;
      let bestS = Infinity, bestK = 0; const SS = {};
      for (let k = c - 3; k <= c + 3; k++) { const s = sad(a, b, w, h, k, 0); SS[k] = s; if (s < bestS) { bestS = s; bestK = k; } }
      let dy = bestK;
      if (SS[bestK - 1] !== undefined && SS[bestK + 1] !== undefined && Number.isFinite(SS[bestK - 1]) && Number.isFinite(SS[bestK + 1])) dy += parabola(SS[bestK - 1], bestS, SS[bestK + 1]);
      const absImp = s0f - bestS, improve = absImp / (s0f + 1.5);
      out.s0 = s0f; out.sBest = Math.min(bestS, s0f);
      if (Math.abs(dy) >= 0.15 && absImp >= 0.25 && improve >= 0.12 && out.conf >= 0.25) out.dy = dy;
      else out.sBest = s0f;
      // horizontal shift at the found dy
      const syInt = Math.round(out.dy);
      if (out.sBest > 0.8) {
        const Rx = Math.floor(0.3 * w2);
        const sy2 = Math.round(syInt / 2);
        const cx = coarseSearch(this.ph, this.ch, w2, h2, 'x', Rx, sy2);
        const confX = confidenceOf(cx);
        if (cx.best !== 0 && confX >= 0.3) {
          const base = sad(a, b, w, h, syInt, 0);
          const cc = 2 * cx.best;
          let bx = Infinity, bk = 0; const XS = {};
          for (let k = cc - 3; k <= cc + 3; k++) { const s = sad(a, b, w, h, syInt, k); XS[k] = s; if (s < bx) { bx = s; bk = k; } }
          let dx = bk;
          if (Number.isFinite(XS[bk - 1]) && Number.isFinite(XS[bk + 1])) dx += parabola(XS[bk - 1], bx, XS[bk + 1]);
          const imp = base - bx;
          if (Math.abs(dx) >= 0.5 && imp >= 0.5 && imp / (base + 1.5) >= 0.2) { out.dx = dx; out.sBest = bx; if (out.dy === 0) out.conf = confX; }
        }
      }
      if (out.dy !== 0 || out.dx !== 0) {
        const r = residual(a, b, w, h, out.dy, out.dx);
        if (r) { out.resid = r.mean; out.grid = r.grid; }
      }
    }
    const t = this.ph; this.ph = this.ch; this.ch = t; this.havePrev = true;
    return out;
  }
}

/**
 * Stream the whole video through the analyser.
 * Returns {aw, ah, kx, ky, frames:[{dyA,dxA,conf,resid,raw,grid,sBest,s0}]} (frame 0 is a zero record).
 */
export function analyseMotion(file, probe, crop, { width = 360, timeout = 1500000, onProgress } = {}) {
  const aw = Math.min(width, crop.w) & ~1, ah = Math.max(8, Math.round((crop.h * aw) / crop.w)) & ~1;
  const kx = crop.w / aw, ky = crop.h / ah;
  const fsz = aw * ah, N = probe.times.length;
  const args = ['-nostdin', '-v', 'error', '-threads', '2', '-i', file, '-an', '-vf',
    `crop=${crop.w}:${crop.h}:${crop.x}:${crop.y},scale=${aw}:${ah}:flags=area,format=gray`,
    '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'gray', 'pipe:1'];
  const frames = [];
  const an = new PairAnalyser(aw, ah);
  return new Promise((resolve, reject) => {
    const p = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let errTxt = '', killed = false;
    const timer = setTimeout(() => { killed = true; p.kill('SIGKILL'); }, timeout);
    p.stderr.on('data', (d) => { errTxt += d; });
    let cur = new Uint8Array(fsz), prev = new Uint8Array(fsz), fill = 0, n = 0;
    const t0 = Date.now();
    let lastLog = t0;
    const push = () => {
      if (n === 0) frames.push({ dy: 0, dx: 0, conf: 1, resid: 0, raw: 0, grid: new Array(GRID_COLS * GRID_ROWS).fill(0), sBest: 0, s0: 0 });
      else frames.push(an.analyse(prev, cur));
      n++;
      const t = prev; prev = cur; cur = t;
      const now = Date.now();
      if (now - lastLog > 3000) {
        lastLog = now;
        const rate = n / ((now - t0) / 1000), eta = (N - n) / rate;
        log(`motion pass: ${n}/${N} frames (${((100 * n) / N).toFixed(0)}%)  ${rate.toFixed(0)} fps  ETA ${fmtDur(eta)}`);
        onProgress?.(n / N);
      }
    };
    p.stdout.on('data', (chunk) => {
      let o = 0;
      while (o < chunk.length) {
        const take = Math.min(fsz - fill, chunk.length - o);
        cur.set(chunk.subarray(o, o + take), fill);
        fill += take; o += take;
        if (fill === fsz) { fill = 0; push(); }
      }
    });
    p.on('error', (e) => { clearTimeout(timer); reject(e); });
    p.on('close', (code) => {
      clearTimeout(timer);
      if (killed) return reject(new Error(`motion pass timed out after ${timeout / 1000}s at frame ${n}/${N}`));
      if (code !== 0) return reject(new Error(`ffmpeg motion pass exit ${code}: ${errTxt.slice(-400)}`));
      log(`motion pass done: ${n} frames in ${fmtDur((Date.now() - t0) / 1000)}`);
      if (n !== N) log(`WARNING: decoded ${n} frames but ffprobe listed ${N}; timestamps beyond ${Math.min(n, N)} unreliable`);
      resolve({ aw, ah, kx, ky, decoded: n, frames });
    });
  });
}

/** ffmpeg scene score per frame (cross-check for cuts), computed on the same cropped/scaled content. */
export function sceneScores(file, crop, aw, ah, N, { timeout = 900000 } = {}) {
  const args = ['-nostdin', '-v', 'error', '-threads', '2', '-i', file, '-an', '-vf',
    `crop=${crop.w}:${crop.h}:${crop.x}:${crop.y},scale=${aw}:${ah}:flags=area,select=gte(scene\\,0),metadata=print:file=-`,
    '-fps_mode', 'passthrough', '-f', 'null', '-'];
  return new Promise((resolve, reject) => {
    const p = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    const timer = setTimeout(() => p.kill('SIGKILL'), timeout);
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', (d) => { err += d; });
    p.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error('scene pass failed: ' + err.slice(-300)));
      const sc = [...out.matchAll(/lavfi\.scene_score=([0-9.eE+-]+)/g)].map((m) => parseFloat(m[1]));
      if (sc.length < N - 2 || sc.length > N + 2) return reject(new Error(`scene score count ${sc.length} != frames ${N}`));
      resolve(sc);
    });
  });
}
