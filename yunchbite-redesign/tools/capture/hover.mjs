// Pass 4: hover catalogue. Finds hoverable elements, deduplicates visually similar ones, then for
// each: before-screenshot, realistic mouse approach, timed frames, out-transition, computed-style
// diff, CSS transition/animation spec, filmstrip. Output: hover/<nn>-<slug>/ + hover/index.json.
import fs from 'node:fs';
import path from 'node:path';
import { slugify, sleep } from '../lib/browser.mjs';
import { openPage } from './session.mjs';
import { clamp, drawtextSafe, ensureDir, ffmpeg, fontFile, log, pad, round, writeJson } from './util.mjs';

const IN_MS = [0, 80, 160, 320, 600, 1000];
const OUT_MS = [60, 300];
const TILE = 264; // filmstrip tile size; 9 tiles stay under 2400 px

/** Scan the page for hover candidates; keeps element refs in window.__cap.hoverEls. */
function enumerateInPage() {
  const cap = window.__cap;
  const vw = innerWidth;
  const vh = innerHeight;
  const found = new Map(); // element -> { hoverRule }
  const add = (el, hoverRule = false) => {
    const prev = found.get(el);
    found.set(el, { hoverRule: hoverRule || (prev && prev.hoverRule) || false });
  };
  document.querySelectorAll('a[href], button, [role=button], [role=link], summary, input[type=submit], [onclick], label[for]').forEach((el) => add(el));
  let n = 0;
  for (const el of document.body.querySelectorAll('*')) {
    if (++n > 5000) break;
    if (el.closest('svg') && el.tagName !== 'svg') continue;
    if (getComputedStyle(el).cursor === 'pointer' && (!el.parentElement || getComputedStyle(el.parentElement).cursor !== 'pointer')) add(el);
  }
  // elements targeted by :hover rules in readable stylesheets (the compound selector before :hover)
  const rules = cap.hoverRules();
  for (const sel of rules.selectors) {
    for (const part of sel.split(',')) {
      const i = part.indexOf(':hover');
      if (i <= 0) continue;
      const base = part.slice(0, i).trim();
      if (!base || /[>+~]$/.test(base)) continue;
      try {
        [...document.querySelectorAll(base)].slice(0, 40).forEach((el) => add(el, true));
      } catch {}
    }
  }
  const transitioned = (el) => {
    const nodes = [el, ...[...el.querySelectorAll('*')].slice(0, 4)];
    return nodes.some((x) => ['', '::before', '::after'].some((p) => {
      const d = getComputedStyle(x, p).transitionDuration;
      return d && d.split(',').some((v) => parseFloat(v) > 0);
    }));
  };
  const st = cap.scrollTop();
  const out = [];
  cap.hoverEls = [];
  for (const [el, info] of found) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none') continue;
    if (r.width < 14 || r.height < 14 || r.width * r.height > vw * vh * 2.5) continue;
    if (el.closest('.cursor, [data-cap-ignore]')) continue;
    const classes = [...el.classList].filter((c) => !/\d/.test(c)).sort();
    const parent = el.parentElement;
    const parentKey = parent ? parent.tagName + '.' + [...parent.classList].filter((c) => !/\d/.test(c)).sort().join('.') : '';
    const bucket = Math.round(Math.log2(r.width * r.height) / 2);
    const key = `${el.tagName}|${classes.length ? classes.join('.') : parentKey}|${bucket}`;
    const hasImg = !!el.querySelector('img, picture, video, canvas') || el.tagName === 'IMG';
    const hasTransition = transitioned(el);
    const magnetLike = /magnet/i.test(el.className && el.className.baseVal === undefined ? el.className : '') || el.hasAttribute('data-magnetic') || el.hasAttribute('data-magnet');
    const score = Math.log(Math.min(r.width * r.height, 400000)) + (info.hoverRule ? 4 : 0) + (hasTransition ? 2 : 0) + (hasImg ? 2 : 0) + (el.tagName === 'BUTTON' ? 1 : 0) + (magnetLike ? 4 : 0) - (el.closest('nav, header') ? 1 : 0);
    const text = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    cap.hoverEls.push(el);
    out.push({ i: cap.hoverEls.length - 1, key, selector: cap.sel(el), tag: el.tagName.toLowerCase(), text, docY: Math.round(r.top + st), w: Math.round(r.width), h: Math.round(r.height), hasHoverRule: info.hoverRule, hasTransition, hasImg, magnetLike, score: +score.toFixed(2) });
  }
  return { candidates: out, hoverRuleCount: rules.selectors.length, blockedSheets: rules.blockedSheets };
}

