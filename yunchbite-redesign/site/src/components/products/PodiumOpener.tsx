"use client";
import { useRef, type CSSProperties } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { RingBurst, type RingBurstHandle } from "@/components/motion/RingBurst";
import { TypeIn } from "@/components/motion/TypeIn";
import { DriftShapes } from "@/components/sections/DriftShapes";
import { PackImage } from "@/components/product/PackImage";
import { dur, ease, mq } from "@/lib/tokens";
import type { ShapeName } from "@/data/types";
import type { PackData } from "./groups";

export interface OpenerPack extends PackData {
  color: string;
  ink: string;
  /** Small label under the pack (podium only), e.g. "Makhana". */
  label?: string;
}

export interface PodiumOpenerProps {
  variant: "podium" | "pyramid";
  title: string;
  tagline: string;
  /** podium: 5 packs left to right (centre = winner). pyramid: packs from the top down (1-2-3-5). */
  packs: OpenerPack[];
  shapes?: ShapeName[];
  /** Colour of the ring burst behind the lead pack. */
  burst: string;
  eyebrow?: string;
}

// podium step heights and pack sizes, in "u" (a unit that follows both viewport width and height)
const PODIUM = [
  { block: 7, pack: 20 },
  { block: 10, pack: 24 },
  { block: 14, pack: 29 },
  { block: 10, pack: 24 },
  { block: 7, pack: 20 },
];
const ROWS = [1, 2, 3, 5];

/**
 * PRD-01 / BEST-01 opener: giant title, tagline, and a podium (or pyramid) of packs that pop in, staggered from the
 * lead pack outwards, with a ring burst behind it. The packs are decorative here (alt=""): the grid below links them.
 * Reduced motion: everything shown as is.
 */
