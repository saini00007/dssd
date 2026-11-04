# Yunch Bite: theoretical site overview (v1, for review)

> **Status:** draft for client review, phase 2 of the plan. It is text only and follows the agreed format in [`03-site-overview-format.md`](03-site-overview-format.md). Every section names its **component**, its **motion**, its **reference evidence** (pattern IDs from [`04-reference-findings.md`](04-reference-findings.md)) and the **assets** it needs.
>
> **How to review:** approve, change or drop any section by its ID (e.g. "HOME-07: drop", "PDP-03: make it simpler"). After approval we draw wireframes.

**Fixed inputs:**
- Same sitemap (38 pages), built clean.
- No shop.
- Match the existing brand and packaging.
- **Cut-out style** (no 3D).
- Desktop-first for this review (mobile rules are noted, and designed before wireframes are final).
- Brand facts are taken as they appear on the current site.

**Motion vocabulary used below** (from the findings):

| Token | Meaning |
|---|---|
| **pop** | quick scale-up with a small overshoot (`dur.pop` 380 ms, `ease.crunch`) |
| **roast** | calm move or reveal (`dur.roast` 900 ms, `ease.roast`) |
| **type-in** | letter-by-letter headline (22 ms stagger) |
| **ring burst** | a ring in the flavour colour expanding and thinning (≈450 ms) |
| **arch reveal** | the next section rises with a rounded top edge |

---

## Part 1: Global experience

### G-01 · First-visit loader: "Makhana pop" · P01
- **Purpose:** a memorable first impression that says *popped, crunchy, playful* in under 1.5 s.
- **When:** **homepage, first visit only** (remembered per session). Never on deep links: product and article visitors from search get content immediately.
- **Sequence:**
  1. A cream screen.
  2. Paper-cut makhana kernels and spice shapes **pop** up from the bottom and pile up.
  3. A brand-voice line types in: *"Loading crunch…"* (alt: *"Crunch aa raha hai…"*).
  4. A **brand-red curtain** wipes up and off into the hero. Makhana Buddy pops out at the end.
- **Rules:** ≤1.5 s total, skipped on any click or key press, no fake waiting. Reduced motion: no loader.
- **Assets:** paper-cut shape set (P17). Buddy "pop-out" pose.

### G-02 · Header · P02, R1-C1
- **At the top:**
  - left: the Yunch Bite ribbon logo
  - right: pill links **Products · Bestsellers · About**, plus a solid CTA pill and a **MENU** pill
- **CTA pill:** "Partner with us" (→ contact, partnership form). If the client provides marketplace links, it becomes **"Where to buy"** (open question Q1).
- **On scroll:** the logo shrinks to the **makhana-"B" mark** and the links fold away; only the mark, the CTA pill and the MENU pill float top-right (R1-C1). They come back fully when you scroll up.
- **Motion:** links fade and slide out (`dur.quick`); the MENU ↔ CLOSE label **rolls** vertically (R2-D1, ≈600 ms, `ease.roast`).

### G-03 · Full-screen menu · P02, R2 menu
- **Look:**
  - a **brand-red** panel drops from the top (`dur.move`, `ease.roast`)
  - the 9 main pages as **giant cream items, stepped further right on each line**, with a dot marking the current page (R2)
  - a row of 3 category tiles with pack cut-outs (Makhana · Popcorn · Dry Fruits)
  - small links at the bottom: Contact · Instagram · Facebook · LinkedIn · wecare@yunchbite.com
  - **Makhana Buddy waves** from the bottom corner
- **Motion:** items type in with a 60 ms stagger; hovering an item slides it right and shows its dot.
- **Reduced motion:** the panel simply appears.

### G-04 · Footer (new: the current site has none) · P18, P07
- Arrives with an **arch reveal** (P07).
- **Look:**
  - a band with a **giant "YUNCH BITE" wordmark** in the ribbon red
  - Buddy sits on the wordmark and peeks over it on hover
- **Columns:**
  - Products: 3 categories + Bestsellers
  - Company: About · Why Yunch Bite · Benefits · Ingredients & Quality
  - Read: Blogs & Reviews
  - Contact: email · phone · address
  - Social
- **Partner pill:** "Stock Yunch Bite in your store →"
- **Sign-off:** "Great taste. Better choices. A healthier way to snack." plus FSSAI and legal lines.

### G-05 · Page transitions · P16
- A **brand-red curtain** sweeps up with a single **makhana pop** in the centre (≈600 ms in total).
- The next page is **prefetched** when its link is hovered or enters the viewport, so the curtain never waits on the network.
- The new page's headline **types in** as the curtain leaves.
- **Reduced motion:** an instant swap.

### G-06 · Pointer (desktop only) · P12
- The native cursor stays.
- Over packs, a trailing **"Taste me →"** label pill follows it with an elastic lag (R2-D5).
- CTA pills are slightly **magnetic**.
- **Touch:** none of this; taps get press states.

