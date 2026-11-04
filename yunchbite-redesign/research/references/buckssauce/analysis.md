# R1 · Bucks Sauce: reference analysis

- **Site:** <https://buckssauce.com/> (small-batch BBQ sauce, US). Built by Buzzworthy.
- **Stack** (from a browser visit): Next.js (Turbopack build), Prismic CMS (`images.prismic.io`), fonts *Inter Tight* + custom *Peperoncino Sans*, LogRocket, CrazyEgg, GTM. Vercel bot protection is on, so automated browsers are refused (429).
- **Source:** the client's desktop screen recording (Brave, 1920×1020, 65.6 s, VFR ≈24.5 fps). It covers the homepage, a page reload (the loader), and the *Crushed Pineapple Sriracha* product page. **There is no mobile recording yet.**
- **Frame data:** `analysis/desktop-brave-2026-11-04/` (contact sheets, per-event frame strips, motion timeline, frame stepper `viewer.html`)
- **Timestamps** below are positions in the recording (`mm:ss`). Until the per-event strips are measured they're accurate to about ±0.5 s; measured values are marked **(measured)**.

---

## A · First 5 seconds

The recording starts on an already-loaded homepage. The user reloads at about 00:06, so the loader is visible:

| t | What happens |
|---|---|
| 00:06 | Black screen |
| 00:07 | **Iris reveal:** a full-bleed red field with a black circle in the centre holding the deer-chef logo. The circle grows until it fills the screen. |
| 00:08–00:09 | The logo sits centred on black, with four **ingredient cut-outs** (habanero, cherry, pineapple, peach) floating around it with gentle drift |
| 00:10 | The loader clears. The hero headline types in **letter by letter**: each letter drops in and fades from transparent to solid ("MAKEs OTh…" caught mid-way) |
| 00:11 | The hero is complete: headline, bottle on a peach-coloured disc, peach cut-out, "PRODUCT NO.01 / SMOKED PEACH CHIPOTLE" rail |

**Total intro ≈ 4 s.** That's long for a repeat visitor, and it doesn't seem to be skippable.

## B · Story structure (homepage)

| # | Section | Job it does | ≈Length |
|---|---|---|---|
| 1 | Announcement bar "BUILD YOUR OWN 3-PACK & SAVE $4 BUCKS" (closable) + full nav | Offer and wayfinding | — |
| 2 | Hero: "THE BBQ SAUCE THAT MAKES OTHER SAUCES INSECURE" (outline + solid type) | Attitude first, product second | 1 vh |
| 3 | **Flavour carousel**: bottle on a colour disc + a fruit **character with a face** peeking out, ← → arrows, "PRODUCT NO.0X" odometer, "SHOP NOW" | Meet each flavour | 1 vh |
| 4 | Kinetic manifesto: "Our BBQ sauces use real, natural stuff like it's the 1800s. Slap it on anything…" | Brand voice | 0.6 vh |
| 5 | **Claim cards**: NO CORN SYRUP → NO SEED OILS → NO ADDITIVES → GLUTEN FREE stack up, surrounded by floating, depth-blurred ingredient cut-outs | Health proof points | ~2 vh (sticky) |
| 6 | "CHOOSE YOUR WEAPON" giant outline header + 4 colour-coded product cards | Product grid | 1.2 vh |
| 7 | **Build your 3-pack**: bottle silhouettes in a ring, "+" per flavour, progress ring | Upsell (commerce) | 1 vh |
| 8 | "WHY BUCKS SAUCE" arched heading + one-line manifesto | Transition into the story | 0.6 vh |
| 9 | **Arc carousel**: 01 SMALL BATCHES · 02 REAL INGREDIENTS · 03 OH, THIS? (award); a garlic character travels along a dotted arc | Reasons to believe | ~2 vh (scroll-driven) |
| 10 | "REVIEWS" giant outline header + **UGC video wall** (creator handles as pills over videos) | Social proof | 1 vh |
| 11 | Footer: logo, links, "JOIN THE BUCKS CLUB" newsletter, Instagram/Facebook tiles | Retention | 0.5 vh |

**Product page** (from 00:45): split hero with the pack and flying pineapple cut-outs on the left and a gallery on arrows → the title typing in letter by letter → a **flavour character with sunglasses** (pineapple) → *Taste profile* and *Pairs with* cards → a row of claim icons → size select, quantity, add to cart → 3-pack banner → "THE SAUCE THAT DIDN'T ESCAPE THE LAB" with the founder video → "STARTS WITH REAL INGREDIENTS / BUILT ON FIRE" (arched type) with *Ingredients / Nutrition* tabs → ingredient and nutrition cards fanned over a row of pineapple photos ("PURE AF. SERIOUSLY") → process video clips → a "No fillers / No mystery 'natural flavors'…" tick list → "CHOOSE" + view all products → footer.

## C · Scroll choreography

