// Pass 5: cursor & pointer behaviour. Detects custom cursors (and measures their lag), magnetic
// elements (move as the pointer approaches, before hovering) and mouse-move parallax.
// Records a short clip (video/cursor.mp4) and writes cursor.json.
import fs from 'node:fs';
import path from 'node:path';
import { sleep } from '../lib/browser.mjs';
import { cleanupVideoDir, openPage } from './session.mjs';
import { ensureDir, log, round, toMp4, writeJson } from './util.mjs';

/** Remember on-screen elements and return their centres; later calls re-read the same elements. */
function moversInPage(init) {
  const cap = window.__cap;
  if (init) {
    const parent = new Map();
    const els = [];
    let n = 0;
    for (const el of document.body.querySelectorAll('*')) {
      if (++n > 3000 || els.length >= 1500) break;
      if (el.closest('svg') && el.tagName !== 'svg') continue;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (r.width < 2 || r.height < 2 || cs.display === 'none' || r.bottom < -200 || r.top > innerHeight + 200 || r.right < -200 || r.left > innerWidth + 200) continue;
      parent.set(el, els.length);
      els.push(el);
    }
    cap.movers = els;
    cap.moverParent = els.map((el) => {
      for (let p = el.parentElement; p; p = p.parentElement) if (parent.has(p)) return parent.get(p);
      return -1;
    });
    cap.moverSel = els.map(cap.sel);
    cap.moverInfo = els.map((el) => {
      const cs = getComputedStyle(el);
      return { position: cs.position, cursor: cs.cursor, pointerEvents: cs.pointerEvents };
    });
  }
  return cap.movers.map((el) => {
    const r = el.getBoundingClientRect();
    return [r.x + r.width / 2, r.y + r.height / 2, r.width, r.height];
  });
}

/** rAF-sample an element's centre for `ms`, noting when the next mousemove event arrives. */
function sampleFollow({ el, ms }) {
  return new Promise((resolve) => {
    const out = [];
    const t0 = performance.now();
    let ev = null;
    window.addEventListener('mousemove', (e) => (ev = { t: performance.now() - t0, x: e.clientX, y: e.clientY }), { once: true });
    (function loop() {
      const r = el.getBoundingClientRect();
      out.push([performance.now() - t0, r.x + r.width / 2, r.y + r.height / 2]);
      if (performance.now() - t0 < ms) requestAnimationFrame(loop);
      else resolve({ samples: out, event: ev });
    })();
  });
}

function cursorStyle(el) {
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return { width: Math.round(r.width * 10) / 10, height: Math.round(r.height * 10) / 10, opacity: cs.opacity, backgroundColor: cs.backgroundColor, mixBlendMode: cs.mixBlendMode, borderRadius: cs.borderTopLeftRadius };
}

function magneticCandidatesInPage() {
  const cap = window.__cap;
  const seen = new Set();
  const out = [];
  cap.magEls = [];
  const els = [...document.querySelectorAll('button, a[href], [role=button], [class*=magnet i], [data-magnetic], [data-magnet], [class*=btn i], [class*=cta i]')];
  for (const el of els) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (r.width < 30 || r.height < 20 || cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none') continue;
    const magnetLike = /magnet/i.test(typeof el.className === 'string' ? el.className : '') || el.hasAttribute('data-magnetic') || el.hasAttribute('data-magnet');
    const key = el.tagName + '|' + (typeof el.className === 'string' ? el.className : '');
    if (seen.has(key)) continue;
    seen.add(key);
    cap.magEls.push(el);
    out.push({ i: cap.magEls.length - 1, selector: cap.sel(el), magnetLike, area: r.width * r.height });
  }
  return out.sort((a, b) => Number(b.magnetLike) - Number(a.magnetLike) || b.area - a.area);
}

const std = (a) => {
  const m = a.reduce((x, y) => x + y, 0) / a.length;
  return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length);
};

