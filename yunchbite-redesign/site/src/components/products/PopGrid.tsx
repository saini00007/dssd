"use client";
import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { marginFor, revealOnView } from "@/components/motion/entrance";
import { dur, ease, mq } from "@/lib/tokens";

/**
 * A list/grid whose direct children pop in (scale + rise, crunch ease) in batches as they scroll into view.
 * Content is in the server HTML; children are held invisible only until the effect is ready (see globals.css).
 */
export function PopGrid({ as: Tag = "ul", className, children, from = 0.84 }: { as?: ElementType; className?: string; children: ReactNode; from?: number }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(mq.reduce, () => el.setAttribute("data-yb-ready", ""));
      mm.add(mq.motion, () => {
        const items = Array.from(el.children) as HTMLElement[];
        const hold = (n: HTMLElement) => gsap.set(n, { opacity: 0, scale: from, y: 36 });
        let pending: HTMLElement[] = [];
        let raf = 0;
        const flush = () => {
          raf = 0;
          const batch = pending;
          pending = [];
          gsap.to(batch, { opacity: 1, scale: 1, y: 0, duration: dur.pop + 0.3, ease: ease.crunch, stagger: 0.07, overwrite: true, clearProps: "transform,opacity" });
        };
        // Children below the fold are held (inline) until they are reached; the ones already in the first viewport stay as painted.
        const stops = items.map((n) =>
          revealOnView(n, {
            margin: marginFor("top 90%"),
            onWait: () => hold(n),
            play: (instant) => {
              n.removeAttribute("data-yb-ready");
              if (instant) {
                gsap.set(n, { clearProps: "transform,opacity" });
                return;
              }
              pending.push(n);
              if (!raf) raf = requestAnimationFrame(flush);
            },
          }),
        );
        el.setAttribute("data-yb-ready", "");
        return () => {
          stops.forEach((s) => s());
          if (raf) cancelAnimationFrame(raf);
          gsap.killTweensOf(items);
          gsap.set(items, { clearProps: "transform,opacity" });
        };
      });
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={className} data-yb-anim="children">
      {children}
    </Tag>
  );
}
