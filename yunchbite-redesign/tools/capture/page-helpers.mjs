// Scripts injected into every page BEFORE any site code runs (context.addInitScript).
//
//  - helpersScript: side-effect free utilities shared by all passes (window.__cap.*).
//  - hooksScript:   recording hooks (gsap, Element.animate, Lenis, canvas contexts,
//                   history). Probe pass only, because hooks change prototypes.
//
// They are written as real functions and serialised with toString() so they get
// syntax checking and editor support; they must stay self-contained.

function helpers() {
  if (window.__cap) return;
  const cap = (window.__cap = { tweens: [], waapi: [], plugins: [], lenis: [], nav: [], t0: performance.now() });

  /** Short, human-readable CSS-ish selector for an element (or a label for non-elements). */
  cap.sel = (el) => {
    if (el === window) return 'window';
    if (el === document) return 'document';
    if (!el || el.nodeType !== 1) return el && el.constructor ? el.constructor.name : typeof el;
    const tag = el.tagName.toLowerCase();
    if (el.id && /^[A-Za-z][\w-]*$/.test(el.id)) return `${tag}#${el.id}`;
    const cls = [...el.classList].filter((c) => c.length < 40 && !/^\d/.test(c)).slice(0, 3);
    if (cls.length) return `${tag}.${cls.map((c) => CSS.escape(c)).join('.')}`;
    const parent = el.parentElement;
    if (!parent || parent === document.body) return tag;
    const same = [...parent.children].filter((c) => c.tagName === el.tagName);
    return `${cap.sel(parent)} > ${tag}${same.length > 1 ? `:nth-of-type(${same.indexOf(el) + 1})` : ''}`;
  };

  /** The element marked as the scroll container by the scroll pass (null = window scrolls). */
  cap.scrollEl = () => document.querySelector('[data-cap-scroller]');
  cap.scrollTop = () => {
    const s = cap.scrollEl();
    return s ? s.scrollTop : window.pageYOffset;
  };
  cap.scrollHeight = () => {
    const s = cap.scrollEl();
    return s ? s.scrollHeight : Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
  };

  /** Jump to the top without animation (library-aware); used only for passes that are not recording motion. */
  cap.toTop = () => {
    const l = window.lenis;
    if (l && typeof l.scrollTo === 'function') l.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    const s = cap.scrollEl();
    if (s) s.scrollTop = 0;
  };

  const skipTags = new Set(['SCRIPT', 'STYLE', 'LINK', 'TEMPLATE', 'NOSCRIPT', 'META']);
  const visibleKids = (root) =>
    [...root.children].filter((el) => {
      if (skipTags.has(el.tagName)) return false;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.position === 'fixed') return false;
      const r = el.getBoundingClientRect();
      return r.height > 30 && r.width > 30;
    });

  /**
   * Top-level page sections ("landmarks"): children of <main> (or body), descending through
   * single wrapper elements, e.g. #__next > div > sections. Returns elements with doc-space top.
   */
  cap.landmarks = () => {
    let root = document.querySelector('main') || document.body;
    let kids = visibleKids(root);
    // descend through wrapper elements (#root > div.app > sections) until a level with several sections
    for (let i = 0; i < 5 && kids.length > 0 && kids.length < 3; i++) {
      const big = kids.reduce((a, b) => (b.getBoundingClientRect().height > a.getBoundingClientRect().height ? b : a));
      const nk = visibleKids(big);
      if (nk.length === 0 || (kids.length === 2 && nk.length < 3)) break;
      kids = nk;
    }
    if (root !== document.body) {
      kids = [...visibleKids(document.body).filter((el) => el !== root && /^(HEADER|FOOTER)$/.test(el.tagName) && !kids.includes(el) && !root.contains(el)), ...kids];
    }
    const st = cap.scrollTop();
    const base = cap.scrollEl() ? cap.scrollEl().getBoundingClientRect().top : 0;
    return kids
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { el, top: Math.round(r.top - base + st), height: Math.round(r.height) };
      })
      .sort((a, b) => a.top - b.top);
  };

  /** Heading-based label for a landmark: tag#id.class "Heading text". */
  cap.label = (el) => {
    let core = el;
    while (core.children.length === 1 && /spacer|wrapper/i.test(core.className || '')) core = core.firstElementChild;
    const h = core.querySelector('h1,h2,h3,[role=heading]');
    const text = (h ? h.textContent : core.getAttribute('aria-label') || core.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 48);
    return cap.sel(core).replace(/ > .*$/, '') + (text ? ` "${text}"` : '');
  };

  /** Which landmark covers the viewport centre right now. */
  cap.inView = () => {
    const lm = cap.landmarks();
    const mid = innerHeight / 2;
    const hit = lm.find((l) => {
      const r = l.el.getBoundingClientRect();
      return r.top <= mid && r.bottom > mid;
    });
    return hit ? cap.label(hit.el) : null;
  };

  /** Selectors of rules using :hover, scanning same-origin sheets (cross-origin ones are counted). */
  cap.hoverRules = () => {
    const selectors = new Set();
    let blocked = 0;
    const walk = (rules) => {
      for (const rule of rules) {
        if (rule.selectorText && rule.selectorText.includes(':hover')) selectors.add(rule.selectorText);
        if (rule.cssRules) walk(rule.cssRules);
      }
    };
    for (const sheet of document.styleSheets) {
      try {
        walk(sheet.cssRules);
      } catch {
        blocked++;
      }
    }
    return { selectors: [...selectors], blockedSheets: blocked };
  };
}

