// Parses the harvested product pages and writes src/data/products.ts.
// SEO: hand-written meta descriptions (120–160 chars) where the old ones were too long or too short.
const META_OVERRIDES = {
  "makhana-jar-chatpataa": "Chatpata Masala makhana: tangy chaat spices on crunchy fox nuts, roasted in olive oil with zero palm oil and packed in an airtight countertop jar.",
  "makhana-pillow-peri-peri": "Peri-Peri Paradise makhana: fox nuts roasted in olive oil and tossed in a fiery peri-peri blend. The perfect balance of crunch and spice, in a 12 gm pack.",
  "makhana-raw-1": "Raw makhana from the fresh-water ponds of Bihar: hand-graded, jumbo fox nuts, unprocessed and naturally rich in plant protein, calcium and antioxidants.",
  "makhana-zipper-black-salt": "Black Salt makhana: roasted fox nuts with mineral-rich kala namak and roasted cumin. Olive-oil roasted, zero palm oil, in a resealable zipper pouch.",
  "makhana-zipper-chatpataa": "Chatpata Masala makhana: tangy street-chaat spices over slow-roasted, crispy fox nuts. Olive-oil roasted, zero palm oil, in an airtight zipper pouch.",
  "makhana-zipper-cheese-herbs": "Tangy Cheese & Herbs makhana: cheddar cheese with oregano and basil over slow-roasted fox nuts. Roasted in olive oil, in a resealable zipper pouch.",
  "makhana-zipper-peri-peri": "Peri-Peri Paradise makhana: fox nuts roasted in olive oil and seasoned with a fiery peri-peri blend, in a resealable zip-lock pouch that keeps it fresh.",
  "makhana-zipper-pudina": "Pudina Masala makhana: garden mint and rock salt over slow-roasted makhana in virgin olive oil. Fresh, light and crunchy, in a resealable zipper pouch."
};
// Run: node scripts/data/extract-products.mjs   (from site/)
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const PAGES = resolve(here, "../../../research/current-site/pages");
const OUT = resolve(here, "../../src/data/products.ts");

const SLUGS = [
  "dryfruits-raw-almonds", "dryfruits-raw-cashews", "dryfruits-roasted-almonds", "dryfruits-roasted-cashews",
  "makhana-jar-chatpataa", "makhana-jar-peri-peri", "makhana-jar-salt-pepper",
  "makhana-pillow-chatpataa", "makhana-pillow-peri-peri", "makhana-pillow-salt-pepper",
  "makhana-raw-1",
  "makhana-zipper-berry-berry", "makhana-zipper-black-salt", "makhana-zipper-chatpataa",
  "makhana-zipper-cheese-herbs", "makhana-zipper-peri-peri", "makhana-zipper-pudina", "makhana-zipper-salt-pepper",
  "popcorn-butter", "popcorn-pudina", "popcorn-salted",
];

const BESTSELLERS = new Set([
  "makhana-pillow-peri-peri", "makhana-pillow-chatpataa", "makhana-zipper-peri-peri", "makhana-zipper-chatpataa",
  "makhana-zipper-salt-pepper", "makhana-jar-peri-peri", "makhana-jar-chatpataa", "popcorn-salted", "popcorn-butter",
  "dryfruits-roasted-cashews", "dryfruits-roasted-almonds",
]);

const FLAVOUR_BY_SLUG = {
  "dryfruits-raw-almonds": "raw-almonds", "dryfruits-raw-cashews": "raw-cashews",
  "dryfruits-roasted-almonds": "roasted-almonds", "dryfruits-roasted-cashews": "roasted-cashews",
  "makhana-raw-1": "raw-makhana", "popcorn-butter": "popcorn-butter", "popcorn-pudina": "popcorn-pudina", "popcorn-salted": "popcorn-salted",
};
const FLAVOUR_NAME = {
  "peri-peri": "Peri-Peri Paradise", chatpata: "Chatpata Masala", "salt-pepper": "Himalayan Salt & Pepper",
  pudina: "Pudina Masala", "cheese-herbs": "Tangy Cheese & Herbs", "black-salt": "Black Salt", "berry-berry": "Berry Berry Paradise",
  "raw-makhana": "Raw Makhana", "popcorn-salted": "Salted Popcorn", "popcorn-butter": "Classic Butter Popcorn",
  "popcorn-pudina": "Pudina Masala Popcorn", "raw-almonds": "California Raw Almonds", "raw-cashews": "Whole Raw Cashews",
  "roasted-almonds": "Slow Roasted Almonds", "roasted-cashews": "Slow Roasted Cashews",
};
const CATEGORY_LABEL = { makhana: "Makhana", popcorn: "Popcorn", "dry-fruits": "Dry Fruits" };

function flavourKey(slug) {
  if (FLAVOUR_BY_SLUG[slug]) return FLAVOUR_BY_SLUG[slug];
  const m = slug.match(/^makhana-(?:zipper|pillow|jar)-(.+)$/);
  const f = m[1];
  return f === "chatpataa" ? "chatpata" : f;
}

