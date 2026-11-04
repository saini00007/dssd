"use client";
import { useRef, type CSSProperties } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { PackImage } from "@/components/product/PackImage";
import { Container } from "@/components/ui/Container";
import { shapeSrc } from "@/lib/media";
import { mq } from "@/lib/tokens";
import type { ShapeName } from "@/data/types";

export interface JindgiWipeProps {
  before: string;
  after: string;
  beforeCaption: string;
  afterCaption: string;
  pack: { slug: string; name: string; formatLabel: string; flavourKey: string };
}

const POPS: { s: ShapeName; l: number; t: number; w: number; r: number; at: number }[] = [
  { s: "chilli", l: 4, t: 14, w: 17, r: -24, at: 0.2 },
  { s: "makhana-1", l: 76, t: 6, w: 17, r: 14, at: 0.32 },
  { s: "makhana-3", l: 84, t: 52, w: 15, r: -20, at: 0.5 },
  { s: "pudina-leaf", l: 0, t: 62, w: 17, r: 30, at: 0.4 },
  { s: "makhana-4", l: 20, t: 84, w: 14, r: 10, at: 0.6 },
  { s: "pepper", l: 70, t: 82, w: 12, r: -34, at: 0.7 },
  { s: "makhana-2", l: 44, t: -4, w: 12, r: 40, at: 0.8 },
];

function words(text: string) {
  // "Ye Hai Aam Jindgi" -> 3 lines: "Ye Hai" / "Aam" / "Jindgi"
  const w = text.split(" ");
  return [w.slice(0, 2).join(" "), w[2] ?? "", w.slice(3).join(" ")].filter(Boolean);
}

function SadScene() {
  return (
    <svg viewBox="0 0 500 500" role="img" aria-label="A glum chips packet on a plain desk under a clock that says 4 pm" className="size-full">
      <rect x="20" y="420" width="460" height="22" rx="8" fill="#B4AFA7" />
      <rect x="60" y="442" width="16" height="48" fill="#A39E96" />
      <rect x="424" y="442" width="16" height="48" fill="#A39E96" />
      {/* clock */}
      <circle cx="404" cy="96" r="42" fill="#DAD6CF" stroke="#9C978F" strokeWidth="6" />
      <path d="M404 96V68M404 96l22 12" stroke="#7B766F" strokeWidth="6" strokeLinecap="round" />
      {/* bag */}
      <path d="M150 128h200l16 276q-116 22-232 0z" fill="#A9A59E" />
      <path d="M150 128l10-18 10 18 10-18 10 18 10-18 10 18 10-18 10 18 10-18 10 18 10-18 10 18 10-18 10 18 10-18 10 18 10-18 10 18 10-18 10 18 10-18 10 18z" fill="#97928B" />
      <rect x="186" y="226" width="128" height="92" rx="14" fill="#C9C5BE" />
      <text x="250" y="284" textAnchor="middle" fontSize="30" fontWeight="800" fill="#8F8B84" fontFamily="Arial Black, Arial, sans-serif">CHIPS</text>
      {/* face */}
      <circle cx="222" cy="184" r="6" fill="#6E6A64" />
      <circle cx="278" cy="184" r="6" fill="#6E6A64" />
      <path d="M224 212q26-22 52 0" fill="none" stroke="#6E6A64" strokeWidth="6" strokeLinecap="round" />
      <path d="M304 186q8 14 0 22-8-8 0-22z" fill="#B9C3C9" />
      {/* crumbs */}
      <path d="M120 410l12-8 6 10zM372 412l14-6 4 12zM336 420l9-6 5 8z" fill="#9A958E" />
      <text x="418" y="170" textAnchor="middle" fontSize="20" fontWeight="700" fill="#8F8B84" fontFamily="Arial, sans-serif">4:00</text>
    </svg>
  );
}

function Headline({ text, as: Tag, className }: { text: string; as: "h2" | "p"; className?: string }) {
  return (
    <Tag className={`display-type text-[length:clamp(2.7rem,8.2vw,8.4rem)] leading-[0.88] ${className ?? ""}`}>
      {words(text).map((l, i) => (
        <span key={i} className="block">
          {l}
        </span>
      ))}
    </Tag>
  );
}