### G-07 · Scroll
- **Desktop:** Lenis smooth scroll, `lerp 0.1` (the setting measured on Bucks Sauce).
- **Touch devices:** native scroll.
- **Reduced motion:** off.
- **Reveals** start when an element's top reaches 80% of the viewport.
- **Budget:** at most 2 pinned sections per page, each ≤2.5 viewports.

### G-08 · Makhana Buddy (where he appears)

| Where | What he does | Pose needed |
|---|---|---|
| Loader end | Pops out of the pile | pop-out |
| Menu | Waves | wave |
| Flavour stage | Peeks from behind each pack, holding that flavour's ingredient | peek (+ prop per flavour) |
| Process path | Walks the dotted arc | walk cycle (3–4 frames) or a single walking pose |
| Product card hover | Peeks over the card edge | peek-over |
| Footer | Sits on the wordmark | sitting (exists: `mascot-photo-hq.png`, needs a cut-out) |
| Contact | Points at the form | pointing (exists: `contact-mascot-hero.png`, needs high resolution) |
| Form success | Thumbs up with a ring burst | thumbs-up |
| 404 page | Lost, holding an empty pouch | confused |

### G-09 · Visual system (matches the packaging)

| Element | Rule |
|---|---|
| **Colour** | Brand red `#D61610`, deep maroon `#8B1313`, yellow `#FFD200`, cream `#FFFDF5`. **Flavour colours** come from the real packs (the product photos). Cream is the reading background; red and maroon are for brand moments; flavour colours are for product moments. |
| **Type** | The packaging display font for headlines (to confirm, Q3; the current site uses Montserrat 800 and Roboto Condensed 700). Giant **outline** variants for section breaks (P13). A clean sans for body copy. |
| **Imagery** | **Cut-out packs + paper-cut ingredient shapes** (P17); real photography only for people, places and occasions. |
| **Shapes** | Pills, circles (makhana), arches, a dotted path. |

### G-10 · Global rules
- **SEO-safe:** all copy and images are in the server-rendered HTML.
- **Reduced motion everywhere.**
- **Keyboard and screen readers:**
  - every carousel and stage has buttons and real links
  - visible focus states
  - nothing is reachable only by hovering
- **Performance:**
  - no WebGL
  - AVIF/WebP packs
  - no autoplay video above the fold
  - mobile targets LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1

---

## Part 2: Page by page

Content sources are in [`current-content-inventory.md`](current-content-inventory.md). "Existing" means the copy or asset is already on the current site. Asset files are in `research/current-site/assets/`.

---

### Home `/`

> **Page goal:** in 30 seconds, *"makhana-led snacks that taste great, made better: roasted in olive oil, zero palm oil, and a brand with a sense of humour."* The business needs flavour discovery and partner leads.
> **Primary action:** explore a flavour (→ product page). **Secondary:** partner with us.

```
HOME-01 · Hero: "Yunchy. Crunchy. Healthy Bite."
Purpose     Attitude and product in one screen
Content     Headline: "YUNCHY. CRUNCHY. HEALTHY BITE." (existing tagline, typo fixed)
            Line: "Slow-roasted in olive oil. Zero palm oil. All crunch."
            CTAs: "Find your flavour" (→ HOME-02) · "Partner with us"
Component   <HeroWordmarkPacks>, page-specific
Layout      Desktop: a giant headline across the middle; 4 makhana pack cut-outs tilted
            around it (YAAS-style); floating makhana kernels; Buddy peeks from behind a pack
Motion      After the loader (or immediately on repeat visits): the headline types in; packs
            drop in from the top and settle with a crunch overshoot, staggered 70 ms; kernels drift
            Scroll: packs drift apart, the headline ghosts to 15%, kernels fall toward HOME-02
            Reduced motion: static composition
Reference   R3 hero + R3-C1 · R1-C2 type-in · P01 handover
Assets      Existing: makhana-*.jpg are NOT cut-outs, so new pack cut-outs are needed · Buddy peek pose
```

```
HOME-02 · Flavour stage: "7 FLAVOURS. 1 CRUNCH."
Purpose     Meet every makhana flavour; colour = flavour
Content     7 flavours: Peri-Peri Paradise · Chatpata Masala · Himalayan Salt & Pepper · Pudina
            Masala · Tangy Cheese & Herbs · Black Salt · Berry Berry Paradise, each with its
            existing one-line description · "View flavour →" (→ the zipper-pouch product page)
            Small links below: "Also: Popcorn · Dry Fruits"
Component   <FlavourStage>, shared (also used on Bestsellers)
Layout      Desktop: an endless row of zipper-pouch cut-outs; the centre pack ×1.4 on a colour
            disc; ◁ ▷ round buttons; flavour name + number ("NO. 03") below
Motion      Switch (≈1 s): row slides one slot (roast); the stage background crossfades to the
            pack colour; disc recolours; the flavour's character / Buddy variant pops from behind
            the pack (pop); name and number roll like an odometer. Keys ← →, swipe (later).
            Packs show the cursor label "Taste me →". Reduced motion: crossfade only
Reference   P04 = R3-D1 (line-up + background crossfade) + R1-D0 (disc + character pop + odometer)
Assets      7 zipper-pouch cut-outs · a character/Buddy variant per flavour (Q2) · pack colour HEX
            per flavour (taken from the product photos)
```

