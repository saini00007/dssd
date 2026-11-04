"use client";
import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "./gsap";
import { marginFor, revealOnView } from "./entrance";
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
  /** Reveal line. Default "top 80%" (only "top N%" is supported). */
  start?: string;
  /**
   * The content sits in the first viewport. Server HTML is visible straight away on a hard load (no entrance); the
   * entrance only plays under the home loader and after a client-side navigation.
   */
  lcp?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

/**
 * Fades and slides content up when it scrolls into view (dur.roast, ease.roast). Content is in the SSR HTML.
 * One shared IntersectionObserver drives it (no ScrollTrigger per element); no inline styles exist until it plays.
 */
export function Reveal({
  as: Tag = "div",
  children,
  y = 40,
  x = 0,
  delay = 0,
  stagger,
  duration = dur.roast,
  start = reveal.start,
  lcp,
  className,
  style,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const kids = stagger != null;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(mq.reduce, () => {
        el.setAttribute("data-yb-ready", "");
      });
      mm.add(mq.motion, () => {
        let tween: gsap.core.Tween | null = null;
        const stop = revealOnView(el, {
          lcp,
          margin: marginFor(start),
          play: (instant) => {
            if (instant) {
              el.setAttribute("data-yb-ready", "");
              return;
            }
            tween = gsap.fromTo(
              kids ? Array.from(el.children) : el,
              { opacity: 0, y, x },
              { opacity: 1, y: 0, x: 0, duration, delay, ease: ease.roast, stagger: stagger ?? 0, clearProps: "transform,opacity" },
            );
            el.setAttribute("data-yb-ready", "");
          },
        });
        return () => {
          stop();
          tween?.revert();
        };
      });
    },
    { scope: ref, dependencies: [y, x, delay, stagger, duration, start, lcp] },
  );

  return (
    <Tag ref={ref} id={id} className={className} style={style} data-yb-anim={`${lcp ? "lcp" : ""}${lcp && kids ? "-" : ""}${kids ? "children" : ""}`}>
      {children}
    </Tag>
  );
}
