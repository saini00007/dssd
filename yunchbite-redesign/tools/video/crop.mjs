// Auto-detect the page-content rectangle (exclude browser chrome, sidebar, scrollbar).
// Method: sample ~60 frames at small scale, per-pixel temporal std-dev; the browser UI is static, the page moves.
// Row/column "activity" profiles -> longest active run; then snap to strong static edges in the mean image.
import { ffmpeg, run, evenDown, evenUp, percentile, median, log } from './util.mjs';
import { writeFile } from 'node:fs/promises';

const SW = 960; // sampling width (half of 1920): edges resolved to ~2 source px

export function parseCrop(spec, W, H) {
  if (!spec || spec === 'auto') return null;
  if (spec === 'none') return { x: 0, y: 0, w: evenDown(W), h: evenDown(H), source: 'none' };
  const m = /^(\d+):(\d+):(\d+):(\d+)$/.exec(spec);
  if (!m) throw new Error(`bad --crop "${spec}" (want auto|none|W:H:X:Y)`);
  const [w, h, x, y] = m.slice(1).map(Number);
  if (x + w > W || y + h > H) throw new Error(`--crop ${spec} exceeds ${W}x${H}`);
  return { x, y, w, h, source: 'manual' };
}

function longestRun(flags, maxGap) {
  // longest run of true values, bridging gaps <= maxGap
  let best = null, start = -1, last = -1;
  const close = () => { if (start >= 0 && (!best || last - start > best[1] - best[0])) best = [start, last]; };
  for (let i = 0; i < flags.length; i++) {
    if (flags[i]) { if (start < 0 || i - last > maxGap + 1) { close(); start = i; } last = i; }
  }
  close();
  return best;
}

