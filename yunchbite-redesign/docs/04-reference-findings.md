# Reference findings: the Yunch Bite motion language

This is the synthesis of the three reference studies. Each pattern links back to its evidence:

| ID | Reference | Analysis | What it was studied from |
|---|---|---|---|
| **R1** | [Bucks Sauce](../research/references/buckssauce/analysis.md) | `research/references/buckssauce/analysis.md` | The client's recording, measured frame by frame |
| **R2** | [Agrume Farm](../research/references/agrumeafarm/analysis.md) | `research/references/agrumeafarm/analysis.md` | Automated capture + scripted journeys |
| **R3** | [YAAS Energy](../research/references/yaas-energy/analysis.md) | `research/references/yaas-energy/analysis.md` | Automated capture + scripted journeys |

Desktop only for now (client decision). Every pattern below gets a mobile and reduced-motion rule before wireframes are final.

---

## 1. What the three references teach together

| | R1 Bucks Sauce | R2 Agrume Farm | R3 YAAS |
|---|---|---|---|
| **Tempo** | Fast, punchy | Slow, editorial | Bold, poppy |
| **Easing** | Snappy, overshoot on pops | **One curve everywhere**: `cubic-bezier(0.645,0.045,0.355,1)` | Simple: `0.2s ease` on UI |
| **Motif** | **Circles bursting in flavour colours** | Paper-cut fruit, rotating ring text | Arches, curved galleries |
| **Character** | An ingredient character per flavour (faces) | Farmer in the logo | **A character on every can** |
| **Colour** | One colour per flavour on a dark base | Cream + orange + maroon | Gradient mesh + one colour per flavour |
| **Product display** | Disc + bottle + character; card grid | Floating jars; **jar flight** on the product page | **Line-up with focus**; background follows the flavour |
| **Data display** | Fanned cards over a photo strip | Quiet, centred, allergens in bold | Numbered benefit cards |
| **Loader** | 4.8 s, ripple rings | ≈10 s, falling fruit pile + counter | ≈2 s, "LOADING ENERGY" |
| **Smooth scroll** | Lenis, `lerp 0.1` (measured τ 0.158 s) | Lenis | Lenis |

**Common ground:**
1. Lenis smooth scroll.
2. Cut-out products with cut-out ingredients.
3. **One colour per flavour.**
4. A character system.
5. Big confident display type.
6. Pill-shaped UI.

**Where they differ:** tempo. Yunch Bite needs **both**: *crunchy* moments that are quick and poppy, and *slow-roasted* moments that are calm and readable. So we define two speeds and use each deliberately.

## 2. Motion principles

1. **Pop.** Makhana and popcorn are *popped*, so **things arrive by popping**: a quick scale-up with a small overshoot, sometimes with a ring burst in the flavour colour. This is our version of Bucks' circle motif (R1), and it's the one shape everything returns to.
2. **Crunch.** UI feedback is short and crisp (≤250 ms). Headlines type in letter by letter. Nothing that responds to the user floats or lags.
3. **Slow-roasted.** Story, origin, ingredients and nutrition move calmly (≈0.9 s ease-in-out, as on Agrume, R2). Reading always comes first; text never moves while it's being read.
4. **Flavour is colour.** Every flavour owns its pack colour. Choosing a flavour **recolours the stage** (R3 background crossfade + R1 disc).
5. **Buddy is mischief, not wallpaper.** Makhana Buddy appears at a few chosen moments: the loader, the flavour switch, the process path, empty and error states, the footer. He peeks, pops and walks; he never sits on every section.

## 3. Motion tokens (draft)

