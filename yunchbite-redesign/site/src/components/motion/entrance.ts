"use client";
// Entrance policy + lazy-setup helpers shared by the motion primitives and the section components.
//
//  - LCP-safe entrances: on a hard load (no first-visit loader, no client navigation yet) nothing in the first viewport
//    is hidden or animated, so the browser paints real content straight from the server HTML. Entrances run only
//    under the home loader (`html[data-yb-loader]`) and after a client-side navigation (`html[data-yb-softnav]`),
//    where the curtain covers the page anyway. CSS (globals.css) hides `[data-yb-anim]` only in those two modes.
//  - Lazy setup: below-the-fold reveals use one shared IntersectionObserver instead of a ScrollTrigger per element,
//    and scrubbed / pinned sections build their ScrollTriggers in idle time after first paint (`defer`), with a single
//    `ScrollTrigger.refresh()` once the batch is done.
import { ScrollTrigger } from "./gsap";
import { whenLoaderDone } from "./loader-gate";

/** True while entrances should play (home loader showing/leaving, or after the first client navigation). */
export function entranceOn(): boolean {
  if (typeof document === "undefined") return false;
  const d = document.documentElement;
  return d.hasAttribute("data-yb-loader") || d.hasAttribute("data-yb-softnav");
}

/** Marks the document as soft-navigated (called by SmoothScroll when the pathname changes). */
export function markSoftNav() {
  if (typeof document !== "undefined") document.documentElement.setAttribute("data-yb-softnav", "");
}

// ------------------------------------------------------------------------------------------------------------------
// Shared IntersectionObserver registry (one observer per rootMargin).
// ------------------------------------------------------------------------------------------------------------------
type Cb = (entry: IntersectionObserverEntry) => void;
const observers = new Map<string, { io: IntersectionObserver; cbs: Map<Element, Cb> }>();

/** Observes `el`; `cb` runs for every intersection change. Returns an unobserve function. */
export function observe(el: Element, margin: string, cb: Cb): () => void {
  let o = observers.get(margin);
  if (!o) {
    const cbs = new Map<Element, Cb>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) cbs.get(e.target)?.(e);
      },
      { rootMargin: margin },
    );
    o = { io, cbs };
    observers.set(margin, o);
  }
  const { io, cbs } = o;
  cbs.set(el, cb);
  io.observe(el);
  return () => {
    if (cbs.get(el) === cb) {
      cbs.delete(el);
      io.unobserve(el);
    }
  };
}

/** "top 80%" -> rootMargin that fires when the element's top crosses 80% of the viewport height. */
export function marginFor(start: string | undefined): string {
  const m = /^top\s+(\d+(?:\.\d+)?)%$/.exec(start ?? "top 80%");
  const pct = m ? Number(m[1]) : 80;
  return `0px 0px -${Math.max(0, 100 - pct)}% 0px`;
}

export interface ViewRevealOptions {
  /** The element is in the first viewport by construction (hero): never wait for scrolling. */
  lcp?: boolean;
  /** rootMargin for the reveal line (default top 80%). */
  margin?: string;
  /**
   * Called when the element should reveal. `instant` = the element is already behind the reader (scrolled past or
   * restored mid-page) or is part of the static first paint: show the final state with no animation.
   * Must set `data-yb-ready=""` on the element (directly or via the tween it builds).
   */
  play: (instant: boolean) => void;
  /** Called once the element is known to be waiting below the fold (hidden until reached): start pre-work here. */
  onWait?: () => void;
}

/**
 * Reveal-on-view with the LCP-safe policy.
 *  - animate mode (loader / soft navigation): the element is held hidden (`data-yb-ready="wait"`) and `play(false)`
 *    runs when it reaches the reveal line (lcp elements: right away, after the loader).
 *  - static mode (hard load): lcp elements and anything already inside the first viewport stay visible (`play(true)`);
 *    everything below is hidden then and revealed on scroll.
 */
export function revealOnView(el: HTMLElement, { lcp, margin = "0px 0px -20% 0px", play, onWait }: ViewRevealOptions): () => void {
  if (entranceOn()) {
    el.setAttribute("data-yb-ready", "wait");
    if (lcp) return whenLoaderDone(() => play(false));
    onWait?.();
    let stop = () => {};
    stop = observe(el, margin, (e) => {
      if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
      stop();
      play(!e.isIntersecting); // above the viewport (or zero-sized): nothing to animate
    });
    return () => stop();
  }
  if (lcp) {
    play(true);
    return () => {};
  }
  let waiting = false;
  let stop = () => {};
  stop = observe(el, margin, (e) => {
    if (e.isIntersecting) {
      stop();
      play(!waiting);
      return;
    }
    const r = e.boundingClientRect;
    if (!waiting && r.height > 0 && r.top >= window.innerHeight) {
      // below the first viewport: hold it hidden until the reader gets there
      waiting = true;
      el.setAttribute("data-yb-ready", "wait");
      onWait?.();
    } else if (!waiting || r.bottom <= 0) {
      // first viewport (between the reveal line and the fold), behind the reader, or not rendered: leave it as painted
      stop();
      play(true);
    }
  });
  return () => stop();
}

// ------------------------------------------------------------------------------------------------------------------
// Idle scheduling for scrubbed / pinned setup.
// ------------------------------------------------------------------------------------------------------------------
type Job = { run: () => void | (() => void); cleanup?: void | (() => void); cancelled: boolean };
const queue: Job[] = [];
let pump = false;
let refreshTimer: number | undefined;

const idle = (cb: () => void, timeout = 1500) => {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(cb, { timeout });
  else window.setTimeout(cb, 60);
};

function drain() {
  pump = false;
  const t0 = performance.now();
  while (queue.length) {
    const job = queue.shift()!;
    if (job.cancelled) continue;
    job.cleanup = job.run();
    if (performance.now() - t0 > 12) break; // keep every task short; the rest runs in the next idle slot
  }
  if (queue.length) schedulePump();
  else scheduleRefresh();
}
function schedulePump() {
  if (pump) return;
  pump = true;
  idle(drain);
}

/** Builds ScrollTriggers after first paint, in idle time. Returns a disposer (cancels, or runs the build's cleanup). */
export function defer(run: () => void | (() => void)): () => void {
  const job: Job = { run, cancelled: false };
  queue.push(job);
  schedulePump();
  return () => {
    job.cancelled = true;
    if (typeof job.cleanup === "function") job.cleanup();
    job.cleanup = undefined;
  };
}

/** One ScrollTrigger.refresh() after the idle queue is empty (coalesces calls). */
export function scheduleRefresh(delay = 80) {
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    if (queue.length) return; // the pump will schedule it again when it finishes
    idle(() => ScrollTrigger.refresh(), 800);
  }, delay);
}

/**
 * Runs `cb` once when the element reaches the `start` line ("top 75%") or is already behind the reader.
 * IntersectionObserver based: no ScrollTrigger, no layout measurement. Returns a cancel function.
 */
export function whenInView(el: Element, start: string, cb: () => void): () => void {
  let stop = () => {};
  stop = observe(el, marginFor(start), (e) => {
    if (e.isIntersecting || (e.boundingClientRect.height > 0 && e.boundingClientRect.bottom <= 0)) {
      stop();
      cb();
    }
  });
  return () => stop();
}

/** `defer` for builds that create GSAP objects: runs inside the matchMedia context (`contextSafe`) so they are reverted with it. */
export function deferIn(safe: gsap.ContextSafeFunc | undefined, run: () => void | (() => void)): () => void {
  return defer(safe ? (safe(run) as () => void | (() => void)) : run);
}
