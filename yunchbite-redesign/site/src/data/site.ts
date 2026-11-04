// Brand, contact, navigation, claims. Facts as on the current site (client decision: correct later).

export const site = {
  name: "Yunch Bite",
  /** Legal-ish long form used in structured data. */
  legalName: "Yunch Bite",
  url: "https://yunchbite.com",
  tagline: "Yunchy. Crunchy. Healthy Bite.",
  shortDescription:
    "Slow-roasted makhana, popcorn and dry fruits, roasted in olive oil with zero palm oil. Great taste, better choices.",
  founded: "2023-10-18",
  foundedLabel: "18 October 2023",
  founder: { name: "Mr. Nitin Rathi", role: "Founder & Managing Director" },
  contact: {
    // Phone exactly as on the current site (it has one digit too many; to be corrected with the client).
    phone: "+91 97850 009977",
    phoneHref: "tel:+9197850009977",
    email: "wecare@yunchbite.com",
    emailHref: "mailto:wecare@yunchbite.com",
    address: {
      lines: ["Khasra No. 25/32, Killa No. 14, 2, Tigaon", "Faridabad, Haryana, India – 121101"],
      full: "Khasra No. 25/32, Killa No. 14, 2, Tigaon, Faridabad, Haryana, India – 121101",
      locality: "Tigaon, Faridabad",
      region: "Haryana",
      postalCode: "121101",
      country: "IN",
    },
  },
  social: [
    { label: "Instagram", handle: "@yunchbite", href: "https://www.instagram.com/yunchbite" },
    { label: "Facebook", handle: "@yunchbite", href: "https://www.facebook.com/yunchbite" },
    { label: "LinkedIn", handle: "@yunchbite", href: "https://www.linkedin.com/company/yunchbite" },
  ],
  hashtag: "#YunchyJindgi",
  signOff: "Great taste. Better choices. A healthier way to snack.",
  /** FSSAI licence number: not on the current site. Add when the client supplies it. */
  fssai: null as string | null,
  legal: "© 2026 Yunch Bite. All rights reserved.",
} as const;

export interface NavLink {
  label: string;
  href: string;
}

/** Header pills (G-02). */
export const primaryNav: NavLink[] = [
  { label: "Products", href: "/products" },
  { label: "Bestsellers", href: "/bestsellers" },
  { label: "About", href: "/about" },
];

/** Header CTA (becomes "Where to buy" if marketplace links arrive, Q1). */
export const headerCta: NavLink = { label: "Partner with us", href: "/contact" };

/** Full-screen menu (G-03): the 9 main pages, in order. */
export const menuPages: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Bestsellers", href: "/bestsellers" },
  { label: "About", href: "/about" },
  { label: "Why Yunch Bite", href: "/why-yunch-bite" },
  { label: "Benefits", href: "/benefits" },
  { label: "Ingredients & Quality", href: "/ingredients-quality" },
  { label: "Blogs & Reviews", href: "/blogs-reviews" },
  { label: "Contact", href: "/contact" },
];

export const menuCategories: NavLink[] = [
  { label: "Makhana", href: "/categories/makhana" },
  { label: "Popcorn", href: "/categories/popcorn" },
  { label: "Dry Fruits", href: "/categories/dry-fruits" },
];

/** Footer (G-04). */
export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: "Products",
    links: [...menuCategories, { label: "Bestsellers", href: "/bestsellers" }],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Why Yunch Bite", href: "/why-yunch-bite" },
      { label: "Benefits", href: "/benefits" },
      { label: "Ingredients & Quality", href: "/ingredients-quality" },
    ],
  },
  { title: "Read", links: [{ label: "Blogs & Reviews", href: "/blogs-reviews" }] },
];

export const footerPartner = {
  label: "Stock Yunch Bite in your store →",
  href: "/contact",
};

export type ClaimIcon = "olive" | "no-palm" | "no-preservatives" | "protein" | "veg-gluten";

export interface Claim {
  key: string;
  /** Short label for chips and cards. */
  label: string;
  /** One line explaining it. */
  detail: string;
  icon: ClaimIcon;
}

/** The 5 core claims (HOME-04, PDP-04, Benefits). Explanations reuse /benefits copy where it exists. */
export const claims: Claim[] = [
  {
    key: "olive-oil",
    label: "Roasted in olive oil, never fried",
    detail: "Olive oil is rich in healthy fats and antioxidants that support heart health and overall wellness.",
    icon: "olive",
  },
  {
    key: "zero-palm-oil",
    label: "Zero palm oil",
    detail: "Olive oil goes in the pan. Palm oil never does.",
    icon: "no-palm",
  },
  {
    key: "no-preservatives",
    label: "No preservatives",
    detail: "We keep it real and clean. No artificial colors, flavors, or preservatives – ever.",
    icon: "no-preservatives",
  },
  {
    key: "protein-fibre",
    label: "High in protein & fibre",
    detail: "Supports digestion, keeps you fuller for longer and fuels your body.",
    icon: "protein",
  },
  {
    key: "gluten-free-veg",
    label: "Gluten-free & 100% vegetarian",
    detail: "Naturally gluten-free snacks that are easy to digest and suitable for most diets.",
    icon: "veg-gluten",
  },
];

/** Short chip strip used by the claims marquee (PRD-02): exact site wording, typo fixed. */
export const claimChips = [
  "Roasted in Olive Oil",
  "No Preservatives",
  "High in Protein & Fiber",
  "100% Vegetarian",
  "Gluten Free",
] as const;
