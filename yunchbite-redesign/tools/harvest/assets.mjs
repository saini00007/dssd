// Asset store: SHA-256 dedupe, naming, type folders, metadata, manifest.json/csv.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { sniff, inspect, EXT_BY_MIME, MIME_BY_EXT } from './media.mjs';
import { guessRoles } from './roles.mjs';
import { shortHash } from './urls.mjs';

export const TYPE_DIRS = ['images', 'svg', 'gif', 'video', 'audio', 'fonts', 'lottie', '3d', 'css', 'icons'];
const FONT_EXT = new Set(['woff2', 'woff', 'ttf', 'otf', 'eot']);
const MODEL_EXT = new Set(['glb', 'gltf', 'usdz', 'obj', 'fbx', 'hdr', 'exr', 'splinecode', 'spline']);

export const extOf = (url) => {
  try { return /\.([a-z0-9]{2,6})$/i.exec(new URL(url, 'http://x').pathname)?.[1]?.toLowerCase() || ''; } catch { return ''; }
};

export function isLottieJson(buf) {
  if (buf.length > 30 * 1024 * 1024) return false;
  try {
    const j = JSON.parse(buf.toString('utf8'));
    return j && typeof j === 'object' && 'v' in j && 'fr' in j && 'ip' in j && 'op' in j && Array.isArray(j.layers);
  } catch { return false; }
}

/** -> { type, mime } or null when the body is not a reusable asset. */
export function classify({ mime, url, buf, iconHint }) {
  const ext = extOf(url);
  let m = (mime || '').split(';')[0].trim().toLowerCase();
  const sn = sniff(buf);
  if (sn && (!m || m === 'application/octet-stream' || m.startsWith('text/') || m.startsWith('binary') || sn !== m)) {
    if (!(sn === 'video/mp4' && m.startsWith('video/')) && !(sn === 'image/x-icon' && m.includes('icon'))) m = sn;
  }
  if (!m || m === 'application/octet-stream') m = MIME_BY_EXT[ext] || m;
  if (m === 'image/vnd.microsoft.icon') m = 'image/x-icon';
  if (m === 'application/x-font-woff' || m === 'application/font-woff') m = 'font/woff';
  if (m === 'application/font-woff2') m = 'font/woff2';
  if (m === 'application/x-font-ttf' || m === 'application/x-font-truetype') m = 'font/ttf';
  if (m === 'image/svg+xml') return { type: iconHint ? 'icons' : 'svg', mime: m };
  if (m === 'image/gif') return { type: iconHint ? 'icons' : 'gif', mime: m };
  if (m.startsWith('image/')) return { type: iconHint || ext === 'ico' ? 'icons' : 'images', mime: m };
  if (m.startsWith('video/')) return { type: 'video', mime: m };
  if (m.startsWith('audio/')) return { type: 'audio', mime: m };
  if (m.startsWith('font/') || m.includes('font') || FONT_EXT.has(ext)) return { type: 'fonts', mime: m.startsWith('font/') ? m : MIME_BY_EXT[ext] || m };
  if (m === 'text/css') return { type: 'css', mime: m };
  if (ext === 'riv') return { type: 'lottie', mime: m };
  if (ext === 'lottie') return { type: 'lottie', mime: 'application/zip' };
  if (m.startsWith('model/') || MODEL_EXT.has(ext)) return { type: '3d', mime: m || MIME_BY_EXT[ext] };
  if ((m.includes('json') || ext === 'json' || m.startsWith('text/')) && isLottieJson(buf)) return { type: 'lottie', mime: 'application/json' };
  return null;
}

const sanitize = (s) => s.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^[-.]+|[-.]+$/g, '');

export class AssetStore {
  constructor(outDir, { log = () => {}, force = false } = {}) {
    this.dir = path.join(outDir, 'assets');
    this.log = log;
    this.entries = [];          // manifest entries
    this.bySha = new Map();
    this.byUrl = new Map();     // any source url -> entry
    this.names = new Map();     // type -> Set(filenames)
    this.pending = [];
    this.fontFaces = new Map(); // abs url -> {family, weight, style}
    this.stats = { downloaded: 0, duplicates: 0 };
    for (const t of TYPE_DIRS) this.names.set(t, new Set());
    fs.mkdirSync(this.dir, { recursive: true });
    this._load(force);
  }

