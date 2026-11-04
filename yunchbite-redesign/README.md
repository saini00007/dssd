# Yunch Bite — website redesign workspace

The working folder for the new Yunch Bite website: a modern, motion-rich D2C food-brand site that keeps the **current sitemap and brand identity** and replaces everything else.

Current site: <https://yunchbite-git-main-pradeeps-projects-bf5ebbc6.vercel.app/> (preview) · <https://yunchbite.com/> (production)

## Process and status

| # | Phase | Output | Status |
|---|-------|--------|--------|
| 0 | Discovery: brand knowledge, sitemap, harvest of every reusable asset from the live site | `docs/01-brand-knowledge.md`, `research/current-site/` | Brand notes done. **Asset harvest blocked: the site's host isn't allowed by this environment's network policy.** Harvester is built and tested. |
| 1 | Reference deep-dive: frame-by-frame capture of scroll, hover, cursor, loader and page-transition motion on the reference sites the client picks | `research/references/<site>/`, `docs/04-reference-findings.md` | Capture toolkit built and tested. **Waiting for the reference URLs and network access.** |
| 2 | Theoretical site overview: every page and section in text, each tied to a component and to the reference frames it borrows from | `docs/05-site-overview.md` | Format agreed in `docs/03-site-overview-format.md`; content comes after phase 1 |
| 3 | Wireframes: low-fidelity structure plus motion notes for each page template | TBD | — |
| 4 | Visual design and motion prototypes | TBD | — |
| 5 | Build (Next.js, Vercel) and QA | TBD | — |

Each phase ends with client approval before the next one starts.

## Decisions so far

| Date | Decision | Source |
|------|----------|--------|
| 2026-11-04 | Assets are harvested from the live site over the network (no code repo available for now). | Client |
| 2026-11-04 | Visual identity must **match the existing brand and packaging**: logo, colours and pack look stay. | Client |
| 2026-11-04 | **Exact same sitemap.** No shop or cart pages are added. | Client |
| 2026-11-04 | Motion direction comes from the client's reference sites, studied frame by frame (scroll, hover, cursor, transitions) with real browser recordings. | Client |
| 2026-11-04 | Order of work: theoretical overview, then wireframes, then design and build. The client supplies any extra assets (PNGs, custom illustrations) on request. | Client |

## Folder map

```
docs/                       brand knowledge, method, formats, findings, overview
research/current-site/      harvested pages, copy, screenshots, assets manifest (from tools/harvest)
research/references/<site>/ motion captures + reports per reference site (from tools/capture)
assets/                     curated, renamed brand assets chosen for the new site
tools/                      Playwright + ffmpeg research tooling (see tools/*/README.md)
```

## Running the tools

```bash
cd yunchbite-redesign/tools && npm install
node harvest/harvest.mjs https://yunchbite.com/ --hosts yunchbite.com,www.yunchbite.com,yunchbite-git-main-pradeeps-projects-bf5ebbc6.vercel.app
node capture/capture.mjs https://example-reference.com/ --profiles desktop,mobile
```

Both tools have a self-test against local fixture sites (`node harvest/test.mjs`, `node capture/test.mjs`). Playwright and Chromium are pre-installed in the cloud session; don't reinstall them.
