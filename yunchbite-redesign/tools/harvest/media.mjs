// Binary metadata: image dimensions, alpha detection, ffprobe for video/GIF, thumbnails.
import { execFile } from 'node:child_process';
import { imageSize } from 'image-size';

const run = (cmd, args, opts = {}) =>
  new Promise((resolve, reject) =>
    execFile(cmd, args, { maxBuffer: 64 * 1024 * 1024, timeout: 60000, ...opts }, (e, stdout, stderr) =>
      e ? reject(Object.assign(e, { stderr })) : resolve({ stdout, stderr })));

export const MIME_BY_EXT = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif',
  svg: 'image/svg+xml', ico: 'image/x-icon', bmp: 'image/bmp', tif: 'image/tiff', tiff: 'image/tiff', heic: 'image/heic',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', m4v: 'video/x-m4v', mkv: 'video/x-matroska', ogv: 'video/ogg',
  mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', m4a: 'audio/mp4',
  woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', otf: 'font/otf', eot: 'application/vnd.ms-fontobject',
  css: 'text/css', json: 'application/json', lottie: 'application/zip', riv: 'application/octet-stream',
  glb: 'model/gltf-binary', gltf: 'model/gltf+json', usdz: 'model/vnd.usdz+zip',
};
export const EXT_BY_MIME = Object.fromEntries(
  Object.entries(MIME_BY_EXT).reverse().map(([e, m]) => [m, e]));
EXT_BY_MIME['image/jpeg'] = 'jpg'; EXT_BY_MIME['image/svg+xml'] = 'svg'; EXT_BY_MIME['image/x-icon'] = 'ico';
EXT_BY_MIME['image/vnd.microsoft.icon'] = 'ico'; EXT_BY_MIME['audio/mpeg'] = 'mp3'; EXT_BY_MIME['video/ogg'] = 'ogv';

/** Sniff the real format from magic bytes (servers lie about content-type). */
export function sniff(buf) {
  const h = buf.subarray(0, 16);
  const s = (a, b) => h.subarray(a, b).toString('latin1');
  if (s(0, 8) === '\x89PNG\r\n\x1a\n') return 'image/png';
  if (h[0] === 0xff && h[1] === 0xd8) return 'image/jpeg';
  if (s(0, 3) === 'GIF') return 'image/gif';
  if (s(0, 4) === 'RIFF' && s(8, 12) === 'WEBP') return 'image/webp';
  if (s(4, 8) === 'ftyp') return /avif|avis/.test(s(8, 12)) ? 'image/avif' : /heic|heix|mif1/.test(s(8, 12)) ? 'image/heic' : 'video/mp4';
  if (s(0, 4) === 'wOF2') return 'font/woff2';
  if (s(0, 4) === 'wOFF') return 'font/woff';
  if (s(0, 4) === 'glTF') return 'model/gltf-binary';
  if (h[0] === 0 && h[1] === 0 && h[2] === 1 && h[3] === 0) return 'image/x-icon';
  if (h[0] === 0x1a && h[1] === 0x45 && h[2] === 0xdf && h[3] === 0xa3) return 'video/webm';
  if (s(0, 4) === 'OTTO') return 'font/otf';
  if (h[0] === 0 && h[1] === 1 && h[2] === 0 && h[3] === 0) return 'font/ttf';
  const t = buf.subarray(0, 600).toString('utf8');
  if (/<svg[\s>]/i.test(t)) return 'image/svg+xml';
  return null;
}

function pngInfo(buf) {
  const colorType = buf[25];
  let trns = false, animated = false;
  let off = 8;
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('latin1', off + 4, off + 8);
    if (type === 'tRNS') trns = true;
    if (type === 'acTL') animated = true;
    if (type === 'IDAT' || type === 'IEND') break;
    off += 12 + len;
  }
  return { hasAlpha: colorType === 4 || colorType === 6 || trns, animated, colorType };
}

function webpInfo(buf) {
  const fourcc = buf.toString('latin1', 12, 16);
  if (fourcc === 'VP8X') return { hasAlpha: !!(buf[20] & 0x10), animated: !!(buf[20] & 0x02) };
  if (fourcc === 'VP8L') return { hasAlpha: !!(buf[24] & 0x10), animated: false };
  return { hasAlpha: false, animated: false };
}

