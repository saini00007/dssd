# R2 · Agrume Farm: reference analysis

- **Site:** <https://www.agrumeafarm.it/en> (Sicilian jams, pestos and preserves). The shop is external (riblo.it), so like Yunch Bite this is a brand site, not a store.
- **Stack** (probe): Nuxt (SPA routing with a page-transition overlay `div.page-transition__panel`), **Lenis**, **Splitting.js** (char/word splitting for text reveals), **GSAP bundled** (no global), Prismic CMS, Adobe Fonts (Typekit). The home jar labels are drawn on 2D `<canvas>` elements (10 of them).
- **Captures** (desktop, 1440×900):
  - automated capture in `desktop/` (probe, hover with exact CSS, cursor, transition)
  - journeys in `journeys/`:
    - `home-jar-slider`: loader, wheel-driven carousel, mouse sweep, menu
    - `tour-product-production-about`: product page. Its menu clicks failed after scrolling, so production and about came from the next journey.
    - `production-about`
- **Why journeys:** the homepage **never scrolls** (`scrollY` stays 0, the document is 900 px tall). The wheel drives a horizontal jar carousel instead, so the standard scroll capture stopped early.
- **Key frames** (timestamped sheets, in `key-frames/`):
  - [loader](key-frames/01-loader-2fps.jpg)
  - [jar carousel on wheel](key-frames/02-jar-carousel-wheel-1fps.jpg)
  - [cursor label sweep](key-frames/03-cursor-label-sweep.jpg)
  - [menu](key-frames/04-menu-1fps.jpg)
  - [menu open at 10 fps](key-frames/05-menu-open-10fps.jpg)
  - [product page / jar flight](key-frames/06-product-page-jar-flight.jpg)
  - [production](key-frames/07-production-page.jpg)
  - [about](key-frames/08-about-page.jpg)
- **Precision:** loader and carousel timings come from 1–10 fps timestamped frames. This page renders WebGL in software, so the recorder drops frames and short transitions (menu) are approximate (±100–200 ms). CSS hover values are exact.

---

## The big idea: calm, editorial and illustrated

Agrume is the **"slow-roasted" end** of our spectrum:
- **one easing curve** for everything (`cubic-bezier(0.645, 0.045, 0.355, 1)`, an ease-in-out-cubic)
- long durations (0.8–0.9 s) for movement
- elegant serif type
- a **flat, paper-cut illustration system** of fruit in the product colours

Where Bucks Sauce is loud and fast, Agrume is warm, generous with space, and confident.

## A · First seconds: loader (measured, journey `home-jar-slider`)

| t (video) | What happens |
|---|---|
| 1.25 s | A serif **percentage counter** "0%" in orange on cream |
| 2.2 → 3.0 s | 34% → 70%. **Flat paper-cut fruit** (pomegranate, fig, aubergine, pear, lemon, strawberry, orange, blackberry, date) starts **falling from the top and piling up**, rotating as it lands |
| 4.4 → 6.7 s | The pile fills the whole screen, about 30 shapes; the counter finishes behind it |
| 6.7 → 7.2 s | An **orange panel wipes up** from the bottom and covers everything (≈450 ms) |
| 7.6 → 9.0 s | The orange panel keeps sliding up and off, revealing the cream page and a **ghosted** maroon blob with ring text |
| 9.4 s | Logo and menu appear; the blob turns solid |
| 10.8 → 11.3 s | Jars **fade from translucent to solid** while floating up into place |

**Total ≈10 s** from blank to usable, and it runs on **every direct page load** (the product page has it too). Beautiful, but far too long to repeat.

## B · Story structure

**Home** is one viewport:
- the logo top centre, IT/EN pills top left, a MENU pill top right
- a **wheel-driven horizontal carousel of all 10 jars** floating at angles over a big maroon octagonal blob
- ring text "PRESERVE · WE GROW" running around the blob
- "SCROLL TO DISCOVER" at the bottom

There's no long scroll at all: **the product range *is* the homepage.**

**Menu:** a full-screen orange panel. Huge serif items (HOME • · PANTRY · PRODUCTION · EXPERIENCE) are stepped further right on each line, separated by hairlines. Secondary links (About · Contacts · Shop ↗) sit small at the bottom.

**Product page** (journey `tour-…`, 8–22 s):