const PROPS = ['transform', 'scale', 'translate', 'rotate', 'opacity', 'color', 'background-color', 'background-image', 'box-shadow', 'filter', 'backdrop-filter', 'clip-path', 'border-radius', 'border-color', 'width', 'height', 'outline-color', 'text-decoration-line', 'letter-spacing', 'font-weight'];

/** Computed-style snapshot of an element, its ::before/::after and first few descendants. */
function snapshotInPage({ el, props }) {
  const cap = window.__cap;
  const read = (node, pseudo) => {
    const cs = getComputedStyle(node, pseudo);
    if (pseudo && (cs.content === 'none' || cs.content === 'normal')) return null;
    const o = {};
    for (const p of props) o[p] = cs.getPropertyValue(p);
    return o;
  };
  const trans = (node, pseudo) => {
    const cs = getComputedStyle(node, pseudo);
    if (pseudo && (cs.content === 'none' || cs.content === 'normal')) return null;
    const durs = cs.transitionDuration.split(',').map((s) => s.trim());
    const hasT = durs.some((d) => parseFloat(d) > 0);
    const hasA = cs.animationName !== 'none';
    if (!hasT && !hasA) return null;
    return {
      ...(hasT ? { transitionProperty: cs.transitionProperty, transitionDuration: cs.transitionDuration, transitionTimingFunction: cs.transitionTimingFunction, transitionDelay: cs.transitionDelay } : {}),
      ...(hasA ? { animationName: cs.animationName, animationDuration: cs.animationDuration, animationTimingFunction: cs.animationTimingFunction, animationIterationCount: cs.animationIterationCount } : {}),
    };
  };
  const kids = [];
  const queue = [...el.children].map((c) => [c, 1]);
  while (queue.length && kids.length < 6) {
    const [node, depth] = queue.shift();
    const r = node.getBoundingClientRect();
    if (r.width > 1 && r.height > 1) kids.push(node);
    if (depth < 3) queue.push(...[...node.children].map((c) => [c, depth + 1]));
  }
  const nodes = [['self', el], ...kids.map((k, i) => [`child${i} ${cap.sel(k)}`, k])];
  const styles = {};
  const specs = {};
  for (const [name, node] of nodes) {
    for (const pseudo of ['', '::before', '::after']) {
      const key = name + pseudo;
      const s = read(node, pseudo || undefined);
      if (s) styles[key] = s;
      const t = trans(node, pseudo || undefined);
      if (t) specs[key] = t;
    }
  }
  const r = el.getBoundingClientRect();
  return { styles, specs, rect: { x: r.x, y: r.y, width: r.width, height: r.height } };
}

/** Live transitions / animations / gsap tweens started by the hover (sampled right after entering). */
function liveDriversInPage(el) {
  const cap = window.__cap;
  const css = el.getAnimations({ subtree: true }).filter((a) => a.effect.getTiming().iterations !== Infinity).map((a) => {
    const t = a.effect.getTiming();
    return { kind: typeof CSSTransition !== 'undefined' && a instanceof CSSTransition ? 'CSSTransition' : typeof CSSAnimation !== 'undefined' && a instanceof CSSAnimation ? 'CSSAnimation' : 'WAAPI', property: a.transitionProperty || a.animationName || null, target: cap.sel(a.effect.target) + (a.effect.pseudoElement || ''), duration: t.duration, delay: t.delay, easing: t.easing };
  });
  const g = window.gsap;
  const js = [];
  if (g) {
    const nodes = [el, ...el.querySelectorAll('*')].slice(0, 12);
    for (const n of nodes) {
      for (const tw of g.getTweensOf(n)) {
        if (!tw.isActive()) continue;
        js.push({ target: cap.sel(n), duration: +tw.duration().toFixed(2), ease: typeof tw.vars.ease === 'string' ? tw.vars.ease : tw.vars.ease ? 'custom function' : 'power1.out', props: Object.keys(tw.vars).filter((k) => !/^(ease|duration|delay|overwrite|immediateRender)$/.test(k) && !/^on[A-Z]/.test(k)) });
      }
    }
  }
  return { css, gsap: js };
}

