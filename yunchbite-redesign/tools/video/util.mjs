// Shared helpers: logging, process running, small math utilities.
import { spawn } from 'node:child_process';

const T0 = Date.now();
export function log(...a) {
  const s = ((Date.now() - T0) / 1000).toFixed(1).padStart(6);
  console.error(`[${s}s]`, ...a);
}

/** Run a command, collect stdout/stderr, kill on timeout. Never throws for non-zero exit: check .code. */
export function run(cmd, args, { timeout = 300000, encoding = 'utf8', input } = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    const out = [], err = [];
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; p.kill('SIGKILL'); }, timeout);
    p.stdout.on('data', (d) => out.push(d));
    p.stderr.on('data', (d) => err.push(d));
    p.on('error', (e) => { clearTimeout(timer); reject(e); });
    p.on('close', (code) => {
      clearTimeout(timer);
      const so = Buffer.concat(out), se = Buffer.concat(err).toString('utf8');
      resolve({ code: timedOut ? -1 : code, timedOut, stdout: encoding ? so.toString(encoding) : so, stderr: se });
    });
    if (input) p.stdin.end(input); else p.stdin.end();
  });
}

export async function ffmpeg(args, opts = {}) {
  const r = await run('ffmpeg', ['-nostdin', '-hide_banner', '-v', 'error', '-threads', '2', ...args], opts);
  if (r.code !== 0) throw new Error(`ffmpeg failed (${r.timedOut ? 'timeout' : 'exit ' + r.code}): ${r.stderr.slice(-600)}`);
  return r;
}

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
export const round = (v, d = 3) => (Number.isFinite(v) ? Math.round(v * 10 ** d) / 10 ** d : null);
export const evenDown = (v) => Math.floor(v / 2) * 2;
export const evenUp = (v) => Math.ceil(v / 2) * 2;

export function percentile(arr, p) {
  if (!arr.length) return 0;
  const s = Float64Array.from(arr).sort();
  const i = clamp((s.length - 1) * p, 0, s.length - 1);
  const lo = Math.floor(i), hi = Math.ceil(i);
  return s[lo] + (s[hi] - s[lo]) * (i - lo);
}
export const median = (a) => percentile(a, 0.5);
export const mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);

export function fmtT(t, d = 3) { return `${t.toFixed(d)}s`; }
export function fmtDur(sec) {
  if (!Number.isFinite(sec)) return '?';
  const m = Math.floor(sec / 60), s = Math.round(sec % 60);
  return m ? `${m}m${String(s).padStart(2, '0')}s` : `${s}s`;
}

/** Escape commas for ffmpeg filter expressions passed as argv (no shell). */
export const fesc = (s) => String(s).replace(/,/g, '\\,');

/** Binary search: index of the last element <= x (clamped to 0). */
export function lastLE(arr, x) {
  let lo = 0, hi = arr.length - 1;
  if (x < arr[0]) return 0;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (arr[mid] <= x) lo = mid; else hi = mid - 1; }
  return lo;
}
/** Index of the element nearest to x. */
export function nearestIdx(arr, x) {
  const i = lastLE(arr, x);
  if (i + 1 < arr.length && Math.abs(arr[i + 1] - x) < Math.abs(arr[i] - x)) return i + 1;
  return i;
}
