// Pass 2: turn a recorded video into things a designer / LLM can read: timestamped contact
// sheets, scene-change keyframes and an index linking every image to time and scrollY.
import fs from 'node:fs';
import path from 'node:path';
import { drawtextSafe, ensureDir, ffmpeg, ffprobeDuration, fontFile, log, pad, readJson, writeJson } from './util.mjs';

/** Nearest scroll sample (by time) from a timeline. */
export function nearestSample(samples, t) {
  if (!samples.length) return null;
  let lo = 0;
  let hi = samples.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].t < t) lo = mid + 1;
    else hi = mid;
  }
  const a = samples[Math.max(0, lo - 1)];
  const b = samples[lo];
  return Math.abs(a.t - t) <= Math.abs(b.t - t) ? a : b;
}

/**
 * Contact sheets: frames sampled at `fps`, scaled to `tileW`, each stamped with `label(t)`, tiled cols x rows.
 * Returns [{ file, frames: [{ t, label }] }]. `ss`/`duration` select a window of the video.
 */
export async function contactSheets(video, { outDir, prefix = 'sheet', fps = 4, cols = 4, rows = 3, tileW = 600, ss = 0, duration = 0, label }) {
  ensureDir(outDir);
  const total = duration || (await ffprobeDuration(video)) - ss;
  const n = Math.max(1, Math.floor(total * fps) + 1);
  const font = fontFile();
  const fontSize = Math.max(14, Math.round(tileW / 28));
  const draws = [];
  for (let k = 0; k < n; k++) {
    const text = drawtextSafe(label(ss + k / fps));
    draws.push(`drawtext=${font ? `fontfile=${font}:` : ''}text='${text}':x=6:y=6:fontsize=${fontSize}:fontcolor=white:box=1:boxcolor=black@0.75:boxborderw=4:enable='eq(n,${k})'`);
  }
  const graph = [`fps=${fps}`, `scale=${tileW}:-2`, ...draws, `tile=${cols}x${rows}:padding=4:margin=4:color=0x1a1a1a`].join(',');
  const scriptFile = path.join(outDir, `.${prefix}-filter.txt`);
  fs.writeFileSync(scriptFile, graph);
  for (const f of fs.readdirSync(outDir)) if (f.startsWith(`${prefix}-`) && f.endsWith('.jpg')) fs.rmSync(path.join(outDir, f));
  const args = [];
  if (ss > 0) args.push('-ss', ss.toFixed(2));
  args.push('-i', video);
  if (duration > 0) args.push('-t', duration.toFixed(2));
  args.push('-filter_script:v', scriptFile, '-fps_mode', 'vfr', '-q:v', '3', path.join(outDir, `${prefix}-%02d.jpg`));
  const r = await ffmpeg(args);
  fs.rmSync(scriptFile, { force: true });
  if (r.code !== 0) throw new Error(`contact sheet ffmpeg failed: ${r.stderr.split('\n').slice(-4).join(' ')}`);
  const per = cols * rows;
  return fs
    .readdirSync(outDir)
    .filter((f) => f.startsWith(`${prefix}-`) && f.endsWith('.jpg'))
    .sort()
    .map((file, i) => ({
      file,
      frames: Array.from({ length: Math.min(per, n - i * per) }, (_, j) => {
        const t = ss + (i * per + j) / fps;
        return { t: +t.toFixed(2), label: label(t) };
      }),
    }));
}

