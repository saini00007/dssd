// Per-frame classification, segmentation and event derivation.
import { percentile, median, mean, round, clamp } from './util.mjs';
import { GRID_COLS, GRID_ROWS } from './motion.mjs';

export const DEFAULTS = {
  scrollMinPx: 0,          // accepted shifts are already thresholded in motion.mjs
  animEnergy: 0.8,         // residual above idle floor (gray levels) that counts as in-place change
  animCellEnergy: 2.5,     // same, for the strongest 4x3 grid cell (localised changes)
  animEnergyScroll: 2.5,   // above the speed-dependent scroll floor while scrolling
  scrollGapFrames: 4, scrollGapSec: 0.25,
  animGapFrames: 4, animGapSec: 0.3,
  minAnimFrames: 3,
  cutSBest: 14, cutAlignMax: 0.25, cutSceneMin: 0.35, cutResidMin: 20,
  cutMergeSec: 1.0,        // cut frames closer than this form ONE navigation event (old page -> blank -> new page)
  pinnedMinSec: 1.0, pinnedBridgeSec: 0.6, pinnedScrollAdjSec: 1.5,
};

export function buildTimeline({ times, motion, crop, scene }) {
  const N = Math.min(times.length, motion.frames.length);
  const { kx, ky } = motion;
  const tl = [];
  for (let n = 0; n < N; n++) {
    const m = motion.frames[n];
    const dt = n ? times[n] - times[n - 1] : 0;
    tl.push({
      n, t: times[n], dt,
      dy: m.dy * ky, dx: m.dx * kx,              // source px since previous frame; + = scrolled down / content moved left
      confidence: m.conf,
      residual: m.resid, rawDiff: m.raw,
      regionGrid: m.grid,
      _sBest: m.sBest, _s0: m.s0, _dyA: m.dy,
      sceneScore: scene ? scene[n] ?? 0 : null,
    });
  }
  return tl;
}