/** Actual transparent pixels? (an RGBA PNG can be fully opaque). */
async function transparentPixels(file) {
  try {
    const { stdout, stderr } = await run('ffmpeg', ['-v', 'error', '-i', file, '-frames:v', '1', '-vf',
      'format=rgba,alphaextract,signalstats,metadata=print:key=lavfi.signalstats.YMIN:file=-', '-f', 'null', '-']);
    const m = /YMIN=(\d+)/.exec(stdout + stderr);
    return m ? Number(m[1]) < 255 : null;
  } catch { return null; }
}

export async function ffprobe(file) {
  try {
    const { stdout } = await run('ffprobe', ['-v', 'error', '-count_frames', '-show_entries',
      'stream=codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate,duration,nb_read_frames,nb_frames:format=duration,bit_rate',
      '-of', 'json', file]);
    return JSON.parse(stdout);
  } catch { return null; }
}
const frac = (s) => { const [a, b] = String(s || '0/1').split('/').map(Number); return b ? a / b : a || 0; };

/** Returns { width, height, hasAlpha, hasTransparency, animated, durationSec, fps, frames, codec, hasAudio } (nulls where unknown). */
export async function inspect({ buf, mime, file, type }) {
  const out = {};
  if (mime.startsWith('image/') && mime !== 'image/svg+xml') {
    try {
      const d = imageSize(buf);
      out.width = d.width ?? null; out.height = d.height ?? null;
      if (d.images?.length > 1 && mime === 'image/x-icon') out.iconSizes = d.images.map((i) => `${i.width}x${i.height}`);
    } catch { /* ignore */ }
    if (mime === 'image/png') { const p = pngInfo(buf); out.hasAlpha = p.hasAlpha; out.animated = p.animated; }
    else if (mime === 'image/webp') { const p = webpInfo(buf); out.hasAlpha = p.hasAlpha; out.animated = p.animated; }
    else if (mime === 'image/gif') out.hasAlpha = null;
    else if (mime === 'image/jpeg') out.hasAlpha = false;
    else out.hasAlpha = null;
    if (out.hasAlpha === true && !out.animated) out.hasTransparency = await transparentPixels(file);
  }
  if (mime === 'image/svg+xml') {
    const t = buf.toString('utf8', 0, Math.min(buf.length, 4000));
    const vb = /viewBox=["']\s*[-\d.]+[ ,]+[-\d.]+[ ,]+([\d.]+)[ ,]+([\d.]+)/i.exec(t);
    const w = /<svg[^>]*\swidth=["']([\d.]+)(?:px)?["']/i.exec(t);
    const h = /<svg[^>]*\sheight=["']([\d.]+)(?:px)?["']/i.exec(t);
    out.width = Number(w?.[1] || vb?.[1]) || null;
    out.height = Number(h?.[1] || vb?.[2]) || null;
    out.hasAlpha = true;
  }
  if (mime === 'image/gif' || type === 'video' || type === 'audio') {
    const p = await ffprobe(file);
    const v = p?.streams?.find((s) => s.codec_type === 'video') || p?.streams?.[0];
    if (v) {
      out.width = Number(v.width) || out.width || null; out.height = Number(v.height) || out.height || null;
      out.fps = Math.round(frac(v.avg_frame_rate) * 100) / 100 || Math.round(frac(v.r_frame_rate) * 100) / 100 || null;
      out.frames = Number(v.nb_read_frames || v.nb_frames) || null;
      out.codec = v.codec_name;
    }
    const dur = Number(p?.format?.duration || v?.duration);
    out.durationSec = Number.isFinite(dur) ? Math.round(dur * 100) / 100 : null;
    if (mime === 'image/gif') out.animated = (out.frames || 0) > 1;
    if (type === 'video') out.hasAudio = !!p?.streams?.some((s) => s.codec_type === 'audio');
    if (p?.format?.bit_rate) out.bitrate = Number(p.format.bit_rate);
  }
  return out;
}

/** Poster/thumbnail frame for contact sheets (videos). */
export async function videoThumb(file, outFile, atSec = 0.5) {
  try {
    await run('ffmpeg', ['-v', 'error', '-y', '-ss', String(atSec), '-i', file, '-frames:v', '1', '-vf', 'scale=480:-2', outFile]);
    return true;
  } catch {
    try { await run('ffmpeg', ['-v', 'error', '-y', '-i', file, '-frames:v', '1', '-vf', 'scale=480:-2', outFile]); return true; } catch { return false; }
  }
}
