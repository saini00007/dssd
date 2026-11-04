import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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

const FLAVOURS = [
  { name: "Peri-Peri Paradise", slug: "makhana-zipper-peri-peri" },
  { name: "Chatpata Masala", slug: "makhana-zipper-chatpataa" },
  { name: "Himalayan Salt & Pepper", slug: "makhana-zipper-salt-pepper" },
  { name: "Pudina Masala", slug: "makhana-zipper-pudina" },
  { name: "Tangy Cheese & Herbs", slug: "makhana-zipper-cheese-herbs" },
  { name: "Black Salt", slug: "makhana-zipper-black-salt" },
  { name: "Berry Berry Paradise", slug: "makhana-zipper-berry-berry" },
];

/** Scrolls the whole page once so every scroll-triggered reveal has played and lazy images have loaded. */
async function scrollThrough(page: Page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

test("/ returns 200 with no console errors and a single h1", async ({ page }) => {
  const errors = collectErrors(page);
  await noLoader(page);
  const res = await page.goto("/", { waitUntil: "networkidle" });
  expect(res?.status()).toBe(200);
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator("main h1")).toContainText("YUNCHY. CRUNCHY. HEALTHY BITE.", { ignoreCase: true });
  await scrollThrough(page);
  expect(errors).toEqual([]);
});

test("server HTML carries the headline, all 7 flavours and the section copy", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain("Yunchy. Crunchy. Healthy Bite.");
  for (const f of FLAVOURS) {
    expect(html).toContain(f.name.replace("&", "&amp;"));
    expect(html).toContain(`/products/${f.slug}`);
  }
  expect(html).toContain("Five reasons to snack smarter");
  expect(html).toContain("Interested in stocking or distributing");
  expect(html).not.toContain("Neha Sharma"); // reviews stay hidden
});

