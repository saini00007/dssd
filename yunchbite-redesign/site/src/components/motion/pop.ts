"use client";
import { gsap } from "./gsap";
import { dur, ease } from "@/lib/tokens";

/** Imperative character pop: scale up from `from` with the crunch overshoot. No-op under reduced motion (just shows). */
export function popElement(el: Element | null | undefined, opts: { from?: number; delay?: number; y?: number } = {}) {
  if (!el) return null;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    gsap.set(el, { opacity: 1, scale: 1, y: 0 });
    return null;
  }
  return gsap.fromTo(
    el,
    { scale: opts.from ?? 0.55, opacity: 0, y: opts.y ?? 12, transformOrigin: "50% 100%" },
    { scale: 1, opacity: 1, y: 0, duration: dur.pop + 0.1, delay: opts.delay ?? 0, ease: ease.crunch, overwrite: "auto" },
  );
}
