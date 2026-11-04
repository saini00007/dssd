// Benefits page copy (BEN-01…05). Existing copy, spelling cleaned. Nutrition values as on the site.

export const seo = {
  title: "Benefits | Why Yunch Bite Is a Wholesome Choice",
  description:
    "High in protein and fibre, roasted in olive oil, gluten-free and made without preservatives. See what's good in every Yunch Bite and the nutrition per 100 g.",
};

export const benefits = {
  "BEN-01": {
    title: "What Are the Benefits of Yunch Bite Products?",
    shortTitle: "What's good in every bite",
    intro:
      "At Yunch Bite, every product is thoughtfully crafted to deliver the perfect balance of taste, nutrition, and quality. From ingredients to packaging, we focus on every detail to make your snacking experience healthy, safe, and satisfying.",
  },
  "BEN-02": {
    n: "01",
    heading: "Wholesome Benefits for a Better You",
    lead: "Yunch Bite snacks are more than just tasty – they are made to support your everyday wellness. Here's what makes them a smart choice:",
    cards: [
      { title: "High in Protein", detail: "Helps build and repair body tissues, supports muscle health and keeps you energized." },
      { title: "Rich in Fiber", detail: "Supports healthy digestion, keeps you full for longer and promotes gut health." },
      { title: "Roasted in Olive Oil", detail: "Olive oil is rich in healthy fats and antioxidants that support heart health and overall wellness." },
      { title: "No Preservatives or Additives", detail: "We keep it real and clean. No artificial colors, flavors, or preservatives – ever." },
      { title: "Gluten Free", detail: "Naturally gluten free snacks that are easy to digest and suitable for most diets." },
      { title: "Great Taste, Guilt-Free", detail: "Crunchy, flavorful and satisfying – without the extra calories or unhealthy oils." },
      { title: "Goodness in Every Bite", detail: "Our makhana, nuts and popcorn are packed with essential nutrients like iron, magnesium, potassium and antioxidants that help support immunity, bone health and overall well-being." },
    ],
  },
  "BEN-03": {
    n: "02",
    heading: "Nutritional Value You Can Trust",
    lead: "Here's a general nutritional profile of our roasted makhana (per 100g*):",
    columns: ["Nutrient", "Approx. Per 100g*", "% Daily Value**"],
    /** `dv` is the numeric % DV used to size the bars; `dvLabel` is the text as printed. */
    rows: [
      { nutrient: "Energy", value: "347 kcal", dvLabel: "17%", dv: 17 },
      { nutrient: "Protein", value: "9.7 g", dvLabel: "19%", dv: 19 },
      { nutrient: "Carbohydrates", value: "76.9 g", dvLabel: "26%", dv: 26 },
      { nutrient: "Dietary Fiber", value: "7.6 g", dvLabel: "27%", dv: 27 },
      { nutrient: "Total Fat", value: "0.1 g", dvLabel: "0.2%", dv: 0.2 },
      { nutrient: "Saturated Fat", value: "0 g", dvLabel: "0%", dv: 0 },
      { nutrient: "Trans Fat", value: "0 g", dvLabel: "0%", dv: 0 },
      { nutrient: "Cholesterol", value: "0 mg", dvLabel: "0%", dv: 0 },
      { nutrient: "Sodium", value: "5 mg", dvLabel: "0.2%", dv: 0.2 },
      { nutrient: "Iron", value: "4.9 mg", dvLabel: "27%", dv: 27 },
      { nutrient: "Calcium", value: "60 mg", dvLabel: "6%", dv: 6 },
      { nutrient: "Potassium", value: "430 mg", dvLabel: "12%", dv: 12 },
    ],
    footnotes: ["*Values may vary slightly with flavor.", "**% Daily Value based on a 2000 kcal diet."],
    /** Clarifies what the table describes (plain roasted makhana vs flavoured packs). */
    note: "This is plain roasted makhana. Flavoured packs vary; see each product page for its own numbers.",
    ingredients: {
      title: "Clean & Quality Ingredients",
      lead: "We use ingredients that are carefully selected and naturally better.",
      points: [
        "Premium-quality makhana, nuts & kernels",
        "Roasted in olive oil for better health",
        "Natural spices & seasonings",
        "No artificial colors or flavors",
        "No preservatives or MSG",
      ],
    },
  },
  "BEN-04": {
    n: "03",
    heading: "Packaging That Protects Goodness",
    lead: "We believe good food deserves good packaging. That's why all our products come with:",
    pickLabel: "Pick a pack",
    formats: [
      { key: "pillow", label: "Pillow pouch", line: "Small, light and made for one-person munching." },
      { key: "zipper", label: "Zipper pouch", line: "Reseal it, stash it, and it stays crunchy." },
      { key: "jar", label: "Jar", line: "An airtight countertop jar you can reuse." },
    ],
    features: [
      { title: "Hygienic & Food-Grade Packaging", detail: "Ensures safety and freshness in every pack." },
      { title: "Resealable Pouches / Jars", detail: "Keeps your snacks fresh, crunchy and tasty for longer." },
      { title: "Moisture & Air Protection", detail: "Specially designed packs that lock out moisture and air to maintain quality." },
      { title: "Travel & On-the-Go Friendly", detail: "Lightweight, easy to carry and perfect for your busy life." },
      { title: "Eco-Conscious Materials", detail: "We are moving towards sustainable and recyclable packaging solutions." },
    ],
  },
  "BEN-05": {
    n: "04",
    heading: "Quality You Can Rely On",
    lead: "Every Yunch Bite product goes through strict quality checks at every step – from sourcing raw materials to the final pack – to ensure you receive nothing but the best.",
    taglines: ["Better Ingredients. Better You.", "Healthy Crunch. Happy Life."],
    promise: "That's the Yunch Bite promise.",
    chips: ["Better Taste", "Better Nutrition", "Better Choices", "Better You"],
    closing: "Yunch Bite is not just a snack – it's a better choice for a healthier, happier and more balanced lifestyle.",
  },
};
