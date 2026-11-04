// Shared content types: the contract between data, assets and components.
// Owned by the coordinator; change only with the coordinator's approval.

import type { FlavourKey } from "./keys";

export type CategoryKey = "makhana" | "popcorn" | "dry-fruits";

/** Pack formats. Product pages exist per format (existing URLs). */
export type Format = "pillow" | "zipper" | "jar" | "raw" | "pouch";

/** Paper-cut SVG shapes in /public/shapes/<name>.svg (pattern P17). */
export type ShapeName =
  | "makhana-1"
  | "makhana-2"
  | "makhana-3"
  | "makhana-4"
  | "makhana-5"
  | "chilli"
  | "pudina-leaf"
  | "pepper"
  | "salt"
  | "black-salt"
  | "cheese"
  | "herb-sprig"
  | "berry"
  | "chaat-star"
  | "popcorn"
  | "butter"
  | "almond"
  | "cashew"
  | "olive"
  | "oil-drop"
  | "tiffin";

/** Makhana Buddy poses available in /public/brand/buddy/. Missing poses fall back (see data/assets.ts). */
export type BuddyPose = "point" | "sit" | "peek" | "wave" | "walk" | "thumbs" | "confused" | "pop";

export interface TasteProfile {
  /** 0–5 */
  spice: number;
  tang: number;
  salt: number;
  sweet: number;
}

export interface Flavour {
  key: FlavourKey; // e.g. "peri-peri"
  name: string; // "Peri-Peri Paradise" (clean spelling)
  category: CategoryKey;
  /** Pack colour sampled from the real pack photo (or provisional, see colorSource). */
  color: string;
  /** Readable text colour on `color` (AA). */
  ink: string;
  colorSource: "pack-photo" | "provisional";
  /** The ingredient Makhana Buddy holds for this flavour. */
  ingredient: ShapeName;
  /** One short, playful line (brand voice, light Hinglish allowed). */
  tagline: string;
  taste: TasteProfile;
  pairsWith: string[];
}

export interface NutritionRow {
  label: string; // "Energy"
  value: string; // "428 kcal"
}

export interface Product {
  /** Existing URL slug, kept exactly: /products/<slug> */
  slug: string;
  /** Clean display name, e.g. "Peri-Peri Paradise" */
  name: string;
  flavourKey: FlavourKey;
  category: CategoryKey;
  format: Format;
  /** "Zipper Pouch", "Pillow Pouch", "Jar", "Raw", "Pouch" */
  formatLabel: string;
  sizes: string[]; // ["50 gm", "80 gm", "100 gm"]
  rating?: number;
  /** True only for the 11 products on the existing bestsellers list. */
  bestseller: boolean;
  /** First sentence: used on cards. */
  blurb: string;
  description: string;
  ingredients: string;
  nutrition: { servingSize: string; rows: NutritionRow[] };
  allergens: string;
  storage: string;
  shelfLife: string;
  origin: string;
  metaTitle: string;
  metaDescription: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Category {
  key: CategoryKey;
  /** /categories/<slug> */
  slug: CategoryKey;
  name: string; // "Makhana"
  title: string; // "Crunchy Outside, Wholesome Inside"
  subline: string; // "Light. Crunchy. Full of Goodness."
  statement: string; // e.g. "All our makhana is roasted in olive oil – never fried."
  color: string;
  ink: string;
  metaTitle: string;
  metaDescription: string;
  faq: FaqItem[];
}

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ol" | "ul"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "product"; slug: string };

export interface Article {
  slug: string;
  title: string;
  category: "Health & Wellness" | "Snacking Tips" | "Our Products" | "Lifestyle";
  date: string; // ISO yyyy-mm-dd
  readTime: string; // "4 min read"
  author: { name: string; role: string };
  hero: string; // /photos/blog/<file>
  heroAlt: string;
  lead: string;
  body: ArticleBlock[];
  metaTitle: string;
  metaDescription: string;
}

export interface Review {
  name: string;
  date: string;
  title: string;
  body: string;
  rating?: number;
}

/** Image entry for a product's pack. */
export interface PackAsset {
  /** Transparent cut-out (webp) or null when only a placeholder exists. */
  cutout: string | null;
  /** Original lifestyle photo of this exact pack, if it exists. */
  photo: string | null;
  width: number;
  height: number;
  /** True when the cut-out was auto-generated (background removal) and should be replaced by a studio cut-out. */
  interim: boolean;
}
