"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { mq } from "@/lib/tokens";

/** ART-03: the hero image starts inset and widens as it scrolls through (scrubbed). Static rounded block under reduced motion. */
export function ArticleHero({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(`${mq.motion} and (min-width: 768px)`, () => {
        gsap.fromTo(el.querySelector("[data-frame]"), { clipPath: "inset(0% 12% 0% 12% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 28px)", ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "top 20%", scrub: 0.5 } });
        gsap.fromTo(el.querySelector("[data-img]"), { scale: 1.15 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 30%", scrub: 0.5 } });
      });
    },
    { scope: root },
  );
  return (
    <div ref={root} className="mx-auto w-full max-w-[1280px] px-gutter">
      <div data-frame="" className="overflow-hidden rounded-card">
        <div data-img="" className="relative aspect-[16/9]">
          <Image src={src} alt={alt} width={width} height={height} priority sizes="(min-width: 1280px) 1200px, 100vw" className="absolute inset-0 size-full object-cover" />
        </div>
      </div>
    </div>
  );
}
