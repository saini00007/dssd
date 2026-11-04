// Home page copy, keyed by section ID from docs/05-site-overview.md.

export const seo = {
  title: "Yunch Bite | Roasted Makhana, Popcorn & Dry Fruits",
  description:
    "Crunchy makhana, popcorn and dry fruits slow-roasted in olive oil with zero palm oil. Seven bold flavours and a healthier way to snack, for every age.",
};

export const home = {
  "HOME-01": {
    headline: "Yunchy. Crunchy. Healthy Bite.",
    line: "Slow-roasted in olive oil. Zero palm oil. All crunch.",
    primaryCta: { label: "Find your flavour", href: "#flavours" },
    secondaryCta: { label: "Partner with us", href: "/contact" },
  },
  "HOME-02": {
    id: "flavours",
    heading: "7 Flavours. 1 Crunch.",
    cta: "View flavour →",
    numberLabel: "No.",
    also: { label: "Also:", links: [{ label: "Popcorn", href: "/categories/popcorn" }, { label: "Dry Fruits", href: "/categories/dry-fruits" }] },
    prev: "Previous flavour",
    next: "Next flavour",
  },
  "HOME-03": {
    before: "Ye Hai Aam Jindgi",
    after: "Ye Hai Yunchy Jindgi",
    beforeCaption: "Same old chips. Same sad desk.",
    afterCaption: "Olive-oil roasted. Flavour loaded. Proper crunch.",
  },
  "HOME-04": {
    eyebrow: "Why it's better",
    heading: "Five reasons to snack smarter",
  },
  "HOME-05": {
    heading: "Choose your crunch",
    cta: "Explore",
    counts: { makhana: "14 products", popcorn: "3 products", "dry-fruits": "4 products" },
  },
  "HOME-06": {
    eyebrow: "From pond to pack",
    heading: "How a makhana becomes a Yunch Bite",
    steps: [
      { n: "01", title: "Hand-picked makhana", detail: "Jumbo fox nuts, hand-graded and sourced from the fresh water ponds of Bihar." },
      { n: "02", title: "Slow-roasted in olive oil", detail: "Roasted, never fried." },
      { n: "03", title: "Seasoned with real spices", detail: "Natural spice blends, tossed through every kernel." },
      { n: "04", title: "Packed fresh, resealable", detail: "Food-grade pouches and jars that lock out moisture and air." },
    ],
  },
  "HOME-07": {
    eyebrow: "Snack o'clock",
    heading: "Any time is crunch time",
    occasions: [
      { key: "tiffin", title: "Tiffin break", line: "A tiffin that comes back empty." },
      { key: "office", title: "4 pm office slump", line: "Skip the vending machine. Reach for a pouch." },
      { key: "movie", title: "Movie night", line: "Popcorn's job. Makhana's side hustle." },
      { key: "chai", title: "Chai time", line: "Chai's favourite crunchy friend." },
      { key: "travel", title: "Travel", line: "Zip it, pack it, munch it on the move." },
    ],
  },
  "HOME-08": {
    heading: "Bestsellers",
    sub: "The packs everyone reaches for first.",
    cta: { label: "See all bestsellers", href: "/bestsellers" },
  },
  "HOME-09": {
    heading: "Meet our Makhana Buddy!",
    body: "Say ‘Hello’ to our fun-loving, energetic & mischievous little buddy who makes every snack moment more exciting, and brings a lot of smiles to every bite!",
    bubble: "Psst… want a flavour?",
    clickHint: "Poke him.",
  },
  "HOME-10": {
    heading: "Know more",
    cards: [
      { n: "01", title: "Why you should prefer Yunch Bite?", href: "/why-yunch-bite" },
      { n: "02", title: "What are the benefits of Yunch Bite products?", href: "/benefits" },
      { n: "03", title: "All about ingredients and quality", href: "/ingredients-quality" },
    ],
  },
  "HOME-11": {
    heading: "Loved by snackers",
    sub: "Join the #YunchyJindgi crowd on Instagram.",
  },
  "HOME-12": {
    // Uses shared partnerBand copy.
  },
  /** Brand block and "Purity in Every Pack" (existing copy), for use where the layout wants them. */
  brand: {
    title: "Yunchy Crunchy Healthy Bite",
    body: "Yunch Bite brings together the power of energy and the joy of a bite, symbolising our belief that every snack should be delicious, nourishing, and full of life. It reflects our Mission to make healthy snacking a delightful part of everyday living.",
  },
  purity: {
    heading: "Purity in Every Pack",
    body: "At Yunch Bite, every pack is made with premium ingredients, hygienic processing and strict quality control to give you a healthy and tasty snack you can trust.",
  },
  heroSlides: ["Let the Crunch Begin", "Flavours That Spark Joy", "The Crunch You'll Remember", "100% Roasted Zero Guilt"],
};
