import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Run with: BASE_URL=http://localhost:3103 npx playwright test tests/content.spec.ts

const PAGES = ["/about", "/why-yunch-bite", "/benefits", "/ingredients-quality", "/blogs-reviews", "/contact"];
const ARTICLES = [
  "why-makhana-is-the-perfect-smart-snack",
  "the-power-of-nuts-small-bite-big-benefits",
  "popcorn-the-crunchy-snack-you-can-feel-good-about",
  "discover-our-range-of-healthy-snacks",
  "healthy-snacking-habits-for-the-whole-family",
].map((s) => `/articles/${s}`);
const ALL = [...PAGES, ...ARTICLES];

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

/** Scrolls the whole page so lazy images and scroll-triggered reveals run. */
async function scrollThrough(page: Page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

for (const path of ALL) {
  test(`${path}: 200, one visible h1, no console errors`, async ({ page }) => {
    const errors = collectErrors(page);
    await noLoader(page);
    const res = await page.goto(path, { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    await expect(page.locator("main h1:visible")).toHaveCount(1);
    await scrollThrough(page);
    await page.waitForTimeout(400);
    expect(errors).toEqual([]);
  });

  test(`${path}: no horizontal scroll at 390 px`, async ({ page }) => {
    await noLoader(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path, { waitUntil: "networkidle" });
    await scrollThrough(page);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(over).toBeLessThanOrEqual(0);
  });

  test(`${path}: reduced motion shows all content`, async ({ page }) => {
    await noLoader(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const hidden = await page.evaluate(() => {
      const out: string[] = [];
      document.querySelectorAll("main [data-yb-anim]").forEach((el) => {
        const st = getComputedStyle(el);
        const kids = el.getAttribute("data-yb-anim") === "children";
        if (!kids && (st.opacity === "0" || st.visibility === "hidden")) out.push((el.textContent ?? "").slice(0, 40));
      });
      return out;
    });
    expect(hidden).toEqual([]);
  });

  test(`${path}: axe has no serious or critical violations`, async ({ page }) => {
    await noLoader(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path, { waitUntil: "networkidle" });
    await scrollThrough(page);
    const res = await new AxeBuilder({ page } as never).include("main").analyze();
    const bad = res.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
  });
}

test("blogs: category filters change the grid", async ({ page }) => {
  await noLoader(page);
  await page.goto("/blogs-reviews", { waitUntil: "networkidle" });
  const list = page.getByTestId("journal-list");
  await expect(list.locator("article")).toHaveCount(5);
  await page.getByRole("radio", { name: /Health & Wellness/ }).click();
  await expect(list.locator("article")).toHaveCount(2);
  await page.getByRole("radio", { name: /Lifestyle/ }).click();
  await expect(list.locator("article")).toHaveCount(1);
  await expect(list.locator("article h2")).toContainText("Healthy Snacking Habits");
  await page.getByRole("radio", { name: /^All/ }).click();
  await expect(list.locator("article")).toHaveCount(5);
  // reviews and newsletter are hidden by config
  await expect(page.getByText("Customer Reviews")).toHaveCount(0);
  await expect(page.getByText("Get the crunch in your inbox")).toHaveCount(0);
});

test("articles: Article + BreadcrumbList JSON-LD is valid", async ({ page }) => {
  await noLoader(page);
  for (const path of ARTICLES) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const blobs = await page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? "null")));
    const article = blobs.find((b) => b["@type"] === "Article");
    const crumbs = blobs.find((b) => b["@type"] === "BreadcrumbList");
    expect(article?.headline).toBeTruthy();
    expect(article?.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(article?.author?.name).toBeTruthy();
    expect(article?.image?.[0]).toMatch(/^https:\/\//);
    expect(crumbs?.itemListElement).toHaveLength(3);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
    await expect(page.locator('meta[property="article:published_time"]')).toHaveCount(1);
  }
});

test("article: reading progress rolls and the inline product card shows", async ({ page }) => {
  await noLoader(page);
  await page.goto(ARTICLES[0], { waitUntil: "networkidle" });
  await expect(page.locator('a[href="/products/makhana-zipper-peri-peri"]').first()).toBeVisible();
  const bar = page.locator("[data-bar]");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.6));
  await page.waitForTimeout(400);
  const t = await bar.evaluate((el) => getComputedStyle(el).transform);
  expect(t).not.toBe("none");
  expect(t).not.toMatch(/matrix\(0,/);
});

test("nutrition table: semantics and final values are in the HTML", async ({ page }) => {
  await noLoader(page);
  await page.goto("/benefits", { waitUntil: "networkidle" });
  const table = page.locator("table").first();
  await expect(table.locator("caption")).toBeAttached();
  await expect(table.locator('th[scope="col"]')).toHaveCount(3);
  await table.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  await expect(table).toContainText("347 kcal");
  await expect(table).toContainText("27%");
});

test("ingredients: tabs switch tables", async ({ page }) => {
  await noLoader(page);
  await page.goto("/ingredients-quality", { waitUntil: "networkidle" });
  await expect(page.getByRole("cell", { name: /Makhana \(Fox Nuts\)\./ }).first()).toBeVisible();
  await page.getByRole("radio", { name: /Popcorn/ }).click();
  await expect(page.getByRole("rowheader", { name: "Salted Popcorn" })).toBeVisible();
  await page.getByRole("radio", { name: /Nuts/ }).click();
  await expect(page.getByRole("rowheader", { name: "Raw Almonds" })).toBeVisible();
});

test("why: audience pills scroll-spy and click", async ({ page }) => {
  await noLoader(page);
  await page.goto("/why-yunch-bite", { waitUntil: "networkidle" });
  const pills = page.getByRole("radiogroup", { name: "Jump to an audience" });
  await pills.getByRole("radio", { name: "Retailers" }).click();
  await expect(pills.getByRole("radio", { name: "Retailers" })).toHaveAttribute("aria-checked", "true");
  await page.waitForTimeout(1500);
  await expect(page.getByRole("heading", { name: "For Retailers" })).toBeInViewport();
  await page.evaluate(() => document.getElementById("why-distributors")?.scrollIntoView());
  await page.waitForTimeout(600);
  await expect(pills.getByRole("radio", { name: "Distributors" })).toHaveAttribute("aria-checked", "true");
});

test.describe("contact", () => {
  test("client validation blocks an empty submit and shows messages", async ({ page }) => {
    await noLoader(page);
    let posted = false;
    await page.route("**/api/contact", (r) => {
      posted = true;
      return r.continue();
    });
    await page.goto("/contact", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Submit Partnership Inquiry" }).click();
    await expect(page.locator("#partner").getByText("Please fill this in.")).toHaveCount(5);
    expect(posted).toBe(false);
    await expect(page.locator("#partner [aria-invalid=true]").first()).toBeFocused();
    await page.locator("#partner").getByLabel("E-mail ID").fill("nope");
    await page.locator("#partner").getByLabel("Phone Number").fill("12");
    await page.getByRole("button", { name: "Submit Partnership Inquiry" }).click();
    await expect(page.getByText("That email doesn't look right.")).toBeVisible();
    await expect(page.getByText("That phone number doesn't look right.")).toBeVisible();
  });

  test("valid partner submit shows the success state", async ({ page }) => {
    await noLoader(page);
    await page.goto("/contact", { waitUntil: "networkidle" });
    const f = page.locator("#partner");
    await f.getByLabel("Name").fill("Asha Rao");
    await f.getByLabel("Phone Number").fill("+91 98765 43210");
    await f.getByLabel("E-mail ID").fill("asha@example.com");
    await f.getByLabel("I am interested in").selectOption("Distribution");
    await f.getByLabel("City").fill("Pune");
    await f.getByRole("button", { name: "Submit Partnership Inquiry" }).click();
    await expect(page.getByRole("status").filter({ hasText: "We've got your message" })).toBeVisible();
  });

  test("question path switches the form and submits", async ({ page }) => {
    await noLoader(page);
    await page.goto("/contact", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Have a question/ }).click();
    await expect(page.locator("#partner")).toBeHidden();
    const f = page.locator("#question");
    await expect(f).toBeVisible();
    await f.getByLabel("Name").fill("Ravi");
    await f.getByLabel("Phone Number").fill("9876543210");
    await f.getByLabel("E-mail ID").fill("ravi@example.com");
    await f.getByLabel("Message").fill("Do you ship to Goa?");
    await f.getByRole("button", { name: "Send Message" }).click();
    await expect(page.getByRole("status").filter({ hasText: "We've got your message" })).toBeVisible();
  });

  test("#partner deep link lands on the partner form", async ({ page }) => {
    await noLoader(page);
    await page.goto("/contact#partner", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await expect(page.locator("#partner")).toBeVisible();
    await expect(page.locator("#partner")).toBeInViewport();
  });

  test("API validates payloads, rejects the honeypot, never claims delivery without a webhook", async ({ request }, info) => {
    const ip = (n: number) => ({ "x-forwarded-for": `10.${info.workerIndex}.${Date.now() % 250}.${n}` });
    const good = { kind: "question", name: "Ravi", phone: "9876543210", email: "ravi@example.com", message: "Hello there" };
    const ok = await request.post("/api/contact", { data: good, headers: ip(1) });
    expect(ok.status()).toBe(200);
    const body = await ok.json();
    expect(body.ok).toBe(true);
    expect(typeof body.delivered).toBe("boolean");
    expect((await request.post("/api/contact", { data: { ...good, email: "bad" }, headers: ip(2) })).status()).toBe(400);
    expect((await request.post("/api/contact", { data: { ...good, phone: "abc" }, headers: ip(3) })).status()).toBe(400);
    expect((await request.post("/api/contact", { data: { ...good, name: 42 }, headers: ip(4) })).status()).toBe(400);
    expect((await request.post("/api/contact", { data: { ...good, kind: "x" }, headers: ip(5) })).status()).toBe(400);
    expect((await request.post("/api/contact", { data: { ...good, website: "http://spam" }, headers: ip(6) })).status()).toBe(400);
    expect((await request.post("/api/contact", { data: { kind: "partner", name: "A", phone: "9876543210", email: "a@b.co", city: "Pune" }, headers: ip(7) })).status()).toBe(400);
    expect((await request.post("/api/contact", { data: "not json", headers: { ...ip(8), "content-type": "application/json" } })).status()).toBe(400);
  });

  test("API rate-limits one IP", async ({ request }, info) => {
    const h = { "x-forwarded-for": `172.${info.workerIndex}.${Date.now() % 250}.9` };
    const codes: number[] = [];
    for (let i = 0; i < 10; i++) codes.push((await request.post("/api/contact", { data: { kind: "x" }, headers: h })).status());
    expect(codes).toContain(429);
  });
});
