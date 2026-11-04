# R1 · Bucks Sauce: reference analysis

- **Site:** <https://buckssauce.com/> (small-batch BBQ sauce, US). Built by Buzzworthy.
- **Stack** (from a browser visit): Next.js (Turbopack build), Prismic CMS (`images.prismic.io`), fonts *Inter Tight* + custom *Peperoncino Sans*, LogRocket, CrazyEgg, GTM. Vercel bot protection is on, so automated browsers are refused (429). This analysis is therefore based on the client's own recording.
- **Source:** the client's desktop recording (Brave, 1920×1020, 65.6 s, VFR ≈24.5 fps, 1,607 frames). It covers the homepage, a reload (the loader), and the *Crushed Pineapple Sriracha* product page. **Mobile is skipped for now** (client decision).
- **Frame data:** [`analysis/desktop-brave-2026-11-04/`](analysis/desktop-brave-2026-11-04/report.md) holds the motion timeline (`timeline.png`), 46 detected events with frame-by-frame strips (`events/E##-*/strip.jpg`), contact sheets, and the frame stepper `viewer.html` (← / → steps one frame).
- **Precision:** timings marked **(measured)** come from frame strips with true timestamps. At ≈24.5 fps, one frame is ≈41 ms (recorder gaps up to 200 ms), so durations are ±1–2 frames. Event IDs (E##) refer to the strips.

---

## The big idea: one motion motif, used everywhere

Bucks Sauce builds its whole motion language from **circles that expand in flavour colours**:

- the loader's concentric rings (E01)
- the colour disc behind every bottle (E04)
- the ring burst when a bottle is added to the 3-pack (E17)
- the arc carousel and the arched headings (E19)

That consistency is why the site feels *designed* rather than *animated*.

**For Yunch Bite:** makhana and popcorn are literally **popped**. "Pop" (a quick burst with a little overshoot) and "crunch" (snappy, short timings) can be our equivalent motif.

## Smooth scroll (measured)

- 16 scroll bursts. The median peak velocity is ≈2,400 px/s and the fastest reaches 8,200 px/s.
- **Scroll decay τ is about 0.158 s** (median of 12 fits). That's exactly what **Lenis at its default `lerp: 0.1`** produces at 60 fps: τ = −1/(60·ln 0.9) ≈ 0.158 s. So Bucks almost certainly runs Lenis on defaults.
- **Takeaway:** a light lerp (0.1) feels smooth but responsive. Nothing heavier is needed.

---

## A · First 5 seconds: loader (E01–E02, measured)

| t (+ms from start) | What happens |
|---|---|
| 6.47 s (−33) | A tiny gold dot appears in the centre of black |
| +0 → +570 | **Concentric ripple:** a gold disc expands from the centre. An orange disc follows ≈130–170 ms behind it, then crimson, then black. Each layer **accelerates** as it grows (ease-in, expo-like). Gold fills the screen at ≈+570 ms, orange at ≈+800 ms, crimson at ≈+1,070 ms. |
| +800 → +1,070 | Black takes over the centre. The logo **scales up** from a dot inside the black circle. |
| +1,170 → +1,700 | **Four ingredient cut-outs** (pineapple, habanero, cherry, peach) fly out from behind the logo to fixed positions, staggered ≈70–100 ms, easing out (decelerating) |
| 8.4 → 9.6 s | Hold, about 1.3 s. Probably the page loading or a minimum display time. |
| 9.64 s (+0 of E02) | **Exit:** the logo and fruit **zoom towards the camera** (scale ×3+, ease-in, ≈330 ms) |
| +430 → +1,340 | The hero headline types in **letter by letter**: ≈22 ms between letters, and each letter fades in over ≈150 ms (3–4 letters fading at once). The nav appears at +430 ms. |
| +1,030 → +1,300 | Bottle and colour disc rise from the bottom |

**Total ≈ 4.8 s** from dot to finished hero, including the 1.3 s hold. **Too long for repeat visits**, and there's no skip.

## B · Story structure (homepage)

| # | Section | Job it does | ≈Length |
|---|---|---|---|
| 1 | Announcement bar "BUILD YOUR OWN 3-PACK & SAVE $4 BUCKS" (closable) + full nav | Offer and wayfinding | — |
| 2 | Hero: "THE BBQ SAUCE THAT MAKES OTHER SAUCES INSECURE" (outline + solid type) | Attitude first | 1 vh |
| 3 | **Flavour carousel:** bottle on a colour disc + fruit **character with a face**, ← → arrows, "PRODUCT NO.0X", "SHOP NOW" | Meet each flavour | 1 vh |
| 4 | Kinetic manifesto: "Our BBQ sauces use real, natural stuff like it's the 1800s…" | Brand voice | 0.6 vh |
| 5 | **Claim cards:** NO CORN SYRUP → NO SEED OILS → NO ADDITIVES → GLUTEN FREE, inside a field of depth-blurred ingredient cut-outs | Health proof | ≈2 vh, pinned |
| 6 | "CHOOSE YOUR WEAPON" giant outline header + 4 colour-coded product cards | Product grid | 1.2 vh |
| 7 | **Build your 3-pack:** bottle silhouettes in a ring, "+" per flavour | Upsell | 1 vh |
| 8 | "WHY BUCKS SAUCE" arched heading + manifesto line | Transition into the story | 0.6 vh |
| 9 | **Arc carousel:** 01 SMALL BATCHES · 02 REAL INGREDIENTS · 03 OH, THIS? (award), with a garlic character on a dotted arc | Reasons to believe | ≈2 vh, pinned |
| 10 | "REVIEWS" giant outline header + **UGC video wall** (creator handles as pills) | Social proof | 1 vh |
| 11 | Footer: logo, links, "JOIN THE BUCKS CLUB" newsletter, social tiles | Retention | 0.5 vh |

**Product page:** a split hero (pack + flying pineapple cut-outs on the left with a gallery on arrows; the title typing in on the right) → a **flavour character in sunglasses** → *Taste profile* and *Pairs with* cards → claim icons → size, quantity, add to cart → 3-pack banner → "THE SAUCE THAT DIDN'T ESCAPE THE LAB" + founder video → "STARTS WITH REAL INGREDIENTS / BUILT ON FIRE" (arched) with *Ingredients / Nutrition* tabs → fanned data cards over a pineapple photo strip ("PURE AF. SERIOUSLY") → process clips → "No fillers…" tick list → "CHOOSE" + all products → footer.

## C · Scroll choreography

| ID | Pattern | Where | Measured detail |
|---|---|---|---|
| R1-C1 | **Header morph:** the full nav collapses into floating pills (GET SAUCE + cart + menu), and the logo shrinks to an antler mark | 00:12 | The main CTA stays one click away at all times |
| R1-C2 | **Letter-type headline:** letters fade in one after another, slightly overlapping | 00:10, 00:45, 00:49, 00:51 | **≈22–35 ms between letters, ≈150 ms fade per letter.** A 25-letter title takes ≈0.9 s, a 3-word title ≈1.2 s. Used on every big headline, so it's the signature. |
| R1-C4 | **Kinetic manifesto (E07, scroll-scrubbed):** each word tumbles up from below, rotated, and settles into the sentence as you scroll | 18.0–19.0 s | Each word settles over about 200–300 ms of scroll. **Hard to read mid-motion.** |
| R1-C5 | **Stacking claim cards (E07, pinned, 3.4 s of scroll):** a card rises from the bottom tilted ≈−5° and straightens; when the next card arrives, the previous card's **body collapses and only its label pill stays**, stacked like index-card tabs (inactive tabs dimmed, active one bright) | 18.6–21.4 s | Cut-outs at the edges move at different depths; the **nearest ones are blurred** (fake depth of field) |
| R1-C6 | **Giant outline headers** ("WEAPON", "REVIEWS") | 00:23, 00:36 | Strong section breaks for almost no performance cost |
| R1-C7 | **Arc carousel (E19, pinned, 2.7 s of scroll):** numbered cards enter from the right **tilted along a large circle**, straighten at the centre, and tilt away to the left; the character stays near the centre on a dotted arc | 33.2–35.9 s | Each card takes ≈1.1 s of scroll to cross the centre at the recorded speed |
| R1-C8 | **Arched heading** ("WHY BUCKS SAUCE", "BUILT ON FIRE") | 00:32, 00:51 | Text on a curve, sliding up as you scroll |
| R1-C9 | **Fanned data cards:** ingredients and nutrition cards tilted and overlapping over a photo strip | 00:52 | Makes dry data feel physical |

## D · Micro-interactions (measured)

| ID | Pattern | Measured detail |
|---|---|---|
| R1-D0 | **Flavour switch (E04, arrow click):** 1) the character disappears; 2) the current bottle swings off to the left and shrinks, while the next bottle swings in from the right, small and tilted, then grows to the centre (a **cover-flow on an arc**); 3) the **disc changes colour** (peach → crimson); 4) the "PRODUCT NO.0X" counter rolls and the flavour name **slides up**, old over new; 5) the new character **pops** out from behind the bottle with overshoot | Bottle swap ≈570 ms (+1,435 → +2,002) · character pop ≈370 ms (+2,002 → +2,370) · **≈1 s per switch** · arrow hover: the cream disc turns into an outline ring |
| R1-D1 | **Product card hover (E24):** antlers **spring up** behind the bottle; an "ADD TO CART $12" bar sits at the card's foot; the bottle tilts slightly | Antlers grow over ≈170–230 ms (+0 → +167 → +230), ease-out with slight overshoot |
| R1-D2 | **3-pack add (E17):** the button label changes at once ("ADD 3 MORE" → "ADD 2 MORE"); a **thick ring in the flavour's colour bursts** out from the centre (≈100 ms, fast ease-out), then **thins to a hairline and fades** (≈350 ms); the bottle drops into its slot at ≈+300 ms | **≈450 ms per add**, the same circle motif as the loader |
| R1-D3 | Round cream arrow buttons; pill labels with dot bullets "• NO CORN SYRUP •" | — |

