"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/components/motion/gsap";
import { FilterPills } from "@/components/sections/FilterPills";
import { ArticleCard, type ArticleCardData } from "./ArticleCard";

export interface JournalGridProps {
  articles: ArticleCardData[];
  categories: string[];
  readMore: string;
  featuredLabel: string;
}

/** BLOG-01/02: category pills filter the grid; the newest match is the large feature card. */
export function JournalGrid({ articles, categories, readMore, featuredLabel }: JournalGridProps) {
  const [cat, setCat] = useState("All");
  const wrap = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const options = categories
    .map((c) => ({ value: c, label: c, count: c === "All" ? articles.length : articles.filter((a) => a.category === c).length }))
    .filter((o) => o.value === "All" || o.count > 0);
  const list = cat === "All" ? articles : articles.filter((a) => a.category === cat);
  const [feature, ...rest] = list;

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = wrap.current;
    if (el && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(el.children, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.06, clearProps: "transform,opacity" });
    }
  }, [cat]);

  return (
    <div>
      <FilterPills label="Filter articles by category" options={options} value={cat} onChange={setCat} />
      <p className="sr-only" role="status" aria-live="polite">
        Showing {list.length} {list.length === 1 ? "article" : "articles"}{cat !== "All" ? ` in ${cat}` : ""}
      </p>
      <div ref={wrap} className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="journal-list">
        {feature && (
          <div className="md:col-span-2 lg:col-span-3">
            <ArticleCard article={feature} featured badge={featuredLabel} readMore={readMore} priority headingLevel={2} />
          </div>
        )}
        {rest.map((a) => (
          <ArticleCard key={a.slug} article={a} readMore={readMore} />
        ))}
      </div>
    </div>
  );
}
