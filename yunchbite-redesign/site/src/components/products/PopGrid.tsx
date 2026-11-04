"use client";
import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/components/motion/gsap";
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
        gsap.set(items, { opacity: 0, scale: from, y: 36 });
        el.setAttribute("data-yb-ready", "");
        const triggers = ScrollTrigger.batch(items, {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, scale: 1, y: 0, duration: dur.pop + 0.3, ease: ease.crunch, stagger: 0.07, overwrite: true, clearProps: "transform,opacity" }),
        });
        return () => {
          triggers.forEach((t) => t.kill());
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
