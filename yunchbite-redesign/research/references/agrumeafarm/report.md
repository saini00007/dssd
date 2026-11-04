# Motion capture report: https://www.agrumeafarm.it/

Captured 2026-11-04T08:41:31.623Z | profiles: desktop | total 364.9s

## Summary

| profile | stack | ScrollTriggers (pinned) | tweens | CSS/WAAPI anims | hovers | custom cursor | parallax layers | magnetic | transitions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| desktop | lenis, splitting, nuxt, gsap | 0 (0) | 0 | 0/0 | 6 | false | 5 | a.jar-slider__item | SPA-style (URL changed without page load); no navigation (in-page / blocked) |

## Profile: desktop

### Pass status

| pass | status | time (s) | detail |
| --- | --- | --- | --- |
| probe | ok | 13.9 |  |
| scroll | ok | 20 |  |
| frames | ok | 2.3 |  |
| steps | ok | 15.5 |  |
| hover | ok | 162.5 |  |
| cursor | ok | 101.9 |  |
| transition | ok | 48.7 |  |

### Tech stack

| library | detected via | details |
| --- | --- | --- |
| lenis | global + bundle fingerprint |  |
| splitting | global |  |
| nuxt | global + network+bundle fingerprint |  |
| gsap | bundle fingerprint | detected via bundle fingerprint (no global) - runtime details unavailable |

Page: "Agrumea Farm | Jams, pestos and flavours of Sicily" | lang en | 360 DOM nodes | document height 900px | canvases: canvas.jar-slider__label (2d), canvas.jar-slider__label (2d), canvas.jar-slider__label (2d), canvas.jar-slider__label (2d), canvas.jar-slider__label (2d), canvas.jar-slider__label (2d), canvas.jar-slider__label (2d), canvas.jar-slider__label (2d), canvas.jar-slider__label (2d), canvas.jar-slider__label (2d) | videos: 0

### Motion system

- Smooth scroll: Lenis, 
- ScrollTriggers: 0 (0 pinned, 0 scrubbed)
- GSAP tweens: 0 recorded at creation time (including intro tweens that already finished), 0 still in the global timeline at probe time
- CSS animations/transitions alive at load: 3 (0 CSS animations, 0 WAAPI, 3 transitions)

_No GSAP tweens captured (no gsap global, or bundled without globals)._

CSS / WAAPI animations

_none_

### Per-section timeline

| scroll range (px) | video time (s) | section in view | ScrollTriggers starting in range | tweens targeting it |
| --- | --- | --- | --- | --- |
| 0-0 | 6.4-9.7 | div.jar-slider__overlay "SCROLL TO DISCOVER" | - | 0 |

Section outline

| # | section | top | height | height (vh) | background |
| --- | --- | --- | --- | --- | --- |
| 0 | div.jar-slider__overlay "SCROLL TO DISCOVER" | 0 | 900 | 1 | #fdf3eb |
| 1 | div.jar-slider__marquee | 0 | 900 | 1 | #fdf3eb |
| 2 | div.jar-slider__shape-layer | 408 | 492 | 0.55 | #fdf3eb |

### Hover catalogue

6 elements captured of 9 unique candidate groups (13 :hover rules readable; 1 cross-origin stylesheets unreadable). Skipped: 3.

