import type { Review } from "./types";

/**
 * Hidden until the client confirms these are genuine customer reviews.
 * All six are dated within one week of May 2024 and look like placeholders (open question Q5).
 * Pages must check this flag before rendering reviews, the aggregate rating, or any review schema.
 */
export const SHOW_REVIEWS = false;

/** Exact text as on the current /blogs-reviews page. Per-review star ratings were not in the harvest. */
export const reviews: Review[] = [
  {
    name: "Neha Sharma",
    date: "2024-05-24",
    title: "Super crunchy and so healthy!",
    body: "Yunch Bite makhana is my go-to snack! It's light, crunchy and full of flavour. I feel good about giving it to my kids too.",
  },
  {
    name: "Rohit Verma",
    date: "2024-05-23",
    title: "Whole family loves it!",
    body: "Finally a snack that the whole family enjoys. The quality, taste and packaging – everything is top notch.",
  },
  {
    name: "Priya Malhotra",
    date: "2024-05-22",
    title: "Tasty, healthy and guilt-free!",
    body: "I love that it's roasted, not fried. Perfect snack for work breaks. Totally guilt-free and very tasty.",
  },
  {
    name: "Amit Khanna",
    date: "2024-05-21",
    title: "Amazing quality!",
    body: "You can really taste the freshness and quality in every bite. The flavours are just perfect.",
  },
  {
    name: "Sneha Iyer",
    date: "2024-05-20",
    title: "My evening snack fix!",
    body: "Light, crunchy and super tasty, I keep a pack in my bag always. Highly recommended!",
  },
  {
    name: "Vivek Singh",
    date: "2024-05-19",
    title: "Great taste, better choice.",
    body: "Love the healthy ingredients and zero compromises on taste. Yunch Bite is simply the best!",
  },
];

/** As shown on the current site: "4.8, based on customer reviews" (no count). Distribution in percent. */
export const reviewAggregate = {
  average: 4.8,
  basis: "Based on customer reviews",
  distribution: [
    { stars: 5, percent: 82 },
    { stars: 4, percent: 13 },
    { stars: 3, percent: 4 },
    { stars: 2, percent: 1 },
    { stars: 1, percent: 0 },
  ],
} as const;