/** Spelling and formatting clean-up. Facts are left exactly as on the site. */
function clean(s) {
  return s
    .replace(/Peri-\s+Peri/g, "Peri-Peri")
    .replace(/Chatpataa/g, "Chatpata")
    .replace(/Yunch\s?[Bb]ite/g, "Yunch Bite")
    .replace(/Protien/g, "Protein")
    .replace(/Heathy/g, "Healthy")
    .replace(/that satisfy your cravings/g, "that satisfies your cravings")
    .replace(/!!!/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function section(md, label) {
  const re = new RegExp(`### \\[Button: ${label}\\]\\s*\\n([\\s\\S]*?)(?=\\n### |\\n## |$)`);
  const m = md.match(re);
  if (!m) throw new Error(`missing section ${label}`);
  return m[1].trim();
}

const titleCase = (label) => label.charAt(0).toUpperCase() + label.slice(1);

function blurbOf(desc) {
  const parts = desc.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [desc];
  let b = parts[0].trim();
  if (b.length < 40 && parts[1]) b = `${b} ${parts[1].trim()}`;
  return b;
}

const products = SLUGS.map((slug) => {
  const dir = `${PAGES}/products-${slug}`;
  const md = readFileSync(`${dir}/content.md`, "utf8");
  const meta = JSON.parse(readFileSync(`${dir}/meta.json`, "utf8"));
  const category = slug.startsWith("makhana") ? "makhana" : slug.startsWith("popcorn") ? "popcorn" : "dry-fruits";
  const fk = flavourKey(slug);
  const body = md.slice(md.indexOf("\n# ") + 1);
  const afterH1 = body.slice(body.indexOf("\n") + 1);
  const header = afterH1.slice(0, afterH1.indexOf("## Description"));
  const lines = header.split("\n").map((l) => l.trim()).filter((l) => l && l !== "|");
  const formatLabel = lines[0];
  const rating = Number(lines[lines.length - 1]);
  const sizes = lines.slice(1, -1);
  if (!Number.isFinite(rating) || sizes.length < 1) throw new Error(`bad header in ${slug}: ${JSON.stringify(lines)}`);
  const format = { "Zipper Pouch": "zipper", "Pillow Pouch": "pillow", Jar: "jar", Raw: "raw" }[formatLabel];
  if (!format) throw new Error(`unknown format ${formatLabel}`);

  const description = clean(afterH1.match(/## Description\s*\n([\s\S]*?)\n### /)[1]);
  const nutRaw = section(md, "Nutritional Information").split("\n").map((l) => l.trim()).filter(Boolean);
  const nut = [];
  for (let i = 0; i < nutRaw.length; i += 2) nut.push([titleCase(nutRaw[i]), nutRaw[i + 1]]);
  const [sv, ...rows] = nut;
  if (sv[0] !== "Serving Size") throw new Error(`no serving size in ${slug}`);
  const name = FLAVOUR_NAME[fk];
  const fmtMeta = { zipper: "Zipper Pouch", pillow: "Pillow Pouch", jar: "Jar", raw: "Raw" }[format];
  const lead = category === "makhana" && !name.includes("Makhana") ? `${name} Makhana` : name;
  const metaTitle = format === "raw" ? `${lead} | Yunch Bite` : `${lead} (${fmtMeta}) | Yunch Bite`;
  return {
    slug, name, flavourKey: fk, category, format, formatLabel, sizes, rating,
    bestseller: BESTSELLERS.has(slug),
    blurb: blurbOf(description),
    description,
    ingredients: clean(section(md, "Ingredients")),
    nutrition: { servingSize: sv[1], rows: rows.map(([label, value]) => ({ label, value })) },
    allergens: clean(section(md, "Allergen Information")),
    storage: clean(section(md, "Storage Instructions")),
    shelfLife: clean(section(md, "Shelf Life")),
    origin: clean(section(md, "Country of Origin")),
    metaTitle,
    metaDescription: META_OVERRIDES[slug] ?? clean(meta.description),
  };
});

const header = `// GENERATED by scripts/data/extract-products.mjs from the harvest (research/current-site/pages),
// then free to edit by hand. Facts are as on the current site (client decision: correct later);
// only spelling and formatting were cleaned.
import type { CategoryKey, Product } from "./types";
import type { FlavourKey } from "./keys";

export const products: Product[] = ${JSON.stringify(products, null, 2)};

const bySlug = new Map(products.map((p) => [p.slug, p]));

export function getProduct(slug: string): Product | undefined {
  return bySlug.get(slug);
}

export function productsByCategory(cat: CategoryKey): Product[] {
  return products.filter((p) => p.category === cat);
}

export function productsByFlavour(key: FlavourKey | string): Product[] {
  return products.filter((p) => p.flavourKey === key);
}

/** The same flavour in the other formats (excludes the product itself). */
export function siblingFormats(product: Product): Product[] {
  return products.filter((p) => p.flavourKey === product.flavourKey && p.slug !== product.slug);
}

export function bestsellers(): Product[] {
  return products.filter((p) => p.bestseller);
}

/** Same flavour in other formats first, then other flavours in the same category, then everything else. */
export function relatedProducts(product: Product, n = 6): Product[] {
  const siblings = siblingFormats(product);
  const sameCat = products.filter(
    (p) => p.category === product.category && p.flavourKey !== product.flavourKey,
  );
  const others = products.filter((p) => p.category !== product.category);
  const seen = new Set<string>([product.slug]);
  const out: Product[] = [];
  for (const p of [...siblings, ...sameCat, ...others]) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    out.push(p);
    if (out.length === n) break;
  }
  return out;
}
`;
writeFileSync(OUT, header);
console.log(`wrote ${products.length} products to ${OUT}`);
