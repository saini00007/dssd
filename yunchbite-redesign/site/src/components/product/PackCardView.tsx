"use client";
import { useRef, type CSSProperties } from "react";
import { RingBurst, type RingBurstHandle } from "@/components/motion/RingBurst";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { Pill } from "@/components/ui/Pill";
import { Icon } from "@/components/ui/Icon";
import { useCursorLabel } from "@/components/layout/CursorLabel";
import { cursorLabel } from "@/data/copy/shared";
import { FlavourBuddy } from "./FlavourBuddy";
import { PackImage } from "./PackImage";
import { cn } from "@/lib/cn";

export interface PackCardData {
  slug: string;
  name: string;
  flavourKey: string;
  formatLabel: string;
  sizes: string[];
  color: string;
  ink: string;
  ingredient: import("@/data/types").ShapeName;
}

export function PackCardView({
  card,
  priority,
  morph = true,
  eager = true,
  headingLevel = 3,
  className,
}: {
  card: PackCardData;
  priority?: boolean;
  morph?: boolean;
  eager?: boolean;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}) {
  const ring = useRef<RingBurstHandle>(null);
  const cursor = useCursorLabel(cursorLabel);
  const Heading = `h${headingLevel}` as "h3";
  const vars = { "--flavour": card.color, "--flavour-ink": card.ink } as CSSProperties;

  return (
    <article className={cn("group/card relative", className)} style={vars}>
      {/* Buddy peeks over the top edge (behind the card body) */}
      <div className="pointer-events-none absolute bottom-full right-[8%] z-0 mb-[-26px] w-[30%] translate-y-[88%] transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)] group-hover/card:translate-y-0 group-has-[a:focus-visible]/card:translate-y-0">
        <FlavourBuddy flavour={{ ingredient: card.ingredient, name: card.name }} pose="peek" hand={{ x: -6, y: 40, size: 40, rotate: -18 }} />
      </div>

      <TransitionLink
        href={`/products/${card.slug}`}
        eager={eager}
        {...cursor}
        onPointerEnter={(e) => {
          cursor.onPointerEnter(e);
          ring.current?.burst();
        }}
        onFocus={(e) => {
          if (e.currentTarget.matches(":focus-visible")) ring.current?.burst();
        }}
        className="relative z-10 block overflow-hidden rounded-card bg-[color-mix(in_srgb,var(--flavour)_16%,var(--color-cream))] outline-offset-4 transition-shadow duration-[var(--dur-pop)] hover:shadow-[var(--shadow-lift)] focus-visible:shadow-[var(--shadow-lift)]"
      >
        <div className="relative aspect-[5/5.4] w-full">
          {/* flavour-colour disc */}
          <div aria-hidden="true" className="absolute left-1/2 top-[52%] aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-flavour" />
          <div className="absolute left-1/2 top-[53%] aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2">
            <RingBurst ref={ring} color={card.color} />
          </div>
          {/* pack lifts on hover with the crunch ease */}
          <div className="absolute inset-x-[22%] bottom-[8%] top-[10%] transition-transform duration-[var(--dur-pop)] ease-[var(--ease-crunch)] will-change-transform group-hover/card:-translate-y-[5%] group-hover/card:rotate-[2.5deg] group-hover/card:scale-[1.06] group-has-[a:focus-visible]/card:-translate-y-[5%] group-has-[a:focus-visible]/card:rotate-[2.5deg] group-has-[a:focus-visible]/card:scale-[1.06]">
            <div className="absolute inset-0 flex items-end">
              <PackImage product={card} size="md" priority={priority} morph={morph} decorative imgClassName="drop-shadow-[0_18px_22px_rgb(42_18_16/0.28)]" />
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 px-5 pb-5 pt-1">
          <div className="min-w-0">
            <Heading className="display-type text-[length:clamp(1.35rem,2.1vw,1.9rem)] leading-[0.95]">{card.name}</Heading>
            <p className="sr-only">{card.formatLabel}</p>
            <div className="mt-3 flex flex-wrap gap-1.5" aria-hidden="true">
              <Pill size="sm" tone="flavour">
                {card.formatLabel}
              </Pill>
              <Pill size="sm" tone="outline">
                {card.sizes.join(" · ")}
              </Pill>
            </div>
          </div>
          <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-cream transition-[background-color,transform] duration-[var(--dur-pop)] ease-[var(--ease-crunch)] group-hover/card:rotate-[-45deg] group-hover/card:bg-red">
            <Icon name="arrow" />
          </span>
        </div>
      </TransitionLink>
    </article>
  );
}