```
HOME-03 · "Aam Jindgi vs Yunchy Jindgi"
Purpose     The brand's humour; turns an existing campaign line into an interaction
Content     Existing banner idea: "Ye Hai Aam Jindgi" → "Ye Hai Yunchy Jindgi"
Component   <JindgiWipe>, page-specific
Layout      A full-width band. Left: a grey, boring scene (a plain chips packet, a sad desk).
            Scrolling wipes it into full colour with makhana popping
Motion      Scroll-scrubbed colour wipe (one viewport, NOT pinned); the words swap with a pop
            Reduced motion: the two halves shown side by side
Reference   R1-C4 kinetic line (adapted: short, readable)
Assets      The existing banner-slide-3 shows the concept; flat illustrations for the two states
            (paper-cut style, P17)
```

```
HOME-04 · Claim stack: "Why it's better"
Purpose     The health proof points, quickly and memorably
Content     5 cards (existing claims): Roasted in olive oil, never fried · Zero palm oil ·
            No preservatives · High in protein & fibre · Gluten-free & 100% vegetarian
            Each has a one-line explanation from /benefits and an icon
Component   <ClaimStack>, shared (Benefits page too)
Layout      Desktop: cards stack in the centre, surrounded by makhana, olive and spice cut-outs
            at 3 depths (the nearest are blurred)
Motion      Pinned ≤2 vh: each card rises tilted −4° and straightens (roast); the previous one
            collapses to a tab; cut-outs parallax by depth. Reduced motion: a plain list of 5 cards
Reference   P05 = R1-C5 (stacking cards to tabs, depth blur)
Assets      Paper-cut / photo cut-outs: makhana, olive, chilli, pudina, salt (P17)
```

```
HOME-05 · "CHOOSE YOUR CRUNCH": categories
Purpose     Route to the three ranges
Content     Makhana (14 products) · Popcorn (3) · Dry Fruits (4), with existing H1 lines
            ("Crunchy Outside, Wholesome Inside", "Simple Ingredients, Extra Happiness",
            "Nourishment for a Healthier Tomorrow") → /categories/*
Component   <OutlineHeading> + <CategoryCard>, shared
Layout      A giant outline heading across the width; 3 tall cards in category colours with a pack
            cluster in each
Motion      The heading's solid letters type in over the outline; card hover = ring burst behind
            the packs + Buddy peeks over the edge (P11); the cursor label shows
Reference   R1-C6 (giant outline) · R1-D1 + R1-D2 (hover pop, ring burst)
Assets      Pack cut-outs per category
```

```
HOME-06 · "From pond to pack": process path
Purpose     The quality story in 4 steps
Content     01 Hand-picked makhana from the ponds of Bihar (existing raw-makhana copy) →
            02 Slow-roasted in olive oil, never fried → 03 Seasoned with real spices →
            04 Packed fresh, resealable
Component   <ProcessPath>, shared (About and Ingredients & Quality too)
Layout      A big dotted arc; numbered cards ride along it; Buddy walks the path
Motion      Pinned ≤2 vh, scroll-scrubbed: cards enter tilted from the right, straighten at the
            centre, exit left. Reduced motion: 4 cards in a row
Reference   P06 = R1-C7
Assets      Buddy walking pose(s) · 4 small step illustrations (pond, olive oil, spices, pouch)
```

```
HOME-07 · "Snack o'clock": occasions
Purpose     When to eat it: everyday relevance
Content     Tiffin break · 4 pm office slump · Movie night · Chai time · Travel (new copy, 1 line each)
Component   <OccasionStrip>, page-specific
Layout      A short curved strip of photos; the centre one larger with a caption
Motion      Drag or scroll moves the strip (not pinned); the centre photo scales up (roast)
Reference   P08 = R3-C3 (shortened)
Assets      Existing: banner-slide-2 (mother and daughter), blog-family-hq, promotional-collage
            (partial) · New: 5 occasion photos (people + pack)
```

```
HOME-08 · Bestsellers strip
Purpose     Social proof through popularity; quick access
Content     The 11 bestsellers (existing list) → /bestsellers
Component   <PackCard> row, shared
Motion      Cards pop in, staggered 60 ms; horizontal drag; card hover P11
Reference   R1 product grid
```