## E · Page transition (E25, measured)

Click on a product card at 44.51 s:

1. The page **fades to near-black in ≈100–130 ms**.
2. It **holds black ≈430 ms** while the next page loads.
3. The product page **appears in one frame**, with no fade-in, and its title already typing (R1-C2).
4. **Total ≈0.7 s.**

The product page entrance (E26) is choreographed:

| Time | What happens |
|---|---|
| +0 → +500 ms | title types in |
| +500 ms | subtitle fades in |
| +570 ms | nav fades in |
| +700 → +830 ms | Taste profile / Pairs with cards **rise and straighten from a tilt**, ≈70 ms apart |
| +1,030 → +1,240 ms | the **pineapple character pops** out from behind the title (≈200 ms, overshoot), then idles with a slight wobble |

**Whole entrance ≈1.5 s.**

## F · Visual system

- **Colour:** a warm near-black base, cream type, and **one saturated colour per flavour** (golden yellow, chilli orange, crimson, peach) on cards, discs and ring bursts.
- **Type:** a condensed display sans in caps that mixes **outline and solid** within a headline; a clean sans for body; small caps for labels.
- **Shapes:** pills, round buttons, circles, rings, arcs.
- **Imagery:** cut-out bottles + cut-out ingredients, the **cut-out style chosen for Yunch Bite**. Plus lifestyle and process photography and UGC video.

