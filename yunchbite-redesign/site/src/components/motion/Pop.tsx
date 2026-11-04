"use client";
import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "./gsap";
import { revealOnView } from "./entrance";
import { dur, ease, mq } from "@/lib/tokens";

export interface PopProps {
  as?: ElementType;
  children: ReactNode;
  delay?: number;
  /** Start scale (default 0.6). */
  from?: number;
  /** "scroll" (default) pops on entering the viewport; "load" is a first-viewport pop (implies `lcp`). */
  trigger?: "scroll" | "load";
  /** In the first viewport: visible on a hard load, pops only under the loader / after a client-side navigation. */
  lcp?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Scale 0.6 -> 1 with the crunch overshoot (dur.pop). Driven by a shared IntersectionObserver. */
export function Pop({ as: Tag = "div", children, delay = 0, from = 0.6, trigger = "scroll", lcp, className, style }: PopProps) {
  const ref = useRef<HTMLElement>(null);
  const hero = lcp || trigger === "load";

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(mq.reduce, () => el.setAttribute("data-yb-ready", ""));
      mm.add(mq.motion, () => {
        let tween: gsap.core.Tween | null = null;
        const stop = revealOnView(el, {
          lcp: hero,
          play: (instant) => {
            if (instant) {
              el.setAttribute("data-yb-ready", "");
              return;
            }
            tween = gsap.fromTo(el, { scale: from, opacity: 0 }, { scale: 1, opacity: 1, duration: dur.pop, delay, ease: ease.crunch, clearProps: "transform,opacity" });
            el.setAttribute("data-yb-ready", "");
          },
        });
        return () => {
          stop();
          tween?.revert();
        };
      });
    },
    { scope: ref, dependencies: [delay, from, hero] },
  );

  return (
    <Tag ref={ref} className={className} style={style} data-yb-anim={hero ? "lcp" : ""}>
      {children}
    </Tag>
  );
}
