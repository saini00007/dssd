"use client";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";
import { lenis as lenisTok, mq } from "@/lib/tokens";
import { consumeNavIntent } from "@/lib/nav-intent";
import { markSoftNav, scheduleRefresh } from "./entrance";

// A tiny external store so consumers re-render when Lenis is created/destroyed.
let instance: Lenis | null = null;
const listeners = new Set<() => void>();
function setInstance(l: Lenis | null) {
  instance = l;
  listeners.forEach((fn) => fn());
}
function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** The Lenis instance, or null (touch devices, reduced motion, before mount). */
export function useLenis(): Lenis | null {
  return useSyncExternalStore(
    subscribe,
    () => instance,
    () => null,
  );
}

/** Lenis (lerp 0.1) driven by gsap.ticker; only on fine-pointer devices without reduced motion. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // First client-side navigation: entrances (loader-free) may play from now on. Set during render so it is in place
  // before the new page's effects read it (this provider renders before the page content).
  const [firstPath] = useState(pathname);
  if (typeof document !== "undefined" && firstPath !== pathname) markSoftNav();

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(`${mq.fine} and ${mq.motion}`, () => {
      const l = new Lenis({ lerp: lenisTok.lerp, anchors: true, autoRaf: false });
      const tick = (t: number) => l.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      l.on("scroll", ScrollTrigger.update);
      setInstance(l);
      return () => {
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
        l.destroy();
        setInstance(null);
      };
    });
    // Late-loading fonts change layout; make sure triggers are measured against the final layout.
    if (document.fonts?.ready) document.fonts.ready.then(() => scheduleRefresh(0));
    return () => mm.revert();
  }, []);

  // Scroll to top on link navigations (not on browser back/forward), unless there is a hash.
  useEffect(() => {
    // Layout changes with every page: re-measure triggers once the new page is in place.
    scheduleRefresh(120);
    if (!consumeNavIntent()) return;
    const hash = window.location.hash;
    const l = instance;
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        if (l) l.scrollTo(el, { offset: -(parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 80), immediate: true });
        else el.scrollIntoView();
        return;
      }
    }
    if (l) l.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    return;
  }, [pathname]);

  return <>{children}</>;
}
