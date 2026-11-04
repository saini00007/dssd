// Canonical flavour keys shared by data (flavours.ts, products.ts) and assets (pack-colors.ts, assets.ts).
// Owned by the coordinator.

export const FLAVOUR_KEYS = [
  // Makhana (7 flavours + raw)
  "peri-peri",
  "chatpata",
  "salt-pepper",
  "pudina",
  "cheese-herbs",
  "black-salt",
  "berry-berry",
  "raw-makhana",
  // Popcorn
  "popcorn-salted",
  "popcorn-butter",
  "popcorn-pudina",
  // Dry fruits
  "raw-almonds",
  "raw-cashews",
  "roasted-almonds",
  "roasted-cashews",
] as const;

export type FlavourKey = (typeof FLAVOUR_KEYS)[number];

/** The 7 seasoned makhana flavours shown on the flavour stage (HOME-02), in display order. */
export const MAKHANA_STAGE_ORDER: FlavourKey[] = [
  "peri-peri",
  "chatpata",
  "salt-pepper",
  "pudina",
  "cheese-herbs",
  "black-salt",
  "berry-berry",
];
