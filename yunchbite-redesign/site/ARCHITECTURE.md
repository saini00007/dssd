# Yunch Bite site: architecture and build contract

Every contributor (human or agent) follows this file. The design source of truth is `../docs/05-site-overview.md`: section IDs like `HOME-02` and `PDP-05` refer to it. The motion language is in `../docs/04-reference-findings.md`.

## Stack (pinned)

| Package | Version |
|---|---|
| Next.js | 16.4.5 (App Router, Turbopack, `cacheComponents`, `partialPrefetching`) |
| React | 19.3 |
| TypeScript | strict |
| Tailwind CSS | v4 (`@theme` tokens in `src/app/globals.css`) |
| GSAP | 3.15.1 (ScrollTrigger, SplitText) + `@gsap/react` `useGSAP` |
| Lenis | 1.3.27 |
| Tests | Playwright (`@playwright/test`, matching the pre-installed browser) + `@axe-core/playwright` |

**Before using a Next.js API, read its doc in `node_modules/next/dist/docs/`.** Next 16 differs from older versions:
- `params` / `searchParams` are **Promises** (use `PageProps<'/route/[slug]'>` and `await props.params`).
- `next lint` is gone (use `npm run lint`).
- `middleware` is now `proxy`.

**Do not add dependencies** without the coordinator's approval.

## Non-negotiables

1. **Static.** Every page is prerendered at build. No cookies, headers or other request-time data in pages. Dynamic routes use `generateStaticParams`. The only server endpoint is `app/api/contact/route.ts`.
2. **SEO-safe motion.** All text and images are in the server HTML. Client components animate content that is already rendered; never render text only on the client.
3. **Scoped GSAP.** With `cacheComponents`, Next keeps up to 3 previous pages in the DOM, hidden with React `<Activity>`.
   - **Always** use `useGSAP(() => {…}, { scope: ref })` and query inside the scope; never `document.querySelector`.
   - `useGSAP` reverts on cleanup. Effects clean up when a page hides and re-run when it shows.
4. **Reduced motion.** Wrap motion in `gsap.matchMedia()`:
   - `"(prefers-reduced-motion: no-preference)"`: the full animation
   - `"(prefers-reduced-motion: reduce)"`: the final state, or a short opacity fade
   - Lenis is off under reduced motion. Pinned sections become normal stacked layouts.
5. **Accessible.**
   - Semantic landmarks, one `h1` per page, and visible `:focus-visible` rings (brand yellow on dark, red on light).
   - Every carousel or stage has real `<button>`s and keyboard support (← →).
   - Nothing is reachable only by hovering.
   - Decorative images get `alt=""`.
   - Text contrast is AA or better.
6. **Performance.**
   - No WebGL.
   - Images through `next/image` with explicit `sizes`; above-the-fold hero images get `priority`.
   - Pinned sections ≤2.5 viewports, at most 2 per page.
   - No autoplay video above the fold.
   - Animate `transform` and `opacity` only (clip-path is OK for reveals).

## Folder structure

```
src/
  app/                       routes (server components by default)
    layout.tsx               fonts, providers, header, footer, cursor label, loader
    page.tsx                 Home
    products/page.tsx        Products hub
    products/[slug]/page.tsx Product (21, generateStaticParams)
    categories/[category]/page.tsx  Category (3)
    bestsellers/ about/ why-yunch-bite/ benefits/ ingredients-quality/ blogs-reviews/ contact/
    articles/[slug]/page.tsx Article (5)
    api/contact/route.ts     POST: partner and question forms
    not-found.tsx  sitemap.ts  robots.ts
  components/
    layout/    Header, MenuOverlay, Footer, Loader, CursorLabel, PageTransition
    motion/    gsap.ts (plugin registration), SmoothScroll (Lenis provider + useLenis),
               TypeIn, Reveal, Pop, RingBurst, useReducedMotion, useIsTouch
    ui/        Container, Section, Pill/ButtonLink, OutlineHeading, Eyebrow, Chip, TransitionLink, Icon
    product/   PackImage, PackCard, FlavourCard, FlavourBuddy, ...
    sections/  shared sections: ClaimStack, ProcessPath, InsetOpener, Statement, NumberedCard,
               ClaimMarquee, PartnerBand, FilterPills, PillFaq, ReviewWall, ...
    home/ category/ pdp/ content/   page-specific sections
  data/        typed content (see "Data")
  lib/         tokens.ts (motion tokens), utils
public/
  brand/   logo.png, buddy/*.png
  packs/   <product-slug>.webp (transparent cut-outs), photos/<slug>.jpg
  photos/  lifestyle, factory, blog
  shapes/  paper-cut SVG set (P17)
```

