"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { deferIn } from "@/components/motion/entrance";
import { photos } from "@/data/assets";
import { mq } from "@/lib/tokens";
import { cn } from "@/lib/cn";

export interface PhotoStackProps {
  steps: { n: string; title: string }[];
}

// Collapsed pile: rotation + offset per card. Spread: where each card starts (in card widths/heights).
const PILE = [-3, 4, -4, 2, -2, 5];
const COLORS = ["bg-yellow text-ink", "bg-cream-2 text-ink", "bg-maroon text-cream", "bg-cream text-ink", "bg-red text-cream"];
const SPREAD: [number, number][] = [
  [-0.78, -0.5],
  [0.0, -0.58],
  [0.78, -0.5],
  [-0.78, 0.58],
  [0, 0.66],
  [0.78, 0.58],
];

/**
 * IQ-06: a scroll-scrubbed collapse (R3-C6): the factory photo and five paper-cut step cards start spread out and
 * collapse into one stack. Decorative (the steps are also an ordered list beside it). Desktop + motion only;
 * otherwise the stack is hidden and the photo shows as a plain block. Only one factory photo exists, so the stack
 * is composed from it plus the step cards; more factory photos are wanted.
 */
export function PhotoStack({ steps }: PhotoStackProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(`${mq.motion} and (min-width: 768px)`, (_c, safe) => {
        const off = deferIn(safe, () => {
        const section = el.closest("[data-stack-section]") ?? el;
        const cards = el.querySelectorAll<HTMLElement>("[data-card]");
        const tl = gsap.timeline({ defaults: { ease: "power2.inOut" }, scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.6 } });
        cards.forEach((c, i) => {
          const [sx, sy] = SPREAD[i] ?? [0, 0];
          tl.fromTo(c, { xPercent: sx * 100, yPercent: sy * 100, rotation: (i % 2 ? 1 : -1) * 12, scale: 1.04 }, { xPercent: 0, yPercent: 0, rotation: PILE[i], scale: 1, duration: 0.7 }, i * 0.04);
        });
        tl.to({}, { duration: 0.3 });
        });
        return () => off();
      });
    },
    { scope: root },
  );

  const card = "absolute left-1/2 top-1/2 h-[190px] w-[min(270px,52%)] -ml-[min(135px,26%)] -mt-[95px] overflow-hidden rounded-card shadow-[var(--shadow-lift)] lg:h-[210px] lg:-mt-[105px]";
  return (
    <div ref={root} aria-hidden="true" className="relative hidden h-[min(72svh,560px)] w-full md:motion-safe:block">
      <div data-card="" className={cn(card, "z-10")}>
        <Image src={photos.factory.src} alt="" fill sizes="300px" className="object-cover" />
      </div>
      {steps.map((s, i) => (
        <div key={s.n} data-card="" className={cn(card, "flex flex-col justify-between p-5", COLORS[i % COLORS.length])} style={{ zIndex: i + 1 }}>
          <span className="display-type text-outline text-[4rem] leading-[0.8]">{s.n}</span>
          <span className="display-type text-[length:var(--text-h3)] leading-none">{s.title}</span>
        </div>
      ))}
    </div>
  );
}
