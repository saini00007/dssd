"use client";
import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "./gsap";
import { dur, ease, mq, reveal } from "@/lib/tokens";

export interface PopProps {
  as?: ElementType;
  children: ReactNode;
  delay?: number;
  /** Start scale (default 0.6). */
  from?: number;
  /** "scroll" (default) pops on entering the viewport; "load" pops on mount. */
  trigger?: "scroll" | "load";
  className?: string;
  style?: CSSProperties;
}

/** Scale 0.6 -> 1 with the crunch overshoot (dur.pop). */
export function Pop({ as: Tag = "div", children, delay = 0, from = 0.6, trigger = "scroll", className, style }: PopProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(mq.reduce, () => el.setAttribute("data-yb-ready", ""));
      mm.add(mq.motion, () => {
        const tween = gsap.from(el, {
          scale: from,
          opacity: 0,
          duration: dur.pop,
          delay,
          ease: ease.crunch,
          clearProps: "transform,opacity",
          ...(trigger === "scroll" ? { scrollTrigger: { trigger: el, start: reveal.start, once: true } } : {}),
        });
        el.setAttribute("data-yb-ready", "");
        return () => {
          tween.revert();
        };
      });
    },
    { scope: ref, dependencies: [delay, from, trigger] },
  );

  return (
    <Tag ref={ref} className={className} style={style} data-yb-anim="">
      {children}
    </Tag>
  );
}