```
HOME-09 · "Meet Makhana Buddy"
Purpose     Make the mascot a character, not a sticker
Content     Existing: "Say 'Hello' to our fun-loving, energetic & mischievous little buddy who makes
            every snack moment more exciting…"
Component   <BuddyIntro>, page-specific
Layout      Buddy large on the yellow brand colour, with a speech bubble
Motion      Buddy's eyes follow the cursor (2D layers); clicking him triggers a random pose
            and line ("Ek aur?"); the idle bob is very subtle. Reduced motion: static
Reference   Principle 5 (mischief) · R3 characters
Assets      Buddy as layered PNGs (body + eyes/pupils separate) + 3–4 poses
```

```
HOME-10 · Know more (3 link cards)
Content     Existing: 01 Why prefer Yunch Bite? → /why-yunch-bite · 02 Benefits → /benefits ·
            03 Ingredients & quality → /ingredients-quality
Component   <NumberedLinkCard>, shared
Motion      Outline numbers fill on hover; cards lift (quick)
Reference   R3-C4 numbered cards
```

```
HOME-11 · Reviews / community (only with real content)
Content     Real customer reviews and/or Instagram posts of @yunchbite (#YunchyJindgi)
Component   <ReviewWall>, shared
Motion      Gentle marquee; pauses on hover/focus
Reference   R1 UGC wall
Assets      Real reviews with permission (Q5)
```

```
HOME-12 · Partner band
Purpose     The main business conversion (retail and distribution)
Content     Existing: "Interested in stocking or distributing Yunch Bite products?" + 3 retailer
            points from /why-yunch-bite (High-demand category · Attractive margins · Marketing
            support) → /contact (partner form)
Component   <PartnerBand>, shared (Products, Why, PDP: slim version)
Motion      Arch reveal; the CTA pill is magnetic
Reference   P07 · R3 contact pill
```

---

### Products hub `/products`

> **Page goal:** the whole range at a glance. **Primary action:** pick a category or a bestseller.

| ID | Section | Component | Motion | Reference | Content and assets |
|---|---|---|---|---|---|
| PRD-01 | Opener: "OUR PRODUCTS" + a podium of packs from all 3 ranges | `<PodiumOpener>` | Title types in; packs pop onto the podium, staggered | R1-C2, pop | Existing tagline "Wholesome, crunchy & made with premium ingredients for a better you." · pack cut-outs (the existing podium banner is a flat image) |
| PRD-02 | Claims marquee: Roasted in Olive Oil · No Preservatives · High in Protein & Fibre · 100% Vegetarian · Gluten Free | `<ClaimMarquee>` (shared) | Endless marquee, pauses on hover; reduced motion: static row | — | Existing (typo fixed) |
| PRD-03 | 3 category bands (Makhana · Popcorn · Dry Fruits), each in its category colour with a pack carousel preview + "Explore" | `<CategoryBand>` | Arch reveal per band; packs drift on scroll | R3-C2, R2-C1 | Existing category lines |
| PRD-04 | Bestsellers grid (11) | `<PackCard>` grid | Pop-in stagger; hover P11 | R1 grid | Existing list |
| PRD-05 | Partner band | `<PartnerBand>` | — | — | — |

---

### Category template `/categories/makhana` · `/popcorn` · `/dry-fruits`

> **Page goal:** browse a range by flavour and format. **Primary action:** open a product.

```
CAT-01 · Hero: pack carousel
Content     Existing H1 without "!!!": "Crunchy Outside, Wholesome Inside" / "Simple Ingredients,
            Extra Happiness" / "Nourishment for a Healthier Tomorrow" + existing sub-lines
            ("Light. Crunchy. Full of Goodness." …)
Component   <PackCarousel>, shared
Layout      Packs of the range floating in a horizontal carousel over a colour disc; a ring text
            "YUNCHY · CRUNCHY · HEALTHY BITE" around the disc
Motion      Wheel or drag moves the carousel horizontally (eased); the disc and ring text rotate with
            it; the centre pack is upright and biggest; packs float. ◁ ▷ buttons for keyboard
            and touch. Reduced motion: a static row
Reference   P19 = R2-C1
```

```
CAT-02 · Flavour grid with format filter
Content     ONE card per flavour (not one per format: today's page repeats 14 cards under every
            tab). Each card has format chips (Pillow 12 g · Zipper 50 g · Jar 80 g) that link to the
            existing format URLs. Filter pills: All · Pillow · Zipper · Jar · Raw (Makhana),
            Raw · Roasted (Dry Fruits); Popcorn has no filter (one format)
Component   <FlavourCard> + <FilterPills>, shared
Motion      Filtering re-flows cards (layout animation, roast); hover P11 + cursor label
Reference   R1-D1 · R2 availability table + pill tabs
```

| ID | Section | Component | Motion | Reference | Content |
|---|---|---|---|---|---|
| CAT-03 | Range statement: "All our makhana is roasted in olive oil, never fried." (existing per range) with drifting cut-outs | `<Statement>` | Cut-outs drift in parallax | P21 = R2-C6 | Existing lines from /ingredients-quality |
| CAT-04 | Range FAQ (3–5 questions) | `<PillFaq>` | Accordion (quick) | P14 = R3 FAQ | **New copy** (we draft, client approves) |
| CAT-05 | The other two ranges (2 cards) | `<CategoryCard>` | Hover P11 | — | — |

