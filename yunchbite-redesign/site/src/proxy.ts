import { NextResponse, type NextRequest } from "next/server";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { articles } from "@/data/articles";

/**
 * Real 404s for unknown slugs.
 *
 * With Cache Components + Partial Prefetching, a dynamic route streams its static shell before the page
 * can call `notFound()`, so an unknown slug would answer 200 (with a noindex tag): a soft 404. Next's docs
 * recommend a request-time check in Proxy for a proper status. Known slugs pass straight through to the
 * prerendered pages; anything else is rewritten to a path with no route, which renders `app/not-found.tsx`
 * with status 404.
 */
const KNOWN: Record<string, Set<string>> = {
  products: new Set(products.map((p) => p.slug)),
  categories: new Set(categories.map((c) => c.slug)),
  articles: new Set(articles.map((a) => a.slug)),
};

export function proxy(request: NextRequest) {
  const [, section, slug, ...rest] = request.nextUrl.pathname.split("/");
  const known = KNOWN[section];
  if (!known || !slug) return NextResponse.next();
  if (rest.length > 0 || !known.has(slug)) {
    return NextResponse.rewrite(new URL("/__not-found", request.url), { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/products/:path+", "/categories/:path+", "/articles/:path+"],
};
