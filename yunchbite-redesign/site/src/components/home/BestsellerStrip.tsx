import { PackCard } from "@/components/product/PackCard";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/motion/Reveal";
import { TypeIn } from "@/components/motion/TypeIn";
import type { Product } from "@/data/types";
import { DragRow } from "./DragRow";

export interface BestsellerStripProps {
  heading: string;
  sub: string;
  cta: { label: string; href: string };
  products: Product[];
  /** Slugs that also appear elsewhere on the page (their pack morph must be off here). */
  noMorph: string[];
}

/** HOME-08: bestsellers as PackCards in a draggable, snapping, keyboard-scrollable row. */
export function BestsellerStrip({ heading, sub, cta, products, noMorph }: BestsellerStripProps) {
  return (
    <section aria-labelledby="bestsellers-title" data-header-theme="light" className="relative bg-cream-2 py-section">
      <Container className="mb-4 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <TypeIn as="h2" id="bestsellers-title" text={heading} className="display-type text-[length:var(--text-display)] leading-[0.92]" />
          <p className="mt-4 max-w-[34ch] text-lg">{sub}</p>
        </div>
        <ButtonLink href={cta.href} variant="solid" size="lg">
          {cta.label}
        </ButtonLink>
      </Container>
      <DragRow label="Bestselling products, scroll sideways" className="gap-5 px-gutter pb-14 pt-28 [scroll-padding-inline:var(--gutter)]">
        {products.map((p, i) => (
          <Reveal as="li" key={p.slug} delay={Math.min(i, 6) * 0.06} y={50} className="flex w-[clamp(250px,24vw,330px)] shrink-0 snap-start">
            <div className="w-full">
              <PackCard product={p} morph={!noMorph.includes(p.slug)} eager={false} />
            </div>
          </Reveal>
        ))}
      </DragRow>
    </section>
  );
}
