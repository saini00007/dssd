// Regression test: capture the local motion-lab fixture (desktop + mobile) and assert on the outputs.
//   node capture/test.mjs            (set PROFILES=desktop for a quicker run)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import { startServer } from '../fixtures/serve.mjs';
import { capture } from './capture.mjs';
import { ffprobeDuration, readJson } from './util.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '_out', 'fixture');
const profiles = (process.env.PROFILES || 'desktop,mobile').split(',');
fs.rmSync(out, { recursive: true, force: true });

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok || !detail ? '' : `  -> ${detail}`}`);
};
const files = (dir, re) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => re.test(f)) : []);

const server = await startServer({ port: 0 });
const started = Date.now();
let run;
try {
  run = await capture([`${server.url}/motion-lab/`, '--out', out, '--profiles', profiles.join(','), '--step', '0.75', '--budget', '900']);
} finally {
  await server.close();
}
console.log(`\n--- assertions (capture took ${((Date.now() - started) / 1000).toFixed(0)}s)\n`);

check('capture was not reported as blocked', !run.blocked);
for (const profile of profiles) {
  const d = path.join(out, profile);
  const tag = (s) => `[${profile}] ${s}`;
  const status = readJson(path.join(d, 'status.json'), {});
  for (const [pass, st] of Object.entries(status)) check(tag(`pass ${pass} ${st.status === 'skipped' ? 'skipped (expected for touch)' : 'ok'}`), st.status === 'ok' || (st.status === 'skipped' && profile === 'mobile' && /hover|cursor/.test(pass)), st.error || st.reason);

  const mp4 = path.join(d, 'video', 'scroll.mp4');
  check(tag('scroll video mp4 exists, duration > 8s'), fs.existsSync(mp4) && (await ffprobeDuration(mp4)) > 8, fs.existsSync(mp4) ? String(await ffprobeDuration(mp4)) : 'missing');
  const timeline = readJson(path.join(d, 'scroll-timeline.json'), { samples: [] });
  check(tag('scroll timeline reaches the bottom and names sections'), timeline.endReason?.down === 'bottom reached' && new Set(timeline.samples.map((s) => s.section)).size >= 4, JSON.stringify(timeline.endReason));
  check(tag('>= 1 contact sheet, <= 2400px wide'), files(path.join(d, 'frames', 'sheets'), /\.jpg$/).length >= 1);
  check(tag('frames/index.json lists sheets with scrollY'), readJson(path.join(d, 'frames', 'index.json'), { sheets: [] }).sheets[0]?.frames[3]?.scrollY !== undefined);
  check(tag('scene keyframes extracted'), files(path.join(d, 'frames', 'keyframes'), /\.jpg$/).length >= 3);
  check(tag('step screenshots + full page exist'), files(path.join(d, 'steps'), /^step-\d+-y\d+\.jpg$/).length >= 5 && fs.existsSync(path.join(d, 'steps', 'fullpage.jpg')));

  const probe = readJson(path.join(d, 'probe.json'));
  const gsap = probe?.libraries?.gsap;
  const triggers = gsap?.scrollTrigger?.triggers || [];
  check(tag('probe: gsap + ScrollTrigger detected'), gsap?.version && gsap.scrollTrigger?.version, JSON.stringify(gsap?.version));
  check(tag('probe: >= 12 ScrollTriggers incl. pinned+scrubbed'), triggers.length >= 12 && triggers.some((t) => t.pin && t.scrub), `count ${triggers.length}`);
  check(tag('probe: Lenis with lerp 0.1'), probe?.libraries?.lenis?.options?.lerp === 0.1, JSON.stringify(probe?.libraries?.lenis?.options));
  check(tag('probe: webgl canvas + video element'), probe?.canvases.some((c) => /webgl/.test(c.context)) && probe.videos.length >= 1);
  const anims = probe?.animations || [];
  check(tag('probe: CSS animations float + marquee'), ['float', 'marquee'].every((n) => anims.some((a) => a.type === 'CSSAnimation' && a.name === n)));
  const waapi = anims.find((a) => a.type === 'WAAPI');
  check(tag('probe: WAAPI animation with keyframes'), waapi && waapi.keyframes.length >= 3, JSON.stringify(waapi));
  const hooked = probe?.creationHooks?.gsapTweens || [];
  check(tag('probe: intro tweens captured by init hook (curtain + counter + char reveal)'), hooked.some((t) => t.ease === 'expo.inOut') && hooked.some((t) => t.ease === 'power4.out' && t.nTargets > 5) && hooked.length >= 15, `hooked ${hooked.length}`);
  check(tag('probe: tokens (fonts, colours, :root vars, outline)'), probe?.tokens.colors.backgroundsByArea.length > 2 && probe.tokens.customProperties['--accent'] === '#ff5a1f' && probe.page.sections.length >= 6);
  check(tag('probe: network groups'), probe?.network.groups.scripts.length >= 5 && probe.network.groups.video.length >= 1);

  if (profile === 'desktop') {
    const hover = readJson(path.join(d, 'hover', 'index.json'), { entries: [] });
    const find = (re) => hover.entries.find((e) => re.test(e.selector));
    for (const [label, re] of [['magnetic button', /magnet/], ['card', /\.card/], ['underline link', /link-wipe/]]) {
      const e = find(re);
      check(tag(`hover: ${label} found with non-empty diff + filmstrip`), e && e.changedProperties.length > 0 && fs.existsSync(path.join(d, e.filmstrip)), e ? JSON.stringify(e.changedProperties) : 'not found');
    }
    check(tag('hover: card diff includes transform + box-shadow'), ['transform', 'box-shadow'].every((p) => find(/\.card/)?.changedProperties.includes(p)));
    const cursor = readJson(path.join(d, 'cursor.json'));
    check(tag('cursor: custom cursor detected with lag measured'), cursor?.customCursors.some((c) => /cursor/.test(c.selector) && c.lag?.reach63PctMs > 30), JSON.stringify(cursor?.customCursors?.[0]?.lag));
    check(tag('cursor: parallax layers detected'), (cursor?.parallax.layers.length || 0) >= 2 && cursor.parallax.layers.some((l) => /layer/.test(l.selector)));
    check(tag('cursor: magnetic button detected'), cursor?.magnetic.some((m) => /magnet/.test(m.selector) && m.magnetic));
    check(tag('cursor clip recorded'), fs.existsSync(path.join(d, 'video', 'cursor.mp4')));
  }
  const tr = readJson(path.join(d, 'transition', 'transitions.json'), { tested: [] });
  check(tag('transition: about.html recorded as full reload with overlay + sheet'), tr.tested.some((t) => /about\.html/.test(t.link.href) && t.type === 'full page reload' && t.overlayElementsSeen.length && t.contactSheets.length), JSON.stringify(tr.tested.map((t) => t.type || t.error)));
}
const report = fs.readFileSync(path.join(out, 'report.md'), 'utf8');
for (const h of ['Tech stack', 'Motion system', 'Per-section timeline', 'Hover catalogue', 'Cursor and pointer', 'Page transitions', 'Design tokens', 'Media']) check(`report.md has "${h}"`, report.includes(`### ${h}`));
check('summary.json is machine readable', readJson(path.join(out, 'summary.json'))?.profiles?.length === profiles.length);

// a site answering 429 with a Vercel challenge script must be reported as blocked, not captured
const wall = http.createServer((q, r) => {
  r.writeHead(429, { 'content-type': 'text/html' });
  r.end('<title>Vercel Security Checkpoint</title><script src="/.well-known/vercel/security/static/challenge.v2.min.js"></script>');
});
await new Promise((r) => wall.listen(0, '127.0.0.1', r));
const blockedOut = path.join(here, '_out', 'fixture-blocked');
const blockedRun = await capture([`http://127.0.0.1:${wall.address().port}/`, '--out', blockedOut, '--profiles', 'desktop']);
wall.close();
const blockedSummary = readJson(path.join(blockedOut, 'summary.json'), {});
check('HTTP 429 + challenge site is reported as blocked (summary.json + report.md), nothing captured', blockedRun.blocked && blockedSummary.blocked === true && /429/.test(blockedSummary.reason) && /BLOCKED/.test(fs.readFileSync(path.join(blockedOut, 'report.md'), 'utf8')));

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed${failed.length ? `; FAILED: ${failed.map((f) => f.name).join('; ')}` : ''}`);
process.exit(failed.length ? 1 : 0);