---

### Product template `/products/*` (21 pages, per format)

> **Page goal:** everything about one flavour in one format, with the data people actually check (ingredients, nutrition, allergens). **Primary action:** see the other formats or flavours. If links exist: where to buy (Q1).

```
PDP-01 · Hero with pack flight
Content     Flavour name as the title (e.g. "PERI-PERI PARADISE"), format + size chips, rating
            (existing), a "Bestseller" badge ONLY on the 11 real bestsellers, existing description
Component   <ProductHero>, shared
Layout      A cream stage tinted with the flavour colour; a giant flavour title; the pack rises from
            below the fold; the flavour character / Buddy variant beside it
Motion      Entrance (≈1.5 s, R1 product entrance): title types in → sub-line → chips →
            character pops. Scroll: the pack tilts and flies up ACROSS the title into PDP-05
            (pack flight). Reduced motion: static pack
Reference   P09 = R2-C3 · R1 product entrance (E26)
Assets      Pack cut-out of this SKU (front + ¾) · character/variant (Q2)
```

| ID | Section | Component | Motion | Reference | Content |
|---|---|---|---|---|---|
| PDP-02 | **Format switcher:** Pillow · Zipper · Jar chips linking to the sibling URLs; sizes per format | `<FormatSwitch>` | Chip pill slides (quick); page transition keeps the title in place | R1-D3 pills | Existing URLs and sizes |
| PDP-03 | **Taste profile** (spice / tang / salt meters) + **Pairs with** (chai, movie night, office…) | `<TasteProfile>` | Meters fill on enter (roast) | R1 taste profile | **New copy** per flavour (we draft) |
| PDP-04 | Claim icons row: olive oil · zero palm oil · no preservatives · gluten-free · veg mark | `<ClaimIcons>` (shared) | Icons pop, staggered | R1 claim icons | Existing claims |
| PDP-05 | **Ingredients & nutrition:** the pack lands here; tabs *Ingredients / Nutrition / Allergens*; fanned data cards; allergens in **bold**; nutrition per 100 g with bars; facts row: storage · shelf life · origin | `<DataCards>` | Cards fan out (roast); bars grow; numbers count up | P10 = R1-C9 + R2 product data | Existing (per product) |
| PDP-06 | **More to munch:** the same flavour in other formats + up to 6 other flavours (not 20) | `<PackCard>` row | Hover P11 | — | Existing |
| PDP-07 | Partner band, slim | `<PartnerBand>` | — | — | — |

**Structured data:** Product (name, image, description, brand, aggregateRating only if real), plus BreadcrumbList.

---

### Bestsellers `/bestsellers`

| ID | Section | Component | Motion | Reference | Content |
|---|---|---|---|---|---|
| BEST-01 | Opener: "BESTSELLERS" giant outline title + existing tagline; a pyramid of the 11 packs popping in | `<PodiumOpener>` | Packs pop, staggered; ring burst behind the top pack | R1-C6, pop | Replaces the heavy background video |
| BEST-02 | Flavour stage limited to the bestsellers | `<FlavourStage>` | As HOME-02 | P04 | Existing 11 |
| BEST-03 | Grid of the 11 with "Bestseller" ring stamps | `<PackCard>` | Hover P11 | — | Existing |
| BEST-04 | Reviews (real only) | `<ReviewWall>` | Marquee | R1 UGC | Q5 |

---

### About `/about`

> **Page goal:** a brand people trust: who, why, and the founder. **Primary action:** explore flavours, or partner.

| ID | Section | Component | Motion | Reference | Content and assets |
|---|---|---|---|---|---|
| ABOUT-01 | Opener: giant "ABOUT US", then an inset photo growing to full-bleed | `<InsetOpener>` (shared) | Scroll-scrubbed inset → full (roast) | P20 = R2-C5 | Existing intro (founded 18 Oct 2023, Nitin Rathi). Photo: factory-photo-hq (existing) or a new brand photo |
| ABOUT-02 | **"YAN + CHI = YUNCH"**: the name story as type | `<NameMerge>` | Scroll-scrubbed: "YAN" and "CHI" slide together and merge into "YUNCH" with a pop; "energy + vitality" types in | R1-C2 + pop | Existing Our Story copy |
| ABOUT-03 | Our journey: 2023 Makhana → Popcorn and Dry Fruits → today | `<ProcessPath>` (reuse) | As HOME-06 | P06 | Existing Our Journey copy |
| ABOUT-04 | Mission statement with drifting cut-outs: "Better snacking should be delicious, not boring." | `<Statement>` | Cut-out parallax | P21 = R2-C6 | Existing mission and vision |
| ABOUT-05 | Product philosophy: 4 numbered cards | `<NumberedCard>` | Sideways card slide, slight tilt | R3-C4 | Existing 4 cards |
| ABOUT-06 | Quality promise: 6 points + pull quote "This tastes great, and I can trust what I'm eating." | `<QuoteBlock>` | Quote types in | R1-C2 | Existing |
| ABOUT-07 | **Founder:** giant "NITIN RATHI" over a portrait | `<FounderMoment>` | Title masks the photo on scroll | P22 = R2-C7 | Existing role copy · **founder photo needed** (fallback: a typographic quote card) |
| ABOUT-08 | Closing: "ONE BITE, AND YOUR TASTE BUDS WILL NEVER SETTLE FOR ANYTHING LESS." + "Find your flavour" | `<Statement>` | Type-in; CTA magnetic | — | Existing |