## G · Product presentation

- Every flavour has **its own colour and its own character**: a cartoon version of its hero ingredient with a face, sometimes in sunglasses.
- Product page modules: Taste profile · Pairs with · claim icons · ingredients/nutrition tabs · founder story video · process clips · "no fillers" list.

## H · Personality devices

- Irreverent copy: "makes other sauces insecure", "PURE AF. SERIOUSLY", "Doug hovering like it owes him money".
- Two mascot layers: the brand mascot (deer chef) in the logo, and an ingredient character per flavour in the product moments.

## I · Mobile

Skipped for now (client decision, 2026-11-04). It comes back before wireframes are finalised.

## J · Performance and accessibility

- Heavy: the homepage is ≈74,000 px tall on desktop, with 26 `<video>` elements, 6 canvases, and 3 analytics/session-recording scripts.
- Thin outline type on near-black only works at very large sizes.
- The kinetic manifesto is hard to read while it moves.
- A 4.8 s loader with no skip.
- The page transition is a plain fade to black while the next page loads, so the perceived speed depends on the network.

---

## Verdicts for Yunch Bite

| ID | Verdict | How it maps to Yunch Bite |
|---|---|---|
| Motif | **Adopt the principle** | Use one recurring shape for all motion. For Yunch Bite: **the popped makhana (round, puffy, bursting)**, for pops, ring bursts and discs in flavour colours |
| R1-A loader | **Adapt** | A *"makhana pop"* concentric ripple in brand red, yellow and cream, then Makhana Buddy, then cut-outs flying out. **First visit only, ≤1.5 s, skippable.** No dead hold: show the page as soon as it's ready. |
| Lenis | **Adopt** | Smooth scroll with `lerp ≈ 0.1` (measured τ 0.158 s), switched off with reduced motion |
| R1-C1 | **Adopt** | Compact pill header: logo mark + one main CTA + menu |
| R1-C2 | **Adopt + tune** | Letter-type headlines as the signature, ≈25 ms between letters and ≈150 ms per letter, with a slight **crunch** (small y-drop + quick settle) |
| R1-D0 | **Adopt** | **Flavour switcher** for makhana: pack cut-out on a colour disc in the pack's colour, a character pop, an odometer flavour counter, ≈1 s per switch |
| R1-C4 | **Avoid / Adapt** | Only for one short Hinglish line ("Ye Hai Yunchy Jindgi"), never for body copy |
| R1-C5 | **Adopt** | **Stacking claim cards** that collapse into tabs: Zero palm oil · Roasted in olive oil · No preservatives · High protein & fibre · Gluten-free, with depth-blurred makhana and spice cut-outs |
| R1-C6 | **Adopt** | Giant outline section headers |
| R1-C7 | **Adapt** | **Process arc:** Sourced from Bihar ponds → Slow-roasted in olive oil → Seasoned → Packed fresh, with Makhana Buddy on the dotted arc |
| R1-C8 / C9 | **Adopt** | Arched headings; ingredients and nutrition as fanned cards on product pages |
| R1-D1 | **Adapt** | Card hover: a flavour-colour ring bursts behind the pack and Makhana Buddy peeks out (≈200 ms, overshoot); on touch, on tap |
| R1-D2 | **Adapt the effect, not the feature** | No cart, but the **ring burst** (≈450 ms) becomes our "pop" feedback, e.g. when a flavour is picked |
| R1-E | **Improve** | Not a plain fade to black: a brand-colour curtain or iris, ≤600 ms, with the next page prefetched so it never waits on the network |
| R1 product entrance | **Adopt** | Choreographed entrance (title → subtitle → info cards → character pop) in ≈1.5 s |
| R1 UGC wall | **Adapt** | Instagram reels from real customers. Depends on real content. |
