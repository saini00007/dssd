# Motion capture report: https://yaas-energy.com/

Captured 2026-11-04T08:57:03.156Z | profiles: desktop | total 931.1s

## Summary

| profile | stack | ScrollTriggers (pinned) | tweens | CSS/WAAPI anims | hovers | custom cursor | parallax layers | magnetic | transitions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| desktop | lenis, three, gsap | 0 (0) | 0 | 0/0 | 4 | false | 0 | none | SPA-style (URL changed without page load) |

## Profile: desktop

### Pass status

| pass | status | time (s) | detail |
| --- | --- | --- | --- |
| probe | ok | 15.1 |  |
| scroll | ok | 83.4 |  |
| frames | ok | 12 |  |
| steps | ok | 267.1 |  |
| hover | ok | 243.9 |  |
| cursor | ok | 212 |  |
| transition | ok | 97.4 |  |

### Tech stack

| library | detected via | details |
| --- | --- | --- |
| lenis | global + network+bundle fingerprint |  |
| three | global |  |
| gsap | bundle fingerprint | detected via bundle fingerprint (no global) - runtime details unavailable |

Page: "YAAS Energy — Zero-Sugar Energy Drink in 5 Bold Flavors" | lang en | 408 DOM nodes | document height 20100px | canvases: div.site-canvas > div > canvas (webgl2) | videos: 0

### Motion system

- Smooth scroll: Lenis, 
- ScrollTriggers: 0 (0 pinned, 0 scrubbed)
- GSAP tweens: 0 recorded at creation time (including intro tweens that already finished), 0 still in the global timeline at probe time
- CSS animations/transitions alive at load: 0 (0 CSS animations, 0 WAAPI, 0 transitions)

_No GSAP tweens captured (no gsap global, or bundled without globals)._

CSS / WAAPI animations

_none_

### Per-section timeline

| scroll range (px) | video time (s) | section in view | ScrollTriggers starting in range | tweens targeting it |
| --- | --- | --- | --- | --- |
| 0-2837 | 6.05-15.88 | section#flavors "5 Flavors. 1 Energy." | - | 0 |
| 3597-5556 | 16.65-19.59 | section.screen2.is-arc-running "This isn't about hyping you up. It's about stayi" | - | 0 |
| 5905-10595 | 20.01-26.6 | section.screen2 "This isn't about hyping you up. It's about stayi" | - |  |
| 10926-13374 | 26.9-32.19 | section#why-yaas "Why YAAS Beats Whatever's Sitting in Your Fridge" | - | 0 |
| 13977-18725 | 33.03-38.25 | section#about "Not For Everyone.For Our People." | - | 0 |
| 18966-19200 | 38.51-40.54 | footer.site-footer.is-reveal "YAAS Flavors Why YAAS About Us FAQ Contacts YAAS" | - | 0 |

Section outline

| # | section | top | height | height (vh) | background |
| --- | --- | --- | --- | --- | --- |
| 0 | section#flavors "5 Flavors. 1 Energy." | 0 | 3450 | 3.83 | #0b0a09 |
| 1 | section.screen2.is-arc-running "This isn't about hyping you up. It's about stayi" | 2550 | 8706 | 9.67 | #0b0a09 |
| 2 | section#why-yaas "Why YAAS Beats Whatever's Sitting in Your Fridge" | 10233 | 3785 | 4.21 | #0b0a09 |
| 3 | section#about "Not For Everyone.For Our People." | 13118 | 6081 | 6.76 | #ffffff |
| 4 | footer.site-footer.is-reveal "YAAS Flavors Why YAAS About Us FAQ Contacts YAAS" | 18300 | 1800 | 2 | #0b0a09 |

### Hover catalogue

4 elements captured of 11 unique candidate groups (12 :hover rules readable; 0 cross-origin stylesheets unreadable). Skipped: 7.

