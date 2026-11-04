// Tiny static server for local fixtures.
//   node fixtures/serve.mjs [--port 4173]
// Serves tools/fixtures/ as the web root and tools/node_modules/ under /vendor/.
// Importable: `const { url, close } = await startServer({ port })` (port 0 = random).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = HERE;
const VENDOR = path.resolve(HERE, '..', 'node_modules');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

/** Resolve a request path to a file inside ROOT or VENDOR; null when outside / missing. */
function resolveFile(urlPath) {
  let p;
  try { p = decodeURIComponent(urlPath.split('?')[0]); } catch { return null; }
  let base = ROOT;
  if (p.startsWith('/vendor/')) { base = VENDOR; p = p.slice('/vendor'.length); }
  let file = path.normalize(path.join(base, p));
  if (file !== base && !file.startsWith(base + path.sep)) return null;
  try {
    if (fs.statSync(file).isDirectory()) {
      // Directory URLs without a trailing slash are redirected by the caller.
      file = path.join(file, 'index.html');
    }
    return fs.statSync(file).isFile() ? file : null;
  } catch { return null; }
}

function handler(req, res) {
  const pathname = req.url.split('?')[0];
  const file = resolveFile(pathname);
  if (!file) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('Not found'); }
  // /motion-lab -> /motion-lab/ so relative URLs resolve.
  if (!pathname.endsWith('/') && path.basename(file) === 'index.html' && !pathname.endsWith('.html')) {
    res.writeHead(301, { location: pathname + '/' + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '') });
    return res.end();
  }
  const size = fs.statSync(file).size;
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const headers = { 'content-type': type, 'accept-ranges': 'bytes', 'cache-control': 'no-cache' };
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (range) {
    let start = range[1] === '' ? size - Number(range[2]) : Number(range[1]);
    let end = range[1] === '' || range[2] === '' ? size - 1 : Number(range[2]);
    end = Math.min(end, size - 1);
    if (!(start >= 0) || start > end) {
      res.writeHead(416, { 'content-range': `bytes */${size}` });
      return res.end();
    }
    res.writeHead(206, { ...headers, 'content-range': `bytes ${start}-${end}/${size}`, 'content-length': end - start + 1 });
    if (req.method === 'HEAD') return res.end();
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...headers, 'content-length': size });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}

export async function startServer({ port = 4173, host = '127.0.0.1' } = {}) {
  const server = http.createServer(handler);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  const actual = server.address().port;
  return {
    url: `http://${host}:${actual}`,
    port: actual,
    close: () => new Promise((r) => { server.closeAllConnections?.(); server.close(() => r()); }),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--port');
  const port = i > -1 ? Number(process.argv[i + 1]) : 4173;
  const { url } = await startServer({ port });
  console.log(`fixtures served at ${url}/  (vendor -> /vendor/)`);
}