/** Fill derived fields: cut flags, scroll position, velocity, energies, classes. Returns {timeline, noise, params}. */
export function classifyFrames(tl, userParams = {}) {
  const P = { ...DEFAULTS, ...userParams };
  const N = tl.length;
  // 1. cuts
  for (const f of tl) {
    const align = f._s0 > 1e-6 ? (f._s0 - f._sBest) / f._s0 : 1;
    f._align = align;
    const poor = align < P.cutAlignMax && f.dy === 0 && f.dx === 0;
    const sc = f.sceneScore ?? 0;
    f.isCut = f.n > 0 && poor && ((f._sBest >= P.cutSBest) || (sc >= P.cutSceneMin && f.residual >= P.cutResidMin));
  }
  // 2. cumulative scroll position (reset to 0 at a cut) and smoothed velocity
  let pos = 0, posX = 0;
  for (const f of tl) {
    if (f.isCut) { pos = 0; posX = 0; }
    else { pos += f.dy; posX += f.dx; }
    f.scrollPos = pos; f.scrollPosX = posX;
  }
  for (let n = 0; n < N; n++) {
    const a = Math.max(0, n - 1), b = Math.min(N - 1, n + 1);
    const f = tl[n];
    const dtt = tl[b].t - tl[a].t;
    const cutInside = tl[a].isCut || tl[b].isCut || f.isCut;
    f.scrollVelocity = cutInside || dtt <= 0 ? 0 : (tl[b].scrollPos - tl[a].scrollPos) / dtt;
    f.scrollVelocityX = cutInside || dtt <= 0 ? 0 : (tl[b].scrollPosX - tl[a].scrollPosX) / dtt;
    f.vInst = f.dt > 0 && !f.isCut ? f.dy / f.dt : 0;
  }
  // 3. noise floors
  const idle = tl.filter((f) => f.n > 0 && !f.isCut && f.dy === 0 && f.dx === 0);
  const floorIdle = Math.max(0.3, percentile(idle.map((f) => f.residual), 0.3));
  const cellFloor = Array.from({ length: GRID_COLS * GRID_ROWS }, (_, c) =>
    Math.max(0.3, percentile(idle.map((f) => f.regionGrid[c]), 0.5)));
  // scroll-floor as a function of |shift| (parallax / sub-pixel misalignment grows with speed)
  const edges = [0, 1, 3, 8, 15, 25, 1e9];
  const scr = tl.filter((f) => !f.isCut && f.dy !== 0 && f.n > 0);
  const bins = [];
  for (let i = 0; i < edges.length - 1; i++) {
    const v = scr.filter((f) => Math.abs(f._dyA) >= edges[i] && Math.abs(f._dyA) < edges[i + 1]).map((f) => f.residual);
    bins.push(v.length >= 8 ? { c: i < edges.length - 2 ? (edges[i] + edges[i + 1]) / 2 : edges[i] + 5, v: percentile(v, 0.25) } : null);
  }
  const pts = bins.filter(Boolean);
  const globalScroll = scr.length ? percentile(scr.map((f) => f.residual), 0.25) : floorIdle;
  const scrollFloor = (dyA) => {
    const a = Math.abs(dyA);
    if (!pts.length) return globalScroll;
    if (a <= pts[0].c) return Math.max(floorIdle, pts[0].v);
    for (let i = 1; i < pts.length; i++) if (a <= pts[i].c) {
      const k = (a - pts[i - 1].c) / (pts[i].c - pts[i - 1].c);
      return Math.max(floorIdle, pts[i - 1].v + k * (pts[i].v - pts[i - 1].v));
    }
    return Math.max(floorIdle, pts[pts.length - 1].v);
  };
  // 4. energies + classes
  for (const f of tl) {
    const scrolling = f.dy !== 0 || f.dx !== 0;
    f._floor = scrolling ? scrollFloor(f._dyA || 0) : floorIdle;
    f.energy = f.n === 0 ? 0 : Math.max(0, f.residual - f._floor);
    f.cellEnergy = f.regionGrid.map((v, c) => Math.max(0, v - (scrolling ? f._floor : cellFloor[c])));
    const maxCell = Math.max(...f.cellEnergy);
    f.isScroll = scrolling && !f.isCut;
    f.isAnim = !f.isCut && f.n > 0 && (scrolling ? f.energy >= P.animEnergyScroll : (f.energy >= P.animEnergy || maxCell >= P.animCellEnergy));
    f.class = f.isCut ? 'cut' : f.isScroll && f.isAnim ? 'scroll+animate' : f.isScroll ? 'scroll' : f.isAnim ? 'animate' : 'idle';
    f.lowConf = f.confidence < 0.25 && f.rawDiff >= 0.12;
  }
  return { timeline: tl, params: P, noise: { floorIdle, cellFloor, scrollFloorBins: bins, globalScroll } };
}

/** Group a boolean-ish flag array into runs, bridging gaps of <= gapFrames frames and gapSec seconds. */
function runs(tl, test, gapFrames, gapSec) {
  const out = [];
  let cur = null, gap = 0;
  for (let n = 0; n < tl.length; n++) {
    if (test(tl[n])) {
      if (cur && (gap <= gapFrames) && tl[n].t - tl[cur.last].t <= gapSec + 1e-9) { cur.last = n; cur.flagged++; }
      else { if (cur) out.push(cur); cur = { first: n, last: n, flagged: 1 }; }
      gap = 0;
    } else if (cur) { gap++; if (gap > gapFrames) { out.push(cur); cur = null; gap = 0; } }
  }
  if (cur) out.push(cur);
  return out;
}

const COLS = ['left', 'center-left', 'center-right', 'right'];
const ROWS = ['top', 'middle', 'bottom'];

