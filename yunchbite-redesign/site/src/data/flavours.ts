import type { Flavour } from "./types";
import type { FlavourKey } from "./keys";
import { packColors } from "./pack-colors";

/**
 * Flavour = what a pack tastes like (independent of format).
 * Colours come from the real pack photos via pack-colors.ts (assets agent).
 * Taste meters (0-5) are a rough read of each ingredient list, not lab data.
 */
type FlavourDraft = Omit<Flavour, "key" | "color" | "ink" | "colorSource">;

const drafts: Record<FlavourKey, FlavourDraft> = {
  "peri-peri": {
    name: "Peri-Peri Paradise",
    category: "makhana",
    ingredient: "chilli",
    tagline: "Thoda teekha, poora yunchy.",
    taste: { spice: 4, tang: 2, salt: 3, sweet: 0 },
    pairsWith: ["Movie night", "4 pm office slump", "Cold coffee"],
  },
  chatpata: {
    name: "Chatpata Masala",
    category: "makhana",
    ingredient: "chaat-star",
    tagline: "Street-side chaat, in your pocket.",
    taste: { spice: 3, tang: 4, salt: 3, sweet: 0 },
    pairsWith: ["Masala chai", "Tiffin break", "Road trips"],
  },
  "salt-pepper": {
    name: "Himalayan Salt & Pepper",
    category: "makhana",
    ingredient: "pepper",
    tagline: "Simple. Classic. Dangerously poppable.",
    taste: { spice: 2, tang: 0, salt: 3, sweet: 0 },
    pairsWith: ["Morning tea", "Desk drawer stash", "Gym bag"],
  },
  pudina: {
    name: "Pudina Masala",
    category: "makhana",
    ingredient: "pudina-leaf",
    tagline: "Thandi thandi crunch.",
    taste: { spice: 2, tang: 3, salt: 3, sweet: 0 },
    pairsWith: ["Summer evenings", "Nimbu pani", "Tiffin break"],
  },
  "cheese-herbs": {
    name: "Tangy Cheese & Herbs",
    category: "makhana",
    ingredient: "cheese",
    tagline: "Cheesy mood, zero guilt.",
    taste: { spice: 1, tang: 3, salt: 3, sweet: 0 },
    pairsWith: ["Movie night", "Game night", "After-school munching"],
  },
  "black-salt": {
    name: "Black Salt",
    category: "makhana",
    ingredient: "black-salt",
    tagline: "Kala namak, pure desi swag.",
    taste: { spice: 1, tang: 3, salt: 4, sweet: 0 },
    pairsWith: ["Masala chai", "Fasting-day snack", "Train journeys"],
  },
  "berry-berry": {
    name: "Berry Berry Paradise",
    category: "makhana",
    ingredient: "berry",
    tagline: "Sweet, zesty, a little cheeky.",
    taste: { spice: 0, tang: 3, salt: 1, sweet: 4 },
    pairsWith: ["Dessert o'clock", "Kids' lunchbox", "Weekend binge"],
  },
  "raw-makhana": {
    name: "Raw Makhana",
    category: "makhana",
    ingredient: "makhana-1",
    tagline: "Just makhana. Make it your own.",
    taste: { spice: 0, tang: 0, salt: 0, sweet: 0 },
    pairsWith: ["Your own kheer", "Home-made masala roast", "Breakfast bowls"],
  },
  "popcorn-salted": {
    name: "Salted Popcorn",
    category: "popcorn",
    ingredient: "salt",
    tagline: "Classic pop, no drama.",
    taste: { spice: 0, tang: 0, salt: 3, sweet: 0 },
    pairsWith: ["Movie night", "Netflix marathon", "Bag of the day"],
  },
  "popcorn-butter": {
    name: "Classic Butter Popcorn",
    category: "popcorn",
    ingredient: "butter",
    tagline: "Cinema-hall wali feeling.",
    taste: { spice: 0, tang: 0, salt: 3, sweet: 1 },
    pairsWith: ["Movie night", "Rainy days", "Cricket match"],
  },
  "popcorn-pudina": {
    name: "Pudina Masala Popcorn",
    category: "popcorn",
    ingredient: "pudina-leaf",
    tagline: "Pop, pudina, repeat.",
    taste: { spice: 2, tang: 3, salt: 3, sweet: 0 },
    pairsWith: ["Chai time", "Road trips", "Study break"],
  },
  "raw-almonds": {
    name: "California Raw Almonds",
    category: "dry-fruits",
    ingredient: "almond",
    tagline: "Pure badam, pure fuel.",
    taste: { spice: 0, tang: 0, salt: 0, sweet: 1 },
    pairsWith: ["Breakfast bowls", "Overnight soak", "Gym bag"],
  },
  "raw-cashews": {
    name: "Whole Raw Cashews",
    category: "dry-fruits",
    ingredient: "cashew",
    tagline: "Creamy, mellow, kaju at heart.",
    taste: { spice: 0, tang: 0, salt: 0, sweet: 2 },
    pairsWith: ["Mithai making", "Festive gifting", "Gravy night"],
  },
  "roasted-almonds": {
    name: "Slow Roasted Almonds",
    category: "dry-fruits",
    ingredient: "almond",
    tagline: "Slow-roasted. Snap guaranteed.",
    taste: { spice: 0, tang: 0, salt: 2, sweet: 1 },
    pairsWith: ["4 pm office slump", "Gym bag", "Road trips"],
  },
  "roasted-cashews": {
    name: "Slow Roasted Cashews",
    category: "dry-fruits",
    ingredient: "cashew",
    tagline: "Golden, salty, kaju-licious.",
    taste: { spice: 0, tang: 0, salt: 3, sweet: 1 },
    pairsWith: ["Evening chai", "Festive gifting", "Game night"],
  },
};

export const flavours = Object.fromEntries(
  (Object.keys(drafts) as FlavourKey[]).map((key) => [
    key,
    {
      key,
      ...drafts[key],
      color: packColors[key].color,
      ink: packColors[key].ink,
      colorSource: packColors[key].source,
    } satisfies Flavour,
  ]),
) as Record<FlavourKey, Flavour>;

export function getFlavour(key: FlavourKey | string): Flavour {
  const f = (flavours as Record<string, Flavour | undefined>)[key];
  if (!f) throw new Error(`Unknown flavour key: ${key}`);
  return f;
}