export async function runFrames(run) {
  const { dir, opts } = run;
  const video = run.shared.scroll?.mp4 || path.join(dir, 'video', 'scroll.mp4');
  if (!fs.existsSync(video)) throw new Error('no scroll video found; run the scroll pass first');
  const timeline = run.shared.scroll ? readJson(run.shared.scroll.timelineFile) : readJson(path.join(dir, 'scroll-timeline.json'));
  const samples = timeline?.samples || [];
  const framesDir = path.join(dir, 'frames');
  const rawDir = path.join(framesDir, 'raw');
  const sheetDir = path.join(framesDir, 'sheets');
  const keyDir = path.join(framesDir, 'keyframes');
  for (const d of [rawDir, sheetDir, keyDir]) {
    fs.rmSync(d, { recursive: true, force: true });
    ensureDir(d);
  }
  const vp = run.profile.viewport;
  const landscape = vp.width >= vp.height;
  const cols = landscape ? 4 : 6;
  const rows = landscape ? 3 : 2;
  const tileW = Math.min(600, Math.floor(2400 / cols) - 8);
  const stamp = (t) => {
    const s = nearestSample(samples, t);
    return `t ${t.toFixed(2)}s | y ${s ? s.scrollY : '?'}`;
  };

  log('frames', `contact sheets ${cols}x${rows} @ ${opts.sheetFps}fps`);
  const sheets = await contactSheets(video, { outDir: sheetDir, fps: opts.sheetFps, cols, rows, tileW, label: stamp });

  // Raw frames at the sheet rate (git-ignored); sized for reading, not archival.
  const rawW = Math.min(960, vp.width);
  const rawRun = await ffmpeg(['-i', video, '-vf', `fps=${opts.sheetFps},scale=${rawW}:-2`, '-q:v', '4', path.join(rawDir, 'f_%05d.jpg')]);
  if (rawRun.code !== 0) throw new Error('raw frame extraction failed');

  // Scene-change keyframes; the gap term stops continuous motion (video, WebGL) from flooding the output.
  log('frames', `scene-change keyframes (threshold ${opts.sceneThreshold})`);
  const sel = `select='gt(scene,${opts.sceneThreshold})*(isnan(prev_selected_t)+gte(t-prev_selected_t,0.4))'`;
  const tmp = path.join(keyDir, 'tmp_%04d.jpg');
  const kfRun = await ffmpeg(['-i', video, '-vf', `${sel},scale=${rawW}:-2,showinfo`, '-fps_mode', 'vfr', '-q:v', '3', tmp]);
  if (kfRun.code !== 0) throw new Error('keyframe extraction failed');
  const times = [...kfRun.stderr.matchAll(/pts_time:([\d.]+)/g)].map((m) => parseFloat(m[1]));
  const files = fs.readdirSync(keyDir).filter((f) => f.startsWith('tmp_')).sort();
  // Evenly thin the list when over the cap.
  const keep = new Set(files.length <= opts.maxKeyframes ? files.map((_, i) => i) : Array.from({ length: opts.maxKeyframes }, (_, i) => Math.round((i * (files.length - 1)) / (opts.maxKeyframes - 1))));
  const keyframes = [];
  files.forEach((f, i) => {
    const from = path.join(keyDir, f);
    if (!keep.has(i)) return fs.rmSync(from);
    const t = times[i] ?? 0;
    const name = `kf-${pad(keyframes.length + 1)}-t${t.toFixed(2).padStart(6, '0')}s.jpg`;
    fs.renameSync(from, path.join(keyDir, name));
    const near = nearestSample(samples, t);
    keyframes.push({ file: `frames/keyframes/${name}`, t: +t.toFixed(2), scrollY: near?.scrollY ?? null, section: near?.section ?? null });
  });

  const rawFiles = fs.readdirSync(rawDir).filter((f) => f.endsWith('.jpg')).sort();
  const index = {
    video: path.relative(dir, video),
    sheetFps: opts.sheetFps,
    sceneThreshold: opts.sceneThreshold,
    sheets: sheets.map((sh) => ({
      file: `frames/sheets/${sh.file}`,
      tStart: sh.frames[0].t,
      tEnd: sh.frames[sh.frames.length - 1].t,
      layout: `${cols}x${rows}`,
      frames: sh.frames.map((fr) => ({ t: fr.t, scrollY: nearestSample(samples, fr.t)?.scrollY ?? null })),
    })),
    keyframes,
    raw: rawFiles.map((f, i) => {
      const t = i / opts.sheetFps;
      return { file: `frames/raw/${f}`, t: +t.toFixed(2), scrollY: nearestSample(samples, t)?.scrollY ?? null };
    }),
  };
  writeJson(path.join(framesDir, 'index.json'), index);
  log('frames', `${sheets.length} sheets, ${keyframes.length} keyframes, ${rawFiles.length} raw frames`);
  return { sheets: index.sheets.length, keyframes: keyframes.length, raw: rawFiles.length };
}
