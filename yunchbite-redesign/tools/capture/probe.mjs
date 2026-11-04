// Pass 7 (runs first): JS introspection + network fingerprinting -> probe.json
import path from 'node:path';
import { sleep } from '../lib/browser.mjs';
import { detectBotWall, openPage } from './session.mjs';
import { log, writeJson } from './util.mjs';

/** URL / bundle-text fingerprints for libraries that may be bundled without globals. */
const FINGERPRINTS = {
  gsap: { url: /gsap(\.min)?\.js|\/gsap@|\/gsap\/dist|cdnjs[^/]*\/gsap/i, text: /\bgsap\b[\s\S]{0,400}(registerPlugin|globalTimeline)|globalTimeline|"gsap"|_gsap\b/ },
  ScrollTrigger: { url: /ScrollTrigger/i, text: /ScrollTrigger[\s\S]{0,200}(pin|scrub|refresh)|\.scrollTrigger\b|pinSpacing/ },
  lenis: { url: /lenis/i, text: /\blenis\b[\s\S]{0,300}(lerp|smoothWheel|raf)|new Lenis\(/i },
  locomotive: { url: /locomotive/i, text: /LocomotiveScroll|data-scroll-container|has-scroll-smooth/ },
  framer: { url: /framerusercontent\.com|framer\.com\/m\/|framer-motion|\/framer\//i, text: /framer-motion|data-framer-|__framer/ },
  webflow: { url: /webflow\.(js|com|io)|assets-global\.website-files\.com|cdn\.prod\.website-files\.com/i, text: /Webflow\.require|data-wf-page/ },
  three: { url: /three(\.min|\.module)?\.js|\/three@|three\/build/i, text: /WebGLRenderer[\s\S]{0,200}(REVISION|PerspectiveCamera)|REVISION\s*=\s*"\d+/ },
  lottie: { url: /lottie|bodymovin|dotlottie|\.lottie(\?|$)/i, text: /lottie-web|bodymovin|dotlottie/i },
  rive: { url: /rive(\.wasm|-canvas|\.riv|\.app)|\.riv(\?|$)|unpkg\.com\/@rive-app/i, text: /@rive-app|rive-canvas|\bRiveFile\b/ },
  spline: { url: /splinetool|spline\.design|\.splinecode/i, text: /@splinetool|splinecode/ },
  swiper: { url: /swiper/i, text: /swiper-wrapper|new Swiper\(/ },
  splitting: { url: /splitting(\.min)?\.js|split-type|splittype|SplitText/i, text: /SplitType|Splitting\(|SplitText/ },
  barba: { url: /barba/i, text: /barba\.init|data-barba/ },
  swup: { url: /swup/i, text: /new Swup\(|data-swup/ },
  taxi: { url: /taxi(\.min)?\.js|@unseenco\/taxi/i, text: /@unseenco\/taxi|new Taxi\.Core/ },
  highway: { url: /highway(\.min)?\.js|@dogstudio\/highway/i, text: /@dogstudio\/highway|data-router-view/ },
  nextjs: { url: /\/_next\/static\//i, text: /__NEXT_DATA__/ },
  nuxt: { url: /\/_nuxt\//i, text: /__NUXT__/ },
  astro: { url: /\/_astro\//i, text: /astro-island/ },
  shopify: { url: /cdn\.shopify\.com|shopifycloud/i, text: /Shopify\.theme|window\.Shopify/ },
};

/** Everything that needs the live DOM / JS heap. Runs in the page. */
function inPage() {
  const cap = window.__cap;
  const sel = cap.sel;
  const R = { libs: {} };
  const found = (name, info = {}) => (R.libs[name] = { via: ['global'], ...info });
  const has = (v) => typeof v !== 'undefined';
  const cleanEasing = (f) => (typeof f === 'function' ? f.toString().replace(/\s+/g, ' ').slice(0, 120) : f);
  const landmarks = cap.landmarks();
  const sectionOf = (el) => {
    const i = landmarks.findIndex((l) => l.el === el || (el && el.nodeType === 1 && l.el.contains(el)));
    return i === -1 ? null : i;
  };

  // ---------- GSAP
  const g = window.gsap;
  if (g) {
    const ST = window.ScrollTrigger || (g.core && g.core.globals && g.core.globals().ScrollTrigger);
    const globals = (g.core && g.core.globals && g.core.globals()) || {};
    const known = ['ScrollTrigger', 'Observer', 'SplitText', 'ScrollToPlugin', 'ScrollSmoother', 'Draggable', 'Flip', 'MotionPathPlugin', 'MorphSVGPlugin', 'DrawSVGPlugin', 'CustomEase', 'CustomBounce', 'CustomWiggle', 'InertiaPlugin', 'TextPlugin', 'ScrambleTextPlugin', 'Physics2DPlugin', 'PhysicsPropsPlugin', 'RoughEase', 'ExpoScaleEase', 'EasePack', 'GSDevTools'];
    const plugins = known.filter((n) => has(window[n]) || globals[n]);
    const describeTween = (c) => {
      const isTween = typeof c.targets === 'function';
      const base = { type: isTween ? 'tween' : 'timeline', start: +c.startTime().toFixed(2), duration: +c.duration().toFixed(2), delay: +(c.delay ? c.delay() : 0).toFixed(2), repeat: c.repeat ? c.repeat() : 0, yoyo: c.yoyo ? !!c.yoyo() : false };
      if (!isTween) return { ...base, children: c.getChildren(false).length };
      const vars = c.vars || {};
      const targets = c.targets();
      const first = targets.find((t) => t && t.nodeType === 1);
      return {
        ...base,
        targets: targets.slice(0, 4).map(sel),
        nTargets: targets.length,
        ease: typeof vars.ease === 'string' ? vars.ease : vars.ease ? 'custom function' : 'power1.out (default)',
        props: Object.keys(vars).filter((k) => !/^(ease|duration|delay|stagger|repeat|yoyo|repeatDelay|scrollTrigger|overwrite|immediateRender|id|data|lazy|paused)$/.test(k) && !/^on[A-Z]/.test(k)),
        scrollTrigger: !!vars.scrollTrigger,
        section: first ? sectionOf(first) : null,
        active: c.isActive(),
      };
    };
    const triggers = ST
      ? ST.getAll().map((t) => {
          const v = t.vars || {};
          const anim = t.animation;
          const nest = (x) => (typeof x === 'function' ? 'function' : x);
          return {
            trigger: sel(t.trigger),
            section: t.trigger ? sectionOf(t.trigger) : null,
            startPx: Math.round(t.start),
            endPx: Math.round(t.end),
            startVar: nest(v.start) ?? 'top bottom',
            endVar: nest(v.end) ?? 'bottom top',
            pin: !!t.pin,
            pinTarget: t.pin ? sel(t.pin) : null,
            pinSpacing: t.pin ? v.pinSpacing !== false : null,
            scrub: v.scrub === undefined ? false : v.scrub,
            toggleActions: v.toggleActions || (anim && !v.scrub ? 'play none none none' : null),
            once: !!v.once,
            snap: !!v.snap,
            markers: !!v.markers,
            animation: anim
              ? {
                  kind: typeof anim.targets === 'function' ? 'tween' : 'timeline',
                  duration: +anim.duration().toFixed(2),
                  ease: typeof anim.vars?.ease === 'string' ? anim.vars.ease : anim.vars?.ease ? 'custom function' : null,
                  targets: typeof anim.targets === 'function' ? anim.targets().slice(0, 3).map(sel) : undefined,
                  props: typeof anim.targets === 'function' ? Object.keys(anim.vars || {}).filter((k) => !/^(ease|duration|delay|scrollTrigger|stagger|overwrite|immediateRender)$/.test(k) && !/^on[A-Z]/.test(k)) : undefined,
                }
              : null,
            hasCallbacks: ['onEnter', 'onLeave', 'onEnterBack', 'onLeaveBack', 'onUpdate', 'onToggle'].filter((k) => typeof v[k] === 'function'),
          };
        })
      : null;
    found('gsap', {
      version: g.version,
      plugins,
      registeredViaHook: cap.plugins,
      scrollTrigger: ST ? { version: ST.version, count: triggers.length, triggers } : null,
      timeline: (() => {
        const kids = g.globalTimeline.getChildren(true, true, true);
        return { total: kids.length, children: kids.slice(0, 300).map(describeTween) };
      })(),
      defaults: g.defaults ? g.defaults() : null,
    });
  }

  // ---------- Lenis
  const lenisInst = window.lenis || cap.lenis[0] || (window.Lenis && window.Lenis.instance) || null;
  const lenisHtml = document.documentElement.classList.contains('lenis');
  if (lenisInst || lenisHtml || has(window.Lenis)) {
    const o = (lenisInst && lenisInst.options) || {};
    found('lenis', {
      instanceFound: !!lenisInst,
      foundOn: lenisInst ? (window.lenis === lenisInst ? 'window.lenis' : 'constructor hook') : null,
      htmlClass: lenisHtml ? [...document.documentElement.classList].filter((c) => /lenis/.test(c)) : [],
      options: lenisInst
        ? { lerp: o.lerp, duration: o.duration, smoothWheel: o.smoothWheel, orientation: o.orientation, gestureOrientation: o.gestureOrientation, wheelMultiplier: o.wheelMultiplier, touchMultiplier: o.touchMultiplier, syncTouch: o.syncTouch, infinite: o.infinite, autoRaf: o.autoRaf, easing: cleanEasing(o.easing) }
        : null,
      note: lenisInst ? undefined : 'Lenis detected from class/global but no instance reachable; options unknown',
    });
  }

  // ---------- other libraries (globals + DOM markers)
  if (has(window.LocomotiveScroll) || document.querySelector('[data-scroll-container]') || document.documentElement.classList.contains('has-scroll-smooth')) found('locomotive', { global: has(window.LocomotiveScroll), container: !!document.querySelector('[data-scroll-container]') });
  const framerEls = document.querySelectorAll('[data-framer-name],[data-framer-component-type],[data-framer-appear-id]');
  if (framerEls.length || document.querySelector('meta[name=generator][content*=Framer i]') || has(window.__framer_importFromPackage)) found('framer', { elements: framerEls.length, appearAnimations: document.querySelectorAll('[data-framer-appear-id]').length });
  if (document.documentElement.hasAttribute('data-wf-page') || has(window.Webflow)) {
    const info = { page: document.documentElement.getAttribute('data-wf-page'), site: document.documentElement.getAttribute('data-wf-site'), interactionElements: document.querySelectorAll('[data-w-id]').length };
    try {
      const ix = window.Webflow.require('ix2');
      const data = ix.store && ix.store.getState().ixData;
      if (data) info.ix2 = { events: Object.keys(data.events || {}).length, actionLists: Object.keys(data.actionLists || {}).length };
    } catch {}
    found('webflow', info);
  }
  if (has(window.THREE) || has(window.__THREE__)) found('three', { revision: (window.THREE && window.THREE.REVISION) || window.__THREE__ });
  const lottieEls = document.querySelectorAll('lottie-player,dotlottie-player,dotlottie-wc,lottie-web');
  if (has(window.lottie) || has(window.bodymovin) || lottieEls.length) found('lottie', { elements: lottieEls.length, global: has(window.lottie) || has(window.bodymovin) });
  if (has(window.rive) || has(window.Rive)) found('rive', { global: true });
  if (document.querySelector('spline-viewer') || document.querySelector('[data-spline-url]')) found('spline', { viewers: document.querySelectorAll('spline-viewer').length });
  const swipers = document.querySelectorAll('.swiper');
  if (has(window.Swiper) || swipers.length) found('swiper', { instances: [...swipers].filter((s) => s.swiper).length, elements: swipers.length });
  const splitEls = document.querySelectorAll('[data-splitting],.splitting,[data-split-text],[class*="split-"] ,[aria-label][class*=split]');
  const charSpans = [...document.querySelectorAll('span,div')].filter((e) => /(^|[\s_-])(char|chars|word|words)($|[\s_-])/i.test(e.className && e.className.baseVal === undefined ? e.className : '')).length;
  if (has(window.Splitting) || has(window.SplitType) || has(window.SplitText) || splitEls.length || charSpans > 3) found('splitting', { globals: ['Splitting', 'SplitType', 'SplitText'].filter((n) => has(window[n])), charOrWordSpans: charSpans });
  if (has(window.barba) || document.querySelector('[data-barba]')) found('barba', {});
  if (has(window.swup) || document.querySelector('#swup,[data-swup]')) found('swup', {});
  if (document.querySelector('[data-taxi]') || has(window.taxi)) found('taxi', {});
  if (document.querySelector('[data-router-view]')) found('highway', {});
  if (has(window.__NEXT_DATA__) || document.getElementById('__next')) found('nextjs', { buildId: window.__NEXT_DATA__ && window.__NEXT_DATA__.buildId, router: !!window.next });
  if (has(window.__NUXT__) || document.getElementById('__nuxt')) found('nuxt', {});
  if (document.querySelector('astro-island') || document.querySelector('meta[name=generator][content*=Astro i]')) found('astro', {});
  if (has(window.Shopify)) found('shopify', { theme: window.Shopify.theme && window.Shopify.theme.name });

  // ---------- canvases / media
  R.canvases = [...document.querySelectorAll('canvas')].map((c) => {
    const r = c.getBoundingClientRect();
    return { selector: sel(c), context: c.__ctxType || 'unknown', width: c.width, height: c.height, cssWidth: Math.round(r.width), cssHeight: Math.round(r.height) };
  });
  R.videos = [...document.querySelectorAll('video')].map((v) => ({ selector: sel(v), src: v.currentSrc || v.src || null, autoplay: v.autoplay, muted: v.muted, loop: v.loop, playsInline: v.playsInline, paused: v.paused, duration: v.duration, videoWidth: v.videoWidth, videoHeight: v.videoHeight }));

  // ---------- getAnimations
  const animType = (a) => (typeof CSSAnimation !== 'undefined' && a instanceof CSSAnimation ? 'CSSAnimation' : typeof CSSTransition !== 'undefined' && a instanceof CSSTransition ? 'CSSTransition' : 'WAAPI');
  R.animations = document
    .getAnimations()
    .slice(0, 250)
    .map((a) => {
      const e = a.effect;
      const t = e && e.getTiming ? e.getTiming() : {};
      const type = animType(a);
      let keyframes = [];
      try {
        keyframes = e.getKeyframes().slice(0, 12);
      } catch {}
      return {
        type,
        name: a.animationName || a.transitionProperty || a.id || null,
        target: e && e.target ? sel(e.target) + (e.pseudoElement || '') : null,
        duration: typeof t.duration === 'number' ? t.duration : String(t.duration),
        delay: t.delay,
        easing: t.easing,
        iterations: t.iterations === Infinity ? 'infinite' : t.iterations,
        direction: t.direction,
        fill: t.fill,
        playState: a.playState,
        keyframes,
      };
    });

  // ---------- design tokens
  const toHex = (c) => {
    const m = /rgba?\(([^)]+)\)/.exec(c);
    if (!m) return null;
    const [r, gg, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    if (a === 0) return null;
    return '#' + [r, gg, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  };
  const tally = (map, key, w) => map.set(key, (map.get(key) || 0) + w);
  const bgMap = new Map();
  const fgMap = new Map();
  const radii = new Map();
  const maxWidths = new Map();
  const sizes = new Map();
  const families = new Map();
  let count = 0;
  let largestText = null;
  const vw = innerWidth;
  const vh = innerHeight;
  for (const el of document.body.querySelectorAll('*')) {
    if (++count > 3000) break;
    if (el.closest('svg') && el.tagName !== 'svg') continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const area = Math.min(r.width, vw * 2) * Math.min(r.height, vh * 3);
    const bg = toHex(cs.backgroundColor);
    if (bg) tally(bgMap, bg, area);
    const radius = cs.borderTopLeftRadius;
    if (radius && radius !== '0px') tally(radii, radius, 1);
    if (cs.maxWidth !== 'none' && cs.maxWidth.endsWith('px')) tally(maxWidths, cs.maxWidth, 1);
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (hasText) {
      const len = el.textContent.trim().length;
      const fs = parseFloat(cs.fontSize);
      const fg = toHex(cs.color);
      if (fg) tally(fgMap, fg, len * fs);
      tally(sizes, cs.fontSize, len);
      tally(families, cs.fontFamily, len);
      if (r.top < vh && r.bottom > 0 && r.left < vw && (!largestText || fs > largestText.fontSizePx)) largestText = { fontSizePx: fs, selector: sel(el), text: el.textContent.trim().slice(0, 50), fontFamily: cs.fontFamily, fontWeight: cs.fontWeight, lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, color: toHex(cs.color) };
    }
  }
  const top = (map, n) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
  const typo = {};
  for (const s of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'button', 'li', 'label']) {
    const el = [...document.querySelectorAll(s)].find((e) => e.textContent.trim() && e.getBoundingClientRect().width > 0);
    if (!el) continue;
    const cs = getComputedStyle(el);
    typo[s] = { sample: el.textContent.trim().slice(0, 40), fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, textTransform: cs.textTransform, color: toHex(cs.color) };
  }
  // stylesheet scan: custom properties, clamp()/viewport units, blocked cross-origin sheets
  const rootVars = {};
  let blocked = 0;
  let cssText = '';
  const walkRules = (rules) => {
    for (const rule of rules) {
      if (rule.selectorText && /(^|,)\s*(:root|html)\s*(,|$)/.test(rule.selectorText)) {
        for (const p of rule.style) if (p.startsWith('--')) rootVars[p] = rule.style.getPropertyValue(p).trim();
      }
      if (rule.cssRules) walkRules(rule.cssRules);
      if (rule.cssText) cssText += rule.cssText;
    }
  };
  for (const sheet of document.styleSheets) {
    try {
      walkRules(sheet.cssRules);
    } catch {
      blocked++;
    }
  }
  const countRe = (re) => (cssText.match(re) || []).length;
  const html = getComputedStyle(document.documentElement);
  const sections = landmarks.map((l, i) => {
    const cs = getComputedStyle(l.el);
    let bgEl = l.el;
    let bg = toHex(getComputedStyle(bgEl).backgroundColor);
    while (!bg && bgEl.parentElement) {
      bgEl = bgEl.parentElement;
      bg = toHex(getComputedStyle(bgEl).backgroundColor);
    }
    return { index: i, tag: l.el.tagName.toLowerCase(), selector: sel(l.el), label: cap.label(l.el), top: l.top, height: l.height, heightVh: +(l.height / vh).toFixed(2), background: bg, position: cs.position };
  });
  R.tokens = {
    fonts: {
      loadedFaces: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => ({ family: f.family.replace(/["']/g, ''), weight: f.weight, style: f.style })),
      familiesByUsage: top(families, 5).map(([family, chars]) => ({ family, chars })),
      elements: typo,
      largestOnFirstScreen: largestText,
    },
    typeScalePx: top(sizes, 40).map(([s, n]) => [parseFloat(s), n]).sort((a, b) => a[0] - b[0]).map(([px, chars]) => ({ px, chars })),
    colors: { backgroundsByArea: top(bgMap, 10).map(([hex, area]) => ({ hex, area: Math.round(area) })), textByWeight: top(fgMap, 8).map(([hex, weight]) => ({ hex, weight: Math.round(weight) })), sectionBackgrounds: sections.map((s) => ({ section: s.label, hex: s.background })) },
    borderRadii: top(radii, 8).map(([value, count]) => ({ value, count })),
    containerMaxWidths: top(maxWidths, 6).map(([value, count]) => ({ value, count })),
    customProperties: rootVars,
    scrollSnap: [...document.querySelectorAll('html,body,main,section,div')].filter((e) => getComputedStyle(e).scrollSnapType !== 'none').slice(0, 10).map((e) => ({ selector: sel(e), type: getComputedStyle(e).scrollSnapType })),
    scrollBehavior: { html: html.scrollBehavior, body: getComputedStyle(document.body).scrollBehavior },
    cssUsage: { clamp: countRe(/clamp\(/g), vw: countRe(/\d(vw)\b/g), vh: countRe(/\d(vh|svh|dvh|lvh)\b/g), blockedCrossOriginSheets: blocked, sheetsReadable: document.styleSheets.length - blocked },
  };

  // ---------- page meta + outline
  const meta = (n) => (document.querySelector(`meta[name="${n}"],meta[property="${n}"]`) || {}).content || null;
  R.page = {
    url: location.href,
    title: document.title,
    description: meta('description'),
    og: { title: meta('og:title'), description: meta('og:description'), image: meta('og:image'), type: meta('og:type') },
    lang: document.documentElement.lang || null,
    domNodes: document.getElementsByTagName('*').length,
    docHeight: cap.scrollHeight(),
    viewport: { width: vw, height: vh },
    sections,
  };
  return R;
}

export async function runProbe(run) {
  const outFile = path.join(run.dir, 'probe.json');
  const net = [];
  const scriptBodies = [];
  const jsonBodies = [];
  const onResponse = (res) => {
    const req = res.request();
    const headers = res.headers();
    const entry = { url: res.url().slice(0, 300), type: req.resourceType(), status: res.status(), mime: (headers['content-type'] || '').split(';')[0], bytes: Number(headers['content-length']) || null };
    net.push(entry);
    if (entry.type === 'script' && scriptBodies.length < 60) scriptBodies.push(res);
    else if (/json/.test(entry.mime) && jsonBodies.length < 15) jsonBodies.push(res);
  };
  const s = await openPage(run, { hooks: true, label: 'probe', onResponse });
  try {
    const { page } = s;
    await s.waitIntro();
    run.shared.botWall = await detectBotWall(page);
    const scroller = await s.initScroller();
    log('probe', 'introspecting page');
    const snapshot = () => page.evaluate(inPage);
    const result = await snapshot();

    // Second sample mid-scroll: scroll-triggered CSS animations / ScrollTrigger measurements differ from page-load state.
    const st0 = await scroller.state();
    await scroller.flick(Math.min(st0.vh * 2.5, Math.max(0, st0.h / 2 - st0.vh)), { parts: 20, ms: 600 });
    await scroller.waitIdle({ timeout: 2500 });
    const mid = await page.evaluate(() => ({
      y: Math.round(window.__cap.scrollTop()),
      animations: document.getAnimations().slice(0, 250).map((a) => ({ type: typeof CSSAnimation !== 'undefined' && a instanceof CSSAnimation ? 'CSSAnimation' : typeof CSSTransition !== 'undefined' && a instanceof CSSTransition ? 'CSSTransition' : 'WAAPI', name: a.animationName || a.transitionProperty || a.id || null, target: a.effect && a.effect.target ? window.__cap.sel(a.effect.target) : null, duration: a.effect.getTiming().duration, easing: a.effect.getTiming().easing, playState: a.playState })),
      activeScrollTriggers: window.ScrollTrigger ? window.ScrollTrigger.getAll().filter((t) => t.isActive).map((t) => window.__cap.sel(t.trigger)) : null,
    }));
    const hookData = await page.evaluate(() => ({ tweens: window.__cap.tweens, waapi: window.__cap.waapi, plugins: window.__cap.plugins, nav: window.__cap.nav, tweensLostToCap: window.__cap.tweens.length >= 800 }));
    await sleep(100);

    // Network-side fingerprints (works for bundled / global-less builds).
    const fp = {};
    for (const [name, f] of Object.entries(FINGERPRINTS)) {
      const hits = net.filter((n) => f.url.test(n.url)).map((n) => n.url);
      if (hits.length) fp[name] = { via: 'network', evidence: hits.slice(0, 3) };
    }
    for (const res of scriptBodies) {
      let text = '';
      try {
        text = (await res.text()).slice(0, 3_000_000);
      } catch {
        continue;
      }
      for (const [name, f] of Object.entries(FINGERPRINTS)) {
        if (f.text.test(text)) {
          fp[name] = fp[name] || { via: 'bundle fingerprint', evidence: [] };
          if (fp[name].evidence.length < 3) fp[name].evidence.push(res.url().slice(0, 200));
          if (fp[name].via === 'network') fp[name].via = 'network+bundle fingerprint';
        }
      }
    }
    const lottieJson = [];
    for (const res of jsonBodies) {
      try {
        const t = (await res.text()).slice(0, 400000);
        if (/"layers"\s*:/.test(t) && /"fr"\s*:/.test(t) && /"op"\s*:/.test(t)) lottieJson.push(res.url());
      } catch {}
    }
    if (lottieJson.length) fp.lottie = { via: 'network (lottie JSON body)', evidence: lottieJson };

    const libraries = {};
    for (const [name, info] of Object.entries(result.libs)) libraries[name] = { detected: true, ...info, via: ['global', ...(fp[name] ? [fp[name].via] : [])] };
    for (const [name, f] of Object.entries(fp)) {
      if (libraries[name]) continue;
      libraries[name] = { detected: true, via: [f.via], evidence: f.evidence, note: f.via.includes('bundle') ? 'detected via bundle fingerprint (no global) - runtime details unavailable' : 'detected via network request URL only' };
    }

    const groups = { scripts: [], styles: [], fonts: [], images: [], video: [], lottieJson: [], wasm: [], models3d: [], other: [] };
    for (const n of net) {
      const u = n.url.split('?')[0];
      if (/\.(glb|gltf|splinecode|usdz|obj|fbx)$/i.test(u)) groups.models3d.push(n);
      else if (/\.wasm$/i.test(u)) groups.wasm.push(n);
      else if (/\.(lottie|riv)$/i.test(u) || lottieJson.includes(n.url)) groups.lottieJson.push(n);
      else if (n.type === 'script') groups.scripts.push(n);
      else if (n.type === 'stylesheet') groups.styles.push(n);
      else if (n.type === 'font') groups.fonts.push(n);
      else if (n.type === 'image') groups.images.push(n);
      else if (n.type === 'media' || /\.(mp4|webm|m3u8)$/i.test(u)) groups.video.push(n);
      else groups.other.push(n);
    }

    const out = {
      url: run.url,
      profile: run.profile.name,
      capturedAt: new Date().toISOString(),
      botWall: run.shared.botWall,
      scroller: scroller.info,
      ...result,
      libraries,
      midScroll: mid,
      creationHooks: {
        note: 'Recorded at creation time by init-script hooks, so tweens that already finished before the probe are included. Only works when gsap is exposed as window.gsap.',
        gsapTweens: hookData.tweens,
        gsapPluginsRegistered: hookData.plugins,
        waapi: hookData.waapi,
        historyCalls: hookData.nav,
        truncated: hookData.tweensLostToCap,
      },
      network: {
        totals: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, { count: v.length, bytes: v.reduce((a, b) => a + (b.bytes || 0), 0) }])),
        groups,
        totalRequests: net.length,
      },
    };
    writeJson(outFile, out);
    log('probe', `libraries: ${Object.keys(libraries).join(', ') || 'none'}; ${out.animations.length} live animations; ${net.length} requests`);
    return out;
  } finally {
    await s.close();
  }
}
