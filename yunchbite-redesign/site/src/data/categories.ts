import type { Category, CategoryKey } from "./types";

export const categories: Category[] = [
  {
    key: "makhana",
    slug: "makhana",
    name: "Makhana",
    title: "Crunchy Outside, Wholesome Inside",
    subline: "Light. Crunchy. Full of Goodness.",
    statement: "All our makhana is roasted in olive oil – never fried.",
    color: "#F1C396",
    ink: "#5A0B0B",
    metaTitle: "Makhana Range | Olive Oil Roasted Fox Nuts | Yunch Bite",
    metaDescription:
      "Seven bold makhana flavours, from fiery Peri-Peri to tangy Chatpata, slow-roasted in olive oil. Pick a pillow, zipper pouch or jar, and meet your crunch.",
    faq: [
      {
        q: "What is makhana?",
        a: "Makhana, also called fox nuts or lotus seeds, are the popped seeds of a water plant that grows in ponds. Ours are hand-graded, jumbo-sized and sourced from the fresh water ponds of Bihar.",
      },
      {
        q: "Is makhana fried?",
        a: "No – all our makhana is roasted in olive oil, never fried.",
      },
      {
        q: "Is Yunch Bite makhana gluten-free and vegetarian?",
        a: "Yes. It is naturally gluten-free and 100% vegetarian. It is made in a facility that also handles nuts and dairy, so check the allergen note on each product page.",
      },
      {
        q: "How long does it stay fresh?",
        a: "Zipper and pillow pouches are good for 6 months from the date of manufacturing, jars for 9 months and raw makhana for 12 months. Reseal after opening and store in a cool, dry place.",
      },
    ],
  },
  {
    key: "popcorn",
    slug: "popcorn",
    name: "Popcorn",
    title: "Simple Ingredients, Extra Happiness",
    subline: "Always a good idea for munching.",
    statement: "Our popcorn is popped in olive oil – not fried.",
    color: "#FFD84A",
    ink: "#4A1C0B",
    metaTitle: "Popcorn Range | Olive Oil Popped Snacks | Yunch Bite",
    metaDescription:
      "Light, fluffy popcorn popped in olive oil, never fried. Pick Salted, Classic Butter or Pudina Masala in a handy pillow pouch, made for movie nights.",
    faq: [
      {
        q: "Is Yunch Bite popcorn fried?",
        a: "No – our popcorn is popped in olive oil, not fried.",
      },
      {
        q: "Which popcorn flavours do you have?",
        a: "Three: Salted, Classic Butter and Pudina Masala. All come in a pillow pouch.",
      },
      {
        q: "Is the popcorn gluten-free?",
        a: "Yes, it is naturally gluten-free. The Butter popcorn contains milk solids, and all popcorn is made in a facility that handles nuts.",
      },
      {
        q: "How should I store it?",
        a: "Keep it in a cool, hygienic and dry place away from direct sunlight. It stays fresh for 6 months from the date of manufacturing.",
      },
    ],
  },
  {
    key: "dry-fruits",
    slug: "dry-fruits",
    name: "Dry Fruits",
    title: "Nourishment for a Healthier Tomorrow",
    subline: "Pure. Natural. Perfect for you.",
    statement: "Our nuts are carefully sourced and roasted in olive oil to retain natural goodness and crunch.",
    color: "#8A5A33",
    ink: "#FFFDF5",
    metaTitle: "Dry Fruits Range | Roasted & Raw Almonds, Cashews | Yunch Bite",
    metaDescription:
      "Premium California almonds and whole cashews, raw or slow-roasted. Pure, simple nuts for desk drawers, gym bags and gifting, packed to stay fresh and crunchy.",
    faq: [
      {
        q: "What is the difference between raw and roasted nuts?",
        a: "Raw almonds and cashews are the plain nut, with nothing added. Slow-roasted ones are roasted to a golden crisp and lightly salted.",
      },
      {
        q: "Where do the nuts come from?",
        a: "Our almonds are California nonpareil almonds and our cashews are whole cashews from the groves of Mangalore.",
      },
      {
        q: "Do the nuts contain allergens?",
        a: "Yes. They contain tree nuts (almonds or cashews) and are processed in a dedicated nut facility.",
      },
      {
        q: "Which pack sizes are available?",
        a: "Resealable zipper pouches of 100 gm, 250 gm and 500 gm. Raw nuts stay fresh for 9 months and roasted nuts for 6 months from the date of manufacturing.",
      },
    ],
  },
];

export function getCategory(key: CategoryKey | string): Category | undefined {
  return categories.find((c) => c.key === key);
}
