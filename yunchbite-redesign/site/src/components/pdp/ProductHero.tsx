import { ViewTransition, type CSSProperties } from "react";
import { TransitionLink as Link } from "@/components/ui/TransitionLink";
import { TypeIn } from "@/components/motion/TypeIn";
import { Pill } from "@/components/ui/Pill";
import { Icon } from "@/components/ui/Icon";
import { PackImage } from "@/components/product/PackImage";
import { FlavourBuddy } from "@/components/product/FlavourBuddy";
import type { Product, Flavour, Category } from "@/data/types";

export interface ProductHeroProps {
  product: Product;
  flavour: Flavour;
  category: Category;
  copy: { bestsellerBadge: string; ratingLabel: string; breadcrumbRoot: string; sizesLabel: string };
}

/**
 * PDP-01: flavour-tinted stage, giant flavour title, chips, rating, bestseller badge, the hero pack and the flavour Buddy.
 * Markup only: PdpFlight (client) runs the entrance and the scroll flight through the data-* hooks below.
 * Desktop + motion: the stage is sticky inside a taller section (about 1.8 viewports) so the pack can fly up across the title.
 */
export function ProductHero({ product: p, flavour: f, category, copy }: ProductHeroProps) {
  const vars = { "--flavour": f.color, "--flavour-ink": f.ink } as CSSProperties;
  return (
    <section
      data-hero=""
      aria-label={p.name}
      data-header-theme="light"
      className="relative bg-[color-mix(in_srgb,var(--flavour)_13%,var(--color-cream))] text-ink motion-safe:lg:h-[calc(100svh+80vh)]"
      style={vars}
    >
      <div data-stage="" className="relative z-20 flex min-h-[100svh] flex-col px-gutter pb-8 pt-[calc(var(--header-h)+0.75rem)] motion-safe:lg:sticky motion-safe:lg:top-0 motion-safe:lg:h-[100svh]">
        {/* flavour disc behind the pack (clipped to the stage so it never spills into the next section) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            data-disc=""
            data-yb-anim="lcp"
            className="absolute bottom-[-14%] left-1/2 aspect-square w-[min(118vw,max(46rem,96vh))] -translate-x-1/2 rounded-full bg-[color-mix(in_srgb,var(--flavour)_42%,var(--color-cream))]"
          />
        </div>

        <nav aria-label="Breadcrumb" className="relative z-10 mx-auto w-full max-w-[var(--container-max)] text-sm font-semibold text-ink/70">
          <ol className="flex flex-wrap items-center gap-x-2">
            <li>
              <Link href="/products" className="underline-offset-4 hover:underline">
                {copy.breadcrumbRoot}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/categories/${category.slug}`} className="underline-offset-4 hover:underline">
                {category.name}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              {p.formatLabel}
            </li>
          </ol>
        </nav>

        <div className="relative z-10 mx-auto flex w-full max-w-[var(--container-max)] flex-col items-center text-center">
          <ViewTransition name="pdp-title" share="morph" default="none">
            <TypeIn as="h1" text={p.name} trigger="load" className="display-type mt-3 block max-w-[16ch] text-[length:clamp(2.7rem,8.6vw,8.8rem)] leading-[0.86] md:max-w-[20ch]" />
          </ViewTransition>
          <p data-in="sub" data-yb-anim="lcp" className="mt-4 max-w-[52ch] text-[length:clamp(1rem,1.25vw,1.15rem)] text-ink/85">
            {p.description}
          </p>
          <div data-in="chips" data-yb-anim="lcp" className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {p.bestseller && (
              <Pill tone="yellow" className="border-ink/20">
                <Icon name="star" className="size-3.5 text-red" />
                {copy.bestsellerBadge}
              </Pill>
            )}
            <Pill tone="flavour">{p.formatLabel}</Pill>
            <Pill tone="outline">
              <span className="sr-only">{copy.sizesLabel}: </span>
              {p.sizes.join(" · ")}
            </Pill>
            {p.rating != null && (
              <Pill tone="cream" className="border-ink/20">
                <Icon name="star" className="size-3.5 text-red" />
                <span className="sr-only">{copy.ratingLabel}: </span>
                <span className="tabular">{p.rating.toFixed(1)}</span>
              </Pill>
            )}
          </div>
        </div>

        {/* natural resting place of the pack */}
        <div className="relative z-10 mx-auto mt-4 flex w-full max-w-[var(--container-max)] flex-1 items-end justify-center">
          <div data-slot="" className="relative h-[clamp(15rem,45vh,36rem)] min-h-[15rem] w-[min(78vw,30rem)] flex-none">
            <div data-pack="" className="pointer-events-none absolute inset-0 will-change-transform">
              <div data-in="pack" data-yb-anim="lcp" className="absolute inset-0">
                <PackImage product={p} morph priority size="hero" fit imgClassName="drop-shadow-[0_28px_32px_rgb(42_18_16/0.32)]" />
              </div>
            </div>
          </div>
          <div data-in="aside" data-yb-anim="lcp" className="pointer-events-none absolute bottom-6 left-0 hidden max-w-[17rem] text-left lg:block">
            <p className="display-type text-[length:clamp(1.3rem,2vw,1.9rem)] leading-[1.02]">{f.tagline}</p>
          </div>
          <div data-in="buddy" data-yb-anim="lcp" aria-hidden="true" className="pointer-events-none absolute bottom-0 right-[2%] hidden w-[clamp(7rem,15vw,15rem)] sm:block lg:right-[6%]">
            <FlavourBuddy flavour={f} pose="peek" hand={{ x: -14, y: 58, size: 44, rotate: -14 }} />
          </div>
        </div>
      </div>
    </section>
  );
}
