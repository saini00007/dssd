# R3 · YAAS Energy: reference analysis

- **Site:** <https://yaas-energy.com/> (zero-sugar energy drink, 5 flavours). Designed by DVIGA.
- **Stack** (probe): Vite SPA, **Lenis** (global), **three.js r169** with a WebGL2 canvas and a `can.glb` model (**the cans are real-time 3D**), **GSAP bundled** (no global, so tween and ScrollTrigger data couldn't be read; GSAP's `normalizeScroll` ships in the bundle). One long page, about 22 viewports tall: `#flavors` 3.8 vh · `.screen2` (arc gallery) 9.7 vh · `#why-yaas` 4.2 vh · `#about` 6.8 vh · footer 2 vh.
- **Captures** (desktop, 1440×900):
  - automated capture in `desktop/`: scroll video, sheets, 30 scroll steps, hover, cursor, transition, `report.md`
  - scripted journey in `journeys/`: hero → "See the Flavors" → 5 flavour switches → FAQ. It has a step log with video timestamps and a frame analysis.
- **Key frames** (in `key-frames/`):
  - [scroll overview 0–29 s](key-frames/01-scroll-overview-0-29s.jpg)
  - [scroll overview 30–57 s](key-frames/02-scroll-overview-30-57s.jpg)
  - [hero](key-frames/03-hero-2fps.jpg)
  - [hero → line-up at 6 fps](key-frames/04-hero-to-lineup-6fps.jpg)
  - [flavour switcher](key-frames/05-flavour-switcher-1fps.jpg)
- **Precision:** the timings below come from timestamped frames at 1–6 fps (±0.1–0.3 s). Hover and transition CSS values are exact (read from computed styles).

---

## The big idea: a character per flavour, colour as the navigation

Every can carries **its own fruit character in sunglasses**: strawberry, blueberry, orange, apple, lemon. The site's colour changes with the flavour you're looking at. This is the closest of the three references to Yunch Bite: **a playful character system on the pack + flavour colour-coding**.

## A · First seconds

| t | What happens |
|---|---|
| 0–1 s | **Brand-voiced loader:** "LOADING ENERGY" in the display font on salmon pink |
| ~2 s | A dark flash, then the hero |
| 3–6 s | Hero: soft **gradient-mesh** background (purple, pink, orange, yellow); a giant white "YAAS" wordmark in a groovy display face; 3D cans **drop in from the top** and come to rest tilted around the wordmark; pill nav (Flavors · About us · FAQ | Contacts) |

The loader is short (≈2 s), and its copy carries the brand voice. That's a direct idea for us: **"Loading crunch…"**

## B · Story structure (one page)

| # | Section | Job it does |
|---|---|---|
| 1 | Hero: wordmark + tumbling cans + one-line promise + "See the Flavors →" | Attitude and product at once |
| 2 | **"5 FLAVORS. 1 ENERGY."**: cans in a row, the centre one bigger, ◁ ▷ arrows, flavour name below, background in the flavour colour | Flavour discovery |
| 3 | Flavour detail ("WILD STRAWBERRY"): close-up can + copy + "Learn more" | One flavour in depth |
| 4 | **White arch rises** over the pink: "THIS ISN'T ABOUT HYPING YOU UP…" assembling, plus a **curved photo gallery** (photos on a concave arc) | Brand attitude, lifestyle |
| 5 | The arc gallery's **centre photo zooms to full screen**; then full-bleed moments with captions ("LATE NIGHT GAMING SESSION", "ROAD TRIP / FESTIVAL RUN", "WORKOUT, GYM SESSION") | Occasions to drink it |
| 6 | Rounded gradient panel slides up: "WHY YAAS BEATS WHATEVER'S SITTING IN YOUR FRIDGE RIGHT NOW" + **numbered benefit cards** 01 Zero sugar → 05 Grab-and-go size, sliding sideways, slightly tilted | Reasons to believe |
| 7 | **FAQ**: "QUESTIONS YOU'RE GONNA ASK ANYWAY", a 2-column accordion of white pills with "+" | Objections |
| 8 | "NOT FOR EVERYONE. FOR OUR PEOPLE." blurs in and out | Brand line |
| 9 | About: factory and lab **photos scattered, collapsing into a stack** while you scroll, with text on both sides | Credibility |
| 10 | Contact/footer: gradient card, floating cans with characters, "partnership@…" pill | Partnerships (B2B) |

## C · Scroll choreography

| ID | Pattern | Where (capture video) | Notes |
|---|---|---|---|
| R3-C1 | **Hero dissolve on scroll:** the wordmark fades to ghost, the strawberry can spins up and out, the others slide away | 12–15 s | Scroll-scrubbed 3D |
| R3-C2 | **Arch reveal:** the next section's white shape rises with an **arched top edge** over the current one | 19 s | Soft, friendly section change; a simple shape mask |
| R3-C3 | **Curved gallery → zoom:** photos sit on a concave arc (3D perspective); scrolling pulls the centre photo forward to full width while the rest blur away | 20–26 s | The 9.7 vh section; pinned |
| R3-C4 | **Benefit cards carousel:** numbered cards (outline number + title + line) slide horizontally with a slight tilt as you scroll | 33–39 s | The same idea as Bucks' arc, flatter |
| R3-C5 | **Headline assembly:** title words drift in from scattered positions and settle | 19 s, 32 s | The display type stays readable |
| R3-C6 | **Photo stack collapse:** scattered polaroid-like photos converge into one pile at the centre | 44–48 s | Good for "our factory / our process" |
| R3-C7 | **Footer reveal** (`.site-footer.is-reveal`) | 49 s+ | — |