export async function runCursor(run) {
  const { dir, opts, deadline } = run;
  const s = await openPage(run, { video: true, label: 'cursor' });
  let webm = null;
  try {
    const { page } = s;
    await s.waitIntro();
    await sleep(800); // let intro motion finish so it is not mistaken for pointer-driven motion
    const scroller = await s.initScroller();
    const vp = run.profile.viewport;
    const result = { viewport: vp, cursorHidden: {}, customCursors: [], parallax: {}, magnetic: [] };

    result.cursorHidden = await page.evaluate(() => {
      const c = (el) => (el ? getComputedStyle(el).cursor : null);
      const link = document.querySelector('a[href]');
      return { html: c(document.documentElement), body: c(document.body), link: c(link), nativeCursorHidden: [document.documentElement, document.body].some((e) => c(e) === 'none') };
    });

    // ---- 1. custom cursor: which elements track the mouse with a constant offset?
    const points = [[0.2, 0.25], [0.75, 0.3], [0.5, 0.6], [0.25, 0.8], [0.8, 0.75]].map(([x, y]) => ({ x: Math.round(x * vp.width), y: Math.round(y * vp.height) }));
    await page.evaluate(moversInPage, true);
    const trace = [];
    for (const p of points) {
      await page.mouse.move(p.x, p.y, { steps: 8 });
      await sleep(700);
      trace.push(await page.evaluate(moversInPage, false));
    }
    const info = await page.evaluate(() => ({ sel: window.__cap.moverSel, info: window.__cap.moverInfo, parent: window.__cap.moverParent }));
    const followers = [];
    for (let i = 0; i < info.sel.length; i++) {
      const dx = trace.map((t, k) => t[i][0] - points[k].x);
      const dy = trace.map((t, k) => t[i][1] - points[k].y);
      const travel = Math.hypot(trace[trace.length - 1][i][0] - trace[0][i][0], trace[trace.length - 1][i][1] - trace[0][i][1]);
      const [, , w, h] = trace[0][i];
      if (std(dx) <= 10 && std(dy) <= 10 && travel > 100 && w <= 300 && h <= 300) {
        followers.push({ i, selector: info.sel[i], position: info.info[i].position, size: { width: round(w, 0), height: round(h, 0) }, offsetFromPointer: { x: round(dx.reduce((a, b) => a + b, 0) / dx.length, 1), y: round(dy.reduce((a, b) => a + b, 0) / dy.length, 1) } });
      }
    }
    // lag: jump the pointer and watch when the follower arrives
    for (const f of followers.slice(0, 3)) {
      const handle = await page.evaluateHandle((i) => window.__cap.movers[i], f.i);
      const start = { x: points[0].x, y: points[0].y };
      await page.mouse.move(start.x, start.y, { steps: 4 });
      await sleep(700);
      const jump = { x: Math.round(vp.width * 0.8), y: Math.round(vp.height * 0.7) };
      const sampling = page.evaluate(sampleFollow, { el: handle, ms: 1600 });
      await sleep(200);
      await page.mouse.move(jump.x, jump.y, { steps: 1 });
      const { samples, event } = await sampling;
      const target = { x: jump.x + f.offsetFromPointer.x, y: jump.y + f.offsetFromPointer.y };
      const from = samples.find((smp) => smp[0] >= (event?.t ?? 0)) || samples[0];
      const total = Math.hypot(target.x - from[1], target.y - from[2]);
      const reach = (frac) => {
        const hit = samples.find((smp) => smp[0] >= (event?.t ?? 0) && Math.hypot(target.x - smp[1], target.y - smp[2]) <= total * frac);
        return hit ? round(hit[0] - (event?.t ?? 0), 0) : null;
      };
      f.lag = { jumpPx: round(total, 0), reach63PctMs: reach(0.37), reach95PctMs: reach(0.05), samples: samples.length, behaviour: total < 20 ? 'jump too small to measure' : (reach(0.37) ?? 999) <= 20 ? 'direct (follows within a frame or two)' : 'smoothed (eased/lerped follow)' };
      await handle.dispose();
    }
    // does the follower change over interactive elements?
    if (followers.length) {
      const f = followers[0];
      const link = await page.evaluateHandle(() => {
        const ok = (e) => { const r = e.getBoundingClientRect(); return r.width > 20 && r.height > 10 && r.top > 0 && r.bottom < innerHeight && r.left > 0 && r.right < innerWidth; };
        return [...document.querySelectorAll('a[href], button')].find(ok) || null;
      });
      const el = link.asElement();
      if (el) {
        const box = await el.boundingBox();
        const cursorHandle = await page.evaluateHandle((i) => window.__cap.movers[i], f.i);
        await page.mouse.move(points[2].x, points[2].y, { steps: 6 });
        await sleep(600);
        const base = await cursorHandle.evaluate(cursorStyle);
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
        await sleep(700);
        const over = await cursorHandle.evaluate(cursorStyle);
        const sel = await el.evaluate((n) => window.__cap.sel(n));
        const changed = Object.keys(base).filter((k) => base[k] !== over[k]);
        f.reactsToLinks = { link: sel, idle: base, overLink: over, changedProperties: changed };
        await cursorHandle.dispose();
      }
      await link.dispose();
    }
    result.customCursors = followers.map(({ i, ...rest }) => rest);
    result.customCursorDetected = followers.length > 0;
    log('cursor', followers.length ? `custom cursor: ${followers.map((f) => f.selector).join(', ')}` : 'no pointer-following element found');

    // ---- 2. mouse-move parallax in the first viewport
    await page.evaluate(() => (window.lenis ? window.lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0)));
    await sleep(500);
    await page.evaluate(moversInPage, true);
    const pinfo = await page.evaluate(() => ({ sel: window.__cap.moverSel, parent: window.__cap.moverParent }));
    const A = { x: Math.round(vp.width * 0.15), y: Math.round(vp.height * 0.15) };
    const B = { x: Math.round(vp.width * 0.85), y: Math.round(vp.height * 0.85) };
    await page.mouse.move(A.x, A.y, { steps: 10 });
    await sleep(1000);
    const a1 = await page.evaluate(moversInPage, false);
    await sleep(500);
    const a2 = await page.evaluate(moversInPage, false);
    const mids = [];
    const STEPS = 48;
    for (let k = 1; k <= STEPS; k++) {
      await page.mouse.move(A.x + ((B.x - A.x) * k) / STEPS, A.y + ((B.y - A.y) * k) / STEPS);
      await sleep(45);
      if (k === STEPS / 2) mids.push(await page.evaluate(moversInPage, false));
    }
    await sleep(1000);
    const b1 = await page.evaluate(moversInPage, false);
    const followerSel = new Set(followers.map((f) => f.selector));
    const moved = [];
    for (let i = 0; i < pinfo.sel.length; i++) {
      const ambient = Math.hypot(a2[i][0] - a1[i][0], a2[i][1] - a1[i][1]);
      const dx = b1[i][0] - a1[i][0];
      const dy = b1[i][1] - a1[i][1];
      if (followerSel.has(pinfo.sel[i]) || (Math.abs(dx - (B.x - A.x)) < 0.15 * (B.x - A.x) && Math.abs(dy - (B.y - A.y)) < 0.15 * (B.y - A.y))) continue; // the cursor itself
      if (ambient > 1.5) continue; // moves on its own (CSS/JS loop): not pointer-driven
      if (Math.hypot(dx, dy) < 3) continue;
      moved.push({ i, selector: pinfo.sel[i], dx: round(dx, 1), dy: round(dy, 1), midway: { dx: round(mids[0][i][0] - a1[i][0], 1), dy: round(mids[0][i][1] - a1[i][1], 1) } });
    }
    const movedIdx = new Set(moved.map((m) => m.i));
    const layers = moved
      .filter((m) => !movedIdx.has(pinfo.parent[m.i]) || Math.abs(moved.find((p) => p.i === pinfo.parent[m.i]).dx - m.dx) > 1.5) // drop children that just ride on a moved parent
      .map(({ i, ...m }) => ({
        ...m,
        ratioX: round(m.dx / (B.x - A.x), 3),
        ratioY: round(m.dy / (B.y - A.y), 3),
        direction: m.dx * (B.x - A.x) >= 0 && m.dy * (B.y - A.y) >= 0 ? 'with pointer' : 'against pointer',
      }))
      .sort((p, q) => Math.hypot(q.dx, q.dy) - Math.hypot(p.dx, p.dy))
      .slice(0, 12);
    result.parallax = { detected: layers.length > 0, sweep: { from: A, to: B, mouseTravelPx: { x: B.x - A.x, y: B.y - A.y } }, layers, note: 'Elements whose centre moves with the pointer across a slow sweep; elements that also move with the pointer parked (ambient loops) are excluded.' };
    log('cursor', layers.length ? `parallax layers: ${layers.length}` : 'no pointer-driven parallax found');

    // ---- 3. magnetic elements: move while the pointer approaches but has not entered yet
    const cands = (await page.evaluate(magneticCandidatesInPage)).slice(0, 4);
    for (const c of cands) {
      if (Date.now() > deadline) break;
      const handle = await page.evaluateHandle((i) => window.__cap.magEls[i], c.i);
      try {
        await page.mouse.move(vp.width - 12, vp.height - 12);
        const r = await scroller.toElement(handle);
        await sleep(500);
        const centre = () => handle.evaluate((el) => { const b = el.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width, h: b.height }; });
        const c0 = await centre();
        await sleep(350);
        const c0b = await centre();
        if (Math.hypot(c0b.x - c0.x, c0b.y - c0.y) > 1) continue; // ambient motion: cannot attribute to the pointer
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        const dir = dirs.find(([ux, uy]) => {
          const px = c0.x + ux * (c0.w / 2 + 40);
          const py = c0.y + uy * (c0.h / 2 + 40);
          return px > 40 && px < vp.width - 40 && py > 40 && py < vp.height - 40;
        }) || dirs[0];
        const track = [];
        for (const d of [240, 150, 80, 35]) {
          const px = c0.x + dir[0] * (c0.w / 2 + d);
          const py = c0.y + dir[1] * (c0.h / 2 + d);
          if (px < 2 || px > vp.width - 2 || py < 2 || py > vp.height - 2) continue;
          await page.mouse.move(px, py, { steps: 8 });
          await sleep(380);
          const c1 = await centre();
          track.push({ distanceFromEdgePx: d, pointerOffsetFromCentre: round(Math.hypot(px - c0.x, py - c0.y), 0), shiftX: round(c1.x - c0.x, 1), shiftY: round(c1.y - c0.y, 1) });
        }
        const active = track.filter((t) => Math.hypot(t.shiftX, t.shiftY) >= 1.5);
        const closest = track[track.length - 1];
        result.magnetic.push({
          selector: c.selector,
          magnetic: active.length > 0,
          nameSuggestsMagnet: c.magnetLike,
          activationDistanceFromEdgePx: active.length ? Math.max(...active.map((t) => t.distanceFromEdgePx)) : null,
          maxShiftPx: active.length ? round(Math.max(...active.map((t) => Math.hypot(t.shiftX, t.shiftY))), 1) : 0,
          pullRatio: closest && active.length ? round(Math.hypot(closest.shiftX, closest.shiftY) / closest.pointerOffsetFromCentre, 2) : null,
          track,
          viewportRect: { x: round(r.x, 0), y: round(r.y, 0) },
        });
        await page.mouse.move(vp.width - 12, vp.height - 12, { steps: 6 });
        await sleep(300);
      } catch (e) {
        log('cursor', `magnetic check skipped for ${c.selector}: ${e.message.split('\n')[0]}`);
      } finally {
        await handle.dispose().catch(() => {});
      }
    }
    log('cursor', `magnetic elements: ${result.magnetic.filter((m) => m.magnetic).map((m) => m.selector).join(', ') || 'none'}`);

    webm = await s.close();
    if (webm) {
      ensureDir(path.join(dir, 'video'));
      await toMp4(webm, path.join(dir, 'video', 'cursor.mp4'));
      result.clip = 'video/cursor.mp4';
    }
    cleanupVideoDir(s);
    writeJson(path.join(dir, 'cursor.json'), result);
    return { customCursor: result.customCursorDetected, parallaxLayers: layers.length, magnetic: result.magnetic.filter((m) => m.magnetic).length };
  } catch (e) {
    await s.close().catch(() => {});
    fs.rmSync(s.videoDir, { recursive: true, force: true });
    throw e;
  }
}
