"use client";
import { useRef, type CSSProperties } from "react";
import { RingBurst, type RingBurstHandle } from "@/components/motion/RingBurst";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { Icon } from "@/components/ui/Icon";
import { useCursorLabel } from "@/components/layout/CursorLabel";
import { cursorLabel } from "@/data/copy/shared";
import { FlavourBuddy } from "./FlavourBuddy";
import { PackImage } from "./PackImage";
import type { FlavourGroup } from "@/components/products/groups";
import { cn } from "@/lib/cn";

/**
 * CAT-02 card: ONE card per flavour. The pack and name link to the flavour's main page; the format chips
 * (Pillow 12 gm, Zipper 50 gm, Jar 80 gm ... straight from the data) link to each format's own page.
 * Hover/focus: ring burst, pack lift, Buddy peeks, cursor label (same language as PackCard).
 */
export function FlavourCard({ group: g, activeFormat, priority, className }: { group: FlavourGroup; activeFormat?: string; priority?: boolean; className?: string }) {
  const ring = useRef<RingBurstHandle>(null);
  const cursor = useCursorLabel(cursorLabel);
  const vars = { "--flavour": g.color, "--flavour-ink": g.ink } as CSSProperties;
  const target = (activeFormat && g.formats.find((f) => f.format === activeFormat)) || null;
  const href = `/products/${(target ?? g.formats.find((f) => f.slug === g.rep.slug) ?? g.formats[0]).slug}`;

  return (
    <article className={cn("group/card relative h-full", className)} style={vars}>
      <div className="pointer-events-none absolute bottom-full right-[8%] z-0 mb-[-26px] w-[30%] translate-y-[88%] transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)] group-hover/card:translate-y-0 group-has-[a:focus-visible]/card:translate-y-0">
        <FlavourBuddy flavour={{ ingredient: g.ingredient, name: g.name }} pose="peek" hand={{ x: -8, y: 54, size: 40, rotate: -16 }} />
      </div>

      <div
        {...cursor}
        onPointerEnter={(e) => {
          cursor.onPointerEnter(e);
          ring.current?.burst();
        }}
        className="relative z-10 flex h-full flex-col overflow-hidden rounded-card bg-[color-mix(in_srgb,var(--flavour)_16%,var(--color-cream))] transition-shadow duration-[var(--dur-pop)] hover:shadow-[var(--shadow-lift)] has-[a:focus-visible]:shadow-[var(--shadow-lift)]"
      >
        <div className="relative aspect-[5/5] w-full">
          <div aria-hidden="true" className="absolute left-1/2 top-[52%] aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-flavour" />
          <div className="absolute left-1/2 top-[53%] aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2">
            <RingBurst ref={ring} color={g.color} />
          </div>
          <div className="absolute inset-x-[22%] bottom-[8%] top-[10%] transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)] will-change-transform group-hover/card:-translate-y-[5%] group-hover/card:rotate-[2.5deg] group-hover/card:scale-[1.06] group-has-[a:focus-visible]/card:-translate-y-[5%] group-has-[a:focus-visible]/card:rotate-[2.5deg] group-has-[a:focus-visible]/card:scale-[1.06]">
            <div className="absolute inset-0">
              <PackImage product={g.rep} size="md" fit priority={priority} morph decorative imgClassName="drop-shadow-[0_18px_22px_rgb(42_18_16/0.28)]" />
            </div>
          </div>
        </div>

        <div className="mt-auto px-5 pb-5 pt-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="display-type text-[length:clamp(1.35rem,2.1vw,1.9rem)] leading-[0.95]">
                {/* stretched link: the whole card is clickable, the chips sit above it */}
                <TransitionLink href={href} eager={false} className="outline-offset-4 after:absolute after:inset-0 after:z-10 after:rounded-card">
                  {g.name}
                </TransitionLink>
              </h3>
              <p className="mt-1.5 text-sm text-ink/75">{g.tagline}</p>
            </div>
            <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-cream transition-[background-color,transform] duration-[var(--dur-pop)] ease-[var(--ease-crunch)] group-hover/card:rotate-[-45deg] group-hover/card:bg-red">
              <Icon name="arrow" />
            </span>
          </div>
          <ul className="relative z-20 mt-3 flex flex-wrap gap-1.5" aria-label="Formats">
            {g.formats.map((f) => {
              const on = activeFormat === f.format;
              return (
                <li key={f.slug}>
                  <TransitionLink
                    href={`/products/${f.slug}`}
                    eager={false}
                    className={cn(
                      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill border px-3 py-1.5 text-xs font-semibold leading-none transition-colors duration-[var(--dur-quick)]",
                      on ? "border-transparent bg-flavour text-flavour-ink" : "border-ink/30 hover:border-transparent hover:bg-flavour hover:text-flavour-ink focus-visible:bg-flavour focus-visible:text-flavour-ink",
                    )}
                  >
                    <span className="font-bold">{f.formatLabel}</span>
                    <span className="tabular opacity-85">{f.sizes}</span>
                  </TransitionLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </article>
  );
}
