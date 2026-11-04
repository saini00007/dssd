"use client";
import { useRef, type CSSProperties } from "react";
import { RingBurst, type RingBurstHandle } from "@/components/motion/RingBurst";
import { FlavourBuddy } from "@/components/product/FlavourBuddy";
import { PackImage } from "@/components/product/PackImage";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { SlideArrow } from "@/components/ui/ButtonLink";
import { useCursorLabel } from "@/components/layout/CursorLabel";
import type { ShapeName } from "@/data/types";
import { cn } from "@/lib/cn";

export interface CategoryCardProps {
  href: string;
  name: string;
  title: string;
  count: string;
  cta: string;
  color: string;
  ink: string;
  ingredient: ShapeName;
  /** 3 packs for the cluster: [left, centre, right] */
  packs: { slug: string; name: string; formatLabel: string; flavourKey: string }[];
  className?: string;
}

/** HOME-05 category card: category colour, pack cluster, ring-burst hover + Buddy peek, cursor label. */
export function CategoryCard({ href, name, title, count, cta, color, ink, ingredient, packs, className }: CategoryCardProps) {
  const ring = useRef<RingBurstHandle>(null);
  const cursor = useCursorLabel(`${cta} →`);
  const [l, c, r] = packs;
  const vars = { "--flavour": color, "--flavour-ink": ink } as CSSProperties;

  return (
    <article className={cn("group/cat relative", className)} style={vars}>
      {/* Buddy peeks over the top edge */}
      <div aria-hidden="true" className="pointer-events-none absolute bottom-full right-[10%] z-0 mb-[-22px] w-[24%] translate-y-[92%] transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)] group-hover/cat:translate-y-0 group-focus-within/cat:translate-y-0">
        <FlavourBuddy flavour={{ ingredient, name }} pose="peek" hand={{ x: -8, y: 54, size: 40, rotate: -16 }} />
      </div>
      <TransitionLink
        href={href}
        {...cursor}
        onPointerEnter={(e) => {
          cursor.onPointerEnter(e);
          ring.current?.burst();
        }}
        onFocus={(e) => {
          if (e.currentTarget.matches(":focus-visible")) ring.current?.burst();
        }}
        className="relative z-10 flex aspect-[4/5.1] min-h-[420px] w-full flex-col overflow-hidden rounded-[32px] bg-flavour p-6 text-flavour-ink outline-offset-4 transition-[transform,box-shadow] duration-[var(--dur-pop)] ease-[var(--ease-crunch)] hover:-translate-y-2 hover:shadow-[var(--shadow-lift)] md:p-8"
      >
        <div className="relative z-20 flex items-start justify-between gap-4">
          <div>
            <h3 className="display-type text-[length:clamp(2.4rem,4.4vw,4.2rem)] leading-[0.88]">{name}</h3>
            <p className="mt-2 max-w-[22ch] text-[0.98rem] font-semibold leading-snug">{title}</p>
          </div>
          <span className="tabular rounded-pill border-2 border-current px-3 py-1 text-xs font-bold uppercase tracking-wide">{count}</span>
        </div>

        {/* pack cluster */}
        <div className="absolute inset-x-0 bottom-[14%] top-[26%]" aria-hidden="true">
          <div className="absolute left-1/2 top-[48%] aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--flavour-ink)_14%,transparent)]" />
          <div className="absolute left-1/2 top-[48%] aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2">
            <RingBurst ref={ring} color="var(--flavour-ink)" />
          </div>
          <div className="absolute bottom-0 left-[6%] h-[76%] w-[36%] origin-bottom -rotate-[8deg] transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)] group-hover/cat:-translate-x-[6%] group-hover/cat:-rotate-[14deg]">
            <PackImage product={l} fit decorative morph={false} sizes="(min-width: 1024px) 14vw, 30vw" imgClassName="drop-shadow-[0_14px_16px_rgb(42_18_16/0.3)]" />
          </div>
          <div className="absolute bottom-0 right-[6%] h-[76%] w-[36%] origin-bottom rotate-[8deg] transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)] group-hover/cat:translate-x-[6%] group-hover/cat:rotate-[14deg]">
            <PackImage product={r} fit decorative morph={false} sizes="(min-width: 1024px) 14vw, 30vw" imgClassName="drop-shadow-[0_14px_16px_rgb(42_18_16/0.3)]" />
          </div>
          <div className="absolute bottom-0 left-1/2 z-10 h-[94%] w-[52%] -translate-x-1/2 transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)] group-hover/cat:-translate-y-[4%] group-hover/cat:scale-[1.04]">
            <PackImage product={c} fit decorative morph={false} sizes="(min-width: 1024px) 18vw, 40vw" imgClassName="drop-shadow-[0_20px_22px_rgb(42_18_16/0.34)]" />
          </div>
        </div>

        <span className="absolute inset-x-6 bottom-6 z-20 mt-auto flex items-center justify-between md:inset-x-8 md:bottom-8">
          <span className="inline-flex h-12 items-center gap-2 rounded-pill bg-flavour-ink px-6 text-base font-bold text-flavour">
            {cta}
            <SlideArrow />
          </span>
        </span>
      </TransitionLink>
    </article>
  );
}