  _load() {
    const f = path.join(this.dir, 'manifest.json');
    if (!fs.existsSync(f)) return;
    try {
      for (const e of JSON.parse(fs.readFileSync(f, 'utf8'))) {
        if (!fs.existsSync(path.join(this.dir, e.file))) continue;
        this.entries.push(e); this.bySha.set(e.sha256, e);
        for (const u of e.sourceUrls || []) this.byUrl.set(u, e);
        this.names.get(e.type)?.add(path.basename(e.file));
      }
      this.log(`  loaded ${this.entries.length} assets from previous run`);
    } catch (err) { this.log(`  could not read previous manifest: ${err.message}`); }
  }

  /** Previously stored entry for a URL (skips re-downloading). */
  known(url) { return this.byUrl.get(url) || null; }

  _name({ nameUrl, mime, type, sha, entryHint }) {
    let u;
    try { u = new URL(nameUrl, 'http://x'); } catch { u = new URL('http://x/asset'); }
    let base = decodeURIComponent(u.pathname.split('/').pop() || '') || 'asset';
    let ext = /\.([A-Za-z0-9]{2,6})$/.exec(base)?.[1]?.toLowerCase() || '';
    let stem = ext ? base.slice(0, -ext.length - 1) : base;
    stem = stem.replace(/\.[0-9a-f]{8,16}$/i, '');        // Next.js static media hash: logo.1a2b3c4d.png
    const wantExt = EXT_BY_MIME[mime];
    if (!ext || (wantExt && ext !== wantExt && !(ext === 'jpeg' && wantExt === 'jpg') && type !== 'lottie' && type !== '3d' && !(wantExt === 'ico'))) {
      if (wantExt) { if (ext && !MIME_BY_EXT[ext]) stem = `${stem}.${ext}`; ext = wantExt; }
    }
    if (type === 'lottie' && ext !== 'json' && ext !== 'riv' && ext !== 'lottie') ext = 'json';
    stem = sanitize(stem) || 'asset';
    // next/font hashed names -> prefix family so humans can tell them apart
    if (type === 'fonts' && entryHint?.family && /^[0-9a-f]{6,}|[-_]s(\.p)?$/i.test(stem)) {
      stem = `${sanitize(entryHint.family)}-${entryHint.weight || '400'}${/italic/.test(entryHint.style || '') ? '-italic' : ''}-${stem.slice(0, 8)}`;
    }
    stem = stem.slice(0, 90);
    let name = `${stem}.${ext}`;
    const used = this.names.get(type);
    if (used.has(name)) name = `${stem}-${sha.slice(0, 8)}.${ext}`;
    used.add(name);
    return name;
  }