| # | Section |
|---|---|
| 1 | Hero: huge orange serif title "SICILIAN CAPONATA", with "Savoury" on the left and "Made in Sicily · Italy" on the right; the **jar rises from below the fold** |
| 2 | **Jar flight**: on scroll the jar tilts and **flies up across the title**, overlapping the letters, into the next section |
| 3 | Copy: one poetic line ("Rich in notes and flavours, like Baroque music…"), the **ingredients list with allergens in bold**, a "May contain…" line, all centred in small type with lots of air |
| 4 | A 3-column facts row: serving suggestion · formats · shelf life |
| 5 | A lifestyle photo strip (food in use, the jar on a coloured set) |
| 6 | "THE OTHER PRODUCTS": a 4-jar grid on cream tiles |
| 7 | Footer: a giant "AGRUMEA" wordmark on a maroon band |

**Production page** (journey `production-about`, 12–58 s):
- a huge serif "PRODUCTION" title over an **inset photo (oranges) that grows towards full width** as you scroll
- a centred statement paragraph between small diamond dividers
- "CITRUS FRUITS": copy plus a **seasonal availability table** (product · availability window), with pill tabs (Citrus Fruits / Dried Fruits)
- the maroon wordmark footer with contact columns

**About page** (66–110 s):
- "ABOUT" + an inset photo (hands picking tomatoes) that expands to full-bleed with an overlaid title revealing "A TREASURE GUARDED…"
- the origin story (Floridia, grandfather, 50 years) in centred paragraphs
- **paper-cut fruit shapes drifting in parallax** around the line "IT'S NOT JUST A BRAND, BUT A PROMISE THAT HAS BEEN KEPT OVER TIME"
- the 2018 organic-conversion story
- a giant **"VISION"** title over a full-bleed portrait of the farmer in the field
- a product jar photo, then the footer

## C · Scroll and wheel choreography

| ID | Pattern | Notes |
|---|---|---|
| R2-C1 | **Wheel-driven jar carousel** (home): wheel input slides the jars horizontally with smoothing; jars **float and tilt** (about ±15°), the centre jar is biggest and nearly upright; the **maroon blob and the ring text rotate** with the movement | Turns browsing the range into play. Every jar is a link. |
| R2-C2 | **Ghost → solid reveal**: elements start translucent and firm up as they arrive | Gentle; it suits "slow-roasted" |
| R2-C3 | **Jar flight** (product page): the hero pack rises from below the fold, then on scroll **crosses over the title** and continues into the next section | **The strongest product-page idea of the three references.** Works with a cut-out pack. |
| R2-C4 | **Text reveals with Splitting.js** (char/word spans) | Editorial, never jumpy |
| R2-C5 | **Inset → full-bleed hero photo**: under a giant title, an inset photo grows to the full width as you scroll | Production and about pages: an easy, strong page opener |
| R2-C6 | **Paper-cut shapes in parallax** drift at different speeds around a centred statement | The illustration system doing storytelling |
| R2-C7 | **Giant title over a full-bleed portrait** ("VISION") | Founder and people moments |

## D · Micro-interactions (exact CSS from the capture)

| ID | Element | Transition |
|---|---|---|
| R2-D1 | **MENU ↔ CLOSE toggle**: the letters are doubled and the label **rolls vertically** | label `transform, opacity 0.9s cubic-bezier(0.645,0.045,0.355,1)` · pill colour `0.3s ease` · disc `transform 0.3s ease-out` |
| R2-D2 | **Logo hover**: the logo parts (icon, "Farm", wordmark) shift on a track | `transform 0.78–0.9s cubic-bezier(0.645,0.045,0.355,1)`, opacity/colour `0.28s` same curve |
| R2-D3 | Language pills | `border-color, color, background-color 0.3s ease` |
| R2-D4 | Legal link | `opacity 0.25s ease` |
| R2-D5 | **Cursor label**: over a jar, a "DISCOVER THE PRODUCT" pill with a diamond **trails the pointer**. Its parts lag by different amounts (container ≈30% of pointer travel per sample, diamond 31%, pill 36%), so it stretches and catches up elastically. | Desktop only; the native cursor stays visible |
| R2-D6 | Jars are **magnetic** (`a.jar-slider__item` reacts before hover) | Subtle |

## E · Page transitions