---

### Why Yunch Bite `/why-yunch-bite`

> **Page goal:** speak to each audience directly. **Primary action:** consumers explore; retailers and distributors fill the partner form.

| ID | Section | Component | Motion | Reference | Content |
|---|---|---|---|---|---|
| WHY-01 | Opener: "WHY YUNCH BITE?" + **audience pills**: Health-conscious · Parents · Retailers · Distributors (sticky; they highlight the section in view) | `<AudiencePills>` | Pills slide their highlight (quick); click scrolls (Lenis) | R3 pills | Existing intro "great taste with higher standards" |
| WHY-02 | For health-conscious consumers: 6 cards | `<NumberedCard>` | Arch reveal into the section; cards pop | P07 | Existing |
| WHY-03 | For parents: tiffin illustration + 4 points; line "No junk, no worries, only healthy smiles" | `<AudienceBlock>` | Tiffin lid pops open, makhana pops out | pop | Existing · tiffin illustration (P17) |
| WHY-04 | For retailers: 5 cards + "Stock Yunch Bite →" | `<AudienceBlock>` | — | — | Existing |
| WHY-05 | For distributors: 4 points + "Become a distributor →" | `<AudienceBlock>` | — | — | Existing |
| WHY-06 | For everyone, every day: chips + closing line | `<ClaimMarquee>` | Marquee | — | Existing |

---

### Benefits `/benefits`

| ID | Section | Component | Motion | Reference | Content and assets |
|---|---|---|---|---|---|
| BEN-01 | Opener: "WHAT'S GOOD IN EVERY BITE" + the makhana bowl cut-out with kernels popping out | `<InsetOpener>` variant | Kernels pop, staggered | pop | Existing `info-pages-makhana-bowl.png` (**already transparent**) |
| BEN-02 | 7 wholesome benefits | `<ClaimStack>` (reuse) | As HOME-04 | P05 | Existing |
| BEN-03 | **Nutrition per 100 g (plain roasted makhana):** an interactive table; % DV bars grow and numbers count up; footnotes | `<NutritionTable>` | Bars and counters on enter (roast) | R1-C9 data | Existing values · the label clarifies "plain roasted makhana" vs flavoured |
| BEN-04 | Packaging that protects goodness: pick a pack (pillow · zipper · jar) to see its features | `<PackFormats>` | Selected pack pops; features type in | P04 lite | Existing 5 points · format cut-outs |
| BEN-05 | Quality you can rely on: 4 chips "Better Taste · Better Nutrition · Better Choices · Better You" + closing line | `<Statement>` | Chips pop | — | Existing |

---

### Ingredients & Quality `/ingredients-quality`

| ID | Section | Component | Motion | Reference | Content and assets |
|---|---|---|---|---|---|
| IQ-01 | Opener: "QUALITY ISN'T A CLAIM. IT'S OUR COMMITMENT." + inset → full-bleed factory photo | `<InsetOpener>` | P20 | R2-C5 | Existing line · `factory-photo-hq.png` |
| IQ-02 | Clean, carefully chosen ingredients: 5 points with ingredient cut-outs | `<IngredientCards>` | Cut-outs pop | P17 | Existing |
| IQ-03 | **The goodness of olive oil:** an oil drop falls onto makhana; "never fried"; 4 chips | `<OliveOil>` | Drop falls (ease.exit) → splash pop | pop | Existing copy · olive / oil-drop cut-outs |
| IQ-04 | **Ingredients by product:** tabs Makhana · Popcorn · Nuts; one clean table per tab, additives shown with plain names | `<IngredientTable>` + `<FilterPills>` | Tab change cross-fades (quick) | R2 availability table | Existing tables (as on the site; claims to be corrected later) |
| IQ-05 | Packaging that protects quality: 6 chips | `<ClaimMarquee>` | — | — | Existing |
| IQ-06 | Our commitment: factory photos collapse into a stack; 5 steps "Quality Sourced → Loved by Families" | `<PhotoStack>` | Scroll-scrubbed collapse | P15 = R3-C6 | Existing factory photo + **more factory photos needed** |

---

### Blogs & Reviews `/blogs-reviews`

