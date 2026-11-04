// timeline.png: whole-recording chart (SVG -> Playwright screenshot). Designed per the dataviz skill:
// small multiples with ONE axis each (no dual axis), shared time axis, hairline grid, 2px lines, 10% wash,
// text in text tokens (never the series colour), legend for the event-band categories, palette slots 1-4 in order
// (validated: blue #2a78d6, orange #eb6834, aqua #1baf7a, yellow #eda100), band types also distinguished by
// label/pattern (relief for the low-contrast hues).
import { percentile } from './util.mjs';

const C = { surface: '#fcfcfb', ink: '#0b0b0b', ink2: '#52514e', muted: '#8d8c87', grid: '#e6e5e1', axis: '#c9c8c2',
  blue: '#2a78d6', orange: '#eb6834', aqua: '#1baf7a', yellow: '#eda100', scroll: '#8d8c87' };
const TYPE = {
  scroll: { c: C.scroll, label: 'scroll burst' },
  animation: { c: C.orange, label: 'in-place animation' },
  'anim-scroll': { c: C.orange, label: 'animation while scrolling', hatch: true },
  pinned: { c: C.aqua, label: 'pinned / scroll-scrubbed (likely)' },
  hscroll: { c: C.yellow, label: 'horizontal scroll' },
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function niceStep(range, ticks) {
  const raw = range / ticks, mag = 10 ** Math.floor(Math.log10(raw)), f = raw / mag;
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
}
function niceTicks(lo, hi, n = 4) {
  const step = niceStep(hi - lo || 1, n), a = Math.floor(lo / step) * step, out = [];
  for (let v = a; v <= hi + step * 0.001; v += step) out.push(+v.toFixed(6));
  return out;
}
const fmtNum = (v) => (Math.abs(v) >= 10000 ? (v / 1000).toFixed(0) + 'k' : Math.abs(v) >= 1000 ? v.toLocaleString('en-US') : String(v));

export async function renderTimelineChart(R, { tl, events, probe, label, crop, noise }, outFile) {
  const W = 2400, ML = 110, MR = 48, plotW = W - ML - MR;
  const T = tl.map((f) => f.t), tEnd = T[T.length - 1];
  const X = (t) => ML + (t / tEnd) * plotW;

  // ---- lanes (event bands) with greedy label rows
  const place = (list) => {
    const rows = [];
    for (const e of list) {
      const x0 = X(e.startT), x1 = Math.max(X(e.endT), x0 + 4), lw = 8 + e.id.length * 7.4;
      let r = 0;
      while (rows[r] !== undefined && rows[r] > x0 - 2) r++;
      rows[r] = Math.max(x1, x0 + lw) + 3;
      e._row = r; e._x0 = x0; e._x1 = x1;
    }
    return rows.length;
  };
  const scrollEv = events.filter((e) => e.type === 'scroll'), otherEv = events.filter((e) => e.type !== 'scroll' && e.type !== 'cut');
  const cutEv = events.filter((e) => e.type === 'cut');
  const nS = Math.max(1, place(scrollEv)), nO = Math.max(1, place(otherEv));
  const rowH = 17, laneGap = 14;
  const topH = 118, laneSH = nS * rowH + 6, laneOH = nO * rowH + 6;
  const panels = [
    { key: 'pos', title: 'Scroll position', unit: 'px from page top (cumulative, reset at cuts)', h: 200 },
    { key: 'vel', title: 'Scroll velocity', unit: 'px/s (+ down, − up)', h: 200 },
    { key: 'en', title: 'Animation energy', unit: 'residual after scroll compensation, above noise floor (gray levels)', h: 200 },
  ];
  const lanesY = topH, lanesH = 22 + laneSH + laneGap + laneOH;
  let y = lanesY + lanesH + 20;
  for (const p of panels) { p.y = y + 26; y = p.y + p.h + 26; }
  const H = y + 44;

  const parts = [];
  const text = (x, yy, s, { size = 13, fill = C.ink2, weight = 400, anchor = 'start' } = {}) =>
    parts.push(`<text x="${x.toFixed(1)}" y="${yy.toFixed(1)}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}">${esc(s)}</text>`);

  // title
  text(ML, 38, `${label} — frame-by-frame motion timeline`, { size: 26, fill: C.ink, weight: 700 });
  text(ML, 62, `${probe.stats.frames} frames over ${tEnd.toFixed(1)} s, variable frame rate (avg ${probe.stats.avgFps.toFixed(1)} fps, nominal ${probe.stats.nominalFps.toFixed(2)}). Analysed content ${crop.w}×${crop.h} px (browser chrome cropped). Every point is one real frame at its true timestamp.`, { size: 14 });
  // legend
  let lx = ML, ly = 92;
  const defs = [`<defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="${C.surface}"/><rect width="2.4" height="6" fill="${C.orange}"/></pattern></defs>`];
  for (const [k, v] of Object.entries(TYPE)) {
    if (!events.some((e) => e.type === k)) continue;
    parts.push(`<rect x="${lx}" y="${ly - 11}" width="22" height="12" rx="2" fill="${v.hatch ? 'url(#hatch)' : v.c}" ${v.hatch ? `stroke="${C.orange}" stroke-width="1"` : ''}/>`);
    text(lx + 29, ly, v.label, { size: 14 });
    lx += 29 + v.label.length * 7.6 + 26;
  }
  if (cutEv.length) {
    parts.push(`<rect x="${lx}" y="${ly - 12}" width="3" height="14" fill="${C.ink}"/>`);
    text(lx + 11, ly, 'cut (page navigation)', { size: 14 }); lx += 11 + 22 * 7.6 + 26;
  }
  text(lx, ly, `bands labelled with event IDs (E01…); strips for each in events/`, { size: 14, fill: C.muted });

  // event lanes
  text(ML - 12, lanesY + 24, 'scroll', { size: 13, anchor: 'end' });
  const drawLane = (list, y0, label) => {
    for (const e of list) {
      const t = TYPE[e.type]; const yy = y0 + e._row * rowH;
      parts.push(`<rect x="${e._x0.toFixed(1)}" y="${yy}" width="${(e._x1 - e._x0).toFixed(1)}" height="11" rx="2" fill="${t.hatch ? 'url(#hatch)' : t.c}" ${t.hatch ? `stroke="${C.orange}"` : ''} opacity="${e.type === 'scroll' ? 0.55 : 0.95}"/>`);
      text(e._x1 + 4, yy + 10, e.id, { size: 11.5, fill: C.ink2 });
    }
  };
  drawLane(scrollEv, lanesY + 16, 'scroll');
  text(ML - 12, lanesY + 16 + laneSH + laneGap + 8 + 8, 'animation', { size: 13, anchor: 'end' });
  drawLane(otherEv, lanesY + 16 + laneSH + laneGap, 'other');

  // shared background: event shading + cuts through panels
  const pTop = panels[0].y, pBot = panels[2].y + panels[2].h;
  const shade = [];
  for (const e of otherEv) shade.push(`<rect x="${e._x0.toFixed(1)}" y="${pTop}" width="${(e._x1 - e._x0).toFixed(1)}" height="${pBot - pTop}" fill="${TYPE[e.type].c}" opacity="0.07"/>`);

  // x axis ticks
  const xStep = tEnd > 120 ? 20 : tEnd > 50 ? 5 : tEnd > 20 ? 2 : 1;
  const grid = [];

  const panelBody = [];
  for (const p of panels) {
    const { y: py, h: ph } = p;
    let series, lo, hi, color = C.blue;
    if (p.key === 'pos') { series = tl.map((f) => f.scrollPos); lo = Math.min(0, ...series); hi = Math.max(1, ...series); }
    else if (p.key === 'vel') { series = tl.map((f) => f.scrollVelocity); const m = Math.max(100, ...series.map(Math.abs)); lo = -m; hi = m; }
    else { series = tl.map((f) => (f.isCut ? null : f.energy)); const vals = series.filter((v) => v != null); hi = Math.max(3, percentile(vals, 0.995) * 1.1); lo = 0; }
    const ticks = niceTicks(lo, hi, 4); lo = Math.min(lo, ticks[0]); hi = Math.max(hi, ticks[ticks.length - 1]);
    const Y = (v) => py + ph - ((Math.min(Math.max(v, lo), hi) - lo) / (hi - lo)) * ph;
    text(ML, py - 8, p.title, { size: 16, fill: C.ink, weight: 700 });
    text(ML + p.title.length * 9.6 + 14, py - 8, p.unit, { size: 13, fill: C.muted });
    for (const tk of ticks) {
      panelBody.push(`<line x1="${ML}" x2="${W - MR}" y1="${Y(tk).toFixed(1)}" y2="${Y(tk).toFixed(1)}" stroke="${tk === 0 && p.key !== 'pos' ? C.axis : C.grid}" stroke-width="1"/>`);
      text(ML - 10, Y(tk) + 4, fmtNum(tk), { size: 12.5, anchor: 'end' });
    }
    // path with breaks at cuts / nulls
    let d = '', area = '', open = false, firstX = 0, lastX = 0;
    const base = Y(Math.max(lo, Math.min(hi, 0)));
    const flush = () => { if (open) { area += `L${lastX.toFixed(1)},${base.toFixed(1)}L${firstX.toFixed(1)},${base.toFixed(1)}Z`; open = false; } };
    series.forEach((v, i) => {
      if (v == null || tl[i].isCut) { flush(); return; }
      const x = X(T[i]), yy = Y(v);
      if (!open) { d += `M${x.toFixed(1)},${yy.toFixed(1)}`; area += `M${x.toFixed(1)},${yy.toFixed(1)}`; open = true; firstX = x; }
      else { d += `L${x.toFixed(1)},${yy.toFixed(1)}`; area += `L${x.toFixed(1)},${yy.toFixed(1)}`; }
      lastX = x;
    });
    flush();
    panelBody.push(`<path d="${area}" fill="${color}" opacity="0.10"/>`);
    panelBody.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`);
    if (p.key === 'en') {
      // low-confidence frames (textureless): hollow ticks on baseline so they are not mistaken for "idle"
      for (const f of tl) if (f.lowConf) panelBody.push(`<rect x="${(X(f.t) - 1).toFixed(1)}" y="${py + ph - 5}" width="2" height="5" fill="${C.muted}"/>`);
      text(W - MR, py - 8, 'grey ticks on the baseline = low-confidence frames (textureless, scroll not measurable)', { size: 12.5, fill: C.muted, anchor: 'end' });
    }
    if (p.key === 'pos') {
      // annotate the peak
      const mi = series.indexOf(Math.max(...series));
      if (mi >= 0 && series[mi] > 0) { panelBody.push(`<circle cx="${X(T[mi]).toFixed(1)}" cy="${Y(series[mi]).toFixed(1)}" r="4.5" fill="${color}" stroke="${C.surface}" stroke-width="2"/>`); text(X(T[mi]) + 9, Y(series[mi]) + 4, `${fmtNum(Math.round(series[mi]))} px`, { size: 12.5 }); }
    }
    panelBody.push(`<line x1="${ML}" x2="${ML}" y1="${py}" y2="${py + ph}" stroke="${C.axis}"/>`);
  }
  // vertical time grid + axis labels
  for (let t = 0; t <= tEnd + 1e-6; t += xStep) {
    const x = X(t);
    grid.push(`<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${pTop}" y2="${pBot}" stroke="${C.grid}" stroke-width="1"/>`);
    text(x, pBot + 22, `${t}s`, { size: 12.5, anchor: 'middle' });
  }
  const cuts = cutEv.map((e) => {
    const xs = (e.cutFrames || [e.startFrame]).map((n) => X(T[n]));
    const xa = X(e.startT), xb = X(e.endT);
    return `<rect x="${xa.toFixed(1)}" y="${lanesY + 4}" width="${Math.max(3, xb - xa).toFixed(1)}" height="${pBot - lanesY - 4}" fill="${C.ink}" opacity="0.06"/>` +
      xs.map((x) => `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${lanesY + 4}" y2="${pBot}" stroke="${C.ink}" stroke-width="2"/>`).join('') +
      `<text x="${(xa + 6).toFixed(1)}" y="${lanesY + 16}" font-size="12.5" font-weight="700" fill="${C.ink}">${e.id} cut</text>`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Inter,'Helvetica Neue',Arial,'DejaVu Sans',sans-serif">
${defs.join('')}<rect width="${W}" height="${H}" fill="${C.surface}"/>${grid.join('')}${shade.join('')}${panelBody.join('')}${parts.join('')}${cuts.join('')}</svg>`;
  await R.html(`<!doctype html><meta charset=utf-8><body style="margin:0;background:${C.surface}">${svg}`, W, outFile, { type: 'png', height: H });
  return { width: W, height: H };
}
