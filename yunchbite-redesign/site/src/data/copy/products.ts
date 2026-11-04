// Products hub (PRD-*) and product page (PDP-*) copy.

export const seo = {
  title: "Our Products | Makhana, Popcorn & Dry Fruits | Yunch Bite",
  description:
    "Explore the full range of Yunch Bite healthy snacks: slow-roasted makhana pouches and jars, gourmet popcorn, and premium dry fruits crafted with wholesome goodness.",
};

export const products = {
  "PRD-01": {
    title: "Our Products",
    tagline: "Wholesome, crunchy & made with premium ingredients for a better you.",
  },
  "PRD-03": {
    explore: "Explore",
    labels: { makhana: "Explore Makhana", popcorn: "Explore Popcorn", "dry-fruits": "Explore Dry Fruits" },
  },
  "PRD-04": { heading: "Best Selling Products", cta: { label: "See all bestsellers", href: "/bestsellers" } },
};

export const category = {
  filters: {
    makhana: ["All", "Raw", "Pillow", "Zipper", "Jar"],
    popcorn: [] as string[],
    "dry-fruits": ["All", "Raw", "Roasted"],
  },
  "CAT-04": { heading: "Quick questions" },
  "CAT-05": { heading: "More to munch" },
  formatChipLabel: "Formats",
};

export const pdp = {
  bestsellerBadge: "Bestseller",
  ratingLabel: "Rating",
  "PDP-02": { heading: "Pick your pack", sizesLabel: "Sizes" },
  "PDP-03": {
    heading: "Taste profile",
    meters: { spice: "Spice", tang: "Tang", salt: "Salt", sweet: "Sweet" },
    scale: "Out of 5",
    pairsHeading: "Pairs with",
  },
  "PDP-05": {
    heading: "What's inside",
    tabs: { ingredients: "Ingredients", nutrition: "Nutrition", allergens: "Allergens" },
    servingLabel: "Serving size",
    factsLabels: { storage: "Storage", shelfLife: "Shelf life", origin: "Made in" },
  },
  "PDP-06": { heading: "More to munch" },
  breadcrumbRoot: "Products",
};
