# Reference analysis method

**Goal:** understand exactly how each reference site creates its feel (what moves, when, how fast, on what curve, and why), so the Yunch Bite motion can be specified precisely. Then decide for each pattern whether we **adopt** it, **adapt** it, or **avoid** it.

Motion-heavy sites can't be judged from screenshots, so every reference is recorded in a real browser and studied as video and as frame sequences.

---

## 1. Capture protocol (automated: `tools/capture`)

Every reference is captured the same way, so the sites can be compared fairly:

- **Profiles:** desktop 1440×900, and mobile (Pixel 7 class, 412 px wide, touch).
- **Scroll:** real wheel input at a steady ~900 px/s from top to bottom, then partly back up (many sites animate differently in reverse). Real input matters: smooth-scroll libraries such as Lenis ignore programmatic `scrollTo`.
- **Hover timings:** frames at 0 / 80 / 160 / 320 / 600 / 1000 ms on hover-in, and at 60 / 300 ms on hover-out.
- **Reduced motion:** off (`no-preference`), so we see the full experience. Separately we note whether the site supports reduced motion at all.

| Pass | What it produces | What it tells us |
|---|---|---|
| Probe (JS introspection) | Libraries and versions; every GSAP ScrollTrigger (start, end, pin, scrub); GSAP tweens incl. intro ones (ease, duration, stagger); Lenis settings; CSS/WAAPI animations with keyframes; fonts, colours, radii, CSS variables; full network log | The *actual numbers* behind the motion, not guesses |
| Intro and scroll video | MP4 from navigation start (loader included) through the whole page | Real-time feel, rhythm, pacing |
| Contact sheets | Timestamped frame grids (4 fps) | Reading a motion sequence frame by frame |
| Scene-change keyframes | A frame wherever the picture changes significantly | Exact start and end of each animation |
| Scroll steps | Settled viewport state every half viewport | What the page looks like at each scroll position, for layout and wireframe reference |
| Hover | Filmstrip per interactive element and a computed-style diff (transform, colour, shadow, clip-path…) with transition timing | Precise micro-interaction specs |
| Cursor and pointer | Custom cursor, follow lag, magnetic elements, mouse-move parallax | Pointer-driven effects |
| Page transitions | Recording of navigating between pages; SPA or full reload | How the site keeps continuity between pages |

Frames sampled at 4 fps are accurate to about ±125 ms. Where the probe exposes the real duration and easing (GSAP, CSS, WAAPI), we use those numbers instead. Headless capture uses software WebGL, so heavy 3D scenes can drop frames. For those we take timing from the probe, not the video.

## 2. Frame-by-frame analysis (manual, per site)

Each site gets an analysis sheet in `research/references/<site>/analysis.md` with these sections:

| | Section | What is examined |
|---|---|---|
| A | **First 5 seconds** | Loader (type, length, skippable?), hero composition, the order and timing in which elements enter, time until content is usable, the scroll cue |
| B | **Story structure** | Section-by-section beats: what each section is *for*, how the product is introduced, where the calls to action sit, section length in viewports |
| C | **Scroll choreography** | For each section: trigger point; technique (reveal, stagger, pin, scrub, parallax, horizontal track, sticky stack, scale-on-scroll, mask/clip reveal, colour shift, 3D); duration and easing; reverse behaviour; smooth-scroll settings |
| D | **Micro-interactions** | Hover and press states, custom cursor, magnetic buttons, menu open and close, carousels, forms, empty and loading states |
| E | **Page transitions** | Type, duration, what stays on screen across the transition, SPA or reload |
| F | **Visual system** | Typefaces and scale ratio, colour roles, grid and spacing rhythm, image treatment (cut-outs, 3D renders, photography, illustration), texture and grain |
| G | **Product presentation** | How packs and flavours are shown: flavour colour-coding, ingredient "explosions", rotating packs, how nutrition and ingredients are displayed |
| H | **Personality devices** | Mascot or character use, illustration style, tone of copy, sound, easter eggs |
| I | **Mobile** | What changes or is dropped on mobile, what replaces hover on touch, how heavy it feels on a mid-range phone |
| J | **Performance and accessibility** | Page and JS weight, the LCP element, layout shift caused by animation, `prefers-reduced-motion` support, keyboard focus, contrast, vestibular risk (big parallax, scroll-jacking) |

## 3. A verdict for every pattern

Each notable pattern gets an ID, e.g. `R2-C4` = reference 2, scroll choreography item 4. Frame references look like `R2 desktop 00:12.5–00:15.0`. Every pattern gets one of three verdicts:

- **Adopt**: fits the brand and audience as it is.
- **Adapt**: keep the idea, change the execution, and say how.
- **Avoid**: say why (doesn't fit the brand, too heavy for mid-range Android, accessibility risk, cost).

Each verdict is judged on five criteria:

1. **Brand fit**: does it feel *yunchy, crunchy, playful, better-for-you*?
2. **Clarity**: does it help people understand the product, or is it just decoration?
3. **Mobile cost**: low, medium or high on a mid-range Android phone on 4G.
4. **Accessibility risk**: motion sickness, readability, keyboard and screen-reader impact.
5. **Build effort**: S, M, L or XL.

## 4. Synthesis: the Yunch Bite motion language

Phase 1 ends with `docs/04-reference-findings.md`, which feeds the site overview:

- **Motion principles** (3–5), each tied to the brand. These are starting hypotheses for the references to confirm or kill:
  - *Crunch*: quick, snappy entrances with a small overshoot, like a bite.
  - *Slow-roasted*: calm, warm reveals for the story and the ingredients.
  - *Mischief*: Makhana Buddy breaks the grid and reacts to scroll and cursor.
- **Motion tokens**: named durations, easing curves (as `cubic-bezier` values and GSAP eases), stagger values, scroll-trigger offsets, smooth-scroll lerp.
- **Pattern library**: the adopted and adapted patterns, each with its ID and frame references.
- **Mobile and reduced-motion rules**: what every pattern turns into on touch screens and with reduced motion on.
- **Performance budget**: mobile Core Web Vitals at p75 (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1), plus caps on JS, video and 3D weight.

## 5. Constraints known before we start

- **Mobile-first.** Most Indian web traffic is on Android phones, so every pattern is judged on the mobile capture first, and the desktop version is the enhancement.
- **SEO-safe motion.** All content must exist in server-rendered HTML. Animations start from content that is already in the page; nothing should exist only after a JS animation runs. This also fixes the current site's empty-shell problem.
- **No shop.** Calls to action need somewhere to go without new pages: product detail, contact or enquiry, social, and possibly outbound "where to buy" links (open question).
- **Reduced motion is honoured everywhere** (`prefers-reduced-motion`).
