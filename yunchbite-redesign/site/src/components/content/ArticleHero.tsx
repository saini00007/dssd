"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { deferIn } from "@/components/motion/entrance";
import { mq } from "@/lib/tokens";

/** ART-03: the hero image starts inset and widens as it scrolls through (scrubbed). Static rounded block under reduced motion. */
export function ArticleHero({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(`${mq.motion} and (min-width: 768px)`, (_c, safe) => {
        const off = deferIn(safe, () => {
        gsap.fromTo(el.querySelector("[data-frame]"), { clipPath: "inset(0% 12% 0% 12% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 28px)", ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "top 20%", scrub: 0.5 } });
        gsap.fromTo(el.querySelector("[data-img]"), { scale: 1.15 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 30%", scrub: 0.5 } });
        });
        return () => off();
      });
    },
    { scope: root },
  );
  return (
    <div ref={root} className="mx-auto w-full max-w-[1280px] px-gutter">
      <div data-frame="" className="overflow-hidden rounded-card motion-safe:md:[clip-path:inset(0%_12%_0%_12%_round_28px)]">
        <div data-img="" className="relative aspect-[16/9] motion-safe:md:[transform:scale(1.15)]">
          <Image src={src} alt={alt} width={width} height={height} priority sizes="(min-width: 1280px) 1200px, 100vw" className="absolute inset-0 size-full object-cover" />
        </div>
      </div>
    </div>
  );
}
