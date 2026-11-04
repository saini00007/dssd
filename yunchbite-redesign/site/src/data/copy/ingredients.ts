// Ingredients & Quality page copy (IQ-01…06). Existing copy; tables as on the site (claims to be corrected later).
// Note: the original numbering skips 05 (01, 02, 03, 04, 06); numbered here in the overview's section order.

export const seo = {
  title: "Ingredients & Quality | What's Inside Every Yunch Bite",
  description:
    "Complete ingredient transparency for Yunch Bite roasted makhana, popcorn, cashews and almonds, roasted or popped in olive oil. See what goes in every pack.",
};

export const ingredients = {
  "IQ-01": {
    title: "All About Ingredients & Product Quality",
    statement: "Quality isn't a claim. It's our commitment.",
    intro:
      "At Yunch Bite, quality isn't a claim – it's our commitment. From sourcing the finest ingredients to packaging the final pack, every step is taken with care so that you get nothing but the best.",
  },
  "IQ-02": {
    n: "01",
    heading: "Clean & Carefully Chosen Ingredients",
    lead: "We believe great snacks start with great ingredients. That's why we use only premium, naturally good and food-grade ingredients – with no compromise on purity.",
    points: [
      "High quality raw materials",
      "No artificial colors, flavors or preservatives",
      "100% Vegetarian",
      "Gluten Free",
      "Wholesome & nutritious by nature",
    ],
  },
  "IQ-03": {
    n: "02",
    heading: "Product Quality You Can Trust",
    lead: "Every Yunch Bite product goes through multiple quality checks to ensure you get consistent taste, freshness and nutrition in every bite.",
    oliveOil: {
      title: "The Goodness of Olive Oil",
      body: "Our makhana, nuts and popcorn are roasted / popped in premium quality olive oil – never fried. Olive oil is known for its heart-healthy fats and natural antioxidants, making our snacks a smarter and healthier choice.",
      chips: ["Supports Heart Health", "Rich in Natural Antioxidants", "Helps Maintain Healthy Cholesterol", "Adds a Better Crunch"],
      neverFried: "Never fried.",
    },
  },
  "IQ-04": {
    n: "03",
    heading: "Ingredients by Product Category",
    lead: "We believe in transparency. Here's exactly what goes into every pack of Yunch Bite.",
    columns: ["Flavour", "Ingredients"],
    tabs: [
      {
        key: "makhana",
        label: "Makhana",
        title: "A. Fox Nuts (Makhana)",
        rows: [
          { flavour: "Raw Makhana", ingredients: "Makhana (Fox Nuts)." },
          { flavour: "Berry Berry Paradise", ingredients: "Makhana (Fox Nuts), Olive Oil, Berry Seasoning [Sugar, Mixed Berry Powder, Citric Acid (INS 330), Natural Berry Flavour], Black Salt, Pink Salt, Spices & Condiments." },
          { flavour: "Pudina Masala", ingredients: "Makhana (Fox Nuts), Olive Oil, Pudina Seasoning [Iodized Salt, Mint Powder, Black Salt, Cumin Powder, Coriander Powder, Black Pepper, Spices & Condiments, Acidity Regulator (INS 330)]." },
          { flavour: "Himalayan Salt & Pepper", ingredients: "Makhana (Fox Nuts), Olive Oil, Himalayan Pink Salt, Black Pepper, Spices & Condiments." },
          { flavour: "Black Salt", ingredients: "Makhana (Fox Nuts), Olive Oil, Black Salt, Cumin Powder, Spices & Condiments, Acidity Regulator (INS 330)." },
          { flavour: "Chatpata Masala", ingredients: "Makhana (Fox Nuts), Olive Oil, Chat Masala [Iodized Salt, Black Salt, Dry Mango Powder, Cumin Powder, Black Pepper, Ginger Powder, Spices & Condiments, Acidity Regulator (INS 330)]." },
        ],
        note: "All our makhana is roasted in olive oil – never fried.",
      },
      {
        key: "popcorn",
        label: "Popcorn",
        title: "B. Popcorn",
        rows: [
          { flavour: "Salted Popcorn", ingredients: "Popcorn, Olive Oil, Iodized Salt." },
          { flavour: "Pudina Popcorn", ingredients: "Popcorn, Olive Oil, Pudina Seasoning [Iodized Salt, Mint Powder, Black Salt, Cumin Powder, Black Pepper, Spices & Condiments]." },
          { flavour: "Butter Popcorn", ingredients: "Popcorn, Olive Oil, Butter Seasoning [Maltodextrin, Butter Powder, Iodized Salt, Milk Solids, Natural Flavour, Spices, Anticaking Agent (INS 551)]." },
        ],
        note: "Our popcorn is popped in olive oil – not fried.",
      },
      {
        key: "nuts",
        label: "Nuts",
        title: "C. Nuts (Cashews & Almonds)",
        rows: [
          { flavour: "Roasted Cashews (Salted)", ingredients: "Cashews, Olive Oil, Iodized Salt." },
          { flavour: "Raw Cashews", ingredients: "Cashews." },
          { flavour: "Roasted Almonds (Salted)", ingredients: "Almonds, Olive Oil, Iodized Salt." },
          { flavour: "Raw Almonds", ingredients: "Almonds." },
        ],
        note: "Our nuts are carefully sourced and roasted in olive oil to retain natural goodness and crunch.",
      },
    ],
    additivesNote: "INS codes are the food-additive numbers printed on the pack: INS 330 is citric acid, INS 551 is an anticaking agent.",
  },
  "IQ-05": {
    n: "04",
    heading: "Packaging That Protects Quality",
    lead: "Goodness should reach you the way it's made. That's why we use high-quality, food-grade packaging that keeps our products fresh, crunchy and full of flavour for longer.",
    chips: [
      "Food-grade materials",
      "Resealable pouches / jars",
      "Moisture & air protection",
      "Travel & on-the-go friendly",
      "Eco-conscious & recyclable",
      "Quality sealed for freshness",
    ],
  },
  "IQ-06": {
    n: "05",
    heading: "Our Commitment",
    lead: "From farm to final pack, we are committed to delivering snacks that are clean, healthy and delicious – because your health and trust matter the most.",
    taglines: ["Better Ingredients.", "Better Quality.", "Better Snacks.", "Better Life."],
    steps: [
      { n: "01", title: "Quality Sourced" },
      { n: "02", title: "Quality Tested" },
      { n: "03", title: "Hygienically Processed" },
      { n: "04", title: "Packed with Care" },
      { n: "05", title: "Loved by Families" },
    ],
    signOff: "Yunch Bite – Yunchy Crunchy Healthy Bite",
  },
};
