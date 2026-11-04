// Small shared helpers: logging, timeouts, JSON/dir helpers, ffmpeg wrappers.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const START = Date.now();

export function log(tag, msg) {
  const s = ((Date.now() - START) / 1000).toFixed(1).padStart(6);
  console.log(`[${s}s] [${tag}] ${msg}`);
}

/** Reject if `promise` does not settle within `ms`. The underlying work is not cancelled. */
export function withTimeout(promise, ms, label = 'operation') {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms} ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

export function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

/** Run a binary, collect stderr (ffmpeg writes its log there). Never throws; check `.code`. */
export function run(bin, args, { timeoutMs = 180000 } = {}) {
  return new Promise((resolve) => {
    const child = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    const timer = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
    child.on('error', (e) => {
      clearTimeout(timer);
      resolve({ code: -1, stdout, stderr: String(e) });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
  });
}

export const ffmpeg = (args, opts) => run('ffmpeg', ['-hide_banner', '-loglevel', 'info', '-y', ...args], opts);

export async function ffprobeDuration(file) {
  const r = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file]);
  const d = parseFloat(r.stdout);
  return Number.isFinite(d) ? d : 0;
}

/** webm -> H.264 mp4 (yuv420p, faststart). Even dimensions are required by yuv420p. Optional trim. */
export async function toMp4(src, dest, { ss = 0, duration = 0 } = {}) {
  const args = [];
  if (ss > 0) args.push('-ss', ss.toFixed(2));
  args.push('-i', src);
  if (duration > 0) args.push('-t', duration.toFixed(2));
  args.push('-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', dest);
  const r = await ffmpeg(args);
  if (r.code !== 0) throw new Error(`ffmpeg mp4 conversion failed: ${r.stderr.split('\n').slice(-4).join(' ')}`);
  return dest;
}

/** A font file for drawtext; undefined lets fontconfig pick its default. */
export function fontFile() {
  const candidates = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf',
    '/usr/share/fonts/truetype/freefont/FreeMonoBold.ttf',
  ];
  return candidates.find((f) => fs.existsSync(f));
}

/** Sanitise text for an ffmpeg drawtext `text='...'` value inside a filter script. */
export const drawtextSafe = (s) => String(s).replace(/[^\w .|+\-=/]/g, '');

export const pad = (n, w = 3) => String(n).padStart(w, '0');
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const round = (v, d = 2) => (Number.isFinite(v) ? Math.round(v * 10 ** d) / 10 ** d : v);
