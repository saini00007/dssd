// Plain Node HTTP fetching (used for sitemaps and for assets the page never requested).
// Playwright's APIRequestContext ignores the environment proxy, so everything here uses fetch().
import { spawnSync } from 'node:child_process';

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

/** Node's fetch only honours HTTP(S)_PROXY when NODE_USE_ENV_PROXY=1; re-exec once if a proxy is configured. */
export function ensureEnvProxy() {
  const proxied = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
  if (!proxied || process.env.NODE_USE_ENV_PROXY) return;
  const r = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1' },
  });
  process.exit(r.status ?? 1);
}

export async function httpGet(url, { headers = {}, timeout = 30000, maxBytes = 250 * 1024 * 1024, accept = '*/*' } = {}) {
  const res = await fetch(url, { headers: { 'user-agent': UA, accept, ...headers }, redirect: 'follow', signal: AbortSignal.timeout(timeout) });
  const h = Object.fromEntries(res.headers);
  if (!res.ok) { await res.body?.cancel?.(); return { ok: false, status: res.status, headers: h, body: Buffer.alloc(0) }; }
  const len = Number(h['content-length'] || 0);
  if (len > maxBytes) { await res.body?.cancel?.(); return { ok: false, status: 413, headers: h, body: Buffer.alloc(0), tooBig: true }; }
  return { ok: true, status: res.status, headers: h, body: Buffer.from(await res.arrayBuffer()), url: res.url };
}
