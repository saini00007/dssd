// Validates src/data. Run: node scripts/data/validate.mjs   (from site/)
// Compiles the data modules to a temp dir (CommonJS) with the local tsc, then checks the real exports.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dataDir = join(root, "src/data");
const out = mkdtempSync(join(tmpdir(), "yb-data-"));
const tsconfig = join(out, "tsconfig.json");
writeFileSync(
  tsconfig,
  JSON.stringify({
    compilerOptions: { target: "ES2020", module: "commonjs", moduleResolution: "node", outDir: join(out, "js"), rootDir: dataDir, strict: true, skipLibCheck: true, esModuleInterop: true },
    include: [join(dataDir, "**/*.ts")],
  }),
);
execFileSync(join(root, "node_modules/.bin/tsc"), ["-p", tsconfig], { stdio: "inherit" });
const require = createRequire(import.meta.url);
const d = require(join(out, "js/index.js"));

let failures = 0;
const check = (ok, msg) => {
  if (!ok) { failures++; console.error("FAIL:", msg); }
};

const EXPECTED = [
  "dryfruits-raw-almonds", "dryfruits-raw-cashews", "dryfruits-roasted-almonds", "dryfruits-roasted-cashews",
  "makhana-jar-chatpataa", "makhana-jar-peri-peri", "makhana-jar-salt-pepper",
  "makhana-pillow-chatpataa", "makhana-pillow-peri-peri", "makhana-pillow-salt-pepper",
  "makhana-raw-1",
  "makhana-zipper-berry-berry", "makhana-zipper-black-salt", "makhana-zipper-chatpataa", "makhana-zipper-cheese-herbs",
  "makhana-zipper-peri-peri", "makhana-zipper-pudina", "makhana-zipper-salt-pepper",
  "popcorn-butter", "popcorn-pudina", "popcorn-salted",
];

// Products
const slugs = d.products.map((p) => p.slug);
check(d.products.length === 21 && new Set(slugs).size === 21, "21 unique product slugs");
check(JSON.stringify([...slugs].sort()) === JSON.stringify([...EXPECTED].sort()), "product slugs equal the expected list");
for (const p of d.products) {
  for (const f of ["name", "ingredients", "allergens", "storage", "shelfLife", "origin", "description", "blurb", "metaTitle", "metaDescription"])
    check(typeof p[f] === "string" && p[f].trim().length > 0, `${p.slug}.${f} non-empty`);
  check(p.nutrition.rows.length >= 9 && p.nutrition.servingSize, `${p.slug} nutrition rows + serving size`);
  check(p.sizes.length > 0, `${p.slug} sizes`);
  check(d.FLAVOUR_KEYS.includes(p.flavourKey), `${p.slug} flavourKey ${p.flavourKey} exists`);
  check(!!d.flavours[p.flavourKey], `${p.slug} flavour record exists`);
  check(d.getFlavour(p.flavourKey).name === p.name, `${p.slug} name matches flavour name`);
}
check(d.bestsellers().length === 11, "11 bestsellers");
check(d.productsByCategory("makhana").length === 14 && d.productsByCategory("popcorn").length === 3 && d.productsByCategory("dry-fruits").length === 4, "category counts 14/3/4");
const rel = d.relatedProducts(d.getProduct("makhana-zipper-peri-peri"));
check(rel.length === 6 && rel[0].flavourKey === "peri-peri" && rel[1].flavourKey === "peri-peri", "related: same flavour first");
check(d.siblingFormats(d.getProduct("makhana-zipper-peri-peri")).length === 2, "siblingFormats peri-peri zipper = 2");

// Flavours
check(d.FLAVOUR_KEYS.every((k) => d.flavours[k]), "every flavour key has a flavour");
for (const k of d.FLAVOUR_KEYS) {
  const f = d.flavours[k];
  check(f.tagline.split(/\s+/).length <= 8, `${k} tagline <= 8 words`);
  check(f.pairsWith.length === 3, `${k} has 3 pairsWith`);
  check(Object.values(f.taste).every((n) => n >= 0 && n <= 5), `${k} taste 0-5`);
}

// Categories
check(d.categories.length === 3, "3 categories");
for (const c of d.categories) {
  check(c.metaDescription.length >= 140 && c.metaDescription.length <= 160, `${c.key} metaDescription 140-160 (is ${c.metaDescription.length})`);
  check(c.faq.length === 4, `${c.key} has 4 FAQs`);
}

// Articles
check(d.articles.length === 5, "5 articles");
for (const a of d.articles) {
  check(a.body.length >= 2, `${a.slug} body >= 2 blocks`);
  check(a.body.filter((b) => b.type === "product").length === 1, `${a.slug} has one product block`);
  check(a.body.filter((b) => b.type === "product").every((b) => d.getProduct(b.slug)), `${a.slug} product block slug exists`);
  check(/^\d{4}-\d{2}-\d{2}$/.test(a.date), `${a.slug} ISO date`);
}

// Reviews
check(d.reviews.length === 6 && d.SHOW_REVIEWS === false, "6 reviews, SHOW_REVIEWS false");

// SEO descriptions
for (const [name, mod] of Object.entries({ home: d.homeCopy, products: d.productsCopy, bestsellers: d.bestsellersCopy, about: d.aboutCopy, why: d.whyCopy, benefits: d.benefitsCopy, ingredients: d.ingredientsCopy, blog: d.blogCopy, contact: d.contactCopy, notFound: d.notFoundCopy })) {
  check(mod.seo && mod.seo.title && mod.seo.description, `${name} has seo`);
  if (name !== "notFound") check(mod.seo.description.length >= 120 && mod.seo.description.length <= 165, `${name} seo description 120-165 (is ${mod.seo.description.length})`);
  check(mod.seo.title.length <= 65, `${name} seo title <= 65 (is ${mod.seo.title.length})`);
}

// Banned strings anywhere in src/data (own source), excluding this kind of check list.
const BANNED = ["Peri- Peri", "Protien", "Heathy", "!!!", "YunchBite", "Chatpataa Masala"];
function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".ts") ? [p] : [];
  });
}
for (const f of walk(dataDir)) {
  const src = readFileSync(f, "utf8");
  for (const b of BANNED) check(!src.includes(b), `${f.replace(root + "/", "")} contains "${b}"`);
}

rmSync(out, { recursive: true, force: true });
if (failures) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("OK: all data checks passed (21 products, 11 bestsellers, 15 flavours, 3 categories, 5 articles, 6 reviews).");
