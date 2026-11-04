"use client";
import { useRef } from "react";
import type { ShapeName } from "@/data/types";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { shapeSrc } from "@/lib/media";
import { mq } from "@/lib/tokens";
import { cn } from "@/lib/cn";

// Preset slots around a centred line: [left %, top %, size (vmin-ish, rem), rotation, drift px]
const SLOTS: { l: number; t: number; w: number; r: number; d: number }[] = [
  { l: 6, t: 14, w: 9, r: -16, d: 90 },
  { l: 82, t: 10, w: 11, r: 22, d: -70 },
  { l: 18, t: 68, w: 8, r: 30, d: -110 },
  { l: 74, t: 64, w: 10, r: -24, d: 100 },
  { l: 46, t: 4, w: 6, r: 12, d: 60 },
  { l: 90, t: 42, w: 7, r: -8, d: -60 },
  { l: 2, t: 44, w: 6.5, r: 18, d: 70 },
  { l: 52, t: 84, w: 7.5, r: -30, d: -80 },
];

export interface DriftShapesProps {
  shapes: ShapeName[];
  className?: string;
}

/** Decorative paper-cut shapes that drift in parallax while the parent scrolls past (P21). */
export function DriftShapes({ shapes, className }: DriftShapesProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(mq.motion, () => {
        el.querySelectorAll<HTMLElement>("[data-drift]").forEach((s) => {
          const d = Number(s.dataset.drift);
          const spin = Number(s.dataset.spin);
          gsap.fromTo(
            s,
            { y: -d, rotation: `-=${spin}` },
            {
              y: d,
              rotation: `+=${spin}`,
              ease: "none",
              scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: 0.6 },
            },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {shapes.slice(0, SLOTS.length).map((name, i) => {
        const s = SLOTS[i];
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${name}-${i}`}
            data-drift={s.d}
            data-spin={Math.abs(s.r) / 2}
            src={shapeSrc(name)}
            alt=""
            width={160}
            height={160}
            loading="lazy"
            draggable={false}
            className="absolute h-auto select-none"
            style={{ left: `${s.l}%`, top: `${s.t}%`, width: `clamp(${s.w * 4}px, ${s.w}vw, ${s.w * 14}px)`, rotate: `${s.r}deg` }}
          />
        );
      })}
    </div>
  );
}
