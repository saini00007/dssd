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

<!-- PART 2–5: page-by-page sections, component inventory, asset requests, open questions -->