| ID | Section | Component | Motion | Reference | Content |
|---|---|---|---|---|---|
| BLOG-01 | Opener: "THE YUNCH JOURNAL" + category pills (All · Health & Wellness · Snacking Tips · Our Products · Lifestyle) | `<FilterPills>` | Title types in | R1-C2 | Existing categories ("Sustainability" hidden until it has posts) |
| BLOG-02 | Articles: the latest as a large feature card + the rest in a grid | `<ArticleCard>` | Hover: image zooms 1.04, arrow slides (quick) | — | Existing 5 articles |
| BLOG-03 | Newsletter (only if an email service exists) | `<Newsletter>` | Success: Buddy thumbs-up + ring burst | R1-D2 | Q6 |
| BLOG-04 | Reviews: aggregate + distribution bars (animated) + review cards | `<ReviewSummary>` + `<ReviewWall>` | Bars grow; marquee | — | **Real reviews only** (Q5) |
| BLOG-05 | Instagram / community (#YunchyJindgi) | `<ReviewWall>` (UGC mode) | Marquee | R1 UGC | Q5 |

### Article template `/articles/*` (5)

| ID | Section | Component | Motion | Content |
|---|---|---|---|---|
| ART-01 | Header: breadcrumb, category pill, title, byline (author, role, date, read time) | `<ArticleHeader>` | Title types in | Existing (each author needs their own avatar; today all share one) |
| ART-02 | **Reading progress:** a tiny makhana rolls along the top edge as you read | `<ReadProgress>` | Scroll-linked roll | New, playful (principle 5) |
| ART-03 | Hero image, inset → wider | `<InsetOpener>` lite | P20 | Existing blog images |
| ART-04 | Body: editorial typography (≤68 characters per line), lead quote, H2s, lists; **inline product card** where a product is mentioned | `<Prose>` + `<PackCard>` | None while reading | Existing copy |
| ART-05 | More from the journal (3) + back link | `<ArticleCard>` | Hover | Existing |

**Structured data:** Article + BreadcrumbList.

---

### Contact `/contact`

> **Page goal:** make it effortless to become a partner or ask a question. **Primary action:** submit the partner form.

| ID | Section | Component | Motion | Reference | Content and assets |
|---|---|---|---|---|---|
| CON-01 | Opener: "LET'S TALK CRUNCH" + Buddy pointing + two path cards: **Partner with us** / **Have a question?** (they switch the form) | `<ContactPaths>` | Buddy's pointing arm follows the selected card; cards pop | principle 5 | Existing `contact-mascot-hero.png` (needs high resolution) |
| CON-02 | **Partner form:** Name · Phone · Email · I am interested in (Retail stocking · Distribution · Other: to confirm, Q4) · City · Message | `<Form>` | Field focus quick; success: Buddy thumbs-up + ring burst | R1-D2 | Existing fields + City |
| CON-03 | Question form: Name · Phone · Email · Message | `<Form>` | Same | — | Existing |
| CON-04 | Details: phone, email, address (+ map link), social | `<ContactDetails>` | — | — | Existing (phone as on site for now) |

### 404

Buddy looks confused, holding an empty pouch: *"Yeh page toh koi kha gaya!"* ("Someone ate this page!"), with links to Home, Products and Contact.

---

## Part 3: Component inventory

| Component | Used on | Patterns | Motion | Effort |
|---|---|---|---|---|
| Loader (Makhana pop) | Home (first visit) | P01 | pop pile, curtain | M |
| Header + MENU pill + full-screen menu | All | P02 | label roll, panel drop | M |
| Footer (wordmark) | All | P18, P07 | arch reveal | S |
| Page curtain transition | All | P16 | curtain + pop | M |
| Cursor label | All (desktop) | P12 | elastic follow | S |
| Letter-type heading / Outline heading | All | P03, P13 | type-in | S |
| HeroWordmarkPacks | Home | R3 hero | drop-in, scroll drift | M |
| FlavourStage | Home, Bestsellers | P04 | ≈1 s switch, bg crossfade, pop | L |
| JindgiWipe | Home | R1-C4 adapted | scroll colour wipe | M |
| ClaimStack | Home, Benefits | P05 | pinned stack → tabs | L |
| CategoryCard / CategoryBand | Home, Products, Category | P11, P07 | ring burst hover, arch | S |
| ProcessPath | Home, About | P06 | pinned arc, Buddy walk | L |
| OccasionStrip | Home | P08 | drag, centre zoom | M |
| PackCard / FlavourCard | Many | P11 | pop hover, Buddy peek | M |
| BuddyIntro (eyes follow) | Home | principle 5 | pointer tracking | M |
| NumberedCard / NumberedLinkCard | Home, About, Why | R3-C4 | slide, fill | S |
| PackCarousel | Category | P19 | wheel/drag, rotating ring | L |
| FilterPills | Category, IQ, Blog | — | layout animation | S |
| ProductHero (pack flight) | PDP | P09 | entrance + scroll flight | L |
| FormatSwitch | PDP | — | pill slide | S |
| TasteProfile | PDP | — | meters | S |
| DataCards / NutritionTable / IngredientTable | PDP, Benefits, IQ | P10 | fan, bars, counters | M |
| InsetOpener | About, Benefits, IQ, Articles | P20 | inset → full | S |
| Statement (drifting cut-outs) | About, Category, Benefits | P21 | parallax | S |
| NameMerge | About | — | scrubbed merge | S |
| FounderMoment | About | P22 | title mask | S |
| PhotoStack | IQ | P15 | scrubbed collapse | M |
| PillFaq | Category | P14 | accordion | S |
| ReviewSummary / ReviewWall | Home, Bestsellers, Blog | R1 UGC | marquee, bars | M |
| ArticleCard / ArticleHeader / ReadProgress / Prose | Blog, Articles | — | hover, rolling makhana | M |
| ContactPaths / Form | Contact | R1-D2 | form states, success pop | M |
| PartnerBand / ClaimMarquee / ClaimIcons | Many | P07 | arch, marquee, pop | S |

**Effort:** S ≈ ½–1 day, M ≈ 1–3 days, L ≈ 3–5 days.

## Part 4: Asset list

**Already usable (from the current site):**

| File | Use |
|---|---|
| `info-pages-makhana-bowl.png` | Transparent bowl cut-out (BEN-01, statements) |
| `contact-mascot-hero.png` | Buddy pointing, transparent but small (260×195) |
| `mascot-photo-hq.png` | Buddy sitting, on a yellow background |
| `factory-photo-hq.png` | Factory |
| `banner-slide-2/3`, `blog-*-hq.jpg`, `promotional-collage.png` | Lifestyle and blog photos |
| `Bowl-Rotate.gif`, `kid-blinking-isolated.gif` | Reference for motion style (the mascot boy can stay or retire: Q2) |
| Product data | All product copy and data |

**Needed, in priority order:**

| # | Asset | Format | For |
|---|---|---|---|
| A1 | **Pack cut-outs: every SKU** (7 makhana zipper, 3 pillow, 3 jar, raw makhana, 3 popcorn, 4 dry fruits). Current real packs, front + ¾ angle | Transparent PNG/WebP, ≥2000 px tall | Everything product |
| A2 | **Logo as vector** + white/mono versions + the makhana-"B" mark on its own | SVG / AI / PDF | Header, footer, loader |
| A3 | **Makhana Buddy poses:** pop-out, wave, peek, peek-over, walk (2–4 frames), sit, point, thumbs-up, confused; plus **layered eyes** for HOME-09 | Transparent PNG ≥1500 px | G-08 |
| A4 | **Character per flavour** (decision Q2): either Buddy holding each flavour's ingredient, or ingredient characters with faces | Transparent PNG | HOME-02, PDP-01 |
| A5 | **Paper-cut shape set:** makhana kernels (5–6 shapes), chilli, pudina leaf, pepper, salt crystal, cheese, berries, popcorn, almond, cashew, olive, oil drop, tiffin box. **We can draw these** in the design phase if preferred. | SVG | P17: loader, claims, statements |
| A6 | **Packaging font** files (or name) + exact pack colour codes | OTF/WOFF2 · HEX/Pantone | Type and colour |
| A7 | **Founder portrait** (Nitin Rathi), landscape, high resolution | JPG | ABOUT-07 |
| A8 | **Occasion photos** (5): tiffin, office, movie night, chai, travel, each with a pack | JPG | HOME-07 |
| A9 | **More factory / process photos** (4–6): sourcing, roasting, seasoning, packing | JPG | IQ-06, process path |
| A10 | **Real reviews / UGC** with permission | Text + images | HOME-11, BLOG-04 |

## Part 5: Open questions

1. **Where to buy:** are there marketplace or quick-commerce links (Amazon, Blinkit, Zepto, Instamart, Flipkart, BigBasket)? If yes, the header CTA becomes "Where to buy" and every product page gets buy buttons. These are links, not a shop, so the sitemap doesn't change.
2. **Character per flavour:** Buddy variants (Buddy + chilli, Buddy + mint leaf…) **or** ingredient characters with faces (like Bucks and YAAS)? Keep the mascot boy or retire him?
3. **Font:** which typeface is on the packaging?
4. **Forms:** where should submissions go (email address or CRM)? What are the "I am interested in" options?
5. **Reviews:** do real reviews exist (Amazon, Google, Instagram)? The current six look like placeholders. "Write a review" needs a moderated backend; or we link to an external review page.
6. **Newsletter:** is there an email service? If not, BLOG-03 is hidden.
7. **Bestsellers:** which products are truly bestsellers? Every product page currently shows the badge, while the list has 11.
8. **New copy:** OK for us to draft the taste profiles, "pairs with", FAQs and occasion lines in the brand voice (light Hinglish) for your approval?
