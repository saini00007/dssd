import { Fragment } from "react";
import type { Article } from "@/data";
import { getProduct } from "@/data/products";
import { PackCard } from "@/components/product/PackCard";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";

/** "Rich in Plant-Based Protein: Every serving…" -> bold lead-in + the rest. */
function Item({ text }: { text: string }) {
  const i = text.indexOf(": ");
  if (i > 0 && i < 60) {
    return (
      <>
        <strong className="font-bold text-ink">{text.slice(0, i)}.</strong> {text.slice(i + 2)}
      </>
    );
  }
  return <>{text}</>;
}

/**
 * ART-04: editorial body. Measure <= 68ch, 1.18rem / 1.75, generous rhythm, h2s as display type, numbered
 * outline numerals for ordered lists, a pull quote, and an inline product card for `product` blocks.
 */
export function Prose({ blocks, tryIt }: { blocks: Article["body"]; tryIt: string }) {
  return (
    <div className="mx-auto w-full max-w-[68ch] px-gutter text-[1.1875rem] leading-[1.78] text-ink/90 md:text-[1.25rem]">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} className="display-type mb-5 mt-[clamp(3rem,6vw,4.5rem)] scroll-mt-28 text-[length:clamp(1.9rem,3.6vw,2.9rem)] leading-[0.98] text-ink">
                {b.text}
              </h2>
            );
          case "p":
            return (
              <p key={i} className="mt-6 first:mt-0">
                {b.text}
              </p>
            );
          case "ol":
            return (
              <ol key={i} className="mt-8 space-y-6">
                {b.items.map((t, j) => (
                  <li key={j} className="relative pl-[3.4rem]">
                    <span aria-hidden="true" className="display-type text-outline absolute left-0 top-0 text-[2.6rem] leading-[0.9] text-red">{j + 1}</span>
                    <Item text={t} />
                  </li>
                ))}
              </ol>
            );
          case "ul":
            return (
              <ul key={i} className="mt-8 space-y-3">
                {b.items.map((t, j) => (
                  <li key={j} className="flex gap-3">
                    <Icon name="check" className="mt-[0.45em] size-5 shrink-0 text-red" />
                    <span>
                      <Item text={t} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote key={i} className="display-type my-12 border-l-[6px] border-yellow pl-6 text-[length:clamp(1.8rem,3.4vw,2.8rem)] leading-[1] text-maroon">
                {b.text}
              </blockquote>
            );
          case "product": {
            const p = getProduct(b.slug);
            if (!p) return <Fragment key={i} />;
            return (
              <Reveal key={i} className="not-prose my-14 max-w-[420px] mx-auto md:mx-0">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-maroon">{tryIt}</p>
                <PackCard product={p} morph={false} headingLevel={3} />
              </Reveal>
            );
          }
        }
      })}
    </div>
  );
}