/** Per-node, per-property from/to differences, minus properties that also changed with no input (ambient motion). */
function diffStyles(before, after, ambient) {
  const diff = {};
  for (const key of Object.keys(before)) {
    if (!after[key]) continue;
    for (const p of PROPS) {
      if (before[key][p] === after[key][p] || ambient[key]?.has(p)) continue;
      (diff[key] ??= {})[p] = { from: before[key][p], to: after[key][p] };
    }
  }
  return diff;
}

function ambientProps(a, b) {
  const out = {};
  for (const key of Object.keys(a)) {
    if (!b[key]) continue;
    for (const p of PROPS) if (a[key][p] !== b[key][p]) (out[key] ??= new Set()).add(p);
  }
  return out;
}

/** Point in the viewport far from the element to park the mouse on. */
function parkPoint(rect, vw, vh) {
  const pts = [[vw - 12, vh - 12], [12, vh - 12], [vw - 12, vh / 2], [12, vh / 2], [vw / 2, vh - 12], [vw - 12, 12], [12, 12]];
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const away = (p) => !(p[0] > rect.x - 120 && p[0] < rect.x + rect.width + 120 && p[1] > rect.y - 120 && p[1] < rect.y + rect.height + 120);
  const ok = pts.filter(away);
  const pool = ok.length ? ok : pts;
  const [x, y] = pool.reduce((best, p) => (Math.hypot(p[0] - cx, p[1] - cy) > Math.hypot(best[0] - cx, best[1] - cy) ? p : best));
  return { x, y };
}

/** Last point on the park->centre line that is still outside the element (padded by 8px). */
function approachPoint(park, rect) {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const inside = (x, y) => x > rect.x - 8 && x < rect.x + rect.width + 8 && y > rect.y - 8 && y < rect.y + rect.height + 8;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (inside(park.x + (cx - park.x) * mid, park.y + (cy - park.y) * mid)) hi = mid;
    else lo = mid;
  }
  return { x: park.x + (cx - park.x) * lo, y: park.y + (cy - park.y) * lo };
}

async function makeFilmstrip(dir, frames) {
  const font = fontFile();
  const inputs = frames.flatMap((f) => ['-i', path.join(dir, f.file)]);
  const chains = frames.map((f, i) => {
    const text = drawtextSafe(f.label);
    return `[${i}:v]scale=${TILE}:${TILE}:force_original_aspect_ratio=decrease,pad=${TILE}:${TILE}:(ow-iw)/2:(oh-ih)/2:color=0x222222,drawtext=${font ? `fontfile=${font}:` : ''}text='${text}':x=6:y=6:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.75:boxborderw=3[v${i}]`;
  });
  const graph = `${chains.join(';')};${frames.map((_, i) => `[v${i}]`).join('')}hstack=inputs=${frames.length}[out]`;
  const scriptFile = path.join(dir, '.filmstrip.txt');
  fs.writeFileSync(scriptFile, graph);
  const r = await ffmpeg([...inputs, '-filter_complex_script', scriptFile, '-map', '[out]', '-frames:v', '1', '-q:v', '3', path.join(dir, 'filmstrip.jpg')]);
  fs.rmSync(scriptFile, { force: true });
  return r.code === 0;
}

/** Scroll the whole page once so lazy content / reveal animations are in their final state, then return to top. */
async function warmUp(scroller, deadline) {
  const t0 = Date.now();
  let st = await scroller.state();
  while (st.y + st.vh < st.h - 2 && Date.now() - t0 < 25000 && Date.now() < deadline) {
    const before = st.y;
    await scroller.flick(st.vh * 0.9, { parts: 3, ms: 90 });
    await sleep(120);
    st = await scroller.state();
    if (st.y === before) break;
  }
  while (st.y > 2 && Date.now() - t0 < 40000) {
    const before = st.y;
    await scroller.flick(-st.vh * 1.5, { parts: 3, ms: 90 });
    await sleep(120);
    st = await scroller.state();
    if (st.y === before) break;
  }
  await scroller.waitIdle({ timeout: 2500 });
}