| Token | Value | Used for | Evidence |
|---|---|---|---|
| `dur.micro` | 120 ms | colour, opacity, underline | R3 0.2 s, R2 0.25–0.3 s |
| `dur.quick` | 220 ms | hover states, pills, buttons | R3, R2 |
| `dur.pop` | 380 ms | character pop, ring burst, card hover pop | R1 character pop ≈370 ms, ring ≈450 ms |
| `dur.move` | 600 ms | menu label roll, panel drop, page curtain | R2 0.9 s, R2 menu ≈0.5–0.6 s, made snappier |
| `dur.roast` | 900 ms | editorial reveals, pack flight segments, logo track | R2 0.78–0.9 s |
| `dur.switch` | ≈1,000 ms | full flavour-switch choreography | R1 ≈1 s, R3 ≈1 s |
| `ease.roast` | `cubic-bezier(0.645, 0.045, 0.355, 1)` | anything structural that moves | R2 (exact) |
| `ease.crunch` | `cubic-bezier(0.34, 1.56, 0.64, 1)` (back-out) | pops, characters, card lifts | R1 overshoot on pops |
| `ease.glide` | `cubic-bezier(0.22, 1, 0.36, 1)` (out-quint) | things flying in and settling | R1 ingredient fly-out |
| `ease.exit` | `cubic-bezier(0.7, 0, 0.84, 0)` (in-expo) | exits, zoom-throughs, curtains leaving | R1 loader zoom exit |
| `stagger.char` | 22 ms (each letter fades over 150 ms) | letter-type headlines | R1 measured 22–35 ms |
| `stagger.item` | 60–70 ms | cards, list items, nav items | R1 info cards ≈70 ms |
| `scroll.lerp` | 0.1 (Lenis) | smooth scroll on desktop | R1 measured τ 0.158 s |
| `reveal.start` | element top at 80% of viewport | scroll-triggered reveals | common practice |