**Path alias:** `@/*` → `src/*`.

## Design tokens

These are defined once in `globals.css` (`@theme`) and mirrored in `src/lib/tokens.ts`.

**Colour:**

| Token | Value | Use |
|---|---|---|
| `--color-red` | `#D61610` | Brand red: CTAs, menu, curtain |
| `--color-red-deep` | `#BA0403` | Pressed and shadow red |
| `--color-maroon` | `#8B1313` | Dark brand sections, text on cream |
| `--color-maroon-deep` | `#5A0B0B` | Deepest background (footer) |
| `--color-yellow` | `#FFD200` | Brand yellow, highlights, focus on dark |
| `--color-cream` | `#FFFDF5` | Page background (reading) |
| `--color-cream-2` | `#FBEFD9` | Soft surfaces, cards |
| `--color-makhana` | `#F1C396` | Makhana beige accents |
| `--color-ink` | `#2A1210` | Body text (warm near-black) |
| Flavour colours | per flavour in `src/data/flavours.ts` (`color`, `ink` = readable text colour on it) | Product moments |

**Type:**
- **Display:** *Bricolage Grotesque* (variable: `wght` 200–800, `wdth` 75–100, `opsz`), via `next/font/google`. CSS var `--font-display`. Headlines in caps, weight 800, `wdth` 75–85 (condensed).
- **Body:** *DM Sans* (`--font-body`).
- Both are placeholders until the client confirms the packaging font (open question Q3). Swapping them must be a one-line change in `layout.tsx`.
- **Fluid scale:**
  - `--text-hero: clamp(3.5rem, 11vw, 11rem)`
  - `--text-display: clamp(2.75rem, 7vw, 7rem)`
  - `--text-h2: clamp(2rem, 4vw, 3.75rem)`
  - `--text-h3: clamp(1.4rem, 2vw, 2rem)`
  - body: 1.0625rem, line-height 1.6

**Layout:** container max 1440 px; gutters 20 px (mobile) / 40 px (desktop); section padding `clamp(4rem, 10vw, 9rem)` block. Radii: pill 999 px, card 28 px, small 14 px.

**Motion** (`src/lib/tokens.ts`; durations in seconds for GSAP):

```ts
export const dur = { micro: 0.12, quick: 0.22, pop: 0.38, move: 0.6, roast: 0.9, switch: 1.0 };
export const ease = {
  roast: 'power2.inOut',                             // = cubic-bezier(0.645, 0.045, 0.355, 1), ease-in-out-cubic (Agrume, measured)
  crunch: 'back.out(1.6)',                           // CSS: cubic-bezier(0.34, 1.56, 0.64, 1)
  glide: 'expo.out',                                 // CSS: cubic-bezier(0.22, 1, 0.36, 1)
  exit: 'expo.in',                                   // CSS: cubic-bezier(0.7, 0, 0.84, 0)
};
export const stagger = { char: 0.022, item: 0.065 };
export const reveal = { start: 'top 80%' };
export const lenis = { lerp: 0.1 };
```

The CSS custom properties `--ease-roast`, `--ease-crunch`, `--ease-glide`, `--ease-exit` and `--dur-*` are used for CSS transitions (hover states, pills).

## Shared component contracts

These are built in the foundation phase; page builders import them and don't re-implement them.