- SPA (Nuxt) with an overlay panel `div.page-transition__panel`. The language switch IT ↔ EN was recorded as an SPA route change; it settled after ≈5 s on this software-rendered machine.
- **Menu open (measured, approximate):** the orange panel drops from the top, briefly holds at header height (≈0.1–0.4 s), then covers the screen with the items already in place. Total ≈0.5–0.6 s.

## F · Visual system

- **Colour:**
  - cream `#FDF3EB`-ish background
  - **orange** (`≈#E8501F`) for the menu, curtain and titles
  - **maroon** for the blob and footer
  - the product colours (fruit illustrations, labels) carry everything else
- **Type:** an elegant high-contrast **serif in caps** for titles and nav; a small clean sans for body; generous letter-spacing on labels.
- **Illustration:** **flat, paper-cut fruit shapes** in the product colours, used in the loader. This is a full illustration system that fits the cut-out direction well.
- **Layout:** centred, symmetric, a lot of empty cream space.

## G · Product presentation

- The pack is the hero everywhere: the floating jars on home, the jar flight on the product page, the jar grid for other products.
- Product data is **quiet and complete**: ingredients with allergens in bold, "may contain", formats, shelf life, serving suggestion. This is the right tone for Yunch Bite's nutrition, allergen and shelf-life data.

## H · Personality devices

- Poetic food copy ("like Baroque music: sweet and sour, and irresistible").
- The farmer illustration in the logo.
- A sense of place (Sicily, the farm): **origin as a story**, which suits makhana from Bihar's ponds.

## I · Mobile

Skipped for now (client decision).

## J · Performance and accessibility

- A ≈10 s loader on every direct load.
- 10 canvases on home.
- A wheel-hijacked homepage: keyboard and screen-reader users need the jar links to stay reachable (they are real `<a>` links, which is good).
- Small body type on cream can be low contrast.

---

## Verdicts for Yunch Bite

| ID | Verdict | How it maps to Yunch Bite |
|---|---|---|
| Paper-cut illustration | **Adopt (needs assets)** | A **flat cut-out shape set**: makhana kernels, chilli, pudina leaf, pepper, salt crystals, cheese wedge, berries, popcorn, almonds, cashews, in pack colours. Use it in the loader, section backgrounds and flavour moments. **Cheap (SVG), on-brand, cut-out style.** |
| Loader (falling pile) | **Adapt** | **"Makhana shower"**: cut-out makhana and spices **pop up and pile**, a counter in brand voice, then a **brand-red curtain** wipes up. **≤1.5 s, first visit only, skippable**, never on every load. |
| R2-C1 carousel | **Adapt** | Not as the whole homepage (we have 21 products and need a story), but as the **category hero**: wheel/drag through packs on `/categories/makhana`, with the colour disc + ring text "YUNCHY · CRUNCHY · HEALTHY BITE" rotating |
| R2-C3 jar flight | **Adopt** | **Product page hero:** the pack cut-out rises from below, crosses the flavour title on scroll, and lands in the nutrition section |
| R2-C4 text reveal | **Adopt** | Splitting-style char reveals, with the timing tuned to our motif |
| Easing | **Adopt the discipline** | **One curve family for the whole site**, like Agrume. We'll define 2 (a calm "roast" ease-in-out and a snappy "crunch" overshoot) and use nothing else |
| R2-D1 menu toggle | **Adopt** | Rolling MENU ↔ CLOSE label (≈0.6 s for us, a bit snappier) |
| R2-D5 cursor label | **Adopt** | "Taste me →" / "Dekho ✦" trailing pill over packs on desktop |
| Menu panel | **Adopt** | Full-screen **brand-red** panel, giant stepped nav items, small secondary links; drops from the top |
| Product data block | **Adopt** | Quiet, centred ingredients with **allergens in bold**, plus a 3-column facts row (formats · shelf life · storage) |
| Origin story | **Adopt** | "From the ponds of Bihar" as our "Made in Sicily" |
| R2-C5 | **Adopt** | Opener for About / Ingredients & Quality / Benefits: a giant title + an inset photo growing to full-bleed |
| R2-C6 | **Adopt** | Paper-cut makhana and spice shapes drifting around a brand statement (About, Why Yunch Bite) |
| R2-C7 | **Adopt** | Founder moment: "Nitin Rathi" / "VISION" giant title over a portrait (needs a founder photo) |
| Availability table + pill tabs | **Adapt** | Product formats per flavour (pillow · zipper · jar) as a clean table with category pill tabs |