## D · Micro-interactions

| ID | Pattern | Measured |
|---|---|---|
| R3-D1 | **Flavour switcher** (journey 17–42 s): ◁ ▷ slide the can row one slot along an **endless loop**; the centre can scales up and the old one scales down; the **full background crossfades** to the new flavour colour (through a mixed tint, e.g. orange → olive → lime); the flavour name swaps | **≈1 s per switch.** 5 colours: pink (Wild Strawberry), orange (Solar Orange), lime (Green Apple), yellow (Citrus Lemon), blue (Blueberry Rush) |
| R3-D2 | Pill buttons (nav, footer, contact) | `background, border-color, color 0.2s ease` (exact) |
| R3-D3 | Footer credit links | underline appears instantly (no transition) |
| R3-D4 | FAQ accordion: pill rows with "+" | Open/close not clearly resolved at 1 fps |
| — | Cursor | No custom cursor, no pointer parallax, no magnetic elements |

## E · Page transitions

Single page. "See the Flavors" and the nav pills are **anchor links**: Lenis smooth-scrolls to the section. The privacy page is an SPA route with a loader overlay (`div#pl`).

## F · Visual system

- **Colour:** gradient-mesh backgrounds (purple, pink, orange, yellow) for brand moments; **one flat saturated colour per flavour** for product moments; white sections for calm reading.
- **Type:** a **groovy, chunky display face** (custom) for headlines in caps with a bit of letter-play; a clean geometric sans for body.
- **Shapes:** pills, rounded panels, arches.
- **Imagery:** 3D cans (we'll use **cut-out packs** instead), lifestyle photography with real people holding the product, factory photos.

## G · Product presentation

- **Line-up first**, then detail: all flavours visible at once, with one in focus.
- The can artwork does the storytelling: each flavour's character is printed on the can.
- A short benefit list (zero sugar, real ingredients, no crash, 5 calories, grab-and-go) as numbered cards.

## H · Personality devices

- Slangy, confident copy: "Not for everyone. For our people.", "Questions you're gonna ask anyway", "Yes, we use cookies. Sugar-free." (even the cookie banner is on-brand).
- Characters with sunglasses and attitude on every can.

## I · Mobile

Skipped for now (client decision).

## J · Performance and accessibility

- three.js + WebGL2 + a GLB model for the cans is heavy for mid-range Android. **Cut-out packs avoid it entirely.**
- 22 viewports of scroll, ≈10 of them in one pinned gallery: long.
- Flat-colour backgrounds behind white type can fail contrast on yellow and lime.

---

## Verdicts for Yunch Bite

| ID | Verdict | How it maps to Yunch Bite |
|---|---|---|
| Character per flavour | **Adopt (needs assets)** | Makhana Buddy as the brand character, plus a **flavour variant per pack** (e.g. Peri-Peri Buddy with a chilli, Pudina Buddy with a mint leaf), or the flavour's hero ingredient with a face. Asset request. |
| Loader voice | **Adopt** | A ≤1.5 s loader with brand copy: *"Loading crunch…"* / *"Roasting in olive oil…"* |
| R3-D1 | **Adopt** | **"7 Flavours. 1 Crunch."**: makhana pack cut-outs in an endless row, centre pack scaled up, **background crossfades to the pack colour** (Peri-Peri red, Pudina green, Salt & Pepper black, Cheese orange…), ≈1 s, flavour name swaps. **Merge with Bucks' character pop (R1-D0).** |
| R3-C2 | **Adopt** | **Arch reveal** between sections: cheap, friendly, and it echoes the round makhana |
| R3-C3 | **Adapt** | Curved gallery → zoom for **snacking occasions** (tiffin, office 4 pm, movie night, chai time, gym). Shorter: ≤3 vh, not 10. |
| R3-C4 | **Adopt** | Numbered benefit cards: 01 Zero palm oil · 02 Olive-oil roasted · 03 High protein · 04 High fibre · 05 No preservatives (merge with Bucks' stacking cards and pick one) |
| R3-C6 | **Adopt** | Photo stack collapse for the **factory / quality** story (the factory photo exists; more needed) |
| R3 FAQ | **Adopt** | "Sawaal? Hum batate hain." Pill accordion, 2 columns on desktop |
| R3 contact | **Adopt** | Partnership pill in the footer: retailers and distributors are a key audience |
| Gradient mesh | **Adapt** | Use brand colours only (red, yellow, cream) and use it sparingly, so flavour colours stay the hero |
| 3D cans | **Avoid** | We use cut-outs (client decision), with 2D tilt, float and parallax instead |
