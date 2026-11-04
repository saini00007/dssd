// Pass 8: assemble report.md + summary.json from the per-pass JSON files. Says plainly what was not found.
import fs from 'node:fs';
import path from 'node:path';
import { readJson, writeJson } from './util.mjs';

const md = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const table = (head, rows) => (rows.length ? [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.map(md).join(' | ')} |`)].join('\n') : '_none_');
const exists = (dir, rel) => rel && fs.existsSync(path.join(dir, rel));
const tally = (arr) => {
  const m = new Map();
  arr.forEach((v) => m.set(v, (m.get(v) || 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

/** Contiguous runs of the same section label in the scroll timeline (scroll-down phase only). */
function sectionRanges(timeline) {
  const out = [];
  for (const s of (timeline?.samples || []).filter((x) => x.phase === 'scroll-down')) {
    const last = out[out.length - 1];
    if (last && last.section === s.section) {
      last.yTo = Math.max(last.yTo, s.scrollY);
      last.tTo = s.t;
    } else out.push({ section: s.section || '(none)', yFrom: s.scrollY, yTo: s.scrollY, tFrom: s.t, tTo: s.t });
  }
  return out;
}

export function summarizeProfile(dir, name, status) {
  const probe = readJson(path.join(dir, 'probe.json'));
  const timeline = readJson(path.join(dir, 'scroll-timeline.json'));
  const frames = readJson(path.join(dir, 'frames', 'index.json'));
  const steps = readJson(path.join(dir, 'steps', 'steps.json'));
  const hover = readJson(path.join(dir, 'hover', 'index.json'));
  const cursor = readJson(path.join(dir, 'cursor.json'));
  const transition = readJson(path.join(dir, 'transition', 'transitions.json'));
  const gsapLib = probe?.libraries?.gsap;
  const tweens = [...(probe?.creationHooks?.gsapTweens || [])];
  const liveTweens = (gsapLib?.timeline?.children || []).filter((c) => c.type === 'tween');
  const triggers = gsapLib?.scrollTrigger?.triggers || [];
  return {
    profile: name,
    status,
    page: probe?.page ? { title: probe.page.title, description: probe.page.description, lang: probe.page.lang, domNodes: probe.page.domNodes, docHeight: probe.page.docHeight } : null,
    libraries: probe ? Object.fromEntries(Object.entries(probe.libraries).map(([k, v]) => [k, { via: v.via, version: v.version, plugins: v.plugins, options: v.options }])) : null,
    motion: {
      lenis: probe?.libraries?.lenis?.options || null,
      scrollTriggers: triggers.length,
      pinned: triggers.filter((t) => t.pin).length,
      scrubbed: triggers.filter((t) => t.scrub !== false).length,
      creationTimeTweens: tweens.length,
      liveTweens: liveTweens.length,
      cssAnimations: (probe?.animations || []).filter((a) => a.type === 'CSSAnimation').length,
      waapiAnimations: (probe?.animations || []).filter((a) => a.type === 'WAAPI').length,
    },
    hoverCaptured: hover?.entries?.length ?? null,
    customCursor: cursor?.customCursorDetected ?? null,
    parallaxLayers: cursor?.parallax?.layers?.length ?? null,
    magneticElements: cursor ? cursor.magnetic.filter((m) => m.magnetic).map((m) => m.selector) : null,
    transitions: transition ? transition.tested.map((t) => ({ href: t.link.href, type: t.type, error: t.error })) : null,
    scroll: timeline ? { videoDurationSec: timeline.videoDurationSec, endReason: timeline.endReason, maxDocHeight: timeline.maxDocHeight } : null,
    counts: { sheets: frames?.sheets?.length ?? 0, keyframes: frames?.keyframes?.length ?? 0, steps: steps?.steps?.length ?? 0 },
    _data: { probe, timeline, frames, steps, hover, cursor, transition, tweens, liveTweens, triggers },
  };
}

function profileSection(dir, p) {
  const { probe, timeline, frames, steps, hover, cursor, transition, tweens, liveTweens, triggers } = p._data;
  const L = [];
  const rel = (f) => `${p.profile}/${f}`;
  L.push(`## Profile: ${p.profile}`, '');
  L.push('### Pass status', '', table(['pass', 'status', 'time (s)', 'detail'], Object.entries(p.status).map(([k, v]) => [k, v.status, v.seconds ?? '', v.error || v.reason || ''])), '');
  if (!probe) {
    L.push('_Probe pass produced no data: tech stack, tokens and animation inventory are unavailable._', '');
  } else {
    if (probe.botWall?.detected) L.push(`> **Bot wall / error page detected**: ${probe.botWall.reason || probe.botWall.title}. Everything below describes the challenge page, not the site.`, '');
    L.push('### Tech stack', '');
    const libs = Object.entries(probe.libraries);
    L.push(
      table(
        ['library', 'detected via', 'details'],
        libs.map(([k, v]) => [k, v.via.join(' + '), [v.version && `v${v.version}`, v.plugins?.length && `plugins: ${v.plugins.join(', ')}`, v.scrollTrigger && `${v.scrollTrigger.count} ScrollTriggers`, v.note].filter(Boolean).join('; ')])
      ),
      ''
    );
    if (!libs.length) L.push('No known motion libraries detected. If the site animates, it is likely custom CSS/JS or a bundled library without globals or recognisable URLs.', '');
    L.push(`Page: "${probe.page.title}" | lang ${probe.page.lang || '?'} | ${probe.page.domNodes} DOM nodes | document height ${probe.page.docHeight}px | canvases: ${probe.canvases.map((c) => `${c.selector} (${c.context})`).join(', ') || 'none'} | videos: ${probe.videos.length}`, '');

    L.push('### Motion system', '');
    const lenis = probe.libraries.lenis;
    L.push(`- Smooth scroll: ${lenis ? (lenis.options ? `Lenis, ${Object.entries(lenis.options).filter(([, v]) => v !== undefined && typeof v !== 'object').map(([k, v]) => `${k}=${String(v).slice(0, 40)}`).join(', ')}` : `Lenis (${lenis.note})`) : probe.libraries.locomotive ? 'Locomotive Scroll' : 'none detected'}`);
    L.push(`- ScrollTriggers: ${triggers.length} (${triggers.filter((t) => t.pin).length} pinned, ${triggers.filter((t) => t.scrub !== false).length} scrubbed)${libs.some(([k]) => k === 'gsap') ? '' : ' - gsap global not found, so triggers cannot be listed'}`);
    L.push(`- GSAP tweens: ${tweens.length} recorded at creation time (including intro tweens that already finished), ${liveTweens.length} still in the global timeline at probe time`);
    L.push(`- CSS animations/transitions alive at load: ${probe.animations.length} (${probe.animations.filter((a) => a.type === 'CSSAnimation').length} CSS animations, ${probe.animations.filter((a) => a.type === 'WAAPI').length} WAAPI, ${probe.animations.filter((a) => a.type === 'CSSTransition').length} transitions)`, '');
    const spec = tweens.length ? tweens : liveTweens;
    if (!spec.length) L.push('_No GSAP tweens captured (no gsap global, or bundled without globals)._', '');
    else {
      L.push('Most common eases', '', table(['ease', 'tweens'], tally(spec.map((t) => t.ease)).slice(0, 8)), '');
      L.push('Most common durations (s)', '', table(['duration', 'tweens'], tally(spec.map((t) => (Math.round(t.duration * 10) / 10).toFixed(1))).slice(0, 8)), '');
    }
    if (triggers.length) {
      L.push('ScrollTrigger inventory', '', table(['trigger', 'start..end (px)', 'pin', 'scrub', 'toggleActions', 'animation'], triggers.map((t) => [t.trigger, `${t.startPx}..${t.endPx}`, t.pin ? 'yes' : '', t.scrub === false ? '' : String(t.scrub), t.toggleActions || '', t.animation ? `${t.animation.kind} ${t.animation.duration}s ${t.animation.ease || ''} ${(t.animation.props || []).join(',')}` : ''])), '');
    }
    L.push('CSS / WAAPI animations', '', table(['type', 'name', 'target', 'duration ms', 'easing', 'iterations'], probe.animations.filter((a) => a.type !== 'CSSTransition').map((a) => [a.type, a.name, a.target, a.duration, a.easing, a.iterations])), '');

    L.push('### Per-section timeline', '');
    const ranges = sectionRanges(timeline);
    if (!ranges.length) L.push('_No scroll timeline was recorded._', '');
    else {
      L.push(
        table(
          ['scroll range (px)', 'video time (s)', 'section in view', 'ScrollTriggers starting in range', 'tweens targeting it'],
          ranges.map((r) => {
            const sec = probe.page.sections.find((s) => r.section.startsWith(s.label.slice(0, 20)) || s.label === r.section);
            const trigs = triggers.filter((t) => t.startPx >= r.yFrom - 900 && t.startPx <= r.yTo).map((t) => t.trigger);
            const tw = sec ? spec.filter((t) => t.section === sec.index).length : '';
            return [`${r.yFrom}-${r.yTo}`, `${r.tFrom}-${r.tTo}`, r.section, [...new Set(trigs)].slice(0, 6).join(', ') || '-', tw];
          })
        ),
        ''
      );
    }
    L.push('Section outline', '', table(['#', 'section', 'top', 'height', 'height (vh)', 'background'], probe.page.sections.map((s) => [s.index, s.label, s.top, s.height, s.heightVh, s.background || ''])), '');
  }

  L.push('### Hover catalogue', '');
  if (!hover) L.push('_Hover pass did not run or produced no output._', '');
  else {
    L.push(`${hover.entries.length} elements captured of ${hover.uniqueGroups} unique candidate groups (${hover.hoverRulesFound} :hover rules readable; ${hover.blockedStylesheets} cross-origin stylesheets unreadable). Skipped: ${hover.skipped.length}.`, '');
    L.push(
      table(
        ['#', 'element', 'what changes', 'driver', 'duration / easing', 'filmstrip'],
        hover.entries.map((e) => {
          const specs = Object.values(e.transitionSpec || {});
          const s0 = specs.find((s) => s.transitionDuration) || specs[0];
          return [e.index, `${e.selector}${e.text ? ` "${e.text}"` : ''}${e.instancesOnPage > 1 ? ` (x${e.instancesOnPage})` : ''}`, e.changedProperties.join(', ') + (e.movedBeforeEntering ? ' (moves before entering: magnetic)' : '') || 'nothing detected', e.driver, s0 ? `${s0.transitionDuration || s0.animationDuration} ${s0.transitionTimingFunction || s0.animationTimingFunction || ''}` : '', e.filmstrip ? `[filmstrip](${rel(e.filmstrip)})` : ''];
        })
      ),
      ''
    );
    if (hover.skipped.length) L.push('Skipped: ' + hover.skipped.map((s) => `${s.selector} (${s.reason})`).join('; '), '');
  }

  L.push('### Cursor and pointer', '');
  if (!cursor) L.push('_Cursor pass did not run (skipped on touch profiles, or it failed)._', '');
  else {
    L.push(`- Native cursor hidden (cursor:none): ${cursor.cursorHidden.nativeCursorHidden ? 'yes' : 'no'}`);
    if (cursor.customCursors.length) for (const c of cursor.customCursors) L.push(`- Custom cursor element \`${c.selector}\` (${c.size.width}x${c.size.height}): ${c.lag?.behaviour}; reaches 63% in ${c.lag?.reach63PctMs} ms, 95% in ${c.lag?.reach95PctMs} ms${c.reactsToLinks?.changedProperties.length ? `; changes over links: ${c.reactsToLinks.changedProperties.join(', ')} (${c.reactsToLinks.idle.width}px -> ${c.reactsToLinks.overLink.width}px)` : '; no change over links detected'}`);
    else L.push('- No pointer-following DOM element found (WebGL/canvas cursors cannot be detected this way).');
    L.push(`- Mouse-move parallax: ${cursor.parallax.detected ? cursor.parallax.layers.length + ' layers' : 'not detected'}`);
    if (cursor.parallax.layers?.length) L.push('', table(['layer', 'dx px', 'dy px', 'ratio x', 'direction'], cursor.parallax.layers.map((l) => [l.selector, l.dx, l.dy, l.ratioX, l.direction])));
    const mags = cursor.magnetic.filter((m) => m.magnetic);
    L.push('', `- Magnetic elements: ${mags.length ? '' : 'none detected among ' + cursor.magnetic.length + ' tested'}`);
    if (mags.length) L.push('', table(['element', 'activates (px from edge)', 'max shift px', 'pull ratio'], mags.map((m) => [m.selector, m.activationDistanceFromEdgePx, m.maxShiftPx, m.pullRatio])));
    if (cursor.clip) L.push('', `Clip: [${cursor.clip}](${rel(cursor.clip)})`);
    L.push('');
  }

  L.push('### Page transitions', '');
  if (!transition) L.push('_Transition pass did not run._', '');
  else if (!transition.tested.length) L.push('No same-origin navigation links found to test.', '');
  else
    L.push(table(['link', 'type', 'overlay elements', 'settled after (ms)', 'clip', 'contact sheet'], transition.tested.map((t) => [t.link.href, t.type || `error: ${t.error}`, (t.overlayElementsSeen || []).join(', '), t.settledAfterMs ?? '', t.clip ? `[mp4](${rel(t.clip)})` : '', t.contactSheets?.[0] ? `[sheet](${rel(t.contactSheets[0].file)})` : ''])), '');

  if (probe) {
    const t = probe.tokens;
    L.push('### Design tokens', '');
    L.push('Fonts in use: ' + (t.fonts.familiesByUsage.map((f) => `\`${f.family}\``).join('; ') || 'unknown'), '');
    L.push(t.fonts.loadedFaces.length ? 'Loaded @font-face: ' + t.fonts.loadedFaces.map((f) => `${f.family} ${f.weight} ${f.style}`).join(', ') : 'No web fonts loaded through @font-face (system fonts, or fonts not yet loaded).', '');
    L.push(table(['element', 'font-size', 'weight', 'line-height', 'letter-spacing', 'family'], Object.entries(t.fonts.elements).map(([k, v]) => [k, v.fontSize, v.fontWeight, v.lineHeight, v.letterSpacing, v.fontFamily.slice(0, 40)])), '');
    if (t.fonts.largestOnFirstScreen) L.push(`Largest text on first screen: ${t.fonts.largestOnFirstScreen.fontSizePx}px "${t.fonts.largestOnFirstScreen.text}" (${t.fonts.largestOnFirstScreen.selector}).`, '');
    L.push('Type scale (px): ' + t.typeScalePx.map((x) => x.px).join(', '), '');
    L.push('Backgrounds by area: ' + (t.colors.backgroundsByArea.map((c) => c.hex).join(', ') || 'none'), '', 'Text colours: ' + (t.colors.textByWeight.map((c) => c.hex).join(', ') || 'none'), '');
    L.push('Section backgrounds in order: ' + t.colors.sectionBackgrounds.map((s) => s.hex || '-').join(' > '), '');
    L.push('Border radii: ' + (t.borderRadii.map((r) => `${r.value} (x${r.count})`).join(', ') || 'none'), '', 'Container max-widths: ' + (t.containerMaxWidths.map((r) => r.value).join(', ') || 'none found'), '');
    const vars = Object.entries(t.customProperties);
    L.push(`CSS custom properties on :root: ${vars.length ? vars.slice(0, 30).map(([k, v]) => `${k}: ${v}`).join('; ') : 'none readable'}${t.cssUsage.blockedCrossOriginSheets ? ` (${t.cssUsage.blockedCrossOriginSheets} cross-origin stylesheets could not be read)` : ''}`, '');
    L.push(`scroll-behavior: html ${t.scrollBehavior.html}; scroll-snap elements: ${t.scrollSnap.length}; clamp() uses: ${t.cssUsage.clamp}; vw units: ${t.cssUsage.vw}; vh-family units: ${t.cssUsage.vh}`, '');
  }

  L.push('### Media', '');
  if (exists(dir, 'video/scroll.mp4')) L.push(`- Scroll video: [video/scroll.mp4](${rel('video/scroll.mp4')}) (${timeline?.videoDurationSec}s; scroll down: ${timeline?.endReason?.down}; up: ${timeline?.endReason?.up})`);
  L.push('- Timeline: ' + (timeline ? `[scroll-timeline.json](${rel('scroll-timeline.json')})` : 'not recorded'));
  for (const sh of frames?.sheets || []) L.push(`- Contact sheet ${sh.tStart}s-${sh.tEnd}s: [${sh.file}](${rel(sh.file)})`);
  L.push(`- Keyframes: ${frames?.keyframes?.length ?? 0} in \`${p.profile}/frames/keyframes/\`; index [frames/index.json](${rel('frames/index.json')})`);
  if (steps) {
    L.push(`- Scroll steps: ${steps.steps.length} screenshots in \`${p.profile}/steps/\` (step ${steps.stepPx}px); full page: ${steps.fullPage.file ? `[${steps.fullPage.file}](${rel(steps.fullPage.file)})` : 'failed'}`);
    L.push(`  - Full-page limitation: ${steps.fullPage.limitations}`);
  }
  L.push(`- Probe data: [probe.json](${rel('probe.json')})`, '');
  return L.join('\n');

}

