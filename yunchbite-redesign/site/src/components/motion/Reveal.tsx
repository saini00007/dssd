"use client";
import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "./gsap";
import { dur, ease, mq, reveal } from "@/lib/tokens";

export interface RevealProps {
  as?: ElementType;
  children: ReactNode;
  /** Start offset in px (slides up by default). */
  y?: number;
  x?: number;
  delay?: number;
  /** When set, the direct children are revealed one after another (seconds between them). */
  stagger?: number;
  duration?: number;
  /** ScrollTrigger start. Default "top 80%". */
  start?: string;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

/** Fades and slides content up when it scrolls into view (dur.roast, ease.roast). Content is in the SSR HTML. */
export function Reveal({
  as: Tag = "div",
  children,
  y = 40,
  x = 0,
  delay = 0,
  stagger,
  duration = dur.roast,
  start = reveal.start,
  className,
  style,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const targets = stagger != null ? Array.from(el.children) : el;
      const mm = gsap.matchMedia();
      mm.add(mq.reduce, () => {
        el.setAttribute("data-yb-ready", "");
      });
      mm.add(mq.motion, () => {
        const tween = gsap.from(targets, {
          opacity: 0,
          y,
          x,
          duration,
          delay,
          ease: ease.roast,
          stagger: stagger ?? 0,
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: el, start, once: true },
        });
        el.setAttribute("data-yb-ready", "");
        return () => {
          tween.revert();
        };
      });
    },
    { scope: ref, dependencies: [y, x, delay, stagger, duration, start] },
  );

  return (
    <Tag ref={ref} id={id} className={className} style={style} data-yb-anim={stagger != null ? "children" : ""}>
      {children}
    </Tag>
  );
}