export function describeRegion(tl, a, b) {
  const sum = new Float64Array(GRID_COLS * GRID_ROWS);
  for (let n = a; n <= b; n++) for (let c = 0; c < sum.length; c++) sum[c] += tl[n].cellEnergy[c];
  const mx = Math.max(...sum);
  if (!(mx > 0)) return { region: 'none', box: [0, 0, 1, 1], localised: false, cells: Array.from(sum) };
  const sel = []; for (let c = 0; c < sum.length; c++) if (sum[c] >= 0.2 * mx) sel.push(c);
  const rows = sel.map((c) => Math.floor(c / GRID_COLS)), cols = sel.map((c) => c % GRID_COLS);
  const r0 = Math.min(...rows), r1 = Math.max(...rows), c0 = Math.min(...cols), c1 = Math.max(...cols);
  const rs = r1 - r0 + 1, cs = c1 - c0 + 1;
  const rowName = rs >= 3 ? 'full-height' : rs === 2 ? (r0 === 0 ? 'upper' : 'lower') : ROWS[r0];
  let colName;
  if (cs >= 4) colName = 'full-width';
  else if (cs === 3) colName = c0 === 0 ? 'left+center' : 'center+right';
  else if (cs === 2) colName = c0 === 0 ? 'left' : c0 === 1 ? 'center' : 'right';
  else colName = COLS[c0];
  const region = rs >= 3 && cs >= 4 ? 'full-screen' : `${rowName}-${colName}`;
  const pad = 0.25;
  const box = [clamp((c0 - pad) / GRID_COLS, 0, 1), clamp((r0 - pad) / GRID_ROWS, 0, 1), clamp((c1 + 1 + pad) / GRID_COLS, 0, 1), clamp((r1 + 1 + pad) / GRID_ROWS, 0, 1)];
  const area = (box[2] - box[0]) * (box[3] - box[1]);
  return { region, box: box.map((v) => round(v, 3)), localised: area < 0.55, cells: Array.from(sum, (v) => round(v, 2)) };
}

/** Exponential decay fit of the scroll tail after the velocity peak. */
function decayFit(tl, a, b) {
  const v = [];
  for (let n = Math.max(1, a); n <= b; n++) {
    const n0 = Math.max(0, n - 1), n1 = Math.min(tl.length - 1, n + 1);
    const dtt = tl[n1].t - tl[n0].t;
    if (dtt > 0) v.push({ t: tl[n].t, v: Math.abs(tl[n1].scrollPos - tl[n0].scrollPos) / dtt });
  }
  if (v.length < 5) return null;
  let gi = 0; for (let i = 1; i < v.length; i++) if (v[i].v > v[gi].v) gi = i;
  // multi-impulse bursts (several wheel notches): fit the tail after the LAST impulse that is still a strong local peak
  let pi = gi;
  for (let i = gi + 1; i < v.length - 1; i++) if (v[i].v >= 0.5 * v[gi].v && v[i].v >= v[i - 1].v && v[i].v >= v[i + 1].v) pi = i;
  const vp = v[pi].v;
  const pts = [];
  for (let i = pi; i < v.length; i++) { if (v[i].v < 0.05 * vp) break; if (v[i].v > 0) pts.push({ x: v[i].t - v[pi].t, y: Math.log(v[i].v) }); }
  if (pts.length < 5) return null;
  const mx = mean(pts.map((p) => p.x)), my = mean(pts.map((p) => p.y));
  let sxy = 0, sxx = 0, syy = 0;
  for (const p of pts) { sxy += (p.x - mx) * (p.y - my); sxx += (p.x - mx) ** 2; syy += (p.y - my) ** 2; }
  if (sxx < 1e-9 || syy < 1e-9) return null;
  const slope = sxy / sxx, r2 = (sxy * sxy) / (sxx * syy);
  if (!(slope < 0)) return { tau: null, r2: round(r2, 3), points: pts.length, peakV: round(vp, 1) };
  return { tau: round(-1 / slope, 3), r2: round(r2, 3), points: pts.length, peakV: round(vp, 1), tailSec: round(pts[pts.length - 1].x, 3) };
}

