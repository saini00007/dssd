# capture: motion & interaction capture toolkit

Records how a motion-heavy reference site behaves so a designer (or an LLM) can analyse it frame by frame:
loader, scroll choreography, hover states, custom cursors, page transitions, plus a JS-level inventory of the
motion stack and design tokens.

```
node capture/capture.mjs <url> [--out <dir>] [--profiles desktop,mobile] [--passes all|probe,scroll,frames,steps,hover,cursor,transition]
                         [--max-hovers 24] [--scroll-speed 900] [--label name] [--intro-wait 4000] [--budget 360]
node capture/capture.mjs --help          # all options
node capture/test.mjs                    # regression test against fixtures/motion-lab (PROFILES=desktop for a quick run)
node fixtures/serve.mjs --port 4173      # serve the fixtures by hand (http://127.0.0.1:4173/motion-lab/)
```

Default output: `research/references/<slug of host+path>/` (`--label` replaces the slug). Passes are independent and
failure-isolated; a crash is recorded in `<profile>/status.json` and the report, the other passes still run.
Each profile has a time budget (`--budget`, default 360 s); passes that would start after it are skipped.
Exit code: 0 ok, 1 usage/fatal error, 2 site blocked.

## What each pass writes (`<out>/<profile>/`)

| pass | output |
| --- | --- |
| `probe` (runs first) | `probe.json`: libraries (gsap + plugins, ScrollTrigger inventory, global timeline tweens, Lenis options, Locomotive, Framer, Webflow/IX2, three, Lottie, Rive, Spline, Swiper, Split*, Barba/Swup/Taxi/Highway, Next/Nuxt/Astro/Shopify), `document.getAnimations()` (CSS animation / transition / WAAPI with keyframes, sampled at load and mid-scroll), creation-time hook buffer (gsap tweens and `Element.animate` recorded when created, so finished intro tweens are included), design tokens, network log grouped by type, page meta and section outline |
| `scroll` | `video/scroll.mp4` (recorded from navigation start, real wheel input, down, pause, partway back up) and `scroll-timeline.json` (time, scrollY, document height, section in view) |
| `frames` | `frames/sheets/sheet-NN.jpg` (timestamped contact sheets, `t | y` stamped per tile, <= 2400 px wide), `frames/keyframes/kf-NNN-tSSS.SSs.jpg` (scene changes), `frames/raw/` (git-ignored), `frames/index.json` |
| `steps` | `steps/step-NNN-yYYYY.jpg` after motion settles, `steps/fullpage.jpg`, `steps/steps.json` |
| `hover` | `hover/NN-slug/` with before/in/out frames, `filmstrip.jpg`, `diff.json`; `hover/index.json` |
| `cursor` | `cursor.json` (custom cursor + lag, parallax layers, magnetic elements) and `video/cursor.mp4` |
| `transition` | `transition/transitions.json`, `video/transition-N.mp4`, `transition/link-N/sheet-NN.jpg` |

Top level: `report.md` (human readable) and `summary.json` (machine readable). Videos and `frames/raw` are git-ignored by
the repo `.gitignore`; contact sheets, JSON and reports are meant to be committed.

## Behaviour worth knowing

- Scrolling in the video, steps, hover and cursor passes is always `page.mouse.wheel`, so Lenis / Locomotive react like for a user.
  The scroll container is auto-detected (window, or the largest inner `overflow:auto` element for app-shell sites).
- Consent banners: common "accept" buttons are clicked; open dialogs get Escape.
- Blocked sites: HTTP 401/403/429/503 on the document, known challenge scripts (Vercel security checkpoint, Cloudflare,
  PerimeterX/DataDome-style captcha), all stylesheets failing, or a challenge page body stop the run with
  `blocked: true` + `reason` in `summary.json` and `report.md`. The tool only detects this; it never tries to bypass it.
- Hover and cursor passes are skipped on touch profiles (mobile) unless requested with `--passes`.
- Hover frame times are measured wall clock from the mouse entering the element and stored in `diff.json`
  (`frames[].actualMs`); headless screenshots take 50 ms to 2 s, so the 80/160 ms frames can land late on busy pages.

## Known limitations

- Software WebGL (SwiftShader) is slow: pages with live WebGL or video in view drop frames, screenshots can take seconds, and
  video timing differs from a real GPU. Timeline time and video time agree only within ~0.3 s.
- Full-page screenshots resize the viewport. vh-based sections, ScrollTrigger pins, smooth-scroll wrappers and scroll-linked
  reveals can look wrong; inner-scroller sites only show the outer document. Prefer the step screenshots for fidelity.
- GSAP bundled without a `window.gsap` global cannot be introspected (no tweens, no ScrollTrigger list, no creation hook);
  it is reported as "detected via bundle fingerprint" from script URLs/text. Same for module-scoped Lenis: the constructor
  hook only works when `window.Lenis` is assigned by a script tag build.
- Cross-origin stylesheets cannot be read, so `:hover` rules, `:root` custom properties and clamp()/unit counts miss them
  (the count of unreadable sheets is reported). Hover candidates still come from `a/button/cursor:pointer`.
- Hover diffs cover the element, its ::before/::after and the first six descendants only. Canvas/WebGL cursors cannot be detected.
- Bot walls and rate limits end the run (see above); some sites serve different content to headless browsers.
