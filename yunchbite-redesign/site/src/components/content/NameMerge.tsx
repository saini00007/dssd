"use client";
import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/components/motion/gsap";
import { deferIn } from "@/components/motion/entrance";
import { mq } from "@/lib/tokens";
import { Eyebrow } from "@/components/ui/Eyebrow";

export interface NameMergeProps {
  left: string;
  right: string;
  result: string;
  meaning: string;
  eyebrow?: string;
}

/**
 * ABOUT-02: "YAN + CHI = YUNCH". Scroll-scrubbed (sticky, ~1 extra viewport): the two words slide together,
 * merge with a pop into YUNCH, then "energy + vitality" types in. The sentence is the accessible text;
 * the visual layers are aria-hidden. Reduced motion: the final layout, static.
 */
export function NameMerge({ left, right, result, meaning, eyebrow }: NameMergeProps) {
  const root = useRef<HTMLElement>(null);
  const sentence = `${left} plus ${right} equals ${result}: ${meaning}.`;

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = <T extends HTMLElement>(s: string) => el.querySelector<T>(s)!;
      const mm = gsap.matchMedia();
      mm.add(`${mq.motion} and (min-width: 768px)`, (_c, safe) => build(34, safe));
      mm.add(`${mq.motion} and (max-width: 767px)`, (_c, safe) => build(22, safe));
      function build(shift: number, safe: gsap.ContextSafeFunc | undefined) {
        return deferIn(safe, () => {
        const split = SplitText.create(q("[data-meaning]"), { type: "chars", aria: "none" });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.6 },
        });
        tl.fromTo(q("[data-yan]"), { xPercent: -shift * 3, opacity: 0.2 }, { xPercent: 0, opacity: 1, duration: 0.4, ease: "power2.inOut" }, 0)
          .fromTo(q("[data-chi]"), { xPercent: shift * 3, opacity: 0.2 }, { xPercent: 0, opacity: 1, duration: 0.4, ease: "power2.inOut" }, 0)
          .fromTo(q("[data-plus]"), { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.2, ease: "back.out(2)" }, 0.28)
          .fromTo(q("[data-result]"), { scale: 0.4, opacity: 0, yPercent: 20 }, { scale: 1, opacity: 1, yPercent: 0, duration: 0.22, ease: "back.out(1.8)" }, 0.5)
          .to(q("[data-equation]"), { opacity: 0.35, scale: 0.88, yPercent: -12, duration: 0.2, ease: "power2.inOut" }, 0.5)
          .fromTo(split.chars, { opacity: 0, yPercent: 40 }, { opacity: 1, yPercent: 0, stagger: 0.012, duration: 0.1 }, 0.72)
          .to({}, { duration: 0.12 });
        return () => split.revert();
        });
      }
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Where the name comes from" className="relative bg-yellow text-ink motion-safe:h-[220vh]" data-header-theme="light">
      <div className="flex min-h-[80svh] flex-col items-center justify-center overflow-hidden px-gutter py-24 text-center motion-safe:sticky motion-safe:top-0 motion-safe:h-[100svh] motion-safe:min-h-0 motion-safe:py-0">
        <p className="sr-only">{sentence}</p>
        <div aria-hidden="true" className="flex flex-col items-center">
          {eyebrow && <Eyebrow className="mb-6 text-ink">{eyebrow}</Eyebrow>}
          <div data-equation="" className="display-type flex items-baseline gap-[0.18em] text-[length:clamp(3.4rem,11vw,10.5rem)] leading-[0.85]">
            <span data-yan="" className="inline-block">{left}</span>
            <span data-plus="" className="inline-block text-red">+</span>
            <span data-chi="" className="inline-block">{right}</span>
          </div>
          <div data-result="" className="display-type mt-[-0.02em] flex items-baseline gap-[0.12em] text-[length:clamp(4.6rem,19vw,19rem)] leading-[0.82] text-red">
            <span className="text-ink">=</span>
            <span>{result}</span>
          </div>
          <p data-meaning="" className="display-type mt-6 text-[length:clamp(1.6rem,3.4vw,3.2rem)] leading-none">
            {meaning}
          </p>
        </div>
      </div>
    </section>
  );
}