export async function runHover(run) {
  const { dir, opts, deadline } = run;
  const outDir = path.join(dir, 'hover');
  fs.rmSync(outDir, { recursive: true, force: true });
  ensureDir(outDir);
  const s = await openPage(run, { label: 'hover' });
  try {
    const { page } = s;
    await s.waitIntro();
    const scroller = await s.initScroller();
    await warmUp(scroller, deadline);
    const scan = await page.evaluate(enumerateInPage);

    // dedupe by visual signature, keep the highest-scoring member, then the best `maxHovers` in document order
    const groups = new Map();
    for (const c of scan.candidates) {
      const g = groups.get(c.key);
      if (!g) groups.set(c.key, { best: c, instances: 1 });
      else {
        g.instances++;
        if (c.score > g.best.score) g.best = c;
      }
    }
    const picked = [...groups.values()]
      .map((g) => ({ ...g.best, instances: g.instances }))
      .sort((a, b) => b.score - a.score)
      .slice(0, opts.maxHovers)
      .sort((a, b) => a.docY - b.docY);
    log('hover', `${scan.candidates.length} candidates -> ${groups.size} unique -> hovering ${picked.length}; ${scan.hoverRuleCount} :hover rules (${scan.blockedSheets} cross-origin sheets unreadable)`);

    const index = [];
    const skipped = [];
    const vp = run.profile.viewport;
    for (const cand of picked) {
      if (Date.now() > deadline) {
        skipped.push({ selector: cand.selector, reason: 'time budget exhausted' });
        continue;
      }
      const handle = await page.evaluateHandle((i) => window.__cap.hoverEls[i], cand.i);
      try {
        if (!(await handle.evaluate((el) => el.isConnected))) {
          skipped.push({ selector: cand.selector, reason: 'detached from DOM' });
          continue;
        }
        await page.mouse.move(vp.width / 2, vp.height - 12);
        await scroller.toElement(handle);
        await sleep(250);
        const vis = await handle.evaluate((el) => {
          const r = el.getBoundingClientRect();
          const cx = r.x + r.width / 2;
          const cy = r.y + r.height / 2;
          const top = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, cx)), Math.min(innerHeight - 1, Math.max(0, cy)));
          let o = 1;
          for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity);
          return { inView: r.right > 0 && r.bottom > 0 && r.left < innerWidth && r.top < innerHeight && r.width > 0, opacity: o, covered: !!top && !(el.contains(top) || top.contains(el)) ? window.__cap.sel(top) : null };
        });
        if (!vis.inView || vis.opacity < 0.3) {
          skipped.push({ selector: cand.selector, reason: vis.inView ? 'not visible (opacity)' : 'could not be scrolled into view (off-screen / horizontal scroller)' });
          continue;
        }
        if (vis.covered) {
          skipped.push({ selector: cand.selector, reason: `covered by ${vis.covered}` });
          continue;
        }
        index.push(await hoverOne({ page, handle, cand, vp, run, outDir, n: index.length + 1 }));
      } catch (e) {
        skipped.push({ selector: cand.selector, reason: `error: ${e.message.split('\n')[0]}` });
      } finally {
        await handle.dispose().catch(() => {});
      }
    }
    writeJson(path.join(outDir, 'index.json'), { candidatesFound: scan.candidates.length, uniqueGroups: groups.size, hoverRulesFound: scan.hoverRuleCount, blockedStylesheets: scan.blockedSheets, entries: index, skipped });
    log('hover', `captured ${index.length}, skipped ${skipped.length}`);
    return { captured: index.length, skipped: skipped.length };
  } finally {
    await s.close();
  }
}