**Budgets:**
- Loader ≤1.5 s, first visit only, skippable.
- At most **2 pinned sections per page**, each ≤2.5 viewports (R3's 9.7 vh gallery is the counter-example).
- No real-time 3D (cut-out decision).

## 4. Pattern library

Each pattern names where it comes from, its verdict, and what it needs.

| # | Pattern | From | Verdict | What Yunch Bite does | Needs |
|---|---|---|---|---|---|
| P01 | **Makhana pop loader** | R1-A, R2 loader, R3 loader voice | Adapt | Makhana and spice cut-outs **pop up and pile**; brand-voice line ("Loading crunch…"); a **brand-red curtain** wipes up into the hero. ≤1.5 s, first visit, skippable. | Paper-cut shape set (P17) |
| P02 | **Pill header + menu** | R1-C1, R2-D1, R2 menu | Adopt | Logo mark + one main CTA pill + MENU pill with a rolling MENU↔CLOSE label; full-screen **brand-red** menu with giant stepped items dropping from the top | — |
| P03 | **Letter-type headlines** | R1-C2, R2-C4 | Adopt | Chars fade/drop in at 22 ms stagger with a tiny "crunch" settle | Brand display font |
| P04 | **Flavour stage** | R3-D1 + R1-D0 | Adopt | Pack cut-outs in an endless row, the centre one scaled up on a **colour disc**; the **background crossfades to the pack colour**; Buddy or the flavour's ingredient character **pops** from behind the pack; flavour name and an odometer number roll. ≈1 s per switch. | Pack cut-outs, character per flavour |
| P05 | **Claim stack** | R1-C5 (alt. R3-C4) | Adopt | The 5 claims as cards stacking into tabs, with depth-blurred makhana and spice cut-outs around them | Ingredient cut-outs |
| P06 | **Process path** | R1-C7 | Adapt | Bihar ponds → slow-roasted in olive oil → seasoned → packed, as cards along an arc, with Buddy walking the dotted path | Buddy walking poses |
| P07 | **Arch reveal** | R3-C2 | Adopt | The next section rises with a rounded, makhana-like top edge | — |
| P08 | **Occasions gallery** | R3-C3 | Adapt | Tiffin · 4 pm office · movie night · chai · gym on a short curved strip; the centre photo zooms. ≤2.5 vh. | Lifestyle photos (some exist) |
| P09 | **Pack flight** | R2-C3 | Adopt | Product hero: the pack rises from below, crosses the flavour title on scroll, lands in the nutrition section | Pack cut-outs |
| P10 | **Data cards** | R1-C9, R2 product data | Adopt | Ingredients and nutrition as fanned cards; allergens in bold; a facts row (sizes · shelf life · storage) | — (data exists) |
| P11 | **Card pop hover** | R1-D1, R1-D2 | Adapt | A flavour-colour ring bursts behind the pack and Buddy peeks out (`dur.pop`, `ease.crunch`); on touch, on tap | Buddy peek pose |
| P12 | **Cursor label** | R2-D5 | Adopt | A trailing "Taste me →" pill over packs (desktop only) | — |
| P13 | **Giant outline + arched headings** | R1-C6, R1-C8 | Adopt | Section breaks: "CHOOSE YOUR CRUNCH", "WHY YUNCH" | — |
| P14 | **Pill FAQ** | R3 FAQ | Adopt | "Sawaal? Hum batate hain." 2-column pill accordion | FAQ copy |
| P15 | **Photo stack** | R3-C6 | Adopt | Factory and quality photos collapse into a pile | More factory photos |
| P16 | **Page transition** | R1-E (improved), R2 panel | Adapt | A brand-red curtain with a makhana pop (`dur.move`), next page **prefetched**, so it never waits on the network | — |
| P17 | **Paper-cut shape set** | R2 | Adopt | Flat SVG cut-outs of makhana, chilli, pudina, pepper, salt, cheese, berries, popcorn, almond, cashew in pack colours | **Asset request**: to draw |
| P18 | **Wordmark footer + partner pill** | R2 footer, R3 contact | Adopt | A giant "YUNCH BITE" wordmark band, links, social, and a "Partner with us / distributor" pill | — |
| P19 | **Pack carousel (category hero)** | R2-C1 | Adapt | Wheel or drag through all packs of a category, with a rotating ring text "YUNCHY · CRUNCHY · HEALTHY BITE" | Pack cut-outs |
| P20 | **Inset → full-bleed opener** | R2-C5 | Adopt | Page opener for content pages: a giant title, then an inset photo grows to full width as you scroll | One strong photo per page |
| P21 | **Statement with drifting cut-outs** | R2-C6 | Adopt | A centred brand line with paper-cut makhana and spice shapes drifting in parallax around it | P17 shapes |
| P22 | **Founder / people moment** | R2-C7 | Adopt | A giant word ("VISION" / "NITIN") over a full-bleed portrait | Founder photo |

## 5. Rules that apply everywhere

- **SEO-safe:** every word and image is in the server-rendered HTML. Animations only move content that's already there.
- **Reduced motion:**
  - Lenis is off; pops become 150 ms fades.
  - Pinned sections become simple stacked layouts.
  - The loader is skipped; carousels work with buttons only.
- **Keyboard and screen readers:**
  - Every carousel and stage is operable with buttons and has real links.
  - Focus states are visible.
  - Nothing is reachable only by hovering.
- **Performance (mobile p75 targets):** LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1.
  - Motion libraries (GSAP + ScrollTrigger + SplitText + Lenis) are the only animation JS.
  - No WebGL.
  - Pack cut-outs are AVIF/WebP and sized per viewport.
  - No autoplay video above the fold.
- **Mobile (later):** hover becomes tap; the cursor label is off; pinned sections get shorter; the flavour stage becomes a swipe.

## 6. Open points for the client

1. **Character per flavour:** do we extend Makhana Buddy with a variant per flavour (chilli, mint leaf, pepper, cheese…), or use ingredient characters with faces, as Bucks and YAAS do? This shapes the asset request.
2. **Display font:** the packaging font (if different from Montserrat / Roboto Condensed) should become the headline face. Which font is on the pack?
