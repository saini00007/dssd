# video/ — frame-by-frame analysis of website screen recordings

`analyze-video.mjs` takes a screen recording of a motion-heavy site and tells a designer, for **every frame**, what moved:
how far the page scrolled, how fast, how it decelerated, where something animated in place, and where the page cut.
It writes a timeline chart, contact sheets, true frame-by-frame filmstrips per event and a frame-stepper viewer.

```
node video/analyze-video.mjs <video> [--out <dir>] [--crop auto|none|W:H:X:Y] [--sheet-fps 4]
                             [--max-strip 24] [--all-frames] [--label name] [--no-strips] [--no-sheets]
node video/test.mjs          # self-contained end-to-end test on a synthetic VFR recording (≈35 s)
```
Default output: `<dir of video>/../analysis/<video basename>/`. Needs system `ffmpeg`/`ffprobe` and Playwright (via `tools/lib/browser.mjs`, used only to
render PNG/JPG compositions). No npm dependencies. Exit codes: 0 ok, 2 bad usage, 3 finished but some stage failed (see `report.md`), 1 fatal.

## What it measures, and how

| Step | Method |
|---|---|
| **Probe** (`probe.mjs`) | `ffprobe -show_entries frame=pts_time`: every frame has an index `n` and its **true** time `t` (rebased so frame 0 = 0 s). VFR is never flattened to a constant fps. |
| **Crop** (`crop.mjs`) | ~60 frames across the video, 960 px wide gray, per-pixel temporal std-dev. Browser UI is static, the page is not. Row profile (central columns) -> content rows, column profile -> content columns, snapped to strong static edges of the mean image (toolbar border, scrollbar border). A thin high-contrast band at the right edge (scrollbar) is excluded; values rounded to even numbers and mapped back to source pixels. `crop-preview.jpg` shows the box. `--crop` overrides. |
| **Scroll** (`motion.mjs`) | One decode (cropped, ~360 px wide gray, `-fps_mode passthrough`), previous frame only kept. Vertical shift `dy`: SAD with clamped differences, coarse over ±45 % of the height on a 2x-downsampled copy, refined ±3 px at full analysis scale, parabola sub-pixel. Then horizontal `dx` (±30 %) at that dy. Shifts are converted to source px and px/s with the real Δt. Cumulative `scrollPos` resets at cuts. |
| **Confidence** | SAD contrast: best minimum vs the median and vs the second-best minimum. A shift is accepted only if it clearly beats zero shift **and** confidence ≥ 0.25. Textureless frames (dark empty backgrounds) therefore get low confidence and dy = 0, never fake scroll. |
| **Animation energy** | Residual = mean abs gray difference after (bilinear, sub-pixel) shift compensation over the overlap; `rawDiff` = uncompensated. Energy = residual above the idle noise floor (30th percentile of idle residual) or, while scrolling, above a speed-dependent floor (parallax/sub-pixel error grows with speed). Also the fraction of pixels with \|diff\| > 12, which catches small moving objects with flat interiors. 4x3 grid of both gives the screen region ("top-center"). |
| **Cuts** | Very poor alignment (clamped SAD after best shift ≥ 14 and < 25 % gain over zero shift), or ffmpeg `scene` ≥ 0.35 with high residual. Cut frames within 1 s become one navigation event (old page -> blank -> new page is one cut). |
| **Classes / events** (`segments.mjs`) | per frame: idle / scroll / animate / scroll+animate / cut. Runs with small gap tolerance (≤ 4 frames) -> events: `scroll` bursts (peak = max over 2-frame windows, mean = path / duration, exponential tail fit `v ∝ exp(-t/τ)` after the last strong impulse -> τ and R²; typical Lenis-style lerp), `animation` (≥ 3 frames of in-place change), `anim-scroll` (change while scrolling), `hscroll`, `pinned` (long in-place change, page not moving, scrolling within 1.5 s on both sides, not right after a cut: *likely* pinned / scroll-scrubbed), `cut`. IDs E01… in time order. |