| # | element | what changes | driver | duration / easing | filmstrip |
| --- | --- | --- | --- | --- | --- |
| 1 | a.hero-pill.site-footer-pill "Why YAAS" (x5) | color, background-color, outline-color | css transition | 0.2s, 0.2s, 0.2s ease, ease, ease | [filmstrip](desktop/hover/01-why-yaas/filmstrip.jpg) |
| 2 | a.hero-pill.contact-pill "partnership@yaas-energy.com →" | color, background-color, outline-color, border-color | css transition | 0.2s, 0.2s, 0.2s ease, ease, ease | [filmstrip](desktop/hover/02-partnership-yaas-energy-com/filmstrip.jpg) |
| 3 | a.site-footer-credit "Website design DVIGA" | text-decoration-line | instant or script-driven (no CSS transition found) |  | [filmstrip](desktop/hover/03-website-design-dviga/filmstrip.jpg) |
| 4 | a.site-footer-credit.site-footer-privacy "Privacy Policy" | text-decoration-line | instant or script-driven (no CSS transition found) |  | [filmstrip](desktop/hover/04-privacy-policy/filmstrip.jpg) |

Skipped: a.detail-cta (covered by div.screen2-headline); button.arrow.arrow-left (not visible (opacity)); button.arrow.arrow-right (not visible (opacity)); button.flavor-thumb (covered by div.screen2-arc-stage); button.flavor-thumb.is-active (covered by div.screen2-arc-stage); button.faq-question (error: page.screenshot: Timeout 20000ms exceeded.); a.site-footer-logo-link (covered by span.drop-text-piece)

### Cursor and pointer

- Native cursor hidden (cursor:none): no
- No pointer-following DOM element found (WebGL/canvas cursors cannot be detected this way).
- Mouse-move parallax: not detected

- Magnetic elements: none detected among 4 tested

Clip: [video/cursor.mp4](desktop/video/cursor.mp4)

### Page transitions

| link | type | overlay elements | settled after (ms) | clip | contact sheet |
| --- | --- | --- | --- | --- | --- |
| https://yaas-energy.com/privacy-policy | SPA-style (URL changed without page load) | div#pl | 18798 | [mp4](desktop/video/transition-1.mp4) | [sheet](desktop/transition/link-1/sheet-01.jpg) |

### Design tokens

Fonts in use: `Bounded, "Helvetica Neue", Arial, system-ui, -apple-system, sans-serif`; `Soledago, "Arial Narrow", system-ui, -apple-system, sans-serif`

Loaded @font-face: Soledago 400 normal, Bounded 500 normal, Soledago PL normal normal

| element | font-size | weight | line-height | letter-spacing | family |
| --- | --- | --- | --- | --- | --- |
| h1 | 32px | 700 | normal | normal | "Helvetica Neue", Arial, system-ui, -app |
| h2 | 81.9574px | 400 | 81.9574px | normal | Soledago, "Arial Narrow", system-ui, -ap |
| h3 | 40.9787px | 400 | 45.0766px | -0.819574px | Soledago, "Arial Narrow", system-ui, -ap |
| p | 16px | 500 | 22.4px | -0.4px | Bounded, "Helvetica Neue", Arial, system |
| a | 16px | 400 | normal | normal | "Helvetica Neue", Arial, system-ui, -app |
| button | 13.3333px | 400 | normal | normal | "Helvetica Neue", Arial, system-ui, -app |

Largest text on first screen: 539px "YAAS" (span.logo-text).

Type scale (px): 16, 16.3915, 20.4894, 38.9298, 40.9787, 60.048, 81.9574, 92.2021, 112.59, 539, 553.552

Backgrounds by area: #ffffff, #e53a6b, #f0a3b4, #d9d9d9, #212121

Text colours: #212121, #ffffff, #e53a6b, #0085c6, #f18221, #efcc04, #75bd38, #e43a6c

Section backgrounds in order: #0b0a09 > #0b0a09 > #0b0a09 > #ffffff > #0b0a09

Border radii: 20px (x21), 100px (x11), 10px (x4), 720px (x2), 50% (x1)

Container max-widths: 878.195px, 1440px, 892.8px, 439.2px, 640px, 368.275px

CSS custom properties on :root: --asset-bg-texture: url('/textures/bg-texture.webp'); --font-display: "Soledago", "Arial Narrow", system-ui, -apple-system, sans-serif; --font-body: "Helvetica Neue", Arial, system-ui, -apple-system, sans-serif; --font-beiruti: "Bounded", "Helvetica Neue", Arial, system-ui, -apple-system, sans-serif; --ui-scale: 1; --ink: #ffffff; --ink-soft: rgba(255, 255, 255, .85); --ink-on-light: #212121; --ink-on-light-soft: rgba(33, 33, 33, .72); --block-gap: 80px; --heading-gap: calc(50px * var(--ui-scale)); --block-heading: 45px; --text-body: calc(16px * var(--ui-scale)); --text-body-sm: calc(14px * var(--ui-scale)); --content-gutter: 10px; --content-inline: var(--hero-margin, var(--content-gutter)); --paper: #fdfaf1; --bg-color: #f3d118; --block-gap-bottom: calc(var(--block-gap) + 40px)

