"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { TypeIn } from "@/components/motion/TypeIn";
import { PackImage } from "@/components/product/PackImage";
import { mq } from "@/lib/tokens";
import type { PackData } from "./groups";

export interface CategoryBandProps {
  name: string;
  href: string;
  subline: string;
  statement: string;
  color: string;
  ink: string;
  cta: string;
  /** Colour in the arch corners (the previous section). */
  behind: string;
  /** 4 or 5 packs from the range, left to right. */
  packs: PackData[];
  count: number;
  /** "Makhana" -> unique id for aria */
  id: string;
}

// slot: [left %, top %, width %, rotate deg, parallax px]
const SLOTS: [number, number, number, number, number][] = [
  [3, 34, 27, -9, 60],
  [27, 8, 31, 5, -50],
  [50, 38, 30, -4, 70],
  [68, 6, 28, 9, -60],
  [38, 62, 24, 7, 40],
];

/** PRD-03: one category band in its own colour: name, line, "Explore" and a cluster of packs that drift on scroll. */
export function CategoryBand({ name, href, subline, statement, color, ink, cta, behind, packs, count, id }: CategoryBandProps) {
  const root = useRef<HTMLDivElement>(null);
  const dark = ink.toLowerCase() === "#fffdf5";

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(mq.motion, () => {
        el.querySelectorAll<HTMLElement>("[data-drift]").forEach((n) => {
          const d = Number(n.dataset.drift);
          gsap.fromTo(n, { y: -d }, { y: d, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 } });
        });
        const disc = el.querySelector("[data-disc]");
        if (disc) gsap.fromTo(disc, { rotate: -25 }, { rotate: 25, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 } });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <Section tone="flavour" flavour={{ color, ink }} arch behind={behind} className="overflow-hidden" aria-labelledby={`${id}-h`}>
        <Container className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="relative z-10">
            <Eyebrow className="mb-4">{count} flavours</Eyebrow>
            <TypeIn as="h2" id={`${id}-h`} text={name} className="display-type text-[length:clamp(3.5rem,9vw,9rem)] leading-[0.86]" />
            <Reveal delay={0.1}>
              <p className="mt-5 text-[length:var(--text-h3)] font-semibold leading-tight">{subline}</p>
              <p className="mt-3 max-w-[40ch] opacity-85">{statement}</p>
              <div className="mt-8">
                <ButtonLink href={href} variant={dark ? "cream" : "solid"} size="lg">
                  {cta}
                </ButtonLink>
              </div>
            </Reveal>
          </div>
          <div aria-hidden="true" className="relative mx-auto aspect-[1/0.92] w-full max-w-[640px]">
            <div data-disc="" className="absolute left-1/2 top-1/2 aspect-square w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream/55">
              <div className="absolute inset-[7%] rounded-full border-2 border-dashed" style={{ borderColor: `${ink}33` }} />
            </div>
            {packs.slice(0, SLOTS.length).map((p, i) => {
              const [l, t, w, r, d] = SLOTS[i];
              return (
                <div key={p.slug} data-drift={d} className="absolute" style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, aspectRatio: "0.9", rotate: `${r}deg` }}>
                  <PackImage product={p} fit decorative sizes="(min-width: 1024px) 220px, 30vw" imgClassName="drop-shadow-[0_16px_20px_rgb(42_18_16/0.3)]" />
                </div>
              );
            })}
          </div>
        </Container>
      </Section>
    </div>
  );
}
