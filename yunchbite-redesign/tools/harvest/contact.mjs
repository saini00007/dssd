// Contact sheets: thumbnail grids of every visual asset with its filename, rendered by Playwright
// from a local HTML file (file:// so relative asset paths just work).
import fs from 'node:fs';
import path from 'node:path';
import { launch, contextOptions, DESKTOP } from '../lib/browser.mjs';
import { videoThumb } from './media.mjs';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const kb = (n) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export async function buildContactSheets(assetsDir, entries, { perSheet = 30, log = () => {}, browser } = {}) {
  for (const f of fs.readdirSync(assetsDir)) if (/^contact-sheet-\d+\.jpg$/.test(f)) fs.rmSync(path.join(assetsDir, f));
  const items = entries.filter((e) => ['images', 'svg', 'gif', 'icons', 'video', 'fonts', 'lottie', '3d', 'audio'].includes(e.type));
  if (!items.length) return [];
  const thumbDir = path.join(assetsDir, '_thumbs');
  fs.mkdirSync(thumbDir, { recursive: true });

  const cells = [];
  let fi = 0;
  const faces = [];
  for (const e of items) {
    let inner;
    if (e.type === 'video') {
      const t = `_thumbs/${e.sha256.slice(0, 10)}.jpg`;
      const ok = fs.existsSync(path.join(assetsDir, t)) || (await videoThumb(path.join(assetsDir, e.file), path.join(assetsDir, t)));
      inner = ok ? `<img src="${esc(t)}">` : '<div class="ph">VIDEO</div>';
    } else if (e.type === 'fonts') {
      const fam = `f${fi++}`;
      faces.push(`@font-face{font-family:${fam};src:url("${esc(e.file)}")}`);
      inner = `<div class="font" style="font-family:${fam},serif">Aa Bb Cc<br>Hamburgefonstiv<br>0123456789</div>`;
    } else if (['images', 'svg', 'gif', 'icons'].includes(e.type)) {
      inner = `<img src="${esc(e.file)}">`;
    } else inner = `<div class="ph">${esc(e.type.toUpperCase())}</div>`;
    const dims = e.width ? `${e.width}x${e.height}` : '';
    const extra = [e.type, dims, kb(e.bytes), e.durationSec ? `${e.durationSec}s` : '', e.hasAlpha ? 'alpha' : ''].filter(Boolean).join(' · ');
    cells.push(`<figure><div class="thumb">${inner}</div><figcaption><b>${esc(path.basename(e.file))}</b><br>${esc(extra)}<br><i>${esc((e.roles || []).join(', '))}</i></figcaption></figure>`);
  }

  const css = `${faces.join('\n')}
  body{margin:0;padding:16px;background:#f4f4f4;font:12px/1.35 system-ui,sans-serif;color:#222;width:1560px}
  .grid{display:grid;grid-template-columns:repeat(6,240px);gap:16px}
  figure{margin:0;background:#fff;border:1px solid #ddd;border-radius:6px;overflow:hidden}
  .thumb{height:200px;display:flex;align-items:center;justify-content:center;
    background:conic-gradient(#e8e8e8 25%,#fff 0 50%,#e8e8e8 0 75%,#fff 0) 0 0/16px 16px}
  .thumb img{max-width:224px;max-height:184px;object-fit:contain}
  .ph{font-weight:700;color:#999;font-size:20px}.font{font-size:22px;text-align:center;line-height:1.2}
  figcaption{padding:6px 8px;border-top:1px solid #eee;word-break:break-all;height:64px;overflow:hidden}
  figcaption i{color:#777} h1{font-size:14px;margin:0 0 12px}`;
  const own = !browser;
  browser ??= await launch();
  const sheets = [];
  try {
    const ctx = await browser.newContext(contextOptions(DESKTOP, { viewport: { width: 1592, height: 900 } }));
    for (let i = 0, n = 1; i < cells.length; i += perSheet, n++) {
      const htmlFile = path.join(assetsDir, `_contact-${n}.html`);
      fs.writeFileSync(htmlFile, `<!doctype html><meta charset=utf-8><style>${css}</style><h1>Contact sheet ${n} of ${Math.ceil(cells.length / perSheet)} (${items.length} assets)</h1><div class="grid">${cells.slice(i, i + perSheet).join('')}</div>`);
      const page = await ctx.newPage();
      await page.goto('file://' + htmlFile, { waitUntil: 'load' });
      await page.evaluate(async () => {
        await Promise.all([...document.images].map((im) => im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; })));
        await document.fonts.ready;
      });
      const out = path.join(assetsDir, `contact-sheet-${n}.jpg`);
      await page.screenshot({ path: out, fullPage: true, type: 'jpeg', quality: 82 });
      await page.close();
      fs.rmSync(htmlFile);
      sheets.push(path.basename(out));
    }
    await ctx.close();
  } finally { if (own) await browser.close(); }
  log(`  contact sheets: ${sheets.join(', ')}`);
  return sheets;
}
