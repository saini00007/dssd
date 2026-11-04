# Brand website harvester

Crawls a (Next.js / client-rendered) site with Playwright and saves every reusable asset plus all page copy,
so a redesign team can reuse logos, pack shots, mascot GIFs, videos, fonts and text.

```
node harvest/harvest.mjs <startUrl> [--hosts h1,h2] [--out dir] [--max-pages 200] [--concurrency 3]
                         [--no-screens] [--paths /a,/b] [--force] [--no-crawl] [--no-sitemap] [--no-contact]
                         [--header "Name: value"] [--delay ms] [--timeout s] [--retries n] [--min-svg px]
node harvest/harvest.mjs --help
node harvest/test.mjs            # regression test against tools/fixtures/mini-site (exit 1 on failure)
```

Real site (the production domain currently serves an empty redirect shell, so start from the preview host):

```
node harvest/harvest.mjs https://yunchbite-git-main-pradeeps-projects-bf5ebbc6.vercel.app/ \
  --hosts yunchbite.com,www.yunchbite.com,yunchbite-git-main-pradeeps-projects-bf5ebbc6.vercel.app --concurrency 2
```

Default output: `research/current-site/`. Re-running resumes: pages with `meta.json` `done: true` are skipped (their stored
links still feed the crawl) and the asset manifest is merged. `--force` re-harvests. Failed pages are recorded
(`done: false`, error) and retried next run.

## How it works

1. **Discovery** = start URL + `robots.txt` Sitemap lines + `/sitemap.xml` (indexes followed) + `--paths` + BFS over links in the
   *rendered* DOM. URLs are normalised: hash and tracking params (`utm_*`, `fbclid`, ...) stripped, no trailing slash, `index.html`
   dropped, every `--hosts` alias (and `www.`) mapped to the start host, files/mailto/tel skipped. Links that point at an alias host
   are reported in `issues.md` (bug list). Protected deployments (401/403) are reported; pass `--header` for a bypass header.
2. **Per page** (desktop 1440x900, then Pixel 7 pass for the mobile screenshot and any mobile-only assets): load, wait for network
   idle, scroll slowly to the bottom (lazy images / IntersectionObserver), wait again, then
   * every network response body of image/video/audio/font/css/Lottie/.riv/3D is captured; media is re-downloaded in full (not the 206 chunk);
   * `/_next/image?url=...` and `/_vercel/image`: the `url` param is decoded and the ORIGINAL is downloaded; optimiser variants are
     only recorded in `sourceUrls` (and used as a fallback if the original is unavailable, flagged `originalFetchFailed`);
   * DOM references not (yet) requested: `img src/srcset/data-src`, `picture source`, `video src/poster`, computed `background-image`
     (+ `::before/::after`, masks), `link rel=icon/apple-touch-icon/preload`, `og:image`/`twitter:image`, web-manifest icons;
   * `url()` references inside saved CSS (e.g. hover-only backgrounds) and `@font-face` rules (family/weight/style recorded on fonts);
   * inline `<svg>` larger than `--min-svg` (default 24px) are serialised to `.svg` (class-driven fill/stroke baked in, `currentColor`
     resolved, `<use>` sprites inlined).
3. **Dedupe** by SHA-256; filenames keep the original name (Next.js `name.<hash>.ext` hashes stripped; collisions get a short hash).

## Output layout

```
pages/<slug>/content.md  meta.json  screenshot-desktop.jpg  screenshot-mobile.jpg  dom.html
assets/{images,svg,gif,video,audio,fonts,lottie,3d,css,icons}/...
assets/manifest.json  manifest.csv  contact-sheet-N.jpg  _thumbs/
sitemap.json  sitemap.md  issues.md  summary.md  crawl-state.json
```

`manifest.json` entries: `file, sha256, bytes, mime, type, width, height, hasAlpha` (PNG colour type/tRNS, WebP VP8X/VP8L),
`hasTransparency` (alpha channel really contains transparent pixels, via ffmpeg), `animated`, `durationSec, fps, frames`
(GIF/video via ffprobe), `sourceUrls[]`, `originalUrl`, `pages[]`, `alts[]`, `roles[]`, `usages[]` (DOM context evidence),
font family/weight/style, `thirdParty`.

`content.md` is markdown in DOM order: headings, paragraphs, lists, tables, `[CTA: text](href)` / `[Button: text]`, images with
alt (optimiser URLs decoded), `[Video: ...]`, `Header`/`Navigation`/`Footer` regions, card links as `-> href`.

## Role heuristics (guesses; `usages` holds the evidence)

| role | evidence |
|---|---|
| favicon / app-icon / og-image | `link rel=icon` / `apple-touch-icon`+manifest icons / `og:image`, `twitter:image` |
| logo | name/alt/class contains logo, wordmark, brandmark; or image/inline SVG inside header/nav linking to `/` |
| product-pack | name/alt mentions pack/pouch/product/makhana/`50g`; or large image on a `/products/...` page; or image inside a link to a product page |
| hero | name/class hero/banner (>=600px wide); or >=860px rendered, in the first 900px, outside header/footer |
| mascot | name/alt mascot/character/...; any GIF with no other role |
| background | used as CSS background or referenced only from CSS; name bg/pattern/texture |
| icon | max side <= 128px, or name/alt icon |
| video / hero-video / background-video / video-poster | autoplay video near the top; autoplay+loop; `poster=` |
| font, animation (Lottie/GIF), 3d-model, stylesheet, audio | by type |

## Limitations

* `data:` URI images (including Next.js blur placeholders) are ignored; WebGL/canvas content, Spline/Rive runtime data and assets only
  loaded after user interaction (modals, hover, carousels not auto-advancing) are not triggered, except URLs found in CSS.
* Inline SVG fidelity depends on computed styles at capture time (CSS animations, gradients defined in external `<defs>` may differ).
* Roles are heuristic. `hasAlpha=null` for GIF/AVIF (unknown), `hasTransparency` only measured for static PNG/WebP.
* Query-string pages are treated as distinct pages (except tracking params); infinite-scroll lists stop growing after the scroll cap (~40 s).
* Node fetch is used for downloads that bypass the browser; when `HTTPS_PROXY` is set the CLI re-execs itself with
  `NODE_USE_ENV_PROXY=1`. Cookies/login are not shared with those downloads (use `--header`).
* External links are listed but never checked; no auth flows.