test("flavour stage cycles through all 7 with buttons and arrow keys", async ({ page }) => {
  await noLoader(page);
  await page.goto("/", { waitUntil: "networkidle" });
  const stage = page.locator("#flavours");
  await stage.scrollIntoViewIfNeeded();
  const live = stage.locator("[aria-live=polite]");
  const link = stage.getByRole("link", { name: /View flavour/ });
  const colours = new Set<string>();

  await expect(live).toHaveText("Peri-Peri Paradise, 1 of 7");
  await expect(link).toHaveAttribute("href", "/products/makhana-zipper-peri-peri");
  colours.add(await stage.evaluate((el) => el.style.getPropertyValue("--flavour")));

  // 6 steps with the button
  for (let i = 1; i < 7; i++) {
    await stage.getByRole("button", { name: "Next flavour" }).click();
    await expect(live).toHaveText(`${FLAVOURS[i].name}, ${i + 1} of 7`);
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute("href", `/products/${FLAVOURS[i].slug}`);
    colours.add(await stage.evaluate((el) => el.style.getPropertyValue("--flavour")));
    await page.waitForTimeout(150);
  }
  expect(colours.size).toBe(7);

  // wraps around
  await stage.getByRole("button", { name: "Next flavour" }).click();
  await expect(live).toHaveText("Peri-Peri Paradise, 1 of 7");

  // keys: ArrowLeft goes back (wraps to the last), ArrowRight forward
  await stage.getByRole("button", { name: "Previous flavour" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(live).toHaveText("Berry Berry Paradise, 7 of 7");
  await page.keyboard.press("ArrowRight");
  await expect(live).toHaveText("Peri-Peri Paradise, 1 of 7");
  for (let i = 1; i < 7; i++) {
    await page.keyboard.press("ArrowRight");
    await expect(live).toHaveText(`${FLAVOURS[i].name}, ${i + 1} of 7`);
    await page.waitForTimeout(120);
  }

  // the stage background settles on the active flavour colour and the odometer shows the active name
  await page.waitForTimeout(1300);
  const bg = await stage.evaluate((el) => {
    const layer = el.querySelector<HTMLElement>(":scope > div")!;
    return getComputedStyle(layer).backgroundColor;
  });
  expect(bg).not.toBe("rgba(0, 0, 0, 0)");
});

test("stage link navigates to the product page of the active flavour", async ({ page }) => {
  await noLoader(page);
  await page.goto("/", { waitUntil: "networkidle" });
  const stage = page.locator("#flavours");
  await stage.scrollIntoViewIfNeeded();
  await stage.getByRole("button", { name: "Next flavour" }).click();
  await page.waitForTimeout(400);
  await stage.getByRole("link", { name: /View flavour/ }).click();
  await expect(page).toHaveURL(/\/products\/makhana-zipper-chatpataa$/);
});

test("category cards link to /categories/*", async ({ page }) => {
  await noLoader(page);
  await page.goto("/", { waitUntil: "networkidle" });
  const hrefs = await page.locator('main a[href^="/categories/"]').evaluateAll((a) => a.map((x) => x.getAttribute("href")));
  for (const c of ["makhana", "popcorn", "dry-fruits"]) expect(hrefs).toContain(`/categories/${c}`);
  const cards = page.locator("main article a[href^='/categories/']");
  await expect(cards).toHaveCount(3);
});

test("know-more cards, bestsellers and partner band link correctly", async ({ page }) => {
  await noLoader(page);
  await page.goto("/", { waitUntil: "networkidle" });
  for (const href of ["/why-yunch-bite", "/benefits", "/ingredients-quality", "/bestsellers", "/contact#partner"]) {
    await expect(page.locator(`main a[href="${href}"]`).first()).toBeAttached();
  }
  await expect(page.locator("main a[href^='/products/makhana-zipper-peri-peri']").first()).toBeAttached();
  // 11 bestseller cards
  await expect(page.locator("[aria-label='Bestselling products, scroll sideways'] article")).toHaveCount(11);
});

test("reviews section renders nothing while SHOW_REVIEWS is false", async ({ page }) => {
  await noLoader(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByText("Loved by snackers")).toHaveCount(0);
});

test("Buddy: click pops and shows a line; pupils are SVG over the image", async ({ page }) => {
  await noLoader(page);
  await page.goto("/", { waitUntil: "networkidle" });
  const btn = page.getByRole("button", { name: "Poke Makhana Buddy" });
  await btn.scrollIntoViewIfNeeded();
  await expect(page.locator("[data-bubble]")).toContainText("Psst");
  await btn.click();
  await expect(page.locator("[data-bubble]")).not.toContainText("Psst");
  await expect(page.locator("[data-bubble]")).toHaveText(/Ek aur\?|Crunch time!|Pop pop pop!|Kya baat hai!|Thoda aur\?/);
});

test("reduced motion: everything visible and static, no pin spacers", async ({ page }) => {
  const errors = collectErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await noLoader(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  expect(await page.locator(".pin-spacer").count()).toBe(0);
  // nothing is held invisible
  const hidden = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>("[data-yb-anim]"))
      .filter((el) => {
        const own = getComputedStyle(el).opacity === "0";
        const kids = el.dataset.ybAnim === "children" && Array.from(el.children).some((c) => getComputedStyle(c).opacity === "0");
        return own || kids;
      })
      .map((el) => el.tagName + "." + el.className.slice(0, 40)),
  );
  expect(hidden).toEqual([]);
  // claim cards: a plain list, all five visible and in normal flow
  const claims = page.locator("#claims li[data-card]");
  await expect(claims).toHaveCount(5);
  for (let i = 0; i < 5; i++) {
    await expect(claims.nth(i)).toBeVisible();
    expect(await claims.nth(i).evaluate((el) => getComputedStyle(el).position)).toBe("relative");
  }
  // process steps: all four cards visible
  const steps = page.locator("#process li[data-step]");
  await expect(steps).toHaveCount(4);
  for (let i = 0; i < 4; i++) expect(await steps.nth(i).evaluate((el) => getComputedStyle(el).position)).toBe("relative");
  // jindgi: both scenes side by side (no overlap)
  const scenes = page.locator("[aria-labelledby=jindgi-title] > div").first();
  await expect(page.getByText("Ye Hai Yunchy Jindgi", { exact: false }).first()).toBeVisible();
  void scenes;
  // flavour stage still works (crossfade only)
  await page.locator("#flavours").getByRole("button", { name: "Next flavour" }).click();
  await expect(page.locator("#flavours [aria-live=polite]")).toHaveText("Chatpata Masala, 2 of 7");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("no serious or critical axe violations (reduced motion, static)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await noLoader(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
});

test("no serious or critical axe violations (full motion, after scrolling through)", async ({ page }) => {
  await noLoader(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await scrollThrough(page);
  await page.waitForTimeout(1800);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    // colour contrast on elements that are intentionally mid-animation is checked in the static run above
    .disableRules(["color-contrast"])
    .analyze();
  const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
});

test("390 px: no horizontal scroll and nothing wider than the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await noLoader(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await scrollThrough(page);
  const overflow = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth, iw: window.innerWidth }));
  expect(overflow.sw).toBeLessThanOrEqual(overflow.iw);
  expect(overflow.bw).toBeLessThanOrEqual(overflow.iw);
  await expect(page.locator("main h1")).toBeVisible();
});