| # | element | what changes | driver | duration / easing | filmstrip |
| --- | --- | --- | --- | --- | --- |
| 1 | button.site-menu-toggle "M M E E N N U U C C L L O O S S E E" | transform | css transition | 0.3s, 0.3s, 0.3s ease, ease, ease | [filmstrip](desktop/hover/01-m-m-e-e-n-n-u-u-c-c-l-l-o-o-s-s-/filmstrip.jpg) |
| 2 | a.site-lang-switcher__item "IT" | color, border-color, outline-color | css transition | 0.3s, 0.3s, 0.3s ease, ease, ease | [filmstrip](desktop/hover/02-it/filmstrip.jpg) |
| 3 | a.router-link-active.router-link-exact-active.site-lang-switcher__item "EN" | nothing detected | css transition | 0.3s, 0.3s, 0.3s ease, ease, ease | [filmstrip](desktop/hover/03-en/filmstrip.jpg) |
| 4 | div.site-header__brand.is-header-ready.is-revealed > a "Agrumea Farm" | nothing detected | css transition | 0.9s cubic-bezier(0.645, 0.045, 0.355, 1) | [filmstrip](desktop/hover/04-agrumea-farm/filmstrip.jpg) |
| 5 | a.jar-slider__item "GELSI NERI" (x4) | nothing detected | none detected |  | [filmstrip](desktop/hover/05-gelsi-neri/filmstrip.jpg) |
| 6 | a.site-legal__link "Privacy & Cookies" | opacity | css transition | 0.25s ease | [filmstrip](desktop/hover/06-privacy-cookies/filmstrip.jpg) |

Skipped: a.skip-link (could not be scrolled into view (off-screen / horizontal scroller)); a.jar-slider__item (could not be scrolled into view (off-screen / horizontal scroller)); a.jar-slider__item (could not be scrolled into view (off-screen / horizontal scroller))

### Cursor and pointer

- Native cursor hidden (cursor:none): no
- No pointer-following DOM element found (WebGL/canvas cursors cannot be detected this way).
- Mouse-move parallax: 5 layers

| layer | dx px | dy px | ratio x | direction |
| --- | --- | --- | --- | --- |
| span.cursor-label__text | 366.8 | 221.3 | 0.364 | with pointer |
| div.cursor-label__pill.is-visible | 361.7 | 221.3 | 0.359 | with pointer |
| span.cursor-label__diamond | 312.3 | 221.3 | 0.31 | with pointer |
| div.cursor-label | 304.2 | 221.3 | 0.302 | with pointer |
| div.jar-slider__shape-layer | -13.1 | -3.4 | -0.013 | against pointer |

- Magnetic elements: 

| element | activates (px from edge) | max shift px | pull ratio |
| --- | --- | --- | --- |
| a.jar-slider__item | 150 | 15.5 | 0.12 |

Clip: [video/cursor.mp4](desktop/video/cursor.mp4)

### Page transitions

| link | type | overlay elements | settled after (ms) | clip | contact sheet |
| --- | --- | --- | --- | --- | --- |
| https://www.agrumeafarm.it/ | SPA-style (URL changed without page load) | div.page-transition__panel | 5106 | [mp4](desktop/video/transition-1.mp4) | [sheet](desktop/transition/link-1/sheet-01.jpg) |
| https://www.agrumeafarm.it/en/dispensa/smeraldo | no navigation (in-page / blocked) |  | 3309 | [mp4](desktop/video/transition-2.mp4) | [sheet](desktop/transition/link-2/sheet-01.jpg) |

### Design tokens

Fonts in use: `ivystyle-sans, "Avenir Next", "Helvetica Neue", Helvetica, Arial, sans-serif`; `ivymode, "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, serif`

Loaded @font-face: ivystyle-sans 600 normal, ivystyle-sans 400 normal, ivymode 400 normal

| element | font-size | weight | line-height | letter-spacing | family |
| --- | --- | --- | --- | --- | --- |
| h1 | 32px | 400 | 41.6px | normal | ivystyle-sans, "Avenir Next", "Helvetica |
| p | 13px | 400 | 16.9px | 1.3px | ivymode, "Iowan Old Style", "Palatino Li |
| a | 14px | 400 | 18.2px | 0.56px | ivystyle-sans, "Avenir Next", "Helvetica |
| button | 16px | 400 | 20.8px | normal | ivystyle-sans, "Avenir Next", "Helvetica |
| li | 16px | 400 | 20.8px | normal | ivystyle-sans, "Avenir Next", "Helvetica |

Largest text on first screen: 14px "IT" (a.site-lang-switcher__item).

