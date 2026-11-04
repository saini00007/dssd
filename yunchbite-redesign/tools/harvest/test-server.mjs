// Minimal in-process server for tools/fixtures/mini-site that emulates the bits of a
// Next.js (App Router, Vercel) site the harvester has to cope with:
//   - clean URLs (/about -> pages/about.html), 404 page for unknown routes
//   - /_next/image?url=%2Fimages%2Fx.png&w=640&q=75  (optimiser: returns a *resized WebP variant*,
//     like the real thing; the harvester must fetch the ORIGINAL from the decoded url param)
//   - hashed font path /_next/static/media/yb-display.<hash>.woff2
//   - HTTP Range support (Chromium needs it for <video>)
//   - placeholders: __ORIGIN__ (main origin, 127.0.0.1) and __ALT__ (alias host, localhost)
//     are substituted in html/xml/txt so the fixture can link to "the other host".
//   - <!--@head-->, <!--@header-->, <!--@footer--> partial includes
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../fixtures/mini-site');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
};

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

function resolvePage(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/') return 'pages/index.html';
  for (const c of [`pages${clean}.html`, `pages${clean}/index.html`]) {
    if (fs.existsSync(path.join(ROOT, c))) return c;
  }
  return null;
}

function safeJoin(rel) {
  const full = path.normalize(path.join(ROOT, rel));
  return full.startsWith(ROOT + path.sep) ? full : null;
}

export async function startTestServer({ port = 0, host = '0.0.0.0' } = {}) {
  const hits = [];
  const optimizerCache = new Map();
  let origin = '';
  let altOrigin = '';

  const subst = (s) =>
    s
      .replace(/<!--@head-->/g, read('_partials/head.html'))
      .replace(/<!--@header-->/g, read('_partials/header.html'))
      .replace(/<!--@footer-->/g, read('_partials/footer.html'))
      .replace(/__ORIGIN__/g, origin)
      .replace(/__ALT__/g, altOrigin);

  const send = (res, status, type, body, extra = {}) => {
    res.writeHead(status, { 'content-type': type, 'content-length': Buffer.byteLength(body), ...extra });
    res.end(body);
  };

  function sendFile(req, res, file) {
    const ext = path.extname(file).toLowerCase();
    const type = TYPES[ext] || 'application/octet-stream';
    if (['.html', '.xml', '.txt'].includes(ext)) {
      return send(res, 200, type, subst(fs.readFileSync(file, 'utf8')));
    }
    const size = fs.statSync(file).size;
    const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    if (range) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      res.writeHead(206, {
        'content-type': type, 'accept-ranges': 'bytes',
        'content-range': `bytes ${start}-${end}/${size}`, 'content-length': end - start + 1,
      });
      return fs.createReadStream(file, { start, end }).pipe(res);
    }
    res.writeHead(200, { 'content-type': type, 'content-length': size, 'accept-ranges': 'bytes' });
    fs.createReadStream(file).pipe(res);
  }

  function optimise(file, w) {
    const key = `${file}@${w}`;
    if (!optimizerCache.has(key)) {
      optimizerCache.set(key, new Promise((resolve, reject) => {
        execFile('ffmpeg', ['-v', 'error', '-i', file, '-vf', `scale='min(${w},iw)':-2`, '-frames:v', '1', '-f', 'webp', '-'],
          { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 }, (e, out) => (e ? reject(e) : resolve(out)));
      }));
    }
    return optimizerCache.get(key);
  }

  const server = http.createServer(async (req, res) => {
    try {
      const u = new URL(req.url, 'http://x');
      hits.push({ path: u.pathname + u.search, host: req.headers.host, ua: req.headers['user-agent'] });
      const p = u.pathname;

      if (p === '/_next/image' || p === '/_vercel/image') {
        const target = u.searchParams.get('url');
        const w = Number(u.searchParams.get('w'));
        if (!target || !w) return send(res, 400, 'text/plain', 'url/w required');
        const file = safeJoin(decodeURIComponent(new URL(target, 'http://x').pathname));
        if (!file || !fs.existsSync(file)) return send(res, 404, 'text/plain', 'not found');
        const buf = await optimise(file, Math.min(w, 3840));
        res.writeHead(200, { 'content-type': 'image/webp', 'content-length': buf.length, 'x-nextjs-optimizer': '1' });
        return res.end(buf);
      }
      if (p.startsWith('/_next/static/media/') && p.endsWith('.woff2')) {
        return sendFile(req, res, path.join(ROOT, 'fonts/yb-display.woff2'));
      }
      if (p === '/api/hello') return send(res, 200, 'application/json', '{"ok":true}');
      if (p === '/anim/loader.json') {
        return send(res, 200, 'application/json',
          JSON.stringify({ v: '5.7.0', fr: 30, ip: 0, op: 60, w: 100, h: 100, layers: [{ ty: 4, nm: 'dot' }] }));
      }

      const page = resolvePage(p);
      if (page) return sendFile(req, res, path.join(ROOT, page));

      const file = safeJoin(p.slice(1));
      if (file && p !== '/' && fs.existsSync(file) && fs.statSync(file).isFile() &&
          !p.startsWith('/pages/') && !p.startsWith('/_partials/')) {
        return sendFile(req, res, file);
      }
      send(res, 404, 'text/html; charset=utf-8',
        '<!doctype html><html><head><title>404: This page could not be found.</title></head><body><h1>404</h1><p>This page could not be found.</p></body></html>');
    } catch (e) {
      send(res, 500, 'text/plain', String(e));
    }
  });

  await new Promise((r) => server.listen(port, host, r));
  const { port: actual } = server.address();
  origin = `http://127.0.0.1:${actual}`;
  altOrigin = `http://localhost:${actual}`;
  return {
    url: origin, origin, altOrigin, port: actual, hits,
    close: () => new Promise((r) => { server.closeAllConnections?.(); server.close(r); }),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const s = await startTestServer({ port: Number(process.argv[2]) || 4173 });
  console.log(`mini-site on ${s.origin} (alias host ${s.altOrigin})`);
}
