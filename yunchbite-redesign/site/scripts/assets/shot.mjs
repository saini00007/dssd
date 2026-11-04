// Render an HTML file to PNG with the shared Playwright setup. Usage: node shot.mjs in.html out.png width height
import { chromium } from '/home/user/dssd/yunchbite-redesign/tools/lib/browser.mjs';
const [inp, out, w, h] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto('file://' + inp); await p.waitForTimeout(400); await p.screenshot({ path: out, fullPage: true }); await b.close();
