"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { TypeIn } from "@/components/motion/TypeIn";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { shapeSrc } from "@/lib/media";
import { mq } from "@/lib/tokens";
import type { ShapeName } from "@/data/types";

const KERNELS: { n: ShapeName; x: number; y: number; w: number; r: number; dx: number; dy: number }[] = [
  { n: "makhana-1", x: 18, y: 34, w: 8, r: -20, dx: -90, dy: -150 },
  { n: "makhana-3", x: 30, y: 22, w: 6.5, r: 24, dx: -50, dy: -200 },
  { n: "makhana-2", x: 46, y: 14, w: 7.5, r: 8, dx: 0, dy: -230 },
  { n: "makhana-4", x: 62, y: 22, w: 6, r: -30, dx: 60, dy: -190 },
  { n: "makhana-5", x: 74, y: 32, w: 8.5, r: 18, dx: 100, dy: -140 },
  { n: "makhana-3", x: 84, y: 48, w: 5, r: 40, dx: 130, dy: -90 },
  { n: "makhana-1", x: 9, y: 52, w: 5.5, r: -50, dx: -130, dy: -80 },
];

export interface BowlOpenerProps {
  eyebrow: string;
  title: string;
  intro: string;
  image: { src: string; width: number; height: number; alt: string };
}

/** BEN-01: giant title above the transparent makhana bowl; kernels pop out of it, staggered, then bob. */
export function BowlOpener({ eyebrow, title, intro, image }: BowlOpenerProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const ks = el.querySelectorAll<HTMLElement>("[data-k]");
      const bowl = el.querySelector("[data-bowl]");
      const mm = gsap.matchMedia();
      mm.add(mq.motion, () => {
        const tl = gsap.timeline({ delay: 0.5 });
        tl.from(bowl, { y: 80, scale: 0.85, opacity: 0, duration: 0.7, ease: "expo.out" });
        ks.forEach((k, i) => {
          tl.fromTo(
            k,
            { x: -Number(k.dataset.dx), y: -Number(k.dataset.dy) * 0.55, scale: 0, opacity: 0, rotation: 0 },
            { x: 0, y: 0, scale: 1, opacity: 1, rotation: `+=${(i % 2 ? 1 : -1) * 160}`, duration: 0.55, ease: "back.out(1.8)" },
            0.7 + i * 0.07,
          );
        });
        tl.add(() => {
          gsap.to(ks, { y: "-=10", duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: { each: 0.25, from: "random" } });
        });
        return () => {
          tl.kill();
          gsap.killTweensOf(ks);
        };
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-cream-2 pt-[clamp(7rem,14vh,9rem)] text-ink" data-header-theme="light">
      <div className="mx-auto max-w-[var(--container-max)] px-gutter text-center">
        <Eyebrow className="mb-5 text-red">{eyebrow}</Eyebrow>
        <TypeIn as="h1" trigger="load" text={title} className="display-type mx-auto block max-w-[16ch] text-[length:clamp(3rem,8vw,8rem)] leading-[0.86]" />
        <p className="mx-auto mt-5 max-w-[62ch] text-[1.05rem] leading-[1.6]">{intro}</p>
      </div>
      <div className="relative mx-auto mt-6 w-[min(92vw,900px)] pb-[clamp(2rem,6vw,5rem)]">
        <div data-bowl="" className="relative">
          <Image src={image.src} alt={image.alt} width={image.width} height={image.height} priority sizes="(min-width: 900px) 900px, 92vw" className="h-auto w-full" />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {KERNELS.map((k, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} data-k="" data-dx={k.dx} data-dy={k.dy} src={shapeSrc(k.n)} alt="" width={120} height={120} draggable={false} className="absolute h-auto" style={{ left: `${k.x}%`, top: `${k.y}%`, width: `${k.w}%`, rotate: `${k.r}deg` }} />
          ))}
        </div>
      </div>
    </section>
  );
}