async function hoverOne({ page, handle, cand, vp, run, outDir, n }) {
  const slug = `${pad(n, 2)}-${slugify(cand.text || cand.selector, 32)}`;
  const dir = path.join(outDir, slug);
  ensureDir(dir);
  const snapshot = () => page.evaluate(snapshotInPage, { el: handle, props: PROPS });

  const rect0 = (await snapshot()).rect;
  const park = parkPoint(rect0, vp.width, vp.height);
  await page.mouse.move(park.x, park.y, { steps: 6 });
  await sleep(450); // let any hover-out / magnet reset finish
  const before = await snapshot();
  const rect = before.rect;
  await sleep(150);
  const before2 = await snapshot();
  const ambient = ambientProps(before.styles, before2.styles);

  const pad_ = clamp(Math.round(0.12 * Math.max(rect.width, rect.height)), 24, 80);
  const clip = {
    x: Math.max(0, Math.floor(rect.x - pad_)),
    y: Math.max(0, Math.floor(rect.y - pad_)),
  };
  clip.width = Math.min(vp.width - clip.x, Math.ceil(rect.width + pad_ * 2));
  clip.height = Math.min(vp.height - clip.y, Math.ceil(rect.height + pad_ * 2));
  const grab = (file) => page.screenshot({ path: path.join(dir, file), clip, type: 'jpeg', quality: 85, scale: 'css' });

  const frames = [];
  await grab('f0-before.jpg');
  frames.push({ file: 'f0-before.jpg', label: 'before', ms: null });

  // realistic approach: multi-step path to just outside the element, then enter it
  const approach = approachPoint(park, rect);
  await page.mouse.move(approach.x, approach.y, { steps: 14 });
  await sleep(120);
  const afterApproach = await snapshot(); // magnetic / proximity effects show up here, before hovering
  const target = { x: rect.x + rect.width * (0.45 + Math.random() * 0.1), y: rect.y + rect.height * (0.45 + Math.random() * 0.1) };
  const tEnter = Date.now();
  await page.mouse.move(target.x, target.y, { steps: 3 });
  let drivers = null;
  for (const [k, ms] of IN_MS.entries()) {
    const wait = ms - (Date.now() - tEnter);
    if (wait > 0) await sleep(wait);
    const actual = Date.now() - tEnter;
    const file = `f${k + 1}-in-${pad(ms, 4)}ms.jpg`;
    await grab(file);
    frames.push({ file, label: `in ${ms}ms`, ms, actualMs: actual });
    if (k === 0) drivers = await handle.evaluate(liveDriversInPage).catch(() => null);
  }
  const hovered = await snapshot();

  const tLeave = Date.now();
  await page.mouse.move(park.x, park.y, { steps: 4 });
  for (const [k, ms] of OUT_MS.entries()) {
    const wait = ms - (Date.now() - tLeave);
    if (wait > 0) await sleep(wait);
    const actual = Date.now() - tLeave;
    const file = `f${IN_MS.length + 1 + k}-out-${pad(ms, 4)}ms.jpg`;
    await grab(file);
    frames.push({ file, label: `out ${ms}ms`, ms, actualMs: actual });
  }

  const diffOnApproach = diffStyles(before.styles, afterApproach.styles, ambient);
  const diff = diffStyles(before.styles, hovered.styles, ambient);
  const changed = [...new Set(Object.values(diff).flatMap((o) => Object.keys(o)))];
  const hasCssTransitions = (drivers?.css || []).some((d) => d.kind === 'CSSTransition');
  const driver = drivers?.gsap?.length ? 'gsap/js tween' : hasCssTransitions || Object.keys(hovered.specs).length ? 'css transition' : changed.length ? 'instant or script-driven (no CSS transition found)' : 'none detected';
  const ok = await makeFilmstrip(dir, frames);
  const record = {
    index: n,
    dir: path.relative(run.dir, dir),
    selector: cand.selector,
    tag: cand.tag,
    text: cand.text,
    instancesOnPage: cand.instances,
    hasHoverRule: cand.hasHoverRule,
    rect: { x: round(rect.x, 0), y: round(rect.y, 0), width: round(rect.width, 0), height: round(rect.height, 0) },
    changedProperties: changed,
    driver,
    transitionSpec: hovered.specs,
    liveDrivers: drivers,
    movedBeforeEntering: Object.keys(diffOnApproach).length > 0,
    filmstrip: ok ? path.relative(run.dir, path.join(dir, 'filmstrip.jpg')) : null,
    frames,
    diff,
    diffOnApproach,
    ambientIgnored: Object.fromEntries(Object.entries(ambient).map(([k, v]) => [k, [...v]])),
    note: 'frame times are measured wall-clock from the mouse entering the element; screenshots themselves take ~30-100 ms in headless mode',
  };
  writeJson(path.join(dir, 'diff.json'), record);
  log('hover', `${slug}: ${changed.join(', ') || 'no style change'} [${driver}]`);
  return {
    index: n,
    dir: record.dir,
    selector: record.selector,
    text: record.text,
    instancesOnPage: record.instancesOnPage,
    changedProperties: changed,
    driver,
    movedBeforeEntering: record.movedBeforeEntering,
    transitionSpec: record.transitionSpec,
    filmstrip: record.filmstrip,
    diffFile: `${record.dir}/diff.json`,
  };
}