export function writeBlocked(outDir, url, blocked, meta) {
  const md = `# Motion capture report: ${url}\n\n**BLOCKED**: ${blocked.reason}\n\nThe site refused automated access or served a challenge/error page, so nothing was captured. The tool only detects this state; it does not try to bypass bot protection.\n\nCaptured ${meta.capturedAt}${blocked.httpStatus ? ` | document status ${blocked.httpStatus}` : ''}\n`;
  fs.writeFileSync(path.join(outDir, 'report.md'), md);
  writeJson(path.join(outDir, 'summary.json'), { url, ...meta, blocked: true, reason: blocked.reason, httpStatus: blocked.httpStatus ?? null, profiles: [] });
}

export function writeReport(outDir, url, profileSummaries, meta) {
  const L = [`# Motion capture report: ${url}`, '', `Captured ${meta.capturedAt} | profiles: ${profileSummaries.map((p) => p.profile).join(', ')} | total ${meta.totalSeconds}s`, ''];
  L.push('## Summary', '', table(['profile', 'stack', 'ScrollTriggers (pinned)', 'tweens', 'CSS/WAAPI anims', 'hovers', 'custom cursor', 'parallax layers', 'magnetic', 'transitions'], profileSummaries.map((p) => [p.profile, Object.keys(p.libraries || {}).join(', ') || 'none detected', `${p.motion.scrollTriggers} (${p.motion.pinned})`, p.motion.creationTimeTweens || p.motion.liveTweens, `${p.motion.cssAnimations}/${p.motion.waapiAnimations}`, p.hoverCaptured ?? 'n/a', p.customCursor ?? 'n/a', p.parallaxLayers ?? 'n/a', (p.magneticElements || []).join(', ') || (p.magneticElements ? 'none' : 'n/a'), (p.transitions || []).map((t) => t.type).join('; ') || 'n/a'])), '');
  for (const p of profileSummaries) L.push(profileSection(path.join(outDir, p.profile), p), '');
  L.push('## Honest limits', '', '- Headless Chromium uses software WebGL; heavy WebGL pages drop frames, so video timing can differ from a real GPU.', '- GSAP bundled without a `window.gsap` global cannot be introspected; it is reported as "bundle fingerprint" only.', '- Hover/cursor passes use synthetic mouse input and are skipped on touch profiles.', '- Computed-style diffs only see what changed in the sampled element subtree and its ::before/::after.', '');
  fs.writeFileSync(path.join(outDir, 'report.md'), L.join('\n'));
  writeJson(path.join(outDir, 'summary.json'), { url, ...meta, blocked: false, profiles: profileSummaries.map(({ _data, ...rest }) => rest) });
}
