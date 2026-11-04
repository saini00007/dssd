import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { products } from "../src/data/products";
import { categories } from "../src/data/categories";

/** Skips the first-visit loader so tests start from the page itself. */
async function noLoader(page: Page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("yb-loader", "1");
    } catch {}
  });
}

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().startsWith("Failed to load resource")) errors.push(`console.error: ${m.text()}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400 && !r.url().includes("_rsc=")) errors.push(`${r.status()} ${r.url()}`);
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

const PDP_REAL = "/products/makhana-zipper-peri-peri";
const PDP_PLACEHOLDER = "/products/makhana-zipper-berry-berry";
const pages = [
  "/products",
  "/bestsellers",
  ...categories.map((c) => `/categories/${c.slug}`),
  ...products.map((p) => `/products/${p.slug}`),
];

for (const path of pages) {
  test(`${path}: 200, one visible h1, no console errors`, async ({ page }) => {
    const errors = collectErrors(page);
    await noLoader(page);
    const res = await page.goto(path, { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    await expect(page.locator("main h1:visible")).toHaveCount(1);
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });
}

test("unknown product and category slugs are 404", async ({ request }) => {
  expect((await request.get("/products/not-a-product")).status()).toBe(404);
  expect((await request.get("/categories/not-a-category")).status()).toBe(404);
});

test("format switcher links resolve and the current format is marked", async ({ page, request }) => {
  await noLoader(page);
  await page.goto(PDP_REAL, { waitUntil: "networkidle" });
  const nav = page.locator('section[aria-label="Pick your pack"]:visible');
  const links = nav.locator("a");
  await expect(links).toHaveCount(3);
  await expect(nav.locator('a[aria-current="page"]')).toHaveCount(1);
  for (const href of await links.evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute("href")!))) {
    expect((await request.get(href)).status()).toBe(200);
  }
  await links.filter({ hasText: "Pillow" }).click();
  await expect(page).toHaveURL(/makhana-pillow-peri-peri$/);
  await expect(page.locator("main h1:visible")).toContainText("Peri-Peri Paradise");
});

test("category filters change the visible cards", async ({ page }) => {
  await noLoader(page);
  await page.goto("/categories/makhana", { waitUntil: "networkidle" });
  const cards = page.locator("main article:visible");
  const visibleNames = async () => (await cards.locator("h3").allTextContents()).map((t) => t.trim());
  await expect(cards).toHaveCount(8);
  const group = page.getByRole("radiogroup", { name: "Filter by format" });
  await group.getByRole("radio", { name: /^Jar/ }).click();
  await expect(cards).toHaveCount(3);
  expect((await visibleNames()).sort()).toEqual(["Chatpata Masala", "Himalayan Salt & Pepper", "Peri-Peri Paradise"]);
  await group.getByRole("radio", { name: /^Raw/ }).click();
  await expect(cards).toHaveCount(1);
  await group.getByRole("radio", { name: /^Pillow/ }).click();
  await expect(cards).toHaveCount(3);
  await group.getByRole("radio", { name: /^All/ }).click();
  await expect(cards).toHaveCount(8);

  await page.goto("/categories/dry-fruits", { waitUntil: "networkidle" });
  const dry = page.getByRole("radiogroup", { name: "Filter by format" });
  await dry.getByRole("radio", { name: /^Roasted/ }).click();
  await expect(page.locator("main article:visible")).toHaveCount(2);
  await dry.getByRole("radio", { name: /^Raw/ }).click();
  await expect(page.locator("main article:visible")).toHaveCount(2);

  await page.goto("/categories/popcorn", { waitUntil: "networkidle" });
  await expect(page.getByRole("radiogroup", { name: "Filter by format" })).toHaveCount(0);
  await expect(page.locator("main article:visible")).toHaveCount(3);
});

test("flavour card format chips link to the real format URLs", async ({ page }) => {
  await noLoader(page);
  await page.goto("/categories/makhana", { waitUntil: "networkidle" });
  const peri = page.locator("main article:visible", { hasText: "Peri-Peri Paradise" });
  const hrefs = await peri.locator('ul[aria-label="Formats"] a').evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  expect(hrefs).toEqual(["/products/makhana-pillow-peri-peri", "/products/makhana-zipper-peri-peri", "/products/makhana-jar-peri-peri"]);
});

test("pack carousel: buttons and arrow keys move it, vertical wheel still scrolls the page", async ({ page }) => {
  await noLoader(page);
  await page.goto("/categories/makhana", { waitUntil: "networkidle" });
  const region = page.locator("[aria-roledescription=carousel]");
  const caption = region.locator('[aria-live="polite"] p').first();
  await expect(caption).toHaveText("Peri-Peri Paradise");
  await region.getByRole("button", { name: "Next flavour" }).click();
  await expect(caption).toHaveText("Chatpata Masala");
  await region.getByRole("button", { name: "Next flavour" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(caption).toHaveText("Himalayan Salt & Pepper");
  await page.keyboard.press("ArrowLeft");
  await expect(caption).toHaveText("Chatpata Masala");
  // sideways wheel moves it
  const box = (await region.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 200);
  await page.mouse.wheel(500, 0);
  await expect(caption).not.toHaveText("Chatpata Masala");
  // vertical wheel over the carousel scrolls the page (never trapped)
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 400);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 100);
});

test("category FAQ toggles and ships FAQPage JSON-LD", async ({ page }) => {
  await noLoader(page);
  await page.goto("/categories/makhana", { waitUntil: "networkidle" });
  const q = page.getByRole("button", { name: "What is makhana?" });
  await expect(q).toHaveAttribute("aria-expanded", "false");
  await q.click();
  await expect(q).toHaveAttribute("aria-expanded", "true");
  await q.click();
  await expect(q).toHaveAttribute("aria-expanded", "false");
  const blocks = await page.locator('script[type="application/ld+json"]').allInnerTexts();
  const parsed = blocks.map((b) => JSON.parse(b));
  const faq = parsed.find((d) => d["@type"] === "FAQPage");
  expect(faq.mainEntity.length).toBeGreaterThanOrEqual(3);
});

test("PDP JSON-LD: Product + BreadcrumbList, no aggregateRating", async ({ page }) => {
  await noLoader(page);
  await page.goto(PDP_REAL, { waitUntil: "networkidle" });
  const blocks = await page.locator('main script[type="application/ld+json"]').allInnerTexts();
  const docs = blocks.map((b) => JSON.parse(b));
  const types = docs.map((d) => d["@type"]);
  expect(types).toContain("Product");
  expect(types).toContain("BreadcrumbList");
  expect(JSON.stringify(docs)).not.toMatch(/aggregateRating|"review"/);
  expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toContain("/products/makhana-zipper-peri-peri");
  expect(await page.locator('meta[property="og:image"]').getAttribute("content")).toContain("makhana-zipper-peri-peri.webp");
});

test("Bestseller badge only on bestsellers", async ({ page }) => {
  await noLoader(page);
  await page.goto(PDP_REAL, { waitUntil: "networkidle" });
  await expect(page.locator("main section[data-hero]:visible").getByText("Bestseller", { exact: true })).toHaveCount(1);
  await page.goto("/products/makhana-zipper-pudina", { waitUntil: "networkidle" });
  await expect(page.locator("main section[data-hero]:visible").getByText("Bestseller", { exact: true })).toHaveCount(0);
});

test("data cards: tablist is keyboard operable, allergens are bold", async ({ page }) => {
  await noLoader(page);
  await page.goto("/products/makhana-zipper-cheese-herbs", { waitUntil: "networkidle" });
  const tabs = page.locator('[role="tablist"]:visible');
  const ing = tabs.getByRole("tab", { name: "Ingredients" });
  const nut = tabs.getByRole("tab", { name: "Nutrition" });
  const all = tabs.getByRole("tab", { name: "Allergens" });
  await ing.focus();
  await expect(ing).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(nut).toHaveAttribute("aria-selected", "true");
  await expect(nut).toBeFocused();
  const panel = page.locator(`#${await nut.getAttribute("aria-controls")}`);
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("cell", { name: "Energy" }).or(panel.getByRole("rowheader", { name: "Energy" }))).toBeVisible();
  await page.keyboard.press("End");
  await expect(all).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(ing).toHaveAttribute("aria-selected", "true");
  // allergen words are <strong> (the cheese + milk product)
  const bold = await page.locator('[role="tabpanel"] strong').allInnerTexts();
  expect(bold.join(" ").toLowerCase()).toContain("milk");
  // nutrition final values are in the HTML
  expect(await page.locator('[role="tabpanel"][id*="nutrition"] table').first().textContent()).toMatch(/Energy[\s\S]*kcal/);
});

