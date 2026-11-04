#!/usr/bin/env node
// End-to-end test on a synthetic VFR recording (no network). Exit code 0 = pass.
//   node video/test.mjs [--keep]
import path from 'node:path';
import os from 'node:os';
import { mkdtemp, mkdir, readFile, readdir, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { launch } from '../lib/browser.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const keep = process.argv.includes('--keep');
const work = await mkdtemp(path.join(os.tmpdir(), 'vidtest-'));
const fail = [], pass = [];
const check = (ok, msg) => { (ok ? pass : fail).push(msg); console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); };
const sh = (cmd, args) => { const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 28 }); if (r.status !== 0) throw new Error(`${cmd} failed: ${r.stderr.slice(-500)}`); return r; };
const ff = (...a) => sh('ffmpeg', ['-nostdin', '-v', 'error', '-threads', '2', '-y', ...a]);
const esc = (s) => s.replace(/,/g, '\\,');

// ---------- ground truth (must mirror the ffmpeg expressions below) ----------
const D = 700, TAU = 0.35, S0 = 1, S1 = 3.5;
const Y = (t) => (t < S0 ? 0 : t < S1 ? D * (1 - Math.exp(-(t - S0) / TAU)) : D * (1 - Math.exp(-(S1 - S0) / TAU)));
const H0 = 6.5, H1 = 8.0, HD = 360;
const X = (t) => (t < H0 ? 0 : t < H1 ? HD * (1 - Math.pow(1 - (t - H0) / (H1 - H0), 3)) : HD);
const BOX0 = 4.0, BOX1 = 5.5, CUT = 9.2, DUR = 10.5;
const RECT = { x: 40, y: 60, w: 906, h: 540 };
const yExpr = `if(lt(t,${S0}),0,if(lt(t,${S1}),${D}*(1-exp(-(t-${S0})/${TAU})),${D}*(1-exp(-${S1 - S0}/${TAU}))))`;
const xExpr = `if(lt(t,${H0}),0,if(lt(t,${H1}),${HD}*(1-pow(1-(t-${H0})/${H1 - H0},3)),${HD}))`;

console.log(`work dir: ${work}`);
// ---------- build the synthetic recording ----------
const texture = (file, w, h, seed) => ff('-f', 'lavfi', '-i', `color=c=0x808080:s=${w}x${h}:d=1`, '-filter_complex',
  `[0:v]noise=alls=100:all_seed=${seed}:allf=u,format=gray,split=3[a][b][c];` +
  `[a]scale=${w / 8}:${h / 8}:flags=area,scale=${w}:${h}:flags=bicubic[a2];[b]scale=${w / 32}:${h / 32}:flags=area,scale=${w}:${h}:flags=bicubic[b2];[c]scale=${w / 4}:${h / 4}:flags=area,scale=${w}:${h}:flags=bicubic[c2];` +
  `[a2][b2]blend=all_mode=average[ab];[ab][c2]blend=all_mode=average,eq=contrast=5:brightness=0,format=rgb24[o]`, '-map', '[o]', '-frames:v', '1', file);
texture(path.join(work, 'page1.png'), 1280, 2400, 3);
texture(path.join(work, 'page2.png'), 906, 540, 9);
const cfr = path.join(work, 'cfr.mp4'), vfr = path.join(work, 'rec-vfr.mp4');
const chrome = `drawbox=x=0:y=0:w=960:h=60:color=0x3c3c3c:t=fill,drawbox=x=0:y=60:w=40:h=540:color=0x252525:t=fill,` +
  `drawbox=x=946:y=60:w=14:h=540:color=0xe0e0e0:t=fill,drawbox=x=8:y=80:w=24:h=24:color=0xaa3333:t=fill,drawbox=x=8:y=120:w=24:h=24:color=0x3366aa:t=fill,` +
  `drawbox=x=100:y=16:w=500:h=28:color=0x555555:t=fill,drawbox=x=20:y=18:w=24:h=24:color=0x999999:t=fill`;
