"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { whenInView } from "@/components/motion/entrance";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { TypeIn } from "@/components/motion/TypeIn";
import { Reveal } from "@/components/motion/Reveal";
import { dur, ease, mq, reveal } from "@/lib/tokens";
import type { TasteProfile as Taste } from "@/data/types";

export interface TasteProfileProps {
  heading: string;
  pairsHeading: string;
  scale: string;
  meters: Record<keyof Taste, string>;
  taste: Taste;
  pairsWith: string[];
  color: string;
  ink: string;
}

const KEYS: (keyof Taste)[] = ["spice", "tang", "salt", "sweet"];

/** PDP-03: four meters (0-5) that fill on enter, and "Pairs with" chips. */
export function TasteProfile({ heading, pairsHeading, scale, meters, taste, pairsWith, color, ink }: TasteProfileProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(mq.motion, () => {
        const fills = gsap.utils.toArray<HTMLElement>("[data-fill]", el);
        gsap.set(fills, { scaleX: 0, transformOrigin: "0 50%" });
        const tl = gsap.timeline({ paused: true });
        const stop = whenInView(el, reveal.start, () => tl.play());
        fills.forEach((f) => {
          const rowIdx = Number(f.dataset.row);
          const idx = Number(f.dataset.idx);
          tl.to(f, { scaleX: 1, duration: dur.move, ease: ease.roast }, rowIdx * 0.12 + idx * 0.07);
        });
        return () => {
          stop();
          tl.kill();
          gsap.set(fills, { clearProps: "transform" });
        };
      });
    },
    { scope: root },
  );

  return (
    <Section tone="flavour" flavour={{ color, ink }} aria-labelledby="pdp-taste-h" className="overflow-hidden">
      <Container>
        <div ref={root} className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <TypeIn as="h2" id="pdp-taste-h" text={heading} className="display-type text-[length:var(--text-display)] leading-[0.9]" />
            <div className="mt-10 flex flex-col gap-5">
              {KEYS.map((k, row) => {
                const v = taste[k];
                return (
                  <div key={k} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-4 sm:grid-cols-[7rem_1fr_auto]">
                    <span className="display-type text-[length:clamp(1.1rem,1.8vw,1.5rem)]">{meters[k]}</span>
                    <div role="meter" aria-label={meters[k]} aria-valuemin={0} aria-valuemax={5} aria-valuenow={v} aria-valuetext={`${v} out of 5`} className="grid grid-cols-5 gap-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="h-4 overflow-hidden rounded-full bg-current/15 sm:h-5">
                          {i < v && <span data-fill="" data-row={row} data-idx={i} className="block h-full w-full rounded-full bg-current" />}
                        </span>
                      ))}
                    </div>
                    <span className="tabular w-10 text-right text-sm font-bold">{v}/5</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em]">{scale}</p>
          </div>
          <Reveal delay={0.1}>
            <h3 className="display-type text-[length:var(--text-h2)] leading-none">{pairsHeading}</h3>
            <ul className="mt-6 flex flex-wrap gap-3">
              {pairsWith.map((p, i) => (
                <li
                  key={p}
                  className="rounded-pill border-2 border-current px-5 py-3 text-[length:clamp(1.05rem,1.6vw,1.4rem)] font-bold"
                  style={{ rotate: `${[-3, 2, -1.5, 3][i % 4]}deg` }}
                >
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