| ID | Pattern | Where (t) | Notes |
|---|---|---|---|
| R1-C1 | **Header morph**: the full nav collapses into floating pills ("GET SAUCE" CTA + cart + menu) on the right, and the logo shrinks to an antler mark | 00:12 | The nav never blocks the content; the main CTA is always one tap away |
| R1-C2 | **Letter-drop headline**: letters fall in with a stagger and fade as each section header enters | 00:10, 00:45, 00:49, 00:51 | Used on almost every big headline, so it's a signature move |
| R1-C3 | **Flavour switch**: the bottle slides out and the next one slides in, the colour disc changes colour (peach → crimson), the character swaps, and the "PRODUCT NO.0X" counter rolls like an odometer | 00:13–00:17 | Arrow-driven, not scroll-driven |
| R1-C4 | **Kinetic manifesto**: words tumble in with rotation and settle into a sentence | 00:18 | Readability suffers mid-motion |
| R1-C5 | **Sticky stacking claim cards**: each claim card slides up over the last; at the end they collapse into a list of pills | 00:19–00:22 | Floating ingredient cut-outs around it at several depths, with the nearest ones **blurred** (fake depth of field) |
| R1-C6 | **Giant outline headers**: "WEAPON", "REVIEWS" in viewport-wide outline type; the solid part types in | 00:23, 00:36 | Strong section breaks at almost no performance cost |
| R1-C7 | **Arc carousel**: numbered story cards travel along a circular arc as you scroll, with a character walking along a dotted path | 00:33–00:36 | Very ownable "process" storytelling |
| R1-C8 | **Arched heading**: text set on a curve | 00:32, 00:51 | |
| R1-C9 | **Stacked fan cards**: ingredients and nutrition cards fanned and tilted over a photo strip | 00:52 | Makes dry data feel physical |

## D · Micro-interactions

| ID | Pattern | Where | Notes |
|---|---|---|---|
| R1-D1 | **Product card hover**: "ADD TO CART $12" and "VIEW PRODUCT" buttons rise in; an antler graphic springs up behind the bottle | 00:24–00:27 | Timing pending (event strip) |
| R1-D2 | **3-pack builder**: "+" makes a bottle fly into the ring, the progress ring fills, and the button counts down ("ADD 3 MORE" → "ADD 1 MORE") | 00:28–00:31 | Commerce-only |
| R1-D3 | Round cream arrow buttons; claim pills with dot bullets "• NO CORN SYRUP •" | throughout | |

## E · Page transitions

Product card click at about 00:44 → product page at 00:45. The product title then types in with the letter drop (R1-C2). Transition type and duration: **pending** frame-level measurement.

## F · Visual system

- **Colour:** a warm near-black base, cream type, and one **saturated colour per flavour** (golden yellow, chilli orange, crimson, peach orange) used for the product cards and the carousel disc.
- **Type:** a condensed display sans set in caps, mixing **outline and solid** within one headline; a clean sans for body copy; small caps for labels.
- **Shapes:** pill labels, round arrow buttons, circles (discs, rings, iris), arcs and curved paths.
- **Imagery:** cut-out bottles + cut-out ingredients (exactly the **cut-out style** chosen for Yunch Bite), lifestyle and process photography, UGC video.

## G · Product presentation

- Every flavour has **its own colour and its own character**: a cartoon version of its hero ingredient with a face.
- Product page modules: Taste profile · Pairs with · claim icons · ingredients/nutrition tabs · founder story video · process clips · "no fillers" list.

## H · Personality devices

- Irreverent copy: "makes other sauces insecure", "PURE AF. SERIOUSLY", "Doug hovering like it owes him money".
- Two layers of mascot: the brand mascot (deer chef) in the logo, and an **ingredient character per flavour** in the product moments.

## I · Mobile

**Not recorded yet.** If possible, a phone recording of the homepage and one product page would complete this section.

## J · Performance and accessibility

- Heavy: the homepage is ~74,000 px tall on desktop, with 26 `<video>` elements and 6 canvases; three analytics/session-recording scripts.
- Thin outline type on near-black only works at very large sizes.
- The kinetic manifesto is hard to read while it moves.
- A 4 s loader with no skip.

---

## Verdicts for Yunch Bite

| ID | Verdict | How it maps to Yunch Bite |
|---|---|---|
| R1-A (loader) | **Adapt** | Show a *"makhana pop"* iris reveal in brand colour with Makhana Buddy and floating cut-outs (makhana, chilli, pudina leaf) **on the first visit only**, at most about 1.5 s, and skippable. |
| R1-C1 | **Adopt** | Use the compact pill header: logo mark + one main CTA ("Find your flavour" / where to buy) + menu. |
| R1-C2 | **Adopt** | Letter-drop headlines become the type signature, to be retuned for a *crunchy* feel. |
| R1-C3 | **Adopt** | **Flavour switcher** for the makhana flavours: pack cut-out on a colour disc taken from the pack, plus a character, with an odometer flavour counter. Needs a character per flavour or Makhana Buddy poses. |
| R1-C4 | **Avoid / Adapt** | Use only for a short Hinglish line ("Ye Hai Yunchy Jindgi"), never for body copy. |
| R1-C5 | **Adopt** | Stacking **claim cards**: Zero palm oil · Roasted in olive oil · No preservatives · High protein & fibre · Gluten-free, with floating, depth-blurred makhana and spice cut-outs. |
| R1-C6 | **Adopt** | Giant outline section headers, in the packaging typeface if it suits. |
| R1-C7 | **Adapt** | **Process arc**: Sourced → Slow-roasted in olive oil → Seasoned → Packed fresh, with Makhana Buddy walking the path. |
| R1-C8 / C9 | **Adopt** | Arched headings; ingredients and nutrition as fanned cards on the product page. |
| R1-D1 | **Adapt** | Card hover: "View product" rises in and Makhana Buddy peeks out (touch: on tap). |
| R1-D2 | **Avoid** | There's no shop. The ring-progress idea could come back in a "find your flavour" picker. |
| R1 UGC wall | **Adapt** | Instagram reels from real customers. It depends on getting real content, because the current reviews look like placeholders. |

*Effort and mobile-cost ratings are added once the mobile behaviour and the measured timings are in.*