const fc = [
  `[0:v]crop=906:540:'${esc(xExpr)}':'${esc(yExpr)}'[p1]`,
  `[2:v]${chrome}[chrome]`,
  `[chrome][p1]overlay=40:60[a]`,
  `[a][1:v]overlay=40:60:enable='gte(t,${CUT})'[b]`,
  `[b][3:v]overlay=x='${esc(`100+500*(0.5-0.5*cos(3.14159*(t-${BOX0})/${BOX1 - BOX0}))`)}':y=260:enable='between(t,${BOX0},${BOX1})'[c]`,
  `[c][4:v]overlay=x=948:y='${esc(`60+(${yExpr})/1240*460`)}'[o]`,
].join(';');
ff('-loop', '1', '-framerate', '30', '-t', String(DUR), '-i', path.join(work, 'page1.png'),
  '-loop', '1', '-framerate', '30', '-t', String(DUR), '-i', path.join(work, 'page2.png'),
  '-f', 'lavfi', '-i', `color=c=0x2b2b2b:s=960x600:r=30:d=${DUR}`,
  '-f', 'lavfi', '-i', `color=c=0xcc2222:s=160x120:r=30:d=${DUR}`,
  '-f', 'lavfi', '-i', `color=c=0x555555:s=10x80:r=30:d=${DUR}`,
  '-filter_complex', fc, '-map', '[o]', '-t', String(DUR), '-r', '30', '-c:v', 'libx264', '-crf', '12', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', cfr);
// irregular frame dropping -> genuine VFR (keeps original timestamps)
ff('-i', cfr, '-vf', `select=not(eq(mod(n\\,7)\\,3))*not(eq(mod(n\\,11)\\,5))`, '-fps_mode', 'passthrough', '-c:v', 'libx264', '-crf', '12', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', vfr);
console.log('synthetic VFR recording built');

// ---------- run the CLI ----------
const out = path.join(work, 'out');
const t0 = Date.now();
const r = spawnSync('node', [path.join(here, 'analyze-video.mjs'), vfr, '--out', out, '--max-strip', '12'], { encoding: 'utf8', maxBuffer: 1 << 28 });
console.log(`CLI exit ${r.status} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
if (r.status !== 0) console.log(r.stderr.split('\n').filter((l) => !l.includes('motion pass:')).slice(-25).join('\n'));
check(r.status === 0, 'CLI exits 0 (no stage errors)');

const must = async (p) => { const ok = existsSync(path.join(out, p)); check(ok, `output exists: ${p}`); return ok; };
let tlj, evj;
try {
  tlj = JSON.parse(await readFile(path.join(out, 'timeline.json'), 'utf8'));
  evj = JSON.parse(await readFile(path.join(out, 'events.json'), 'utf8'));
} catch (e) { check(false, 'timeline.json / events.json readable: ' + e.message); }

if (tlj && evj) {
  const F = tlj.frames, events = evj.events, T = F.map((f) => f.t);
  const medDt = [...F.map((f) => f.dt).slice(1)].sort((a, b) => a - b)[Math.floor(F.length / 2)];
  const tol = 2 * medDt + 0.015;
  const dts = F.slice(1).map((f) => f.dt);
  check(Math.max(...dts) > 1.4 * medDt, `recording is really VFR (max dt ${Math.max(...dts).toFixed(3)} vs median ${medDt.toFixed(3)})`);
  check(F.length >= 240 && F.length <= 250, `all frames in timeline (${F.length})`);

  // crop
  const c = tlj.meta.crop;
  const e4 = (a, b, name) => check(Math.abs(a - b) <= 6, `crop ${name} ${a} ~ ${b} (±6px)`);
  e4(c.x, RECT.x, 'x'); e4(c.y, RECT.y, 'y'); e4(c.x + c.w, RECT.x + RECT.w - 0, 'right'); e4(c.y + c.h, RECT.y + RECT.h, 'bottom');
  check(c.x >= RECT.x - 0 && c.y >= RECT.y - 0 && c.x + c.w <= 946, 'crop excludes browser chrome and scrollbar (never outside content)');
  check(c.x % 2 === 0 && c.y % 2 === 0 && c.w % 2 === 0 && c.h % 2 === 0, 'crop values are even');

  // vertical scroll burst
  const sc = events.filter((e) => e.type === 'scroll' && e.endT > 0.9 && e.startT < 4);
  const burst = sc[0];
  check(!!burst, 'vertical scroll burst detected');
  if (burst) {
    check(Math.abs(burst.startT - S0) <= tol + 0.04, `scroll start ${burst.startT.toFixed(3)}s ~ ${S0}s (±${(tol + 0.04).toFixed(3)})`);
    check(burst.endT > 2.4 && burst.endT < 3.9, `scroll end ${burst.endT.toFixed(3)}s plausible`);
    const dist = Math.abs(burst.distancePx), expD = Y(S1);
    check(Math.abs(dist - expD) / expD < 0.05, `scroll distance ${dist.toFixed(0)} px ~ ${expD.toFixed(0)} px (±5%)`);
    // peak (2-frame windows) vs truth computed on the same frame times
    let truthPeak = 0;
    for (let n = 2; n < F.length; n++) if (T[n] <= S1 + 0.1) truthPeak = Math.max(truthPeak, Math.abs(Y(T[n]) - Y(T[n - 2])) / (T[n] - T[n - 2]));
    check(Math.abs(burst.peakVelocity - truthPeak) / truthPeak < 0.1, `peak velocity ${burst.peakVelocity.toFixed(0)} px/s ~ truth ${truthPeak.toFixed(0)} (±10%)`);
    // per-frame velocity along the decay
    let worst = 0, cnt = 0;
    for (let n = 1; n < F.length - 1; n++) if (T[n] > 1.3 && T[n] < 2.6) {
      const tv = (Y(T[n + 1]) - Y(T[n - 1])) / (T[n + 1] - T[n - 1]);
      worst = Math.max(worst, Math.abs(F[n].scrollVelocity - tv) - 0.08 * tv); cnt++;
    }
    check(cnt > 10 && worst < 40, `scroll velocity curve matches synthetic (${cnt} frames, worst excess error over 8% of truth: ${worst.toFixed(0)} px/s, tol 40)`);
    check(burst.decay?.tau && Math.abs(burst.decay.tau - TAU) / TAU < 0.2, `decay time-constant ${burst.decay?.tau} s ~ ${TAU} s (±20%, R2 ${burst.decay?.r2})`);
  }
  const scrollFrames = F.filter((f) => f.dy !== 0).length;
  check(F.filter((f) => f.t > 4 && f.t < 6.4 && f.dy !== 0).length <= 2, 'no fake vertical scroll during the in-place animation / idle');

  // in-place animation
  const anim = events.find((e) => ['animation', 'pinned', 'anim-scroll'].includes(e.type) && e.startT > 3.7 && e.startT < 4.5);
  check(!!anim, 'in-place animation event detected');
  if (anim) {
    check(Math.abs(anim.startT - BOX0) <= tol, `animation start ${anim.startT.toFixed(3)}s ~ ${BOX0}s (±${tol.toFixed(3)})`);
    check(Math.abs(anim.endT - BOX1) <= tol, `animation end ${anim.endT.toFixed(3)}s ~ ${BOX1}s (±${tol.toFixed(3)})`);
    check(/middle|top|bottom/.test(anim.region) && anim.region !== 'none', `animation region reported (${anim.region})`);
  }
  // horizontal
  const hs = events.find((e) => e.type === 'hscroll');
  check(!!hs, 'horizontal scroll event detected');
  if (hs) {
    check(Math.abs(hs.startT - H0) <= tol + 0.04, `hscroll start ${hs.startT.toFixed(3)}s ~ ${H0}s`);
    check(hs.endT > H0 + 1.0 && hs.endT < 9.0, `hscroll end ${hs.endT.toFixed(3)}s plausible`);
    check(Math.abs(Math.abs(hs.distancePx) - HD) / HD < 0.06, `hscroll distance ${hs.distancePx} px ~ ${HD} (±6%)`);
    let tp = 0; for (let n = 2; n < F.length; n++) if (T[n] > H0 && T[n] < H1 + 0.2) tp = Math.max(tp, Math.abs(X(T[n]) - X(T[n - 2])) / (T[n] - T[n - 2]));
    check(Math.abs(Math.abs(hs.peakVelocityX) - tp) / tp < 0.2, `hscroll peak velocity ${hs.peakVelocityX} ~ truth ${tp.toFixed(0)} px/s (±20%)`);
  }
  // cut
  const firstCutFrame = T.findIndex((t) => t >= CUT);
  const cut = events.find((e) => e.type === 'cut');
  check(!!cut, 'cut detected');
  if (cut) check(Math.abs(cut.startFrame - firstCutFrame) <= 2, `cut at frame ${cut.startFrame} ~ ${firstCutFrame} (±2 frames)`);
  check(events.filter((e) => e.type === 'cut').length === 1, 'exactly one cut');
  // no spurious events in the idle holds
  const spurious = events.filter((e) => e.type !== 'scroll' && ((e.endT > 0.05 && e.startT < 0.9) || (e.startT > 5.8 && e.endT < 6.4)));
  check(spurious.length === 0, `no spurious events in idle holds (${spurious.map((e) => e.id).join(',') || 'none'})`);
  // all events have ids, regions, frames
  check(events.every((e) => /^E\d\d$/.test(e.id) && e.startFrame <= e.endFrame && Number.isFinite(e.startT)), 'events have IDs E01.. and frame/time ranges');
  check(F.every((f) => f.regionGrid.length === 12 && 'class' in f && 'scrollPos' in f), 'timeline frames carry grid, class, scrollPos');

  // outputs
  await must('crop-preview.jpg'); await must('timeline.png'); await must('report.md'); await must('viewer.html');
  const sheets = existsSync(path.join(out, 'sheets')) ? (await readdir(path.join(out, 'sheets'))).filter((f) => f.endsWith('.jpg')) : [];
  check(sheets.length >= 1, `contact sheets written (${sheets.length})`);
  for (const e of events.filter((e) => ['animation', 'pinned', 'hscroll', 'cut', 'anim-scroll'].includes(e.type))) {
    const dir = path.join(out, 'events', `${e.id}-${e.type}`);
    const ok = existsSync(path.join(dir, 'strip.jpg')) && existsSync(path.join(dir, 'frames')) && (await readdir(path.join(dir, 'frames'))).length >= Math.min(e.frames, 3);
    check(ok, `strip + frames for ${e.id}-${e.type}`);
  }
  const html = await readFile(path.join(out, 'viewer.html'), 'utf8');
  check(html.includes('"times":[') && html.includes('"events":['), 'viewer.html embeds timeline JSON inline');
  const rep = await readFile(path.join(out, 'report.md'), 'utf8');
  check(/Limitations/.test(rep) && /\| E\d\d \|/.test(rep), 'report.md has events table and limitations');

  // viewer in a real browser
  const br = await launch();
  try {
    const page = await (await br.newContext({ viewport: { width: 390, height: 800 } })).newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|media|codec|DEMUXER|ERR_/i.test(m.text())) errs.push(m.text()); });
    await page.goto('file://' + path.join(out, 'viewer.html'));
    await page.waitForTimeout(600);
    const f0 = await page.textContent('#fn');
    await page.keyboard.press('ArrowRight');
    const f1 = await page.textContent('#fn');
    await page.keyboard.press('Shift+ArrowRight');
    const f2 = await page.textContent('#fn');
    await page.keyboard.press('ArrowLeft');
    const f3 = await page.textContent('#fn');
    check(f0 === '0' && f1 === '1' && f2 === '11' && f3 === '10', `viewer stepping 0 -> +1 -> +10 -> -1 gives ${f0},${f1},${f2},${f3}`);
    const t3 = await page.textContent('#ft');
    check(Math.abs(parseFloat(t3) - T[10]) < 0.0006, `viewer shows true timestamp ${t3} = timeline t[10] ${T[10].toFixed(3)}`);
    const wOK = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    check(wOK, 'viewer has no horizontal overflow at phone width (390px)');
    await page.click('#bar', { position: { x: 200, y: 20 } });
    check((await page.textContent('#fn')) !== '10', 'clicking the timeline bar jumps');
    check(errs.length === 0, `viewer: no console/page errors ${errs.join(' | ')}`);
  } finally { await br.close(); }
}

console.log(`\n${pass.length} passed, ${fail.length} failed`);
if (!keep && !fail.length) await rm(work, { recursive: true, force: true }); else console.log(`kept ${work}`);
process.exit(fail.length ? 1 : 0);
