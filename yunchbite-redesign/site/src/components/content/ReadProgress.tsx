"use client";
import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/components/motion/gsap";
import { defer } from "@/components/motion/entrance";
import { shapeSrc } from "@/lib/media";
import { mq } from "@/lib/tokens";

/**
 * ART-02: wraps the article. A fixed top-edge track; a tiny makhana rolls along it as you read (rotation tied to
 * distance). Decorative (aria-hidden). Reduced motion: a plain thin bar that grows.
 */
export function ReadProgress({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const bar = el.querySelector<HTMLElement>("[data-bar]");
      const ball = el.querySelector<HTMLElement>("[data-ball]");
      const track = el.querySelector<HTMLElement>("[data-track]");
      if (!bar || !ball || !track) return;
      const mm = gsap.matchMedia();
      const make = (rolling: boolean) => {
        gsap.set(bar, { scaleX: 0, transformOrigin: "0 50%" });
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top 30%",
          end: "bottom 70%",
          onUpdate: (self) => {
            const p = self.progress;
            gsap.set(bar, { scaleX: p });
            if (rolling) {
              const w = track.clientWidth;
              gsap.set(ball, { x: p * (w - 22), rotation: p * w * 0.9 });
            }
          },
        });
        return () => st.kill();
      };
      mm.add(mq.motion, () => defer(() => make(true)));
      mm.add(mq.reduce, () => defer(() => make(false)));
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <div aria-hidden="true" data-track="" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[22px]">
        <div data-bar="" className="absolute left-0 right-0 top-0 h-[4px] bg-red" style={{ transform: "scaleX(0)" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-ball="" src={shapeSrc("makhana-1")} alt="" width={22} height={22} draggable={false} className="absolute left-0 top-[1px] size-[22px] motion-reduce:hidden" />
      </div>
      {children}
    </div>
  );
}
