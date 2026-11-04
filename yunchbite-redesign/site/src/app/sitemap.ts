import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { articles } from "@/data/articles";

const MAIN = ["/products", "/bestsellers", "/about", "/why-yunch-bite", "/benefits", "/ingredients-quality", "/blogs-reviews", "/contact"];

/** All 38 routes: home + 8 main pages, 3 categories, 21 products, 5 articles. /lab is excluded. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], lastModified: Date = now) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });
  return [
    entry("/", 1, "weekly"),
    ...MAIN.map((p) => entry(p, p === "/products" || p === "/bestsellers" ? 0.9 : 0.7, "monthly")),
    ...categories.map((c) => entry(`/categories/${c.slug}`, 0.8, "monthly")),
    ...products.map((p) => entry(`/products/${p.slug}`, 0.8, "monthly")),
    ...articles.map((a) => entry(`/articles/${a.slug}`, 0.6, "yearly", new Date(a.date))),
  ];
}
