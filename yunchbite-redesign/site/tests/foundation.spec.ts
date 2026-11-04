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
    // Failed resource loads are reported below with their URL (route prefetches of pages that other agents have not built yet are ignored).
    if (m.type() === "error" && !m.text().startsWith("Failed to load resource")) errors.push(`console.error: ${m.text()}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400 && !r.url().includes("_rsc=")) errors.push(`${r.status()} ${r.url()}`);
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

for (const path of ["/lab", "/"]) {
  test(`${path} returns 200 with no console errors`, async ({ page }) => {
    const errors = collectErrors(page);
    await noLoader(page);
    const res = await page.goto(path, { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
    await page.waitForTimeout(800);
    expect(errors).toEqual([]);
  });
}

test("client navigation (link, back, forward) works without console errors and resets scroll", async ({ page }) => {
  const errors = collectErrors(page);
  await noLoader(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "/lab" }).click();
  await expect(page).toHaveURL(/\/lab$/);
  await expect(page.locator("main h1:visible")).toContainText("The Lab");
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/lab$/);
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test("every page has exactly one main landmark and a skip link", async ({ page }) => {
  await noLoader(page);
  await page.goto("/lab");
  await expect(page.locator("main#main")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
});

test("header collapses on scroll down and returns on scroll up", async ({ page }) => {
  await noLoader(page);
  await page.goto("/lab", { waitUntil: "networkidle" });
  const header = page.locator("#site-header");
  await expect(header).toHaveAttribute("data-state", "top");
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();

  await page.mouse.move(700, 500);
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(120);
  }
  await expect(header).toHaveAttribute("data-state", "collapsed");
  // The links have folded away; logo, CTA and MENU remain.
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeHidden();
  await expect(header.getByRole("link", { name: "Partner with us" })).toBeVisible();
  await expect(page.locator("#site-header button[aria-controls=site-menu]")).toBeVisible();

  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(120);
  }
  await expect(header).toHaveAttribute("data-state", "top");
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
});

test("menu opens/closes with the button and Escape, traps focus and restores it", async ({ page }) => {
  await noLoader(page);
  await page.goto("/lab", { waitUntil: "networkidle" });
  const button = page.locator("#site-header button[aria-controls=site-menu]");
  const dialog = page.getByRole("dialog", { name: "Site menu" });

  await expect(dialog).toBeHidden();
  await button.click();
  await expect(dialog).toBeVisible();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  await expect(dialog.getByRole("link", { name: "Ingredients & Quality" })).toBeVisible();

  // Focus moves into the dialog and stays inside the dialog + header controls while tabbing (never reaches the inert page).
  await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest("#site-menu"))).toBe(true);
  for (let i = 0; i < 24; i++) {
    await page.keyboard.press("Tab");
    const ok = await page.evaluate(() => {
      const a = document.activeElement;
      return !!a?.closest("#site-menu") || !!a?.closest("#site-header");
    });
    expect(ok).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute("aria-expanded", "false");

  // Toggle with the same button
  await button.click();
  await expect(dialog).toBeVisible();
  await button.click();
  await expect(dialog).toBeHidden();
});

test("menu navigation goes to the page and closes the menu", async ({ page }) => {
  await noLoader(page);
  await page.goto("/lab", { waitUntil: "networkidle" });
  await page.locator("#site-header button[aria-controls=site-menu]").click();
  await page.getByRole("dialog").getByRole("link", { name: "Home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("dialog", { name: "Site menu" })).toBeHidden();
});

test("footer has the brand links, contact and sign-off", async ({ page }) => {
  await noLoader(page);
  await page.goto("/lab", { waitUntil: "networkidle" });
  const footer = page.locator("#site-footer");
  await expect(footer).toBeAttached();
  for (const name of ["Makhana", "Popcorn", "Dry Fruits", "Bestsellers", "About", "Why Yunch Bite", "Benefits", "Ingredients & Quality", "Blogs & Reviews"]) {
    await expect(footer.getByRole("link", { name, exact: true })).toHaveCount(1);
  }
  await expect(footer.getByRole("link", { name: /wecare@yunchbite.com/ })).toBeAttached();
  await expect(footer.getByText("A healthier way to snack.")).toBeAttached();
  await expect(footer.getByRole("link", { name: /Stock Yunch Bite in your store/ })).toBeAttached();
  await expect(footer.getByText("© 2026 Yunch Bite")).toBeAttached();
});

test.describe("loader", () => {
  test("shows once on / per session and can be skipped", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const loader = page.locator(".yb-loader");
    await expect(page.locator("html")).toHaveAttribute("data-yb-loader", /on|leaving/);
    await expect(loader).toBeVisible();
    // Content is in the HTML under the loader.
    await expect(page.locator("h1")).toHaveCount(1);
    // Skip with a click: it finishes well before the natural 1.5 s.
    await expect(page.locator("[data-shape]").first()).toBeVisible(); // the sequence has started (hydrated)
    await page.waitForTimeout(150);
    await page.mouse.click(300, 300);
    await expect(loader).toBeHidden({ timeout: 1500 });
    await expect(page.locator("html")).not.toHaveAttribute("data-yb-loader", /.*/);

    // Same session: no loader again.
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).not.toHaveAttribute("data-yb-loader", /.*/);
    await expect(loader).toBeHidden();
  });

  test("plays through on its own in under 2 s and fires yb:loader-done", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __done: number }).__done = 0;
      window.addEventListener("yb:loader-done", () => ((window as unknown as { __done: number }).__done += 1));
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect.poll(() => page.evaluate(() => (window as unknown as { __done: number }).__done), { timeout: 12_000 }).toBeGreaterThan(0);
    await expect(page.locator(".yb-loader")).toBeHidden({ timeout: 3000 });
  });

  test("is not shown on other pages", async ({ page }) => {
    await page.goto("/lab", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).not.toHaveAttribute("data-yb-loader", /.*/);
    await expect(page.locator(".yb-loader")).toBeHidden();
  });

  test("reduced motion: no loader, content visible", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).not.toHaveAttribute("data-yb-loader", /.*/);
    await expect(page.locator(".yb-loader")).toBeHidden();
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toHaveCSS("opacity", "1");
    await ctx.close();
  });
});

test("reduced motion on /lab: text is visible without animation", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/lab", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: /Slow-roasted in olive oil/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Slow-roasted in olive oil/i })).toHaveCSS("opacity", "1");
  await ctx.close();
});

test("pack card links to the product page and shows the cursor-label affordance", async ({ page }) => {
  await noLoader(page);
  await page.goto("/lab", { waitUntil: "networkidle" });
  const card = page.locator("article").first();
  const link = card.getByRole("link");
  await expect(link).toHaveAttribute("href", /^\/products\/.+/);
  await link.scrollIntoViewIfNeeded();
  await page.mouse.move(10, 10);
  await link.hover();
  await expect(page.getByText("Taste me →").first()).toBeAttached();
});

test("FAQ pills expand and collapse (aria-expanded)", async ({ page }) => {
  await noLoader(page);
  await page.goto("/lab", { waitUntil: "networkidle" });
  const q = page.getByRole("button", { name: "What is makhana?" });
  await q.scrollIntoViewIfNeeded();
  await expect(q).toHaveAttribute("aria-expanded", "false");
  await q.click();
  await expect(q).toHaveAttribute("aria-expanded", "true");
  await q.click();
  await expect(q).toHaveAttribute("aria-expanded", "false");
});

test("filter pills: arrow keys move the selection", async ({ page }) => {
  await noLoader(page);
  await page.goto("/lab", { waitUntil: "networkidle" });
  const first = page.getByRole("radio", { name: /^All/ });
  await first.scrollIntoViewIfNeeded();
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("filter-value")).toHaveText("makhana");
});

test("no horizontal scroll at 390px", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem("yb-loader", "1"));
  await page.goto("/lab", { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await page.locator("#site-header button[aria-controls=site-menu]").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await ctx.close();
});

// Axe runs against the final (reduced-motion) state so mid-animation opacity does not skew contrast results.
for (const path of ["/lab", "/"]) {
  test(`axe: no serious or critical violations on ${path}`, async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(path, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]["page"] }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]).analyze();
    const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
    await ctx.close();
  });
}
