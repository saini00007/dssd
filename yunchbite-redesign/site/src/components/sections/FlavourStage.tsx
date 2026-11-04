import type { ReactNode } from "react";
import { getFlavour } from "@/data/flavours";
import { products } from "@/data/products";
import type { FlavourKey } from "@/data/keys";
import type { Product, ShapeName } from "@/data/types";
import { FlavourStageView } from "./FlavourStageView";

/**
 * FlavourStage (P04 = R3-D1 line-up + R1-D0 disc/character pop/odometer). Shared: Home (HOME-02) and Bestsellers.
 *
 * Props (all serialisable-friendly, this is a server component that hands plain data to the client view):
 *  - `title`        heading text (h2 by default), e.g. "7 Flavours. 1 Crunch."
 *  - `flavourKeys`  which flavours, in order (e.g. `MAKHANA_STAGE_ORDER`). Ignored when `items` is given.
 *  - `productFor`   `(key) => Product` that the centre pack links to. Default: the flavour's zipper-pouch product.
 *  - `items`        alternative to the two above: fully specified slides `FlavourStageItem[]`.
 *  - `id`           anchor id (default "flavours"); `eyebrow`, `ctaLabel` ("View flavour →"), `numberLabel` ("No."),
 *                   `prevLabel` / `nextLabel` (button names), `headingLevel` (2 | 1), `also` (ReactNode under the stage).
 *  - `morph`        pack morph into the product hero (default true). Every pack uses the shared `pack-<slug>`
 *                   view-transition name, so a product that also appears elsewhere on the page must pass
 *                   `morph={false}` THERE (Home does that in the Bestsellers strip).
 *  - `behind`       colour in the arch corners (previous section background), default cream. `arch` (default true).
 *
 * Behaviour: endless row (wraps), centre pack x1.4 on a colour disc, buttons + ← → keys + swipe, the whole stage
 * background crossfades to the flavour colour (~1 s), Buddy holding the flavour's ingredient pops from behind the
 * pack, name and number roll like an odometer, polite live region announces the flavour. Reduced motion: crossfade only.
 * All slides' text and links are in the server HTML (inactive ones are `inert`).
 */
export interface FlavourStageItem {
  key: string;
  name: string;
  tagline: string;
  /** Stage colour and a readable ink on it. */
  color: string;
  ink: string;
  ingredient: ShapeName;
  /** The product whose pack is shown and linked. */
  product: Pick<Product, "slug" | "name" | "formatLabel" | "flavourKey">;
}

export interface FlavourStageProps {
  title: string;
  flavourKeys?: FlavourKey[];
  productFor?: (key: FlavourKey) => Product | undefined;
  items?: FlavourStageItem[];
  id?: string;
  eyebrow?: string;
  ctaLabel?: string;
  numberLabel?: string;
  prevLabel?: string;
  nextLabel?: string;
  headingLevel?: 1 | 2;
  also?: ReactNode;
  morph?: boolean;
  arch?: boolean;
  behind?: string;
}

const zipperFor = (key: FlavourKey): Product | undefined =>
  products.find((p) => p.flavourKey === key && p.format === "zipper") ?? products.find((p) => p.flavourKey === key);

function isDark(hex: string): boolean {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) < 0.28;
}

export function FlavourStage({
  title,
  flavourKeys = [],
  productFor = zipperFor,
  items,
  id = "flavours",
  eyebrow,
  ctaLabel = "View flavour →",
  numberLabel = "No.",
  prevLabel = "Previous flavour",
  nextLabel = "Next flavour",
  headingLevel = 2,
  also,
  morph = true,
  arch = true,
  behind,
}: FlavourStageProps) {
  const slides: FlavourStageItem[] =
    items ??
    flavourKeys.flatMap((key) => {
      const f = getFlavour(key);
      const product = productFor(key);
      if (!product) return [];
      return [{ key, name: f.name, tagline: f.tagline, color: f.color, ink: f.ink, ingredient: f.ingredient, product }];
    });
  if (slides.length === 0) return null;

  return (
    <FlavourStageView
      title={title}
      id={id}
      eyebrow={eyebrow}
      ctaLabel={ctaLabel}
      numberLabel={numberLabel}
      prevLabel={prevLabel}
      nextLabel={nextLabel}
      headingLevel={headingLevel}
      morph={morph}
      arch={arch}
      behind={behind}
      slides={slides.map((s) => ({
        key: s.key,
        name: s.name,
        tagline: s.tagline,
        color: s.color,
        ink: s.ink,
        dark: isDark(s.color),
        ingredient: s.ingredient,
        product: {
          slug: s.product.slug,
          name: s.product.name,
          formatLabel: s.product.formatLabel,
          flavourKey: s.product.flavourKey,
        },
      }))}
    >
      {also}
    </FlavourStageView>
  );
}