  /**
   * Store a body. Returns the (possibly pre-existing) manifest entry.
   * @param {object} a
   * @param {Buffer} a.buf
   * @param {string} a.url        URL the bytes were fetched from (recorded in sourceUrls)
   * @param {string} [a.nameUrl]  URL used for naming (e.g. decoded next/image original)
   * @param {string[]} [a.alsoUrls] extra URLs delivering this same asset (optimiser variants)
   * @param {string} [a.originalUrl]
   */
  ingest({ buf, url, nameUrl, mime, alsoUrls = [], originalUrl, iconHint, thirdParty }) {
    const c = classify({ mime, url: nameUrl || url, buf, iconHint });
    if (!c) return null;
    const sha = crypto.createHash('sha256').update(buf).digest('hex');
    let e = this.bySha.get(sha);
    if (e) {
      this.stats.duplicates++;
      if (iconHint && e.type !== 'icons' && ['images', 'svg', 'gif'].includes(e.type)) e.alsoIcon = true;
    } else {
      const family = this.fontFaces.get(url);
      const name = this._name({ nameUrl: nameUrl || url, mime: c.mime, type: c.type, sha, entryHint: family });
      const rel = `${c.type}/${name}`;
      fs.mkdirSync(path.join(this.dir, c.type), { recursive: true });
      fs.writeFileSync(path.join(this.dir, rel), buf);
      e = {
        file: rel, sha256: sha, bytes: buf.length, mime: c.mime, type: c.type,
        width: null, height: null, hasAlpha: null,
        sourceUrls: [], originalUrl: originalUrl || nameUrl || url, pages: [], alts: [], roles: [], usages: [],
        thirdParty: !!thirdParty,
      };
      this.entries.push(e); this.bySha.set(sha, e);
      this.stats.downloaded++;
      const p = inspect({ buf, mime: c.mime, file: path.join(this.dir, rel), type: c.type })
        .then((meta) => Object.assign(e, Object.fromEntries(Object.entries(meta).filter(([, v]) => v !== undefined))))
        .catch((err) => { e.inspectError = err.message; });
      this.pending.push(p);
    }
    if (originalUrl && !e.originalUrl) e.originalUrl = originalUrl;
    if (originalUrl && alsoUrls.length) e.originalUrl = originalUrl;  // next/image decoded source wins
    for (const u of [url, ...alsoUrls]) {
      if (u && !e.sourceUrls.includes(u) && e.sourceUrls.length < 60) e.sourceUrls.push(u);
      if (u) this.byUrl.set(u, e);
    }
    return e;
  }

  linkUrls(e, urls) {
    for (const u of urls) {
      if (!u) continue;
      if (!e.sourceUrls.includes(u) && e.sourceUrls.length < 60) e.sourceUrls.push(u);
      this.byUrl.set(u, e);
    }
  }

  addUsage(e, pagePath, u = {}) {
    if (!e) return;
    if (pagePath && !e.pages.includes(pagePath)) e.pages.push(pagePath);
    if (u.alt && !e.alts.includes(u.alt)) e.alts.push(u.alt);
    const slim = {
      page: pagePath, how: u.how, alt: u.alt || undefined, w: u.renderedW ?? u.w, h: u.renderedH ?? u.h, docTop: u.docTop,
      inHeader: u.inHeader || undefined, inNav: u.inNav || undefined, inFooter: u.inFooter || undefined, inMain: u.inMain || undefined,
      link: u.link || undefined, cls: u.cls || undefined, id: u.id || undefined, parentCls: u.parentCls || undefined,
      autoplay: u.autoplay || undefined, loop: u.loop || undefined, sourceType: u.sourceType || undefined,
    };
    const key = `${slim.page}|${slim.how}|${slim.cls}|${slim.alt}`;
    e._keys ??= new Set(e.usages.map((x) => `${x.page}|${x.how}|${x.cls}|${x.alt}`));
    if (e._keys.has(key) || e.usages.length >= 80) return;
    e._keys.add(key);
    e.usages.push(JSON.parse(JSON.stringify(slim)));
  }

  /** Attach @font-face family/weight/style to font entries by URL. */
  annotateFonts() {
    for (const [url, f] of this.fontFaces) {
      const e = this.byUrl.get(url);
      if (e && e.type === 'fonts') Object.assign(e, { fontFamily: f.family, fontWeight: f.weight, fontStyle: f.style });
    }
  }

  async settle() { await Promise.allSettled(this.pending); this.pending = []; }

  async save() {
    await this.settle();
    this.annotateFonts();
    for (const e of this.entries) e.roles = guessRoles(e);
    const clean = this.entries
      .map(({ _keys, ...rest }) => rest)
      .sort((a, b) => a.type.localeCompare(b.type) || a.file.localeCompare(b.file));
    fs.writeFileSync(path.join(this.dir, 'manifest.json'), JSON.stringify(clean, null, 2));
    const cols = ['file', 'type', 'mime', 'bytes', 'width', 'height', 'hasAlpha', 'hasTransparency', 'animated', 'durationSec', 'fps', 'roles', 'pages', 'originalUrl', 'alts', 'sha256'];
    const q = (v) => { const s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    fs.writeFileSync(path.join(this.dir, 'manifest.csv'), [cols.join(','), ...clean.map((e) => cols.map((c) => q(e[c])).join(','))].join('\n') + '\n');
    return clean;
  }
}