scroll-behavior: html auto; scroll-snap elements: 0; clamp() uses: 98; vw units: 112; vh-family units: 97

### Media

- Scroll video: [video/scroll.mp4](desktop/video/scroll.mp4) (58.48s; scroll down: bottom reached; up: target reached)
- Timeline: [scroll-timeline.json](desktop/scroll-timeline.json)
- Contact sheet 0s-2.75s: [frames/sheets/sheet-01.jpg](desktop/frames/sheets/sheet-01.jpg)
- Contact sheet 3s-5.75s: [frames/sheets/sheet-02.jpg](desktop/frames/sheets/sheet-02.jpg)
- Contact sheet 6s-8.75s: [frames/sheets/sheet-03.jpg](desktop/frames/sheets/sheet-03.jpg)
- Contact sheet 9s-11.75s: [frames/sheets/sheet-04.jpg](desktop/frames/sheets/sheet-04.jpg)
- Contact sheet 12s-14.75s: [frames/sheets/sheet-05.jpg](desktop/frames/sheets/sheet-05.jpg)
- Contact sheet 15s-17.75s: [frames/sheets/sheet-06.jpg](desktop/frames/sheets/sheet-06.jpg)
- Contact sheet 18s-20.75s: [frames/sheets/sheet-07.jpg](desktop/frames/sheets/sheet-07.jpg)
- Contact sheet 21s-23.75s: [frames/sheets/sheet-08.jpg](desktop/frames/sheets/sheet-08.jpg)
- Contact sheet 24s-26.75s: [frames/sheets/sheet-09.jpg](desktop/frames/sheets/sheet-09.jpg)
- Contact sheet 27s-29.75s: [frames/sheets/sheet-10.jpg](desktop/frames/sheets/sheet-10.jpg)
- Contact sheet 30s-32.75s: [frames/sheets/sheet-11.jpg](desktop/frames/sheets/sheet-11.jpg)
- Contact sheet 33s-35.75s: [frames/sheets/sheet-12.jpg](desktop/frames/sheets/sheet-12.jpg)
- Contact sheet 36s-38.75s: [frames/sheets/sheet-13.jpg](desktop/frames/sheets/sheet-13.jpg)
- Contact sheet 39s-41.75s: [frames/sheets/sheet-14.jpg](desktop/frames/sheets/sheet-14.jpg)
- Contact sheet 42s-44.75s: [frames/sheets/sheet-15.jpg](desktop/frames/sheets/sheet-15.jpg)
- Contact sheet 45s-47.75s: [frames/sheets/sheet-16.jpg](desktop/frames/sheets/sheet-16.jpg)
- Contact sheet 48s-50.75s: [frames/sheets/sheet-17.jpg](desktop/frames/sheets/sheet-17.jpg)
- Contact sheet 51s-53.75s: [frames/sheets/sheet-18.jpg](desktop/frames/sheets/sheet-18.jpg)
- Contact sheet 54s-56.75s: [frames/sheets/sheet-19.jpg](desktop/frames/sheets/sheet-19.jpg)
- Contact sheet 57s-58.25s: [frames/sheets/sheet-20.jpg](desktop/frames/sheets/sheet-20.jpg)
- Keyframes: 33 in `desktop/frames/keyframes/`; index [frames/index.json](desktop/frames/index.json)
- Scroll steps: 30 screenshots in `desktop/steps/` (step 450px); full page: [steps/fullpage.jpg](desktop/steps/fullpage.jpg)
  - Full-page limitation: Full-page capture resizes the viewport, so vh-based layouts, pinned (ScrollTrigger) sections, smooth-scroll wrappers and scroll-linked reveals can look different from the real scrolled page
- Probe data: [probe.json](desktop/probe.json)


## Honest limits

- Headless Chromium uses software WebGL; heavy WebGL pages drop frames, so video timing can differ from a real GPU.
- GSAP bundled without a `window.gsap` global cannot be introspected; it is reported as "bundle fingerprint" only.
- Hover/cursor passes use synthetic mouse input and are skipped on touch profiles.
- Computed-style diffs only see what changed in the sampled element subtree and its ::before/::after.