export function JindgiWipe({ before, after, beforeCaption, afterCaption, pack }: JindgiWipeProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(mq.motion, () => {
        const sceneB = el.querySelector<HTMLElement>("[data-scene-b]");
        const edge = el.querySelector<HTMLElement>("[data-edge]");
        const pops = gsap.utils.toArray<HTMLElement>("[data-pop]", el);
        const packEl = el.querySelector<HTMLElement>("[data-pack]");
        const bText = el.querySelector<HTMLElement>("[data-b-text]");
        const aText = el.querySelector<HTMLElement>("[data-a-text]");
        if (!sceneB || !edge) return;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el, start: "top 28%", end: "top -48%", scrub: 0.5 },
        });
        tl.fromTo(sceneB, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1 }, 0);
        tl.fromTo(edge, { xPercent: 0 }, { xPercent: 100, duration: 1 }, 0);
        tl.fromTo(edge, { opacity: 1 }, { opacity: 0, duration: 0.08 }, 0.92);
        if (aText) tl.fromTo(aText, { x: 0 }, { x: "-3vw", duration: 1 }, 0);
        if (bText) tl.fromTo(bText, { x: "3vw" }, { x: 0, duration: 1 }, 0);
        if (packEl) tl.fromTo(packEl, { scale: 0.86, rotation: -9 }, { scale: 1, rotation: 5, duration: 1, ease: "back.out(1.4)" }, 0.25);
        pops.forEach((p) => tl.fromTo(p, { scale: 0, rotation: "-=40" }, { scale: 1, rotation: "+=40", duration: 0.28, ease: "back.out(2.2)" }, Number(p.dataset.at)));
        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="jindgi-title"
      data-header-theme="light"
      className="relative overflow-hidden bg-[#CDC8C0] md:grid md:grid-cols-2 motion-safe:md:block motion-safe:h-[100svh] motion-safe:min-h-[600px]"
    >
      {/* Scene A: Aam Jindgi (grey) */}
      <div className="relative flex min-h-[80svh] items-center bg-[#CDC8C0] text-[#6B6761] motion-safe:absolute motion-safe:inset-0 motion-safe:min-h-0">
        <Container className="grid items-center gap-6 py-[calc(var(--header-h)+1rem)] md:grid-cols-[0.95fr_1.05fr] md:py-0 max-md:text-center max-md:grid-cols-1">
          <div data-a-text="" className="md:order-2">
            <Headline as="h2" text={before} className="[&]:text-[#6B6761]" />
            <p className="mt-5 text-[length:clamp(1.05rem,1.6vw,1.4rem)] font-medium">{beforeCaption}</p>
          </div>
          <div className="mx-auto w-[min(72vw,38svh)] md:w-[min(44vw,64svh)] max-md:order-first max-md:hidden md:block">
            <SadScene />
          </div>
        </Container>
        <span id="jindgi-title" className="sr-only">
          {before} / {after}
        </span>
      </div>

      {/* Scene B: Yunchy Jindgi (full colour) */}
      <div data-scene-b="" className="relative flex min-h-[80svh] items-center overflow-hidden bg-yellow text-ink motion-safe:absolute motion-safe:inset-0 motion-safe:min-h-0">
        <Container className="grid items-center gap-6 py-[calc(var(--header-h)+1rem)] md:grid-cols-[0.95fr_1.05fr] md:py-0 max-md:text-center max-md:grid-cols-1">
          <div data-b-text="" className="md:order-2">
            <Headline as="p" text={after} className="text-red" />
            <p className="mt-5 text-[length:clamp(1.05rem,1.6vw,1.4rem)] font-semibold">{afterCaption}</p>
          </div>
          <div className="relative mx-auto aspect-square w-[min(72vw,38svh)] md:w-[min(44vw,64svh)] max-md:hidden md:block" aria-hidden="true">
            <div className="absolute inset-[6%] rounded-full bg-cream" />
            <div data-pack="" className="absolute inset-x-[16%] bottom-[10%] top-[6%]">
              <PackImage product={pack} fit decorative morph={false} sizes="(min-width: 768px) 28vw, 60vw" imgClassName="drop-shadow-[0_24px_28px_rgb(42_18_16/0.3)]" />
            </div>
            {POPS.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                data-pop=""
                data-at={p.at}
                src={shapeSrc(p.s)}
                alt=""
                width={120}
                height={120}
                loading="lazy"
                draggable={false}
                className="absolute h-auto select-none"
                style={{ left: `${p.l}%`, top: `${p.t}%`, width: `${p.w}%`, rotate: `${p.r}deg` } as CSSProperties}
              />
            ))}
          </div>
        </Container>
      </div>

      {/* wipe edge handle */}
      <div data-edge="" aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 hidden motion-safe:block">
        <div className="absolute inset-y-0 left-0 w-[5px] -translate-x-1/2 bg-cream shadow-[0_0_0_1px_rgb(42_18_16/0.15)]">
          <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cream text-red shadow-[var(--shadow-pill)]">
            <span className="display-type text-lg leading-none">◂ ▸</span>
          </span>
        </div>
      </div>
    </section>
  );
}