export async function detectCrop(file, probe, { samples = 60 } = {}) {
  const { width: W, height: H } = probe;
  const N = probe.times.length;
  const SH = Math.round((H * SW) / W);
  const K = Math.max(1, Math.floor(N / samples));
  const r = await ffmpeg(['-i', file, '-an', '-vf', `select=not(mod(n\\,${K})),scale=${SW}:${SH}:flags=area,format=gray`,
    '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'gray', 'pipe:1'], { timeout: 300000, encoding: null });
  const buf = r.stdout, fs = SW * SH, n = Math.floor(buf.length / fs);
  if (n < 4) throw new Error(`only ${n} sample frames decoded`);
  const sum = new Float64Array(fs), sq = new Float64Array(fs);
  for (let f = 0; f < n; f++) {
    const o = f * fs;
    for (let i = 0; i < fs; i++) { const v = buf[o + i]; sum[i] += v; sq[i] += v * v; }
  }
  const mean = new Float32Array(fs), std = new Float32Array(fs);
  for (let i = 0; i < fs; i++) { mean[i] = sum[i] / n; std[i] = Math.sqrt(Math.max(0, sq[i] / n - mean[i] * mean[i])); }

  const T = 5; // gray levels of temporal std-dev that count as "active"
  // rows: fraction of active pixels in the central columns (avoids sidebar / scrollbar)
  const cx0 = Math.floor(SW * 0.2), cx1 = Math.floor(SW * 0.8);
  const rowFrac = new Float32Array(SH);
  for (let y = 0; y < SH; y++) { let c = 0; for (let x = cx0; x < cx1; x++) if (std[y * SW + x] > T) c++; rowFrac[y] = c / (cx1 - cx0); }
  const rowThr = Math.max(0.04, 0.3 * percentile(rowFrac, 0.9));
  const rr = longestRun(Array.from(rowFrac, (v) => v >= rowThr), 8);
  if (!rr) throw new Error('no active rows found (video is static?)');
  let [top, bottom] = rr;
  const colFrac = new Float32Array(SW);
  for (let x = 0; x < SW; x++) { let c = 0; for (let y = top; y <= bottom; y++) if (std[y * SW + x] > T) c++; colFrac[x] = c / (bottom - top + 1); }
  const colThr = Math.max(0.04, 0.3 * percentile(colFrac, 0.9));
  const cr = longestRun(Array.from(colFrac, (v) => v >= colThr), 8);
  if (!cr) throw new Error('no active columns found');
  let [left, right] = cr;

  // Snap to strong static edges of the mean image (toolbar bottom border, scrollbar left border, sidebar border).
  const vGrad = (x, y0, y1) => { let s = 0; for (let y = y0; y <= y1; y++) s += Math.abs(mean[y * SW + Math.min(SW - 1, x + 1)] - mean[y * SW + Math.max(0, x - 1)]); return s / (y1 - y0 + 1); };
  const hGrad = (y, x0, x1) => { let s = 0; for (let x = x0; x <= x1; x++) s += Math.abs(mean[Math.min(SH - 1, y + 1) * SW + x] - mean[Math.max(0, y - 1) * SW + x]); return s / (x1 - x0 + 1); };
  const ya = top + 4, yb = bottom - 4;
  const colG = Array.from({ length: SW }, (_, x) => vGrad(x, ya, yb));
  const rowG = Array.from({ length: SH }, (_, y) => hGrad(y, left + 4, right - 4));
  const gThrC = Math.max(6, 5 * median(colG)), gThrR = Math.max(6, 5 * median(rowG));
  const snaps = {};
  const best = (arr, lo, hi, thr) => { let bi = -1, bv = thr; for (let i = Math.max(0, lo); i <= Math.min(arr.length - 1, hi); i++) if (arr[i] > bv) { bv = arr[i]; bi = i; } return bi; };
  // pad: content starts just after the border line
  let b;
  if (top > 0 && (b = best(rowG, top - 6, top + 3, gThrR)) >= 0) { snaps.top = b - top; top = b + 1; }
  if (left > 0 && (b = best(colG, left - 6, left + 3, gThrC)) >= 0) { snaps.left = b - left; left = b + 1; }
  if (right < SW - 1 && (b = best(colG, right - 4, right + 6, gThrC)) >= 0) { snaps.right = b - right; right = b - 1; }
  // Scrollbar: thin high-contrast vertical band near the right edge, possibly inside the active run.
  if (right > SW - 40) {
    b = best(colG, right - 24, right, Math.max(10, 3 * median(colG)));
    if (b >= 0 && b < right - 1) { snaps.scrollbar = b - right; right = b - 1; }
  }
  if (bottom < SH - 1 && (b = best(rowG, bottom - 4, bottom + 6, gThrR)) >= 0) { snaps.bottom = b - bottom; bottom = b - 1; }

  const sx = W / SW, sy = H / SH;
  const inset = (edgeIsFrameBorder) => (edgeIsFrameBorder ? 0 : 2);
  let x0 = evenUp(left * sx + inset(left === 0)), y0 = evenUp(top * sy + inset(top === 0));
  let x1 = evenDown((right + 1) * sx - inset(right >= SW - 1)), y1 = evenDown((bottom + 1) * sy - inset(bottom >= SH - 1));
  x1 = Math.min(x1, evenDown(W)); y1 = Math.min(y1, evenDown(H));
  const crop = { x: x0, y: y0, w: x1 - x0, h: y1 - y0, source: 'auto',
    debug: { samples: n, step: K, rowThr: +rowThr.toFixed(3), colThr: +colThr.toFixed(3), snaps, activeRows: [top, bottom], activeCols: [left, right] } };
  log(`crop auto: ${crop.w}x${crop.h} at +${crop.x}+${crop.y} (from ${n} samples)`);
  return crop;
}

/** Write crop-preview.jpg: a mid-video frame with the crop box drawn. */
export async function cropPreview(file, probe, crop, outFile) {
  const t = probe.times[Math.floor(probe.times.length / 2)];
  await ffmpeg(['-ss', String(t), '-i', file, '-frames:v', '1', '-vf',
    `drawbox=x=${crop.x}:y=${crop.y}:w=${crop.w}:h=${crop.h}:color=red@0.95:t=3,scale=1600:-2`,
    '-q:v', '3', '-y', outFile], { timeout: 60000 });
}