## Outputs

- `timeline.json` — `{meta, frames:[{n,t,dt,dy,dx,confidence,scrollVelocity,scrollVelocityX,scrollPos,residual,rawDiff,energy,regionGrid[12],sceneScore,class,lowConfidence}]}`. `dy>0` = page scrolled down (px in the *source recording*), `regionGrid` is 4 columns x 3 rows, row-major, mean abs diff.
- `events.json` — `{scrollProfile, events:[{id,type,startFrame,endFrame,startT,endT,duration,region,box,peakEnergy,...}]}`.
- `timeline.png` — 2400 px chart: scroll position, velocity, animation energy on a shared time axis, event bands labelled with IDs, cuts marked.
- `sheets/` — ≤ 2400 px contact sheets (4x3 tiles) at `--sheet-fps`, picked by nearest real timestamp, stamped `time  f#n`.
- `events/E##-<type>/strip.jpg` — filmstrip of **every** frame of the event (evenly sampled with first/last kept and the stride printed if longer than `--max-strip`), plus 2 context frames before/after (dashed), tiles stamped `f#<n>  <t>s  +<ms since event start>`. Localised events: `strip.jpg` is the crop of the active region (from the source, not upscaled from the 960 px frames), `strip-full.jpg` the whole content. `frames/` holds the individual 960 px JPGs (≤ 120 per event), `frames-crop/` the region crops.
- `frames/raw/` — every frame as JPG, only with `--all-frames`.
- `viewer.html` — dark, mobile-friendly frame stepper: ←/→ ±1 frame, Shift+←/→ ±10, Space play/pause, `[` `]` previous/next event, 0.1/0.25/0.5/1× buttons, clickable timeline bar with event bands and cut markers, event list. Uses the real timestamps embedded inline (works from `file://`), loads the video by relative path (keep the folder structure; the video needs H.264 support in the browser, otherwise saved event frames are shown).
- `report.md` — summary, fps stats, crop, scroll profile (bursts, velocities, decay τ), events table with strip links, cuts, stage errors, limitations.

## How to record a good input

- Full-screen (or maximised) browser window at 100 % zoom; hide bookmarks bar. The crop removes chrome, but a stable window means a stable crop.
- **Record at 60 fps if the recorder allows.** At 25–30 fps a 60 fps easing is sampled coarsely and short animations get 2–5 frames. Constant frame rate recorders (OBS) avoid the dropped-frame jitter of VFR capture.
- Scroll steadily, one gesture at a time, then **pause 1–2 s** so decays and in-place animations finish before the next gesture. Hover pauses: hold the cursor still ~1 s before moving it again.
- Keep the cursor out of the area you want measured if possible; avoid OS notifications and tab-title animations.
- Mobile: record the real phone screen (system screen recorder) or Chrome devtools device mode full-window; use `--crop` to cut the status/nav bars if the auto-crop misses them (mobile has no static browser chrome to detect; it falls back to the active area).
- Keep the whole interaction in one file; page navigations are detected as cuts.

## Limitations

- VFR and recorder frame drops limit timing precision; animations shorter than the capture gaps are under-sampled. Check `report.md` for the gap statistics.
- Scroll is one global shift per frame. Parallax, sticky/pinned elements and flying objects appear as residual energy, not as scroll.
- Textureless frames (dark empty page, fades) cannot be aligned: low confidence, treated as not scrolling.
- Decay fits assume a single exponential tail; overlapping wheel notches bias τ. R² is reported.
- "Pinned / scroll-scrubbed" is inferred from neighbouring scrolling (the wheel is invisible); the scrollbar thumb (cropped away) would be a stronger signal.
- The cursor is not masked. It does not trigger events by itself but hover effects do.
- Contact sheets at 4 fps skip most frames; use the event strips for timing.
- The H.264 sources may show keyframe refresh noise; thresholds (noise floor, ≥ 3 frames) suppress most of it.
