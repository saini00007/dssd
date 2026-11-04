# Site overview: format

This is the format the phase-2 **theoretical site overview** (`docs/05-site-overview.md`) will follow. It's shared now so the format can be changed before the content is written.

The overview is text only, with no visuals. It describes the whole site so it can be approved, or changed, section by section, before any wireframe is drawn.

---

## Part 1: Global experience

The things that appear on every page:

- **Loader / first visit** (if any) and repeat-visit behaviour
- **Header and navigation**, menu overlay, mobile menu
- **Footer** (new: the current site has none)
- **Page transitions**
- **Cursor and pointer behaviour** (desktop only), with the touch equivalent
- **Smooth scroll** settings and the reduced-motion behaviour
- **Makhana Buddy**: where the mascot appears and how it reacts

## Part 2: Page by page

One block per sitemap template: Home, the other main pages, Category, Product, Article, Contact. Each block starts with:

> **Page goal:** what the visitor should come away with, and what the business needs from the page
> **Primary action:** the one thing we want the visitor to do next

Then every section, in order, uses this card:

```
### HOME-03 · Flavour wheel
Purpose     Why this section exists, in one line
Content     What it says or shows: current copy reused (page/section), or "new copy needed"
Component   <FlavourWheel>, shared or page-specific
Layout      Desktop: … / Mobile: …
Motion      Trigger → behaviour → timing token (e.g. enter at 80% viewport → packs fan in, stagger 60 ms, ease "crunch")
            Reverse: … / Reduced motion: …
Reference   R2-C4 (R2 desktop 00:12.5–00:15.0), R1-D2
Assets      Existing: <files from the assets manifest> / Needed: <what the client must supply>
```

## Part 3: Component inventory

| Component | Used on | Reference IDs | Motion | Effort |
|---|---|---|---|---|
| e.g. ProductCard | Home, Category | R1-D3, R3-D1 | Hover lift and pack tilt | M |

## Part 4: Asset request list

Everything the new design needs that the current site doesn't have (cut-out pack shots, mascot poses, ingredient renders, textures…). For each item: the format, size, transparency, and which section it's for.

## Part 5: Open questions

Decisions the client needs to make before wireframes.