test("reduced motion: everything is shown statically", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await noLoader(page);
  await page.goto(PDP_REAL, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const hero = page.locator("main section[data-hero]:visible");
  for (const sel of ["h1", '[data-in="chips"]', '[data-in="pack"]', "[data-disc]"]) {
    const op = await hero.locator(sel).first().evaluate((e) => getComputedStyle(e).opacity);
    expect(Number(op), sel).toBe(1);
  }
  expect(await page.locator("[data-pdp], .group\\/pdp").first().getAttribute("data-flight")).toBeNull();
  // all three cards and the claims are visible without scrolling tricks
  await page.locator("[data-stack]").scrollIntoViewIfNeeded();
  const op = await page.locator('[data-card="ingredients"]').evaluate((e) => getComputedStyle(e).opacity);
  expect(Number(op)).toBe(1);
  await page.goto("/categories/makhana", { waitUntil: "networkidle" });
  await expect(page.locator('main [aria-label="Makhana flavours"] li:visible')).toHaveCount(8);
  await page.goto("/products", { waitUntil: "networkidle" });
  await expect(page.locator("main h1:visible")).toBeVisible();
});

test("no horizontal scroll at 390 px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await noLoader(page);
  for (const path of ["/products", "/bestsellers", "/categories/makhana", "/categories/dry-fruits", PDP_REAL, PDP_PLACEHOLDER]) {
    await page.goto(path, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(over, path).toBeLessThanOrEqual(0);
  }
});

for (const path of ["/products", "/categories/makhana", "/categories/dry-fruits", PDP_REAL, PDP_PLACEHOLDER, "/bestsellers"]) {
  test(`axe: ${path} has no serious or critical issues`, async ({ page }) => {
    await noLoader(page);
    await page.goto(path, { waitUntil: "networkidle" });
    await page.waitForTimeout(1800);
    const results = await new AxeBuilder({ page }).analyze();
    const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
  });
}
