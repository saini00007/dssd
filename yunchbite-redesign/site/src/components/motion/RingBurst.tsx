"use client";
import { useImperativeHandle, useRef, type Ref } from "react";
import { gsap, useGSAP } from "./gsap";

export interface RingBurstHandle {
  /** Plays the ring: expands and thins (~450 ms). */
  burst: () => void;
}

export interface RingBurstProps {
  /** Ring colour (usually the flavour colour). */
  color: string;
  className?: string;
  ref?: Ref<RingBurstHandle>;
}

/**
 * A ring that expands and thins out. Absolutely positioned: place it in a `relative` parent and size it with className
 * (default: centred, 150% of the parent). Call `ref.current.burst()`.
 */
export function RingBurst({ color, className, ref }: RingBurstProps) {
  const root = useRef<SVGSVGElement>(null);
  const c1 = useRef<SVGCircleElement>(null);
  const c2 = useRef<SVGCircleElement>(null);
  const { contextSafe } = useGSAP({ scope: root });

  const play = contextSafe(() => {
        gsap.fromTo(
          c1.current,
          { attr: { r: 20, "stroke-width": 9 }, opacity: 1 },
          { attr: { r: 49, "stroke-width": 0.4 }, opacity: 0, duration: 0.55, ease: "expo.out", overwrite: true },
        );
        gsap.fromTo(
          c2.current,
          { attr: { r: 16, "stroke-width": 5 }, opacity: 0.8 },
          { attr: { r: 40, "stroke-width": 0.3 }, opacity: 0, duration: 0.5, delay: 0.07, ease: "expo.out", overwrite: true },
        );
  });

  useImperativeHandle(ref, () => ({
    burst() {
      if (!c1.current || !c2.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      play();
    },
  }));

  return (
    <svg
      ref={root}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      className={className ?? "pointer-events-none absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 overflow-visible"}
    >
      <circle ref={c1} cx="50" cy="50" r="20" fill="none" stroke={color} strokeWidth="9" opacity="0" />
      <circle ref={c2} cx="50" cy="50" r="16" fill="none" stroke={color} strokeWidth="5" opacity="0" />
    </svg>
  );
}