Type scale (px): 13, 14

Backgrounds by area: #fdf3eb, #762530, #ffffff, #e94e1b

Text colours: #762530, #fdf3eb

Section backgrounds in order: #fdf3eb > #fdf3eb > #fdf3eb

Border radii: 50% (x3), 1px (x2), 999px (x1), 14px (x1), 500px (x1)

Container max-widths: none found

CSS custom properties on :root: --color-orange: #e94e1b; --color-border: #762530; --color-white: #fdf3eb; --color-yellow: #f39200; --border-round: 15px; --container-padding: clamp(30px,2vw,40px); --grid-columns: 12; --grid-gap-x: clamp(12px,1.45vw,30px); --grid-gap-y: 0; --header-offset: clamp(20px,2vw,30px); --header-logo-width: clamp(126px,10vw,152px); --header-pad-y: 24px; --header-brand-width: 108px; --header-safe-top: calc(var(--header-pad-y) + var(--header-brand-width)*130/151); --font-sans: "ivystyle-sans","Avenir Next","Helvetica Neue",Helvetica,Arial,sans-serif; --font-serif: "ivymode","Iowan Old Style","Palatino Linotype","Book Antiqua",Palatino,serif; --text-small: .875rem; --text-base: 1rem; --text-medium: clamp(1.125rem, calc(1.085rem + .165vw) ,1.25rem); --text-large: clamp(1.2rem, calc(1.359rem + .1vw) ,1.938rem); --text-hero: 2.65rem; --text-display: clamp(2.5rem, calc(1rem + 8vw) ,999999px); --line-height-s: 1.2; --line-height-m: 1.3; --space-s: 2.5rem; --space-xs: var(--space-s); --space-l: 3rem; --space-xl: calc(var(--space-l)*2); --page-transition-duration: 0ms; --page-cover-duration: 0ms (1 cross-origin stylesheets could not be read)

scroll-behavior: html auto; scroll-snap elements: 0; clamp() uses: 60; vw units: 82; vh-family units: 16

### Media

- Scroll video: [video/scroll.mp4](desktop/video/scroll.mp4) (13.12s; scroll down: stalled (scroll position stopped changing); up: target reached)
- Timeline: [scroll-timeline.json](desktop/scroll-timeline.json)
- Contact sheet 0s-2.75s: [frames/sheets/sheet-01.jpg](desktop/frames/sheets/sheet-01.jpg)
- Contact sheet 3s-5.75s: [frames/sheets/sheet-02.jpg](desktop/frames/sheets/sheet-02.jpg)
- Contact sheet 6s-8.75s: [frames/sheets/sheet-03.jpg](desktop/frames/sheets/sheet-03.jpg)
- Contact sheet 9s-11.75s: [frames/sheets/sheet-04.jpg](desktop/frames/sheets/sheet-04.jpg)
- Contact sheet 12s-13s: [frames/sheets/sheet-05.jpg](desktop/frames/sheets/sheet-05.jpg)
- Keyframes: 12 in `desktop/frames/keyframes/`; index [frames/index.json](desktop/frames/index.json)
- Scroll steps: 2 screenshots in `desktop/steps/` (step 450px); full page: [steps/fullpage.jpg](desktop/steps/fullpage.jpg)
  - Full-page limitation: Full-page capture resizes the viewport, so vh-based layouts, pinned (ScrollTrigger) sections, smooth-scroll wrappers and scroll-linked reveals can look different from the real scrolled page
- Probe data: [probe.json](desktop/probe.json)


## Honest limits

- Headless Chromium uses software WebGL; heavy WebGL pages drop frames, so video timing can differ from a real GPU.
- GSAP bundled without a `window.gsap` global cannot be introspected; it is reported as "bundle fingerprint" only.
- Hover/cursor passes use synthetic mouse input and are skipped on touch profiles.
- Computed-style diffs only see what changed in the sampled element subtree and its ::before/::after.