export function PodiumOpener({ variant, title, tagline, packs, shapes, burst, eyebrow }: PodiumOpenerProps) {
  const root = useRef<HTMLElement>(null);
  const ring = useRef<RingBurstHandle>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      const items = gsap.utils.toArray<HTMLElement>("[data-slot]", el);
      const steps = gsap.utils.toArray<HTMLElement>("[data-step]", el);
      const tag = el.querySelector<HTMLElement>("[data-tagline]");
      const all = [...items, ...steps, ...(tag ? [tag] : [])];
      mm.add(mq.reduce, () => all.forEach((n) => n.setAttribute("data-yb-ready", "")));
      mm.add(mq.motion, () => {
        const lead = variant === "podium" ? 2 : 0;
        // order of arrival: lead pack first, then outwards (podium) / top-down (pyramid)
        const order = items
          .map((n, i) => ({ n, i, d: variant === "podium" ? Math.abs(i - lead) : i }))
          .sort((a, b) => a.d - b.d || a.i - b.i);
        const tl = gsap.timeline({ delay: 0.25 });
        if (steps.length) {
          gsap.set(steps, { scaleY: 0, transformOrigin: "50% 100%" });
          tl.to(steps, { scaleY: 1, duration: dur.roast * 0.8, ease: ease.glide, stagger: { each: 0.09, from: "center" } }, 0);
        }
        gsap.set(items, { opacity: 0, scale: 0.4, y: 60, transformOrigin: "50% 100%" });
        tl.to(
          order.map((o) => o.n),
          { opacity: 1, scale: 1, y: 0, duration: dur.pop + 0.25, ease: ease.crunch, stagger: variant === "podium" ? 0.11 : 0.075 },
          0.35,
        );
        tl.call(() => ring.current?.burst(), [], 0.35 + 0.1);
        if (tag) {
          gsap.set(tag, { opacity: 0, y: 14 });
          tl.to(tag, { opacity: 1, y: 0, duration: dur.move, ease: ease.glide }, 0.5);
        }
        all.forEach((n) => n.setAttribute("data-yb-ready", ""));
        return () => {
          tl.kill();
          gsap.set(all, { clearProps: "transform,opacity" });
        };
      });
    },
    { scope: root, dependencies: [variant] },
  );

  const unit = { "--u": variant === "pyramid" ? "clamp(3px, min(1.3vw, 1.16vh), 14px)" : "clamp(3px, min(1.4vw, 1.3vh), 15px)" } as CSSProperties;

  const pack = (p: OpenerPack, size: number, priority: boolean) => (
    <div className="relative mx-auto w-full" style={{ height: `calc(var(--u) * ${size})` }}>
      <PackImage
        product={p}
        fit
        decorative
        priority={priority}
        sizes="(min-width: 1024px) 320px, 30vw"
        imgClassName="drop-shadow-[0_18px_22px_rgb(42_18_16/0.3)]"
      />
    </div>
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-cream-2 text-ink" data-header-theme="light" style={unit}>
      {shapes && <DriftShapes shapes={shapes} className="opacity-60" />}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[var(--container-max)] flex-col items-center px-gutter pb-0 pt-[calc(var(--header-h)+clamp(1rem,3vh,2.5rem))] text-center">
        {eyebrow && <p className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-red">{eyebrow}</p>}
        {variant === "pyramid" ? (
          <div className="relative w-full text-[length:clamp(3rem,12.5vw,12rem)] leading-[0.86] text-red">
            <div aria-hidden="true" className="display-type text-outline" style={{ "--stroke": "2px" } as CSSProperties}>
              {title.toUpperCase()}
            </div>
            <TypeIn as="h1" text={title.toUpperCase()} trigger="load" className="display-type absolute inset-0" />
          </div>
        ) : (
          <TypeIn as="h1" text={title} trigger="load" className="display-type text-[length:clamp(3rem,10.5vw,10rem)] leading-[0.86]" />
        )}
        <p data-tagline="" data-yb-anim="" className="mt-4 max-w-[34ch] text-[length:clamp(1rem,1.5vw,1.3rem)] text-ink/80">
          {tagline}
        </p>

        {variant === "podium" ? (
          <div className="mt-auto flex w-full max-w-[1100px] items-end justify-center gap-[1.2%] pt-6">
            {packs.slice(0, 5).map((p, i) => {
              const s = PODIUM[i];
              return (
                <div key={p.slug} data-slot="" data-yb-anim="" className="relative flex w-[19%] flex-col items-center">
                  {i === 2 && (
                    <div className="absolute left-1/2 top-[38%] aspect-square w-[130%] -translate-x-1/2 -translate-y-1/2">
                      <RingBurst ref={ring} color={burst} />
                    </div>
                  )}
                  <div className="relative z-10 w-full">{pack(p, s.pack, true)}</div>
                  <div
                    data-step=""
                    data-yb-anim=""
                    className="relative z-0 -mt-[1.5%] flex w-full items-start justify-center rounded-t-[22px] px-1 pt-3 text-[length:clamp(0.65rem,1.1vw,0.9rem)] font-bold uppercase tracking-wide"
                    style={{ height: `calc(var(--u) * ${s.block})`, background: p.color, color: p.ink }}
                  >
                    {p.label}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative mt-auto flex w-full max-w-[1000px] flex-col items-center pt-4">
            <div className="absolute left-1/2 top-[8%] aspect-square w-[min(60vw,26rem)] -translate-x-1/2 rounded-full" style={{ background: `color-mix(in srgb, ${burst} 22%, transparent)` }} aria-hidden="true" />
            {(() => {
              let n = 0;
              return ROWS.map((count, r) => (
                <div key={r} className="relative z-10 flex w-full items-end justify-center gap-[2%]" style={{ marginTop: r ? "calc(var(--u) * -1.2)" : 0 }}>
                  {Array.from({ length: count }).map(() => {
                    const p = packs[n];
                    const idx = n++;
                    if (!p) return null;
                    return (
                      <div key={p.slug} data-slot="" data-yb-anim="" className="relative" style={{ width: r === 0 ? "14%" : "min(17%, 16vh)" }}>
                        {idx === 0 && (
                          <div className="absolute left-1/2 top-1/2 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2">
                            <RingBurst ref={ring} color={burst} />
                          </div>
                        )}
                        {pack(p, r === 0 ? 14 : 12, idx < 3)}
                      </div>
                    );
                  })}
                </div>
              ));
            })()}
          </div>
        )}
      </div>
    </section>
  );
}
