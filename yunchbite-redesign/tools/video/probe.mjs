// Probe real per-frame timestamps. The recording is VFR, so every frame is addressed by index n and true time t.
import { run, median, percentile } from './util.mjs';

export async function probeVideo(file) {
  const s = await run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'stream=width,height,codec_name,r_frame_rate,avg_frame_rate,nb_frames,start_time,duration:format=duration', '-of', 'json', file], { timeout: 60000 });
  if (s.code !== 0) throw new Error('ffprobe stream info failed: ' + s.stderr.slice(-300));
  const j = JSON.parse(s.stdout);
  const st = j.streams?.[0];
  if (!st) throw new Error('no video stream found');

  const f = await run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'frame=pts_time,best_effort_timestamp_time', '-of', 'compact=p=0:nk=0', file], { timeout: 180000 });
  if (f.code !== 0) throw new Error('ffprobe frames failed: ' + f.stderr.slice(-300));
  let raw = [];
  for (const line of f.stdout.split('\n')) {
    if (!line.trim()) continue;
    const m = {};
    for (const kv of line.split('|')) { const [k, v] = kv.split('='); m[k] = v; }
    const v = parseFloat(m.pts_time !== undefined && m.pts_time !== 'N/A' ? m.pts_time : m.best_effort_timestamp_time);
    if (Number.isFinite(v)) raw.push(v);
  }
  raw.sort((a, b) => a - b); // display order
  if (raw.length < 2) throw new Error('fewer than 2 frames with timestamps');
  const t0 = raw[0];
  const times = raw.map((t) => t - t0); // rebased: frame 0 is t=0 (matches HTML5 currentTime)
  const dts = [];
  for (let i = 1; i < times.length; i++) dts.push(times[i] - times[i - 1]);
  const medDt = median(dts);
  const dur = times[times.length - 1];
  const frac = (s) => { const [a, b] = String(s).split('/').map(Number); return b ? a / b : a; };
  const stats = {
    frames: times.length,
    duration: dur,
    nominalFps: frac(st.r_frame_rate),
    avgFpsContainer: frac(st.avg_frame_rate),
    avgFps: (times.length - 1) / dur,
    medianFps: 1 / medDt,
    minDt: Math.min(...dts), maxDt: Math.max(...dts), medianDt: medDt,
    p95Dt: percentile(dts, 0.95),
    gapFrames: dts.filter((d) => d > 1.5 * medDt).length, // frames preceded by a gap > 1.5x median (recorder drops)
    longestGap: Math.max(...dts),
    t0,
  };
  return { file, width: st.width, height: st.height, codec: st.codec_name, times, stats };
}
