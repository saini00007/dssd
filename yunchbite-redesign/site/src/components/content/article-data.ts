import { articlesByDate, type Article } from "@/data";
import { blogImages } from "@/data/assets";
import type { ArticleCardData } from "./ArticleCard";

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** The real blog image for an article (the `hero` path in the data points at files that do not exist). */
export function articleImage(a: Pick<Article, "slug" | "heroAlt">) {
  const img = blogImages[a.slug];
  return { ...img, alt: a.heroAlt };
}

export function toCard(a: Article): ArticleCardData {
  return { slug: a.slug, title: a.title, category: a.category, dateISO: a.date, dateLabel: formatDate(a.date), readTime: a.readTime, lead: a.lead, image: articleImage(a) };
}

export function articleCards(list: Article[] = articlesByDate()): ArticleCardData[] {
  return list.map(toCard);
}
