// Blogs & Reviews page and article template copy (BLOG-*, ART-*).

export const seo = {
  title: "Blogs & Reviews | The Yunch Journal | Yunch Bite",
  description:
    "Read the Yunch Journal: health and wellness reads, snacking tips and family-friendly ideas from the Yunch Bite team, plus what snackers say about us.",
};

export const blog = {
  "BLOG-01": {
    title: "The Yunch Journal",
    sub: "Snack smarter, one crunchy read at a time.",
    // "Sustainability" stays hidden until it has posts.
    categories: ["All", "Health & Wellness", "Snacking Tips", "Our Products", "Lifestyle"],
  },
  "BLOG-02": { readMore: "Read article →", featured: "Latest" },
  "BLOG-03": {
    heading: "Get the crunch in your inbox",
    body: "Subscribe for regular updates.",
    emailLabel: "Email",
    cta: "Subscribe",
    success: "You're in! Thumbs up from Buddy.",
  },
  "BLOG-04": {
    heading: "Customer Reviews",
    basis: "Based on customer reviews",
    sortLabel: "Most Recent",
    verified: "Verified Buyer",
    writeReview: "Write a Review",
  },
  "BLOG-05": { heading: "Join the #YunchyJindgi crowd", sub: "Tag @yunchbite and show us your snack o'clock." },
};

export const article = {
  breadcrumbRoot: "Blogs & Reviews",
  back: { label: "Back to Blogs & Reviews", href: "/blogs-reviews" },
  more: { heading: "More from the Yunch Journal", viewAll: { label: "View all", href: "/blogs-reviews" } },
  productCardLabel: "Try it",
};
