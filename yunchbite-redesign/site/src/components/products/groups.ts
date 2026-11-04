// Server-side helpers: group products by flavour (one card per flavour) and shape plain, serialisable data for client views.
import { products } from "@/data/products";
import { getFlavour } from "@/data/flavours";
import { MAKHANA_STAGE_ORDER } from "@/data/keys";
import type { CategoryKey, Format, ShapeName } from "@/data/types";

export const FORMAT_ORDER: Format[] = ["pillow", "zipper", "jar", "raw", "pouch"];
/** Which pack represents a flavour on cards and carousels (the one with a real cut-out first). */
const REP_ORDER: Format[] = ["zipper", "pillow", "jar", "raw", "pouch"];

export interface FormatLink {
  slug: string;
  format: Format;
  formatLabel: string;
  /** "50 · 80 · 100 gm" */
  sizes: string;
}

export interface FlavourGroup {
  key: string;
  name: string;
  tagline: string;
  color: string;
  ink: string;
  ingredient: ShapeName;
  category: CategoryKey;
  bestseller: boolean;
  /** The product whose pack and page represent the flavour. */
  rep: { slug: string; name: string; formatLabel: string; flavourKey: string };
  formats: FormatLink[];
}

/** "50 gm", "80 gm" -> "50 · 80 gm" */
export function compactSizes(sizes: string[]): string {
  if (sizes.length === 0) return "";
  const unit = sizes[0].replace(/^[\d.]+\s*/, "");
  const sameUnit = sizes.every((s) => s.replace(/^[\d.]+\s*/, "") === unit);
  return sameUnit ? `${sizes.map((s) => s.replace(/\s*[a-zA-Z]+$/, "")).join(" · ")} ${unit}` : sizes.join(" · ");
}

export function flavourGroups(category: CategoryKey): FlavourGroup[] {
  const inCat = products.filter((p) => p.category === category);
  const keys: string[] = [];
  for (const p of inCat) if (!keys.includes(p.flavourKey)) keys.push(p.flavourKey);
  if (category === "makhana") {
    const rank = (k: string) => {
      const i = (MAKHANA_STAGE_ORDER as string[]).indexOf(k);
      return i === -1 ? 99 : i;
    };
    keys.sort((a, b) => rank(a) - rank(b));
  }
  return keys.map((key) => {
    const list = inCat.filter((p) => p.flavourKey === key);
    const f = getFlavour(key);
    const rep = REP_ORDER.map((fm) => list.find((p) => p.format === fm)).find(Boolean) ?? list[0];
    const formats = [...list]
      .sort((a, b) => FORMAT_ORDER.indexOf(a.format) - FORMAT_ORDER.indexOf(b.format))
      .map((p) => ({ slug: p.slug, format: p.format, formatLabel: p.formatLabel.replace(/ Pouch$/, ""), sizes: compactSizes(p.sizes) }));
    return {
      key,
      name: f.name,
      tagline: f.tagline,
      color: f.color,
      ink: f.ink,
      ingredient: f.ingredient,
      category,
      bestseller: list.some((p) => p.bestseller),
      rep: { slug: rep.slug, name: rep.name, formatLabel: rep.formatLabel, flavourKey: rep.flavourKey },
      formats,
    };
  });
}

/** Plain pack data (what a PackImage needs) from a product. */
export function packData(p: { slug: string; name: string; formatLabel: string; flavourKey: string }) {
  return { slug: p.slug, name: p.name, formatLabel: p.formatLabel, flavourKey: p.flavourKey };
}
export type PackData = ReturnType<typeof packData>;
