"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { TypeIn } from "@/components/motion/TypeIn";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { mq } from "@/lib/tokens";

export interface InsetOpenerProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  image: { src: string; alt: string };
  /** Heading tag for the title (default h1: one per page). */
  as?: "h1" | "h2";
  className?: string;
}

const FROM_DESKTOP = "inset(46% 24% 6% 24% round 28px)";
const FROM_MOBILE = "inset(40% 7% 8% 7% round 24px)";
const TO = "inset(0% 0% 0% 0% round 0px)";

/**
 * P20: a giant title, then the inset image grows to full-bleed as you scroll (scrubbed, ~1 extra viewport,
 * sticky not pinned). Under reduced motion: title, then the image as a normal rounded block.
 */
export function InsetOpener({ title, eyebrow, subtitle, image, as = "h1", className }: InsetOpenerProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const media = el.querySelector<HTMLElement>("[data-media]");
      const head = el.querySelector<HTMLElement>("[data-head]");
      const img = el.querySelector<HTMLElement>("[data-img]");
      if (!media || !head || !img) return;
      const mm = gsap.matchMedia();
      mm.add(`${mq.motion} and (min-width: 768px)`, () => build(FROM_DESKTOP));
      mm.add(`${mq.motion} and (max-width: 767px)`, () => build(FROM_MOBILE));
      function build(from: string) {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.5 },
        });
        tl.fromTo(media, { clipPath: from }, { clipPath: TO }, 0)
          .fromTo(img, { scale: 1.25 }, { scale: 1 }, 0)
          .to(head, { yPercent: -18, opacity: 0, scale: 0.94 }, 0.35);
      }
    },
    { scope: root },
  );

  const Title = as;
  return (
    <section ref={root} className={`relative bg-cream text-ink motion-safe:h-[210vh] ${className ?? ""}`}>
      <div className="motion-safe:sticky motion-safe:top-0 motion-safe:h-[100svh] motion-safe:overflow-hidden">
        <div data-head="" className="relative z-10 mx-auto flex max-w-[var(--container-max)] flex-col items-center px-gutter pt-[clamp(6.5rem,16vh,9rem)] text-center">
          {eyebrow && <Eyebrow className="mb-4 text-red">{eyebrow}</Eyebrow>}
          <Title className="display-type text-[length:var(--text-hero)] leading-[0.86]">
            <TypeIn text={title} trigger="load" />
          </Title>
          {subtitle && <p className="mt-5 max-w-[48ch] text-lg text-ink/80">{subtitle}</p>}
        </div>
        <div
          data-media=""
          className="relative mx-auto mt-8 aspect-[16/9] w-[calc(100%-2*var(--gutter))] overflow-hidden rounded-card motion-safe:absolute motion-safe:inset-0 motion-safe:mt-0 motion-safe:aspect-auto motion-safe:w-full motion-safe:rounded-none motion-safe:[clip-path:inset(46%_24%_6%_24%_round_28px)] motion-safe:max-md:[clip-path:inset(40%_7%_8%_7%_round_24px)]"
        >
          <div data-img="" className="absolute inset-0">
            <Image src={image.src} alt={image.alt} fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
