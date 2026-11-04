# Yunch Bite: website

The new yunchbite.com. A static Next.js 16 site with GSAP + Lenis motion, built from the approved site overview (`../docs/05-site-overview.md`). How it's built and the rules for changing it: [`ARCHITECTURE.md`](ARCHITECTURE.md) and [`docs/FOUNDATION-API.md`](docs/FOUNDATION-API.md).

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build, locally:

```bash
npm run build && npm run start
```

Every one of the 38 sitemap pages is prerendered at build time. The only server code is `/api/contact` (form submissions) and `src/proxy.ts` (real 404s for unknown product, category and article URLs).

## Checks

```bash
npm run lint && npm run typecheck
npx playwright test            # against BASE_URL (default http://localhost:3100): e2e, a11y (axe), SEO, links
BASE_URL=http://localhost:3000 npx playwright test
```

The suites in `tests/`:

| File | What it covers |
|---|---|
| `foundation.spec.ts` | Header, menu, loader, navigation, shared components |
| `home.spec.ts` | Homepage |
| `products.spec.ts` | Products, categories, 21 product pages, bestsellers |
| `content.spec.ts` | About, Why, Benefits, Ingredients & Quality, Journal, articles, Contact + API |
| `site-wide.spec.ts` | Every sitemap URL: status, SEO head, JSON-LD, img alts, internal links, one h1, overflow, axe |

## Deploy (Vercel)

1. Import the GitHub repo in Vercel and set **Root Directory** to `yunchbite-redesign/site`. The framework preset is Next.js; no other settings are needed.
2. Environment variables:
   - `CONTACT_WEBHOOK_URL` *(optional)*: where `/api/contact` forwards form submissions as JSON (for example a Zapier/Make webhook, a CRM endpoint, or an email service's inbound webhook). Without it, submissions are only logged and the API answers `{ ok: true, delivered: false }`.
3. Domain: point **yunchbite.com** at the Vercel project. Today that domain only redirects to `/lander`, so the brand site isn't live on it.

## Content

All copy and product data are typed modules in `src/data/`:

| Module | Contents |
|---|---|
| `products.ts` | The 21 products. URLs are fixed: `/products/<slug>` |
| `flavours.ts` | Pack colour, Buddy's ingredient, taste profile, pairs-with |
| `categories.ts`, `articles.ts`, `site.ts` | Categories, articles, site-wide data |
| `copy/*.ts` | Page copy, keyed by the section IDs in the site overview |
| `reviews.ts` | `SHOW_REVIEWS = false` until the reviews are confirmed genuine |

**Images:**
- Pack cut-outs live in `public/packs/<product-slug>.webp`. A product without one shows its flavour-coloured placeholder pouch.
- To add a studio cut-out, drop the file in with the product's slug as the name and set `cutout` in `src/data/assets.ts`.

**Fonts:** Bricolage Grotesque (display) + DM Sans (body), both placeholders until the packaging typeface is confirmed. Swapping is one line in `src/app/layout.tsx`.

## Still needed from Yunch Bite

1. Studio pack cut-outs (every product and format).
2. A vector logo.
3. More Makhana Buddy poses holding each flavour's ingredient.
4. The packaging font.
5. A delivery target for the forms.
6. Real reviews, a founder photo, factory and lifestyle photos.
7. The FSSAI licence number for the footer.