export function deriveEvents(tl, P) {
  const events = [];
  const mk = (type, a, b, extra = {}) => {
    const t0 = a > 0 ? tl[a].t - (tl[a].dt || 0) : tl[a].t; // motion into frame a started after frame a-1
    const dur = tl[b].t - t0;
    const seg = tl.slice(a, b + 1);
    const en = seg.map((f) => f.energy);
    return { type, startFrame: a, endFrame: b, startT: round(tl[a].t, 4), endT: round(tl[b].t, 4), duration: round(dur, 3), frames: b - a + 1,
      peakEnergy: round(Math.max(...en), 2), meanEnergy: round(mean(en), 2),
      lowConfFraction: round(seg.filter((f) => f.lowConf).length / seg.length, 2), ...extra };
  };
  const isCutFrame = (f) => f.isCut;

  // --- cuts (navigation): merge cut frames closer than cutMergeSec
  const cutRuns = runs(tl, isCutFrame, 1e9, P.cutMergeSec);
  const cutEvents = cutRuns.map((r) => {
    const frames = tl.slice(r.first, r.last + 1);
    const cutFrames = frames.filter((f) => f.isCut).map((f) => f.n);
    const scenePeak = Math.max(...frames.map((f) => f.sceneScore ?? 0));
    return mk('cut', r.first, r.last, {
      region: 'full-screen', localised: false, cutFrames,
      sceneScorePeak: round(scenePeak, 3),
      note: cutFrames.length > 1 ? `${cutFrames.length} discontinuities within ${round(tl[r.last].t - tl[r.first].t, 2)}s (page change via an intermediate blank/dark state)` : 'single hard discontinuity',
    });
  });
  events.push(...cutEvents);
  const inCut = (n) => cutEvents.some((e) => n >= e.startFrame && n <= e.endFrame);

  // --- horizontal scroll
  const hRuns = runs(tl, (f) => f.dx !== 0 && !f.isCut, P.scrollGapFrames, P.scrollGapSec).filter((r) => r.flagged >= 3);
  const hEvents = hRuns.map((r) => {
    const vmax = Math.max(...tl.slice(r.first, r.last + 1).map((f) => Math.abs(f.scrollVelocityX)));
    const dist = tl[r.last].scrollPosX - (tl[r.first - 1]?.scrollPosX ?? 0);
    return mk('hscroll', r.first, r.last, { ...describeRegion(tl, r.first, r.last), distancePx: round(dist, 1), peakVelocityX: round(vmax, 1), meanVelocityX: round(dist / (tl[r.last].t - tl[Math.max(0, r.first - 1)].t), 1) });
  });
  events.push(...hEvents);
  const inH = (n) => hEvents.some((e) => n >= e.startFrame && n <= e.endFrame);

  // --- vertical scroll bursts
  const sRuns = runs(tl, (f) => f.dy !== 0 && !f.isCut, P.scrollGapFrames, P.scrollGapSec);
  const scrollEvents = [];
  for (const r of sRuns) {
    const seg = tl.slice(r.first, r.last + 1);
    const dist = tl[r.last].scrollPos - (tl[r.first - 1]?.scrollPos ?? 0);
    const absDist = seg.reduce((s, f) => s + Math.abs(f.dy), 0);
    if (r.flagged < 2 || absDist < 10) continue;
    const t0 = tl[Math.max(0, r.first - 1)].t, dur = tl[r.last].t - t0;
    // peak over 2-frame windows: robust to recorder duplicate frames
    let peak = 0;
    for (let n = Math.max(1, r.first); n <= r.last; n++) {
      const n0 = Math.max(0, n - 2), dtt = tl[n].t - tl[n0].t;
      if (dtt > 0) peak = Math.max(peak, Math.abs(tl[n].scrollPos - tl[n0].scrollPos) / dtt);
    }
    const dec = decayFit(tl, r.first, r.last);
    const ev = mk('scroll', r.first, r.last, {
      region: 'full-screen', localised: false,
      direction: dist >= 0 ? 'down' : 'up', distancePx: round(dist, 1), pathPx: round(absDist, 1),
      peakVelocity: round(peak, 1), meanVelocity: round(absDist / dur, 1), decay: dec,
    });
    scrollEvents.push(ev);
  }
  events.push(...scrollEvents);

  // --- animations (in-place change >= minAnimFrames), with or without scroll
  const aRuns = runs(tl, (f) => f.isAnim, P.animGapFrames, P.animGapSec).filter((r) => r.flagged >= P.minAnimFrames);
  let animEvents = [];
  for (const r of aRuns) {
    const seg = tl.slice(r.first, r.last + 1);
    const scrollFrac = seg.filter((f) => f.isScroll).length / seg.length;
    const hFrac = seg.filter((f) => f.dx !== 0).length / seg.length;
    if (hFrac > 0.6 || inH(r.first) && inH(r.last)) continue; // already explained by a horizontal-scroll event
    animEvents.push(mk(scrollFrac >= 0.5 ? 'anim-scroll' : 'animation', r.first, r.last, { ...describeRegion(tl, r.first, r.last), scrollFraction: round(scrollFrac, 2) }));
  }
  // --- pinned / scroll-scrubbed: long in-place change, page not moving, bracketed by scrolling
  const scrollish = [...scrollEvents, ...hEvents];
  const nearScroll = (t0, t1) => ({
    before: scrollish.some((s) => s.endT <= t0 + 1e-6 && t0 - s.endT <= P.pinnedScrollAdjSec),
    after: scrollish.some((s) => s.startT >= t1 - 1e-6 && s.startT - t1 <= P.pinnedScrollAdjSec),
  });
  const still = animEvents.filter((e) => e.type === 'animation');
  const groups = [];
  for (const e of still) {
    const g = groups[groups.length - 1];
    if (g && e.startT - g.endT <= P.pinnedBridgeSec) { g.items.push(e); g.endT = e.endT; g.endFrame = e.endFrame; }
    else groups.push({ items: [e], startT: e.startT, endT: e.endT, startFrame: e.startFrame, endFrame: e.endFrame });
  }
  const pinned = [];
  for (const g of groups) {
    const dur = g.endT - g.startT;
    const ns = nearScroll(g.startT, g.endT);
    const nearCut = cutEvents.some((c) => g.startT - c.endT >= -1e-6 && g.startT - c.endT <= 1.0);
    if (dur >= P.pinnedMinSec && ns.before && ns.after && !nearCut) {
      pinned.push(g);
    }
  }
  const pinnedEvents = pinned.map((g) => mk('pinned', g.startFrame, g.endFrame, {
    ...describeRegion(tl, g.startFrame, g.endFrame), scrollFraction: 0, mergedAnimations: g.items.length,
    note: 'page content stayed put (no vertical shift) while it kept changing and the user was scrolling before and after: likely a pinned / scroll-scrubbed section',
  }));
  const pinnedSet = new Set(pinned.flatMap((g) => g.items));
  animEvents = animEvents.filter((e) => !pinnedSet.has(e));
  events.push(...animEvents, ...pinnedEvents);

  // drop anything wholly inside a cut window except the cut itself (new-page frames get their own events after)
  const final = events.filter((e) => e.type === 'cut' || !(inCut(e.startFrame) && inCut(e.endFrame)));
  final.sort((a, b) => a.startFrame - b.startFrame || (a.type === 'cut' ? -1 : 0));
  final.forEach((e, i) => { e.id = 'E' + String(i + 1).padStart(2, '0'); });
  // put id first for readability
  return final.map((e) => ({ id: e.id, ...e }));
}

export function scrollProfile(tl, events) {
  const bursts = events.filter((e) => e.type === 'scroll');
  const taus = bursts.map((b) => b.decay?.tau).filter((v) => v && v > 0 && b_ok(v));
  function b_ok(v) { return v < 5; }
  const good = bursts.filter((b) => b.decay && b.decay.tau && b.decay.r2 >= 0.8);
  return {
    bursts: bursts.length,
    totalDownPx: round(tl.reduce((s, f) => s + (f.dy > 0 && !f.isCut ? f.dy : 0), 0), 0),
    totalUpPx: round(tl.reduce((s, f) => s + (f.dy < 0 && !f.isCut ? -f.dy : 0), 0), 0),
    peakVelocity: round(Math.max(0, ...bursts.map((b) => b.peakVelocity)), 0),
    medianPeakVelocity: round(median(bursts.map((b) => b.peakVelocity)), 0),
    medianMeanVelocity: round(median(bursts.map((b) => b.meanVelocity)), 0),
    decayFits: good.length,
    medianDecayTau: good.length ? round(median(good.map((b) => b.decay.tau)), 3) : null,
    allTaus: taus.length,
  };
}