| Component | Contract |
|---|---|
| `<SmoothScroll>` | Root provider: Lenis (`lerp 0.1`) on non-touch, no reduced motion; wired to GSAP ticker + `ScrollTrigger.update`. `useLenis()` returns the instance or `null`. |
| `<TypeIn as="h1" text="…" trigger="load"\|"scroll" delay?>` | SSR renders the full text. On the client, SplitText splits chars and animates them (y 0.35 em → 0, opacity 0 → 1, `stagger.char`, each `dur.quick`+, `ease.crunch` subtle). Keeps `aria-label`. Reduced motion: no split. |
| `<Reveal y? delay? stagger? children>` | Fades and slides children up on scroll (`reveal.start`, `dur.roast`, `ease.roast`). |
| `<Pop delay?>` | Scale 0.6 → 1 with `ease.crunch`, `dur.pop`, on enter. |
| `<RingBurst ref color>` | `ref.current.burst()` plays a ring expanding and thinning (≈450 ms). Pure CSS/GSAP, absolutely positioned. |
| `<TransitionLink href direction?="forward"\|"back">` | `next/link` with `transitionTypes`, for page transitions. |
| `<PageTransition>` | Wraps each page's content in React `<ViewTransition enter/exit>` (curtain wipe, see `globals.css`). Each `page.tsx` wraps its content. |
| `<PackImage product size priority? morph?>` | `next/image` of the pack cut-out. With `morph`, it's wrapped in `<ViewTransition name={'pack-'+slug} share="morph" default="none">` so a card pack morphs into the product hero. |
| `<PackCard product>` | Card: pack + name + size chips; hover ring burst + Buddy peek; cursor label "Taste me →". |
| `useCursorLabel(text)` | Returns pointer handlers that show the global trailing label (desktop, fine pointer only). |
| `<Section tone="cream"\|"red"\|"maroon"\|"yellow"\|"flavour" arch?>` | Section wrapper; `arch` gives the arched top edge with the arch-reveal motion. |
| `<OutlineHeading text solid?>` | Giant outline text; the solid fill types over it on scroll. |
| `<ButtonLink variant="solid"\|"ghost"\|"cream">` | Pill CTA, slightly magnetic on fine pointers. |

## Data (`src/data/`)

Typed TypeScript modules, generated once from the harvest (`../research/current-site/`), then edited by hand:

| Module | Contents |
|---|---|
| `site.ts` | Brand, contact, social, nav, claims |
| `categories.ts` | 3 categories |
| `flavours.ts` | Flavour colour, Buddy's ingredient, taste profile, pairs-with |
| `products.ts` | 21 products: slug = the existing URL slug, all page data |
| `articles.ts` | 5 articles |
| `reviews.ts` | Reviews; **hidden by default** until the client confirms they are real |
| `copy/*.ts` | Page copy |

**Existing URLs must be kept exactly** (e.g. `/products/makhana-zipper-peri-peri`).

## Dev and QA commands

```bash
npm run dev                         # http://localhost:3000
NEXT_DIST_DIR=.next-b1 npx next dev -p 3101   # parallel dev servers use their own distDir + port
npm run lint && npx tsc --noEmit && npm run build
npx playwright test                 # e2e + a11y (tests/)
```

## File ownership during the parallel build

| Phase | Owner | Files |
|---|---|---|
| A · foundation | Foundation agent | `app/layout.tsx`, `globals.css`, `components/{layout,motion,ui}/`, `lib/`, `app/not-found.tsx`, `sitemap.ts`, `robots.ts`, `next.config.ts`, `components/product/PackImage.tsx`, `PackCard.tsx`, `components/sections/{Section,PartnerBand,ClaimMarquee,FilterPills,PillFaq,InsetOpener,Statement,NumberedCard}.tsx` |
| A · data | Data agent | `src/data/**` |
| A · assets | Assets agent | `public/**` (and `src/data/assets.ts` manifest) |
| B · home | Home agent | `app/page.tsx`, `components/home/**`, `components/sections/{ClaimStack,ProcessPath,ReviewWall}.tsx` |
| B · products | Product agent | `app/products/**`, `app/categories/**`, `app/bestsellers/**`, `components/{category,pdp}/**`, `components/product/**` except PackImage and PackCard |
| B · content | Content agent | `app/{about,why-yunch-bite,benefits,ingredients-quality,blogs-reviews,contact,articles}/**`, `app/api/contact/**`, `components/content/**` |

Anyone who needs a change in a file they don't own must ask the coordinator.