function hooks() {
  const cap = window.__cap;
  const now = () => Math.round(performance.now() - cap.t0);
  const arr = (v) => (v == null ? [] : Array.isArray(v) || v instanceof NodeList ? [...v] : [v]);
  const push = (list, item, max = 800) => {
    if (list.length < max) list.push(item);
  };

  // ---- gsap: captured when the library assigns window.gsap (UMD/script-tag builds)
  const VAR_SKIP = new Set(['ease', 'duration', 'delay', 'stagger', 'repeat', 'yoyo', 'repeatDelay', 'scrollTrigger', 'paused', 'overwrite', 'immediateRender', 'id', 'data', 'lazy', 'startAt', 'runBackwards', 'keyframes', 'defaults']);
  function describe(method, a, inTimeline) {
    const g = window.gsap;
    const [targets, v1, v2] = a;
    const vars = (method === 'fromTo' ? v2 : v1) || {};
    const from = method === 'fromTo' ? v1 : null;
    let els = [];
    try {
      els = g.utils.toArray(targets);
    } catch {
      els = arr(targets);
    }
    const stagger = vars.stagger;
    return {
      method,
      inTimeline,
      t: now(),
      targets: els.slice(0, 4).map(cap.sel),
      nTargets: els.length,
      duration: vars.duration ?? 0.5,
      delay: vars.delay ?? 0,
      ease: typeof vars.ease === 'string' ? vars.ease : vars.ease ? 'custom function' : 'power1.out',
      stagger: stagger && typeof stagger === 'object' ? stagger.each ?? stagger.amount : stagger ?? null,
      repeat: vars.repeat ?? 0,
      yoyo: !!vars.yoyo,
      props: Object.keys(vars).filter((k) => !VAR_SKIP.has(k) && !/^on[A-Z]/.test(k)),
      fromProps: from ? Object.keys(from).filter((k) => !VAR_SKIP.has(k)) : null,
      scrollTrigger: !!vars.scrollTrigger,
    };
  }
  function hookGsap(g) {
    if (!g || g.__capHooked || typeof g.to !== 'function') return;
    g.__capHooked = true;
    for (const m of ['to', 'from', 'fromTo']) {
      const orig = g[m];
      g[m] = function (...a) {
        const r = orig.apply(this, a);
        try {
          push(cap.tweens, describe(m, a, false));
        } catch {}
        return r;
      };
    }
    try {
      const probe = g.timeline();
      const proto = Object.getPrototypeOf(probe);
      probe.kill();
      for (const m of ['to', 'from', 'fromTo']) {
        const orig = proto[m];
        proto[m] = function (...a) {
          const r = orig.apply(this, a);
          try {
            push(cap.tweens, describe(m, a, true));
          } catch {}
          return r;
        };
      }
    } catch {}
    const reg = g.registerPlugin;
    g.registerPlugin = function (...plugins) {
      plugins.forEach((p) => push(cap.plugins, (p && (p.name || (p.constructor && p.constructor.name))) || 'unknown', 60));
      return reg.apply(this, plugins);
    };
  }
  let gsapRef;
  try {
    Object.defineProperty(window, 'gsap', {
      configurable: true,
      enumerable: true,
      get: () => gsapRef,
      set: (v) => {
        gsapRef = v;
        try {
          hookGsap(v);
        } catch {}
      },
    });
  } catch {}

  // ---- Lenis: wrap the constructor so instances kept in module scope are still found
  let lenisCtor;
  try {
    Object.defineProperty(window, 'Lenis', {
      configurable: true,
      enumerable: true,
      get: () => lenisCtor,
      set: (v) => {
        lenisCtor =
          typeof v === 'function'
            ? new Proxy(v, {
                construct(target, args, nt) {
                  const inst = Reflect.construct(target, args, nt);
                  cap.lenis.push(inst);
                  return inst;
                },
              })
            : v;
      },
    });
  } catch {}

  // ---- WAAPI: Element.animate
  const origAnimate = Element.prototype.animate;
  Element.prototype.animate = function (keyframes, options) {
    const anim = origAnimate.apply(this, arguments);
    try {
      const o = typeof options === 'number' ? { duration: options } : options || {};
      push(cap.waapi, {
        t: now(),
        target: cap.sel(this),
        duration: o.duration ?? 0,
        delay: o.delay ?? 0,
        easing: o.easing || 'linear',
        iterations: o.iterations ?? 1,
        direction: o.direction || 'normal',
        fill: o.fill || 'none',
        keyframes: anim.effect.getKeyframes().slice(0, 12),
      });
    } catch {}
    return anim;
  };

  // ---- canvas contexts (cannot be queried afterwards without hijacking the canvas)
  const origGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const ctx = origGetContext.call(this, type, ...rest);
    if (ctx && !this.__ctxType) this.__ctxType = type;
    return ctx;
  };

  // ---- history (SPA navigation)
  for (const m of ['pushState', 'replaceState']) {
    const orig = history[m];
    history[m] = function (state, title, url) {
      push(cap.nav, { type: m, url: url == null ? null : String(url), t: now() }, 100);
      return orig.apply(this, arguments);
    };
  }
}

export const helpersScript = `(${helpers})();`;
export const hooksScript = `(${hooks})();`;
