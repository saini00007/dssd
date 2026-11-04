/**
 * Site-wide QA (phase C): every URL in the sitemap gets the same checks.
 *  - HTML level (fast, no browser): status, title/description/canonical/OG, unique titles,
 *    valid JSON-LD, every <img> has alt, every internal link resolves.
 *  - Browser level: one visible h1, no console/page errors or failed requests,
 *    no horizontal overflow (desktop + 390 px), axe (serious/critical) under reduced motion.
 *
 * Run against a production build:  BASE_URL=http://localhost:3200 npx playwright test tests/site-wide.spec.ts
 */
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const BASE = process.env.BASE_URL || "http://localhost:3100";

async function sitemapPaths(request: import("@playwright/test").APIRequestContext): Promise<string[]> {
  const xml = await (await request.get("/sitemap.xml")).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`, "i"));
  return m ? m[1] : null;
}

function headMeta(html: string) {
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  const byName = (n: string) => metas.map((t) => (attr(t, "name") === n || attr(t, "property") === n ? attr(t, "content") : null)).find(Boolean) ?? null;
  const canonical = [...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/gi)].map((m) => attr(m[0], "href"))[0] ?? null;
  return { title, description: byName("description"), ogTitle: byName("og:title"), ogImage: byName("og:image"), canonical };
}

async function skipLoader(page: Page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("yb-loader", "1");
    } catch {}
  });
}

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text().slice(0, 200)}`);
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  return errors;
}

test.describe("HTML-level checks for every sitemap URL", () => {
  test("sitemap has the 38 expected routes", async ({ request }) => {
    const paths = await sitemapPaths(request);
    expect(paths.length).toBe(38);
    for (const p of ["/", "/about", "/benefits", "/bestsellers", "/blogs-reviews", "/contact", "/ingredients-quality", "/products", "/why-yunch-bite"]) expect(paths).toContain(p);
    expect(paths.filter((p) => p.startsWith("/categories/")).length).toBe(3);
    expect(paths.filter((p) => p.startsWith("/products/")).length).toBe(21);
    expect(paths.filter((p) => p.startsWith("/articles/")).length).toBe(5);
  });

  test("every page: 200, SEO head, valid JSON-LD, img alts; titles unique", async ({ request }) => {
    const paths = await sitemapPaths(request);
    const titles = new Map<string, string>();
    const problems: string[] = [];
    for (const path of paths) {
      const res = await request.get(path);
      if (res.status() !== 200) {
        problems.push(`${path}: HTTP ${res.status()}`);
        continue;
      }
      const html = await res.text();
      const h = headMeta(html);
      if (!h.title) problems.push(`${path}: missing <title>`);
      if (h.title && titles.has(h.title)) problems.push(`${path}: duplicate title with ${titles.get(h.title)}: "${h.title}"`);
      titles.set(h.title, path);
      if (!h.description || h.description.length < 50 || h.description.length > 180) problems.push(`${path}: description length ${h.description?.length ?? 0}`);
      if (!h.canonical || !h.canonical.replace(/\/$/, "").endsWith(path === "/" ? "" : path)) problems.push(`${path}: canonical ${h.canonical}`);
      if (!h.ogTitle || !h.ogImage) problems.push(`${path}: missing og:title/og:image`);
      for (const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
        try {
          const data = JSON.parse(m[1]);
          if (JSON.stringify(data).includes("aggregateRating")) problems.push(`${path}: JSON-LD has aggregateRating while reviews are hidden`);
        } catch {
          problems.push(`${path}: invalid JSON-LD`);
        }
      }
      for (const img of html.matchAll(/<img\b[^>]*>/gi)) if (attr(img[0], "alt") === null) problems.push(`${path}: <img> without alt: ${img[0].slice(0, 120)}`);
      const h1s = (html.match(/<h1\b/gi) || []).length;
      if (h1s !== 1) problems.push(`${path}: ${h1s} <h1> in server HTML`);
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

  test("every internal link on every page resolves (no 404s)", async ({ request }) => {
    test.setTimeout(240_000);
    const paths = await sitemapPaths(request);
    const links = new Map<string, string>(); // href -> first page seen on
    for (const path of paths) {
      const html = await (await request.get(path)).text();
      for (const m of html.matchAll(/<a\b[^>]*href="([^"#?]*)(?:[#?][^"]*)?"/gi)) {
        const href = m[1];
        if (href.startsWith("/") && !href.startsWith("//") && !links.has(href)) links.set(href, path);
      }
    }
    const broken: string[] = [];
    for (const [href, from] of links) {
      const res = await request.get(href);
      if (res.status() >= 400) broken.push(`${href} (linked from ${from}) → ${res.status()}`);
    }
    expect(broken, broken.join("\n")).toEqual([]);
  });
});

test.describe("Browser checks for every sitemap URL", () => {
  let paths: string[] = [];
  test.beforeAll(async ({ request }) => {
    paths = await sitemapPaths(request);
  });

  test("desktop: one visible h1, no errors, no horizontal overflow", async ({ page }) => {
    test.setTimeout(600_000);
    await skipLoader(page);
    const problems: string[] = [];
    for (const path of paths) {
      const errors = trackErrors(page);
      await page.goto(path, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);
      const h1 = await page.locator("h1:visible").count();
      if (h1 !== 1) problems.push(`${path}: ${h1} visible h1`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 1) problems.push(`${path}: horizontal overflow ${overflow}px`);
      if (errors.length) problems.push(`${path}: ${errors.join(" | ")}`);
      page.removeAllListeners("console");
      page.removeAllListeners("pageerror");
      page.removeAllListeners("response");
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

  test("390px: no horizontal overflow", async ({ browser }) => {
    test.setTimeout(600_000);
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await skipLoader(page);
    const problems: string[] = [];
    for (const path of paths) {
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 1) problems.push(`${path}: horizontal overflow ${overflow}px`);
    }
    await context.close();
    expect(problems, problems.join("\n")).toEqual([]);
  });

  test("axe (serious/critical) on every page, reduced motion", async ({ browser }) => {
    test.setTimeout(900_000);
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await skipLoader(page);
    const problems: string[] = [];
    for (const path of paths) {
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      for (const v of r.violations.filter((v) => v.impact === "serious" || v.impact === "critical"))
        problems.push(`${path}: [${v.impact}] ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target.join(" ")}`);
    }
    await context.close();
    expect(problems, problems.join("\n")).toEqual([]);
  });
});
